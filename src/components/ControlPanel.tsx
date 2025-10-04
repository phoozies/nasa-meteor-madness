'use client';

import { useState } from 'react';
import { z } from 'zod';

const MATERIALS = ['stony', 'iron', 'cometary'] as const;
type Material = typeof MATERIALS[number];

const METHODS = ['none', 'kinetic', 'tractor'] as const;
type Method = typeof METHODS[number];

const SimSchema = z.object({
  diameter_m: z.number().min(1).max(20000),
  density: z.number().min(100).max(10000),
  speed_ms: z.number().min(1000).max(80000),
  angle_deg: z.number().min(5).max(90),
  material: z.enum(MATERIALS),
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  mitigation: z.object({
    method: z.enum(METHODS),
    dv_ms: z.number().min(0).max(50),
    lead_time_days: z.number().min(0).max(3650),
  }),
});
export type SimPayload = z.infer<typeof SimSchema>;

export default function ControlPanel({
  impactPoint,
  onSimulate,
}: {
  impactPoint: { lon: number; lat: number } | null;
  onSimulate: (payload: SimPayload) => void;
}) {
  const [diameter_m, setDiameter] = useState<number>(150);
  const [density, setDensity] = useState<number>(3000);
  const [speed_ms, setSpeed] = useState<number>(19000);
  const [angle_deg, setAngle] = useState<number>(35);
  const [material, setMaterial] = useState<Material>('stony');
  const [method, setMethod] = useState<Method>('none');
  const [dv_ms, setDv] = useState<number>(0);
  const [lead_time_days, setLead] = useState<number>(365);
  const canRun = !!impactPoint;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Simulation Controls</h2>

      <div className="space-y-3">
        <label className="block text-sm">
          Diameter (m)
          <input
            className="mt-1 w-full rounded-md bg-neutral-800 p-2"
            type="number"
            value={diameter_m}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiameter(Number(e.target.value))}
          />
        </label>

        <label className="block text-sm">
          Density (kg/m³)
          <input
            className="mt-1 w-full rounded-md bg-neutral-800 p-2"
            type="number"
            value={density}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDensity(Number(e.target.value))}
          />
        </label>

        <label className="block text-sm">
          Speed (m/s)
          <input
            className="mt-1 w-full rounded-md bg-neutral-800 p-2"
            type="number"
            value={speed_ms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeed(Number(e.target.value))}
          />
        </label>

        <label className="block text-sm">
          Angle (deg)
          <input
            className="mt-1 w-full rounded-md bg-neutral-800 p-2"
            type="number"
            value={angle_deg}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAngle(Number(e.target.value))}
          />
        </label>

        <label className="block text-sm">
          Material
          <select
            className="mt-1 w-full rounded-md bg-neutral-800 p-2"
            value={material}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setMaterial(e.target.value as Material)
            }
          >
            <option value="stony">Stony (~3000)</option>
            <option value="iron">Iron (~7800)</option>
            <option value="cometary">Cometary (~600)</option>
          </select>
        </label>

        <fieldset className="mt-3">
          <legend className="text-sm font-medium">Mitigation</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              className="rounded-md bg-neutral-800 p-2"
              value={method}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setMethod(e.target.value as Method)
              }
            >
              <option value="none">None</option>
              <option value="kinetic">Kinetic Impactor</option>
              <option value="tractor">Gravity Tractor</option>
            </select>
            <input
              className="rounded-md bg-neutral-800 p-2"
              type="number"
              value={dv_ms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDv(Number(e.target.value))}
              placeholder="Δv (m/s)"
            />
            <input
              className="rounded-md bg-neutral-800 p-2 col-span-2"
              type="number"
              value={lead_time_days}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLead(Number(e.target.value))}
              placeholder="Lead time (days)"
            />
          </div>
        </fieldset>

        <button
          disabled={!canRun}
          onClick={() => {
            const lon = impactPoint?.lon ?? 0;
            const lat = impactPoint?.lat ?? 0;
            const payload = {
              diameter_m: Number(diameter_m),
              density: Number(density),
              speed_ms: Number(speed_ms),
              angle_deg: Number(angle_deg),
              material,
              lon,
              lat,
              mitigation: { method, dv_ms: Number(dv_ms), lead_time_days: Number(lead_time_days) },
            } as const;

            const parsed = SimSchema.safeParse(payload);
            if (!parsed.success) {
              alert('Invalid inputs');
              return;
            }
            onSimulate(payload);
          }}
          className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
        >
          Run Simulation
        </button>

        <div className="text-xs text-neutral-400">
          {impactPoint ? (
            <p>
              Impact at <b>{impactPoint.lat.toFixed(4)}</b>, <b>{impactPoint.lon.toFixed(4)}</b>
            </p>
          ) : (
            <p>Pick an impact location by clicking on the map.</p>
          )}
        </div>
      </div>
    </div>
  );
}
