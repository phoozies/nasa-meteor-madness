import { NextRequest, NextResponse } from 'next/server';
import {
  craterDiameterMeters,
  deflectionOffsetMeters,
  impactEnergy,
  overpressureRadiiMeters,
  thermalRadiusMeters,
} from '@/lib/physics';
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
    const rings = [
      { id: 'ring10', radius: over.p10, color: '#ef4444', opacity: 0.25, label: '10 psi' },
      { id: 'ring5', radius: over.p5, color: '#f97316', opacity: 0.22, label: '5 psi' },
      { id: 'ring3', radius: over.p3, color: '#eab308', opacity: 0.20, label: '3 psi' },
      { id: 'ring1', radius: over.p1, color: '#22c55e', opacity: 0.18, label: '1 psi' },
      { id: 'ringThermal', radius: thermalR, color: '#a855f7', opacity: 0.16, label: 'Thermal' },
    ].map((r) => ({
      id: r.id,
      color: r.color,
      opacity: r.opacity,
      label: r.label,
      geojson: turf.buffer(center, r.radius / 1000, { units: 'kilometers' }),
    }));

    const crater = turf.buffer(center, craterD / 2000, { units: 'kilometers' });

    return NextResponse.json({
      energy_MtTNT: MtTNT,
      crater_diameter_m: craterD,
      rings: [{ id: 'crater', color: '#60a5fa', opacity: 0.35, geojson: crater }, ...rings],
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
