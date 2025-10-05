import { NextRequest, NextResponse } from 'next/server';
import {
  craterDiameterMeters,
  deflectionOffsetMeters,
  impactEnergy,
  overpressureRadiiMeters,
  thermalRadiusMeters,
} from '@/lib/physics';
import { ImpactPhysics } from '@/lib/calculations/impactPhysics';
import * as turf from '@turf/turf';

// Force Node runtime (turf works best here)
export const runtime = 'nodejs';

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
    const craterD = craterDiameterMeters(body.diameter_m, body.density, body.speed_ms, body.angle_deg);
    const over = overpressureRadiiMeters(MtTNT);
    const thermalR = thermalRadiusMeters(MtTNT);

    // Calculate detailed impact effects using ImpactPhysics
    const detailedResults = ImpactPhysics.calculateImpact({
      diameter: body.diameter_m,
      velocity: body.speed_ms / 1000, // m/s to km/s
      density: body.density,
      angle: body.angle_deg,
      composition: body.material === 'iron' ? 'metallic' : body.material === 'cometary' ? 'icy' : 'rocky'
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
    const craterWidthKm = craterD / 1000;
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
    const detailedDescriptions = {
      crater: [
        `${craterWidthKm.toFixed(1)} km wide crater`,
        `The crater is ${Math.round(craterDepthM)} m deep`,
        `Your asteroid impacted the ground at ${(body.speed_ms / 1000).toFixed(0)} km/s`,
        `The impact is equivalent to ${Math.round(MtTNT)} Megatons of TNT`,
        `${comparison} energy was released than Tunguska explosion`,
        `An impact this size happens on average every ${impactFrequencyYears.toLocaleString()} years`
      ],
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
    const crater = turf.buffer(center, craterD / 2000, { units: 'kilometers' });
    
    // Create fireball/explosion radius (immediate vaporization zone)
    const fireballRadius = craterD * 0.8; // Slightly smaller than crater
    const fireball = turf.buffer(center, fireballRadius / 2000, { units: 'kilometers' });

    return NextResponse.json({
      energy_MtTNT: MtTNT,
      crater_diameter_m: craterD,
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
