'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import tangerangGeoJsonRaw from '@/data/tangerangKecamatan';
import { DEMO_KECAMATAN_DATA, getChoroplethColor } from './map-data';
import type { PenyaluranByKecamatan } from '@/lib/api/types';

const geojsonData = tangerangGeoJsonRaw as unknown as FeatureCollection;

export default function RealKecamatanMap({
  selectedKecamatan,
  onSelectKecamatan,
  liveData,
}: {
  selectedKecamatan?: string | null;
  onSelectKecamatan?: (name: string) => void;
  liveData?: PenyaluranByKecamatan[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[360px] w-full rounded-xl bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
        Memuat Peta Geospasial Tangerang...
      </div>
    );
  }

  // Find data by name
  const getDataForKecamatan = (name: string) => {
    const fromApi = liveData?.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (fromApi) return fromApi;
    return DEMO_KECAMATAN_DATA[name] || { totalMustahik: 800, totalDisalurkan: 1000000000 };
  };

  const styleFeature = (feature?: Feature<Geometry, { name: string }>) => {
    if (!feature || !feature.properties) return {};
    const name = feature.properties.name;
    const isSelected = selectedKecamatan?.toLowerCase() === name.toLowerCase();
    const data = getDataForKecamatan(name);
    const mustahikCount = data.totalMustahik || 0;

    return {
      fillColor: getChoroplethColor(mustahikCount),
      weight: isSelected ? 2.5 : 1,
      opacity: 1,
      color: isSelected ? '#09090b' : '#ffffff',
      fillOpacity: isSelected ? 0.9 : 0.75,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, { name: string }>, layer: any) => {
    const name = feature.properties.name;
    const data = getDataForKecamatan(name);

    layer.on({
      click: () => {
        if (onSelectKecamatan) onSelectKecamatan(name);
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.95, weight: 2 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        const isSelected = selectedKecamatan?.toLowerCase() === name.toLowerCase();
        l.setStyle({
          fillOpacity: isSelected ? 0.9 : 0.75,
          weight: isSelected ? 2.5 : 1,
        });
      },
    });

    layer.bindTooltip(
      `<div class="p-1 text-xs">
        <strong class="text-zinc-900">${name}</strong>
        <div class="text-[10px] text-zinc-600">${data.totalMustahik?.toLocaleString('id-ID')} Mustahik Terbantu</div>
      </div>`,
      { sticky: true, className: 'leaflet-custom-tooltip' }
    );
  };

  return (
    <div className="relative h-[360px] w-full rounded-xl overflow-hidden border border-zinc-200 shadow-2xs">
      <MapContainer
        center={[-6.1783, 106.6319]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          data={geojsonData}
          style={styleFeature as any}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-zinc-200 rounded-lg p-2 text-[10px] shadow-sm">
        <p className="font-bold text-zinc-900 mb-1">Kepadatan Mustahik</p>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs" style={{ backgroundColor: '#a7f3d0' }} />
            <span className="text-zinc-600">&lt;500</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs" style={{ backgroundColor: '#10b981' }} />
            <span className="text-zinc-600">500-900</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs" style={{ backgroundColor: '#00663d' }} />
            <span className="text-zinc-600">&gt;1.200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
