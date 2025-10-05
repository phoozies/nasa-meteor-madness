import { NextRequest, NextResponse } from 'next/server';
import {
  deflectionOffsetMeters,
  impactEnergy,
  overpressureRadiiMeters,
  thermalRadiusMeters,
} from '@/lib/physics';
import { ImpactPhysics } from '@/lib/calculations/impactPhysics';
import * as turf from '@turf/turf';

// Force Node runtime (turf works best here)
export const runtime = 'nodejs';

/**
 * Simple water detection based on coordinates
 * Returns true if coordinates are likely over water
 */
function isOverWater(lon: number, lat: number): boolean {
  // Pacific Ocean: large area between Americas and Asia
  // Western Pacific: lon > 120 to 180
  if (lon > 120 && lon <= 180 && lat > -60 && lat < 60) {
    // Exclude Asia/Australia  
    if (lon > 120 && lon < 155 && lat > -10 && lat < 50) return false; // Asia
    if (lon > 110 && lon < 155 && lat > -45 && lat < -10) return false; // Australia
    return true;
  }
  
  // Eastern Pacific: lon < -70 to -180
  if (lon < -70 && lon >= -180 && lat > -60 && lat < 60) {
    // Exclude Americas (much narrower band)
    if (lon > -130 && lon < -65 && lat > 15 && lat < 72) return false; // North America
    if (lon > -82 && lon < -34 && lat > -56 && lat < 15) return false; // South America
    return true;
  }
  
  // Atlantic Ocean: between Americas and Europe/Africa
  if (lon > -70 && lon < 20 && lat > -60 && lat < 70) {
    // Americas (east coast) - narrower band
    if (lon > -82 && lon < -65 && lat > 5 && lat < 50) return false; // Eastern US
    if (lon > -80 && lon < -34 && lat > -56 && lat < 15) return false; // South America
    // Europe/Africa
    if (lon > -10 && lon < 40 && lat > -35 && lat < 72) return false; // Europe/Africa
    return true;
  }
  
  // Indian Ocean
  if (lon > 20 && lon < 120 && lat > -60 && lat < 30) {
    // Africa (east coast)
    if (lon > 20 && lon < 52 && lat > -35 && lat < 40) return false;
    // India
    if (lon > 68 && lon < 97 && lat > 8 && lat < 37) return false;
    // Southeast Asia
    if (lon > 95 && lon < 120 && lat > -10 && lat < 30) return false;
    return true;
  }
  
  // Southern Ocean (around Antarctica)
  if (lat < -60) return true;
  
  // Arctic Ocean
  if (lat > 72) return true;
  
  // Default to land
  return false;
}

type Payload = {
  diameter_m: number;
  density: number;
  speed_ms: number;
  angle_deg: number;
  material: 'stony' | 'iron' | 'cometary';
  lon: number;
  lat: number;
  mitigation: {
    method: 'none' | 'kinetic' | 'tractor';
    dv_ms: number;
    lead_time_days: number;
  };
};

