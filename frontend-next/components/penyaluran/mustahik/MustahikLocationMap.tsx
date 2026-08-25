'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

type MustahikLocationMapProps = {
  address: string;
  village: string;
  subdistrict: string;
};

const SUBDISTRICT_COORDINATES: Record<string, LatLngExpression> = {
  Karawaci: [-6.1908, 106.6078],
  Ciledug: [-6.2378, 106.7053],
  Cipondoh: [-6.1846, 106.6656],
  Batuceper: [-6.1744, 106.6589],
  Larangan: [-6.2394, 106.7177],
};

const TANGERANG_CENTER: LatLngExpression = [-6.1783, 106.6319];

function MapViewport({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 0.65 });
  }, [center, map]);

  return null;
}

export default function MustahikLocationMap({ address, village, subdistrict }: MustahikLocationMapProps) {
  const center = SUBDISTRICT_COORDINATES[subdistrict] ?? TANGERANG_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport center={center} />
      <CircleMarker center={center} radius={8} pathOptions={{ color: '#ffffff', fillColor: '#059669', fillOpacity: 1, weight: 3 }}>
        <Popup>
          <strong>{village}, {subdistrict}</strong><br />
          <span>{address}</span>
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
