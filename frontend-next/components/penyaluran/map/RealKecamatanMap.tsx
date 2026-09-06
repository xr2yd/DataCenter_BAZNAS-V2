'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { GeoJSON as LeafletGeoJSON, Path } from 'leaflet';
import tangerangGeoJsonRaw from '@/data/tangerangKecamatan';
import {
  getChoroplethColor,
  getMapMetricValue,
  getMapMetricPresentation,
  type MapMetric,
} from './map-data';
import type { PenyaluranByKecamatan } from '@/lib/api/types';
import type { MapPeriodData } from '../dashboard/dashboard-data';

const geojsonData = tangerangGeoJsonRaw as unknown as FeatureCollection;

type KecamatanFeatureLayer = Path & {
  feature?: Feature<Geometry, { name: string }>;
  getBounds: () => ReturnType<LeafletGeoJSON['getBounds']>;
  setTooltipContent?: (content: string) => void;
};

function MapSelectionFocus({
  selectedKecamatan,
  geoJsonRef,
}: {
  selectedKecamatan?: string | null;
  geoJsonRef: React.RefObject<LeafletGeoJSON | null>;
}) {
  const map = useMap();
  const skipInitialFocus = useRef(true);

  useEffect(() => {
    if (skipInitialFocus.current) {
      skipInitialFocus.current = false;
      return;
    }
    if (!selectedKecamatan || !geoJsonRef.current) return;

    const selectedLayer = geoJsonRef.current.getLayers().find((layer) => {
      const feature = (layer as KecamatanFeatureLayer).feature;
      return feature?.properties?.name?.toLowerCase() === selectedKecamatan.toLowerCase();
    }) as KecamatanFeatureLayer | undefined;
    if (!selectedLayer) return;

    map.flyToBounds(selectedLayer.getBounds(), {
      padding: [44, 44],
      duration: 0.42,
      easeLinearity: 0.25,
      maxZoom: 13,
    });
  }, [geoJsonRef, map, selectedKecamatan]);

  return null;
}

export default function RealKecamatanMap({
  metric = 'funds',
  selectedKecamatan,
  onSelectKecamatan,
  liveData,
  periodData,
}: {
  metric?: MapMetric;
  selectedKecamatan?: string | null;
  onSelectKecamatan?: (name: string) => void;
  liveData?: PenyaluranByKecamatan[];
  periodData?: MapPeriodData;
}) {
  const [mounted, setMounted] = useState(false);
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);
  const selectedRef = useRef(selectedKecamatan);
  const onSelectRef = useRef(onSelectKecamatan);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metricPresentation = getMapMetricPresentation(metric);

  const getMetricValue = (name: string) => getMapMetricValue(name, metric, liveData, periodData);

  const toColorScaleValue = (value: number) => {
    if (metric === 'funds') return value / 1_000_000;
    if (metric === 'asnafNeed') return value * 2;
    return value;
  };

  const formatMetricValue = (value: number) => {
    if (metric === 'funds') return `Rp ${(value / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
    return `${value.toLocaleString('id-ID')} ${metricPresentation.unit}`;
  };

  const tooltipCopy = (name: string, metricValue: number) => `<div class="p-1 text-xs"><strong class="text-zinc-900">${name}</strong><div class="text-[10px] text-zinc-600">${metricPresentation.label}: ${formatMetricValue(metricValue)}</div></div>`;

  const styleFeature = (feature?: Feature<Geometry, { name: string }>) => {
    if (!feature || !feature.properties) return {};
    const name = feature.properties.name;
    const isSelected = selectedKecamatan?.toLowerCase() === name.toLowerCase();
    const metricValue = getMetricValue(name);

    return {
      fillColor: getChoroplethColor(toColorScaleValue(metricValue)),
      weight: isSelected ? 2.5 : 1,
      opacity: 1,
      color: isSelected ? '#09090b' : '#ffffff',
      fillOpacity: isSelected ? 0.9 : 0.75,
    };
  };

  useEffect(() => {
    selectedRef.current = selectedKecamatan;
    onSelectRef.current = onSelectKecamatan;
  }, [onSelectKecamatan, selectedKecamatan]);

  useEffect(() => {
    geoJsonRef.current?.eachLayer((layer) => {
      const featureLayer = layer as KecamatanFeatureLayer;
      const feature = featureLayer.feature;
      if (!feature?.properties) return;
      const name = feature.properties.name;
      const metricValue = getMetricValue(name);
      featureLayer.setStyle(styleFeature(feature));
      featureLayer.setTooltipContent?.(tooltipCopy(name, metricValue));
    });
  }, [liveData, metric, periodData, selectedKecamatan]);

  const onEachFeature = (feature: Feature<Geometry, { name: string }>, layer: any) => {
    const name = feature.properties.name;
    const metricValue = getMetricValue(name);

    layer.on({
      click: () => {
        onSelectRef.current?.(name);
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.95, weight: 2 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        const isSelected = selectedRef.current?.toLowerCase() === name.toLowerCase();
        l.setStyle({
          fillOpacity: isSelected ? 0.9 : 0.75,
          weight: isSelected ? 2.5 : 1,
        });
      },
    });

    layer.bindTooltip(tooltipCopy(name, metricValue), { sticky: true, className: 'leaflet-custom-tooltip' });
  };

  if (!mounted) {
    return (
      <div className="h-[360px] w-full rounded-xl bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
        Memuat Peta Geospasial Tangerang...
      </div>
    );
  }

  return (
    <div className="relative h-[430px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-emerald-50/30 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
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
          ref={geoJsonRef}
          data={geojsonData}
          style={styleFeature as any}
          onEachFeature={onEachFeature}
        />
        <MapSelectionFocus selectedKecamatan={selectedKecamatan} geoJsonRef={geoJsonRef} />
      </MapContainer>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-zinc-200 bg-white/95 p-3 text-[11px] shadow-sm backdrop-blur-xs">
        <p className="mb-1.5 font-bold text-zinc-900">Intensitas {metricPresentation.label.toLowerCase()}</p>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs" style={{ backgroundColor: '#a7f3d0' }} />
            <span className="text-zinc-600">Rendah</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs" style={{ backgroundColor: '#10b981' }} />
            <span className="text-zinc-600">Menengah</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-xs" style={{ backgroundColor: '#00663d' }} />
            <span className="text-zinc-600">Tinggi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
