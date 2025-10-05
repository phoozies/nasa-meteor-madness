'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, GeoJSON, useMapEvents
} from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';

export type MapViewProps = {
  impactPoint: { lon: number; lat: number } | null;
  setImpactPoint: (p: { lon: number; lat: number }) => void;
  rings: { id: string; color?: string; opacity?: number; geojson: GeoJSON.GeoJSON }[];
};

// Fix default marker icon in many bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ClickSetter({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({ click(e){ onClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function MapViewLeaflet({
  impactPoint, setImpactPoint, rings,
}: MapViewProps) {
  const center: LatLngExpression = useMemo(
    () => impactPoint ? [impactPoint.lat, impactPoint.lon] : [29, -95],
    [impactPoint]
  );

  const [geoVersion, setGeoVersion] = useState(0);
  useEffect(() => { setGeoVersion(v => v + 1); }, [rings]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-800">
      <MapContainer center={center} zoom={4} style={{ height: '100%', minHeight: '70vh', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickSetter onClick={(lat, lon) => setImpactPoint({ lat, lon })} />

        {impactPoint && <Marker position={[impactPoint.lat, impactPoint.lon]} />}

        {rings?.map((r) => (
          <GeoJSON
            key={`${r.id}-${geoVersion}`}
            data={r.geojson}
            style={{
              color: r.color || '#ef4444',
              weight: 1,
              fillColor: r.color || '#ef4444',
              fillOpacity: r.opacity ?? 0.18,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