type ErrorResponse = {
  error: string;
  payload?: { body: string };
  stack?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;

    if (
      !body ||
      typeof body.diameter_m !== 'number' ||
      typeof body.density !== 'number' ||
      typeof body.speed_ms !== 'number'
    ) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const { E, MtTNT } = impactEnergy(body.diameter_m, body.density, body.speed_ms);
    
    // Detect if impact is over water or land
    const isWater = isOverWater(body.lon, body.lat);
    const targetDensity = isWater ? 1000 : 2500; // kg/m³ (water vs rock)
    const targetType = isWater ? 'water' : 'land';
    
    const over = overpressureRadiiMeters(MtTNT);
    const thermalR = thermalRadiusMeters(MtTNT);

    // Calculate detailed impact effects using ImpactPhysics
    const detailedResults = ImpactPhysics.calculateImpact({
      diameter: body.diameter_m,
      velocity: body.speed_ms / 1000, // m/s to km/s
      density: body.density,
      angle: body.angle_deg,
      composition: body.material === 'iron' ? 'metallic' : body.material === 'cometary' ? 'icy' : 'rocky',
      targetDensity: targetDensity
    });

    // Calculate wind speed zones (based on overpressure)
    // 10 psi ≈ 470 mph, 5 psi ≈ 300 mph, 3 psi ≈ 190 mph, 1 psi ≈ 100 mph
    const windZones = {
      extreme: over.p10, // >470 mph
      severe: over.p5,   // >300 mph
      moderate: over.p3, // >190 mph
      light: over.p1     // >100 mph
    };

    let lon = body.lon;
    let lat = body.lat;

    if (
      body.mitigation.method !== 'none' &&
      body.mitigation.dv_ms > 0 &&
      body.mitigation.lead_time_days > 0
    ) {
      const offsetM = deflectionOffsetMeters(
        body.mitigation.dv_ms,
        body.mitigation.lead_time_days,
      );
      const dest = turf.destination([lon, lat], offsetM / 1000, 90, { units: 'kilometers' });
      lon = dest.geometry.coordinates[0];
      lat = dest.geometry.coordinates[1];
    }

    const center = turf.point([lon, lat]);
    
    // Calculate detailed statistics FIRST (before rings)
    // 1. Crater statistics
    const craterWidthKm = detailedResults.craterDiameter; // Already in km
    const craterDepthM = detailedResults.craterDepth * 1000;

    // 2. Shock wave statistics
    const shockwaveDecibels = 236; // Typical for large impacts (from neal.fun data)
    
    // Lung damage radius (20 psi) - now available from overpressure calculation
    const lungDamageRadius = over.p20 || over.p10 * 0.9; // Use p20 if available
    
    // Eardrum rupture radius (~3-5 psi range)
    const eardrumRuptureRadius = (over.p3 + over.p5) / 2;

    // 3. Wind blast statistics
    const peakWindSpeedKmS = 2; // km/s (~4,470 mph)
    
    // Jupiter storm comparison (620 mph or ~1000 km/h)
    const jupiterStormRadius = over.p10 * 0.7;
    
    // EF5 tornado comparison (~200 mph winds)
    const ef5Radius = over.p3;
    
    // Tree destruction radius
    const treeDestructionRadius = over.p1;

    // 4. Seismic statistics
    // Earthquake felt radius: empirical formula based on magnitude
    // M5.7 ≈ 32 km, follows roughly magnitude² scaling
    const earthquakeFeltRadius = Math.pow(detailedResults.seismicMagnitude, 2) * 1000; // in meters

    // 5. Frequency and comparisons
    let impactFrequencyYears = 1000;
    if (MtTNT < 1) impactFrequencyYears = 100;
    else if (MtTNT < 10) impactFrequencyYears = 1000;
    else if (MtTNT < 100) impactFrequencyYears = 10000;
    else if (MtTNT < 1000) impactFrequencyYears = 100000;
    else impactFrequencyYears = 1000000;

    const tunguska = 15; // 15 MT
    const comparison = MtTNT > tunguska ? 'More' : 'Less';

    // Detailed descriptions for each zone
    const craterDescriptions = isWater ? [
      `${craterWidthKm.toFixed(1)} km wide crater`,
      `The crater is ${Math.round(craterDepthM)} m deep on the sea floor`,
      detailedResults.tsunamiHeight ? `The impact will create a ${Math.round(detailedResults.tsunamiHeight)} m tall tsunami` : '',
      `Your asteroid impacted the water at ${(body.speed_ms / 1000).toFixed(0)} km/s`,
      `The impact is equivalent to ${Math.round(MtTNT)} Megatons of TNT`,
      `${comparison} energy was released than Tunguska explosion`,
      `An impact this size happens on average every ${impactFrequencyYears.toLocaleString()} years`
    ].filter(Boolean) : [
      `${craterWidthKm.toFixed(1)} km wide crater`,
      `The crater is ${Math.round(craterDepthM)} m deep`,
      `Impact into ${targetType} (${targetDensity} kg/m³)`,
      `Your asteroid impacted the ground at ${(body.speed_ms / 1000).toFixed(0)} km/s`,
      `The impact is equivalent to ${Math.round(MtTNT)} Megatons of TNT`,
      `${comparison} energy was released than Tunguska explosion`,
      `An impact this size happens on average every ${impactFrequencyYears.toLocaleString()} years`
    ];
    
    const detailedDescriptions = {
      crater: craterDescriptions,
      shockwave: [
        `${shockwaveDecibels} decibel shock wave`,
        `Anyone within ${(lungDamageRadius / 1000).toFixed(1)} km would likely receive lung damage`,
        `Anyone within ${(eardrumRuptureRadius / 1000).toFixed(1)} km would likely have ruptured eardrums`,
        `Buildings within ${(over.p5 / 1000).toFixed(1)} km would collapse`,
        `Homes within ${(over.p3 / 1000).toFixed(1)} km would collapse`
      ],
      windBlast: [
        `${peakWindSpeedKmS.toFixed(1)} km/s peak wind speed`,
        `Wind within ${(jupiterStormRadius / 1000).toFixed(1)} km would be faster than storms on Jupiter`,
        `Homes within ${(over.p10 / 1000).toFixed(1)} km would be completely leveled`,
        `Within ${(ef5Radius / 1000).toFixed(1)} km it would feel like being inside an EF5 tornado`,
        `Nearly all trees within ${(treeDestructionRadius / 1000).toFixed(1)} km would be knocked down`
      ],
      seismic: [
        `${detailedResults.seismicMagnitude.toFixed(1)} magnitude earthquake`,
        `The earthquake would be felt ${(earthquakeFeltRadius / 1000).toFixed(1)} km away`
      ]
    };
    
    // Create visual layers for impact effects (NOW we can reference the variables above)
    const rings = [
      // Overpressure/Blast zones (with detailed damage descriptions)
      { 
        id: 'blast-extreme', 
        radius: over.p10, 
        color: '#7f1d1d', 
        opacity: 0.4, 
        label: 'Total Destruction (10 psi)',
        description: `Complete destruction of all structures, ~470 mph winds. Buildings within ${(over.p5 / 1000).toFixed(1)} km would collapse.`
      },
      { 
        id: 'blast-severe', 
        radius: over.p5, 
        color: '#dc2626', 
        opacity: 0.35, 
        label: 'Severe Damage (5 psi)',
        description: `Buildings collapse, ~300 mph winds. Homes within ${(over.p3 / 1000).toFixed(1)} km would collapse.`
      },
      { 
        id: 'blast-moderate', 
        radius: over.p3, 
        color: '#f97316', 
        opacity: 0.3, 
        label: 'Moderate Damage (3 psi)',
        description: `Homes collapse, ~190 mph winds. Within ${(ef5Radius / 1000).toFixed(1)} km feels like being inside an EF5 tornado. Nearly all trees within ${(treeDestructionRadius / 1000).toFixed(1)} km would be knocked down.`
      },
      { 
        id: 'blast-light', 
        radius: over.p1, 
        color: '#fbbf24', 
        opacity: 0.25, 
        label: 'Light Damage (1 psi)',
        description: `Windows shattered, ~100 mph winds. Anyone within ${(eardrumRuptureRadius / 1000).toFixed(1)} km would likely have ruptured eardrums.`
      },
      // Thermal radiation zone
      { 
        id: 'thermal', 
        radius: thermalR, 
        color: '#ff6b35', 
        opacity: 0.2, 
        label: 'Thermal Radiation',
        description: '3rd degree burns, ignition of flammable materials. Immediate fire hazard zone.'
      },
      // Seismic effects zone
      {
        id: 'seismic',
        radius: detailedResults.seismicMagnitude > 7 ? over.p1 * 2 : over.p1 * 1.5,
        color: '#8b5cf6',
        opacity: 0.15,
        label: 'Seismic Effects',
        description: `Magnitude ${detailedResults.seismicMagnitude.toFixed(1)} earthquake - felt ${(earthquakeFeltRadius / 1000).toFixed(1)} km away.`
      }
    ].map((r) => ({
      id: r.id,
      color: r.color,
      opacity: r.opacity,
      label: r.label,
      description: r.description,
      geojson: turf.buffer(center, r.radius / 1000, { units: 'kilometers' }),
    }));

    // Create crater as a separate, more visible feature
    const crater = turf.buffer(center, craterWidthKm / 2, { units: 'kilometers' });
    
    // Create fireball/explosion radius (immediate vaporization zone)
    const fireballRadius = craterWidthKm * 0.8; // Slightly smaller than crater
    const fireball = turf.buffer(center, fireballRadius / 2, { units: 'kilometers' });

    return NextResponse.json({
      energy_MtTNT: MtTNT,
      crater_diameter_m: craterWidthKm * 1000, // Convert back to meters for API response
      crater_depth_m: craterDepthM,
      seismic_magnitude: detailedResults.seismicMagnitude,
      thermal_radius_km: detailedResults.thermalRadius,
      overpressure_radius_km: detailedResults.overpressureRadius,
      detailed_stats: detailedDescriptions,
      rings: [
        { 
          id: 'crater', 
          color: '#1e3a8a', 
          opacity: 0.6, 
          label: 'Crater',
          description: `${craterWidthKm.toFixed(1)} km wide, ${Math.round(craterDepthM)} m deep.`,
          geojson: crater 
        },
        {
          id: 'fireball',
          color: '#ff4500',
          opacity: 0.7,
          label: 'Fireball Zone',
          description: `Immediate vaporization zone. Impact velocity: ${(body.speed_ms / 1000).toFixed(0)} km/s. Energy equivalent to ${Math.round(MtTNT)} Megatons of TNT.`,
          geojson: fireball
        },
        ...rings
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    let bodyText = '';
    try {
      bodyText = await req.text();
    } catch {
      bodyText = '<unreadable body>';
    }

    const respObj: ErrorResponse = { error: msg };
    if (process.env.NODE_ENV !== 'production') {
      respObj.payload = { body: bodyText };
      if (err instanceof Error && err.stack) respObj.stack = err.stack;
    }

    console.error('simulate API will return error JSON:', respObj);
    return NextResponse.json(respObj, { status: 500 });
  }
}
