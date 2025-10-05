'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, GeoJSON, useMapEvents, Popup, Tooltip
} from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';

export type MapViewProps = {
  impactPoint: { lon: number; lat: number } | null;
  setImpactPoint: (p: { lon: number; lat: number }) => void;
  rings: { 
    id: string; 
    color?: string; 
    opacity?: number; 
    label?: string;
    description?: string;
    geojson: GeoJSON.GeoJSON 
  }[];
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
    <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-800 relative">
      <MapContainer center={center} zoom={4} style={{ height: '100%', minHeight: '70vh', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickSetter onClick={(lat, lon) => setImpactPoint({ lat, lon })} />

        {impactPoint && (
          <Marker position={[impactPoint.lat, impactPoint.lon]}>
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong>Impact Point</strong><br />
                Lat: {impactPoint.lat.toFixed(4)}<br />
                Lon: {impactPoint.lon.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {rings?.map((r) => (
          <GeoJSON
            key={`${r.id}-${geoVersion}`}
            data={r.geojson}
            style={{
              color: r.color || '#ef4444',
              weight: 2,
              fillColor: r.color || '#ef4444',
              fillOpacity: r.opacity ?? 0.18,
            }}
            onEachFeature={(feature, layer) => {
              if (r.label || r.description) {
                const content = `
                  <div style="padding: 4px;">
                    ${r.label ? `<strong>${r.label}</strong><br />` : ''}
                    ${r.description ? `<span style="font-size: 12px;">${r.description}</span>` : ''}
                  </div>
                `;
                layer.bindPopup(content);
                
                // Show label on hover
                if (r.label) {
                  layer.bindTooltip(r.label, {
                    permanent: false,
                    direction: 'center',
                    className: 'impact-zone-label'
                  });
                }
              }
            }}
          />
        ))}
      </MapContainer>
      
      {/* Legend */}
      {rings && rings.length > 0 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px',
            borderRadius: '8px',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '12px',
            minWidth: '200px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
            Impact Effects
          </div>
          {rings.map((r) => (
            <div 
              key={r.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '6px',
                gap: '8px'
              }}
            >
              <div 
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: r.color || '#ef4444',
                  opacity: (r.opacity ?? 0.18) + 0.5,
                  borderRadius: '2px',
                  border: `1px solid ${r.color || '#ef4444'}`,
                  flexShrink: 0
                }}
              />
              <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                <div style={{ fontWeight: '500' }}>{r.label || r.id}</div>
                {r.description && (
                  <div style={{ color: '#666', fontSize: '10px' }}>
                    {r.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
