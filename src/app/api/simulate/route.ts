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
    const craterD = craterDiameterMeters(E);
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
    
    // Create visual layers for impact effects
    const rings = [
      // Overpressure/Blast zones (with wind speeds)
      { 
        id: 'blast-extreme', 
        radius: over.p10, 
        color: '#7f1d1d', 
        opacity: 0.4, 
        label: 'Extreme Blast',
        description: '10 psi overpressure, ~470 mph winds'
      },
      { 
        id: 'blast-severe', 
        radius: over.p5, 
        color: '#dc2626', 
        opacity: 0.35, 
        label: 'Severe Blast',
        description: '5 psi overpressure, ~300 mph winds'
      },
      { 
        id: 'blast-moderate', 
        radius: over.p3, 
        color: '#f97316', 
        opacity: 0.3, 
        label: 'Moderate Blast',
        description: '3 psi overpressure, ~190 mph winds'
      },
      { 
        id: 'blast-light', 
        radius: over.p1, 
        color: '#fbbf24', 
        opacity: 0.25, 
        label: 'Light Blast',
        description: '1 psi overpressure, ~100 mph winds'
      },
      // Thermal radiation zone
      { 
        id: 'thermal', 
        radius: thermalR, 
        color: '#dc2626', 
        opacity: 0.2, 
        label: 'Thermal Radiation',
        description: '3rd degree burns'
      },
      // Seismic effects zone (approximate based on magnitude)
      {
        id: 'seismic',
        radius: detailedResults.seismicMagnitude > 7 ? over.p1 * 2 : over.p1 * 1.5,
        color: '#8b5cf6',
        opacity: 0.15,
        label: 'Seismic Effects',
        description: `Magnitude ${detailedResults.seismicMagnitude.toFixed(1)} earthquake`
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
      crater_depth_m: detailedResults.craterDepth * 1000,
      seismic_magnitude: detailedResults.seismicMagnitude,
      thermal_radius_km: detailedResults.thermalRadius,
      overpressure_radius_km: detailedResults.overpressureRadius,
      rings: [
        { 
          id: 'crater', 
          color: '#1e3a8a', 
          opacity: 0.6, 
          label: 'Crater',
          description: `${(craterD / 1000).toFixed(2)} km diameter, ${detailedResults.craterDepth.toFixed(2)} km deep`,
          geojson: crater 
        },
        {
          id: 'fireball',
          color: '#ff4500',
          opacity: 0.7,
          label: 'Fireball',
          description: 'Immediate vaporization zone',
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
