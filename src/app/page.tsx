'use client';

import dynamic from 'next/dynamic';
import ControlPanel from '@/components/ControlPanel';
import { useState } from 'react';

// render react-leaflet only on the client
const MapView = dynamic(() => import('@/components/MapViewLeaflet'), { ssr: false });

export default function Home() {
  const [impactPoint, setImpactPoint] = useState<{ lon: number; lat: number } | null>(null);
  const [geojsonRings, setGeojsonRings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="font-sans grid grid-cols-1 gap-4 md:grid-cols-[380px_1fr] min-h-screen p-4 md:p-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">☄️ Meteor Madness</h1>
        <ControlPanel
          impactPoint={impactPoint}
          onSimulate={async (payload) => {
            setLoading(true);
            try {
              const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              if (!res.ok) {
                // try to parse JSON error, fall back to text for more visibility
                const contentType = res.headers.get('content-type') || 'unknown';
                let errJson: any = null;
                let errText: string | null = null;
                try { errJson = await res.json(); } catch (_) { /* ignore */ }
                try { errText = await res.text(); } catch (_) { errText = null; }
                console.error('simulate failed', { status: res.status, contentType, bodyJson: errJson, bodyText: errText });
                return;
              }
              const data = await res.json();
              setGeojsonRings(data.rings || []);
            } finally {
              setLoading(false);
            }
          }}
        />
        {loading && <p className="text-sm text-neutral-500">Simulating…</p>}
        <p className="text-xs text-neutral-500">Tip: click the map to set the impact point.</p>
      </section>

      <section className="min-h-[70vh]">
        <MapView impactPoint={impactPoint} setImpactPoint={setImpactPoint} rings={geojsonRings} />
      </section>
    </div>
  );
}
