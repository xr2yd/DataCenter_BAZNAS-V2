'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl, { type ExpressionSpecification, type GeoJSONSource, type Map as MapboxMap, type MapMouseEvent } from 'mapbox-gl';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import tangerangGeoJsonRaw from '@/data/tangerangKecamatan';
import { getChoroplethColor, getMapMetricPresentation, getMapMetricValue, type MapMetric } from './map-data';
import type { PenyaluranByKecamatan } from '@/lib/api/types';
import type { MapPeriodData } from '../dashboard/dashboard-data';

const geojsonData = tangerangGeoJsonRaw as unknown as FeatureCollection;
const SOURCE_ID = 'kecamatan-boundaries';
const FILL_ID = 'kecamatan-fill';
export const MAP_READY_EVENT = 'style.load';
type Props = { name: string; fillColor?: string; isSelected?: boolean; metricValue?: number };

export function getKecamatanStyle(feature: { name: string }, selected: string | null | undefined, value: number) {
  const isSelected = selected?.toLowerCase() === feature.name.toLowerCase();
  return { fillColor: getChoroplethColor(value), weight: isSelected ? 3 : 1, opacity: 1, color: isSelected ? '#047857' : '#ffffff', fillOpacity: isSelected ? 0.88 : 0.75 };
}
export function getTileLayerConfig(mapTilerKey?: string, cartoAccessToken?: string) {
  if (cartoAccessToken) return { url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?api_key=${cartoAccessToken}`, attribution: '&copy; CARTO' };
  if (mapTilerKey) return { url: `https://api.maptiler.com/maps/streets-v2-light/{z}/{x}/{y}.png?key=${mapTilerKey}`, attribution: '&copy; MapTiler' };
  return { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' };
}
export function getMapboxStyleConfig(accessToken?: string) { return { accessToken, style: 'mapbox://styles/mapbox/light-v11' }; }

export function shouldShowMapLoadError(isReady: boolean, isStyleLoaded: boolean) {
  return !isReady && !isStyleLoaded;
}

export function getFillOpacityExpression(): ExpressionSpecification {
  return ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, ['case', ['get', 'isSelected'], 0.88, 0.75]];
}

function boundsFor(feature: Feature<Geometry, Props>) {
  const bounds = new mapboxgl.LngLatBounds();
  const visit = (v: unknown): void => { if (!Array.isArray(v)) return; if (typeof v[0] === 'number' && typeof v[1] === 'number') bounds.extend([v[0], v[1]]); else v.forEach(visit); };
  if ('coordinates' in feature.geometry) visit(feature.geometry.coordinates); return bounds;
}

export default function RealKecamatanMap({ metric = 'funds', selectedKecamatan, onSelectKecamatan, liveData, periodData, mapboxAccessToken }: { metric?: MapMetric; selectedKecamatan?: string | null; onSelectKecamatan?: (name: string) => void; liveData?: PenyaluranByKecamatan[]; periodData?: MapPeriodData; mapboxAccessToken?: string }) {
  const container = useRef<HTMLDivElement | null>(null); const mapRef = useRef<MapboxMap | null>(null); const onSelect = useRef(onSelectKecamatan); const firstFocus = useRef(true); const [ready, setReady] = useState(false); const [error, setError] = useState(false);
  const presentation = getMapMetricPresentation(metric); const config = getMapboxStyleConfig(mapboxAccessToken ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const data = useMemo(() => ({ ...geojsonData, features: geojsonData.features.map((feature) => { const name = (feature.properties as Props).name; const raw = getMapMetricValue(name, metric, liveData, periodData); const scale = metric === 'funds' ? raw / 1_000_000 : metric === 'asnafNeed' ? raw * 2 : raw; const style = getKecamatanStyle({ name }, selectedKecamatan, scale); return { ...feature, properties: { ...feature.properties, fillColor: style.fillColor, isSelected: style.color === '#047857', metricValue: raw } }; }) }) as FeatureCollection<Geometry, Props>, [liveData, metric, periodData, selectedKecamatan]);
  useEffect(() => { onSelect.current = onSelectKecamatan; }, [onSelectKecamatan]);
  useEffect(() => { if (!container.current || !config.accessToken || mapRef.current) return; const map = new mapboxgl.Map({ container: container.current, accessToken: config.accessToken, style: config.style, center: [106.6319, -6.1783], zoom: 11.8, minZoom: 10, maxZoom: 15 }); map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right'); map.scrollZoom.disable(); map.once(MAP_READY_EVENT, () => { map.addSource(SOURCE_ID, { type: 'geojson', data, generateId: true }); map.addLayer({ id: FILL_ID, type: 'fill', source: SOURCE_ID, paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': getFillOpacityExpression() } }); map.addLayer({ id: 'kecamatan-outline', type: 'line', source: SOURCE_ID, paint: { 'line-color': ['case', ['get', 'isSelected'], '#047857', '#ffffff'], 'line-width': ['case', ['get', 'isSelected'], 3, 1], 'line-opacity': .95 } }); map.on('mouseenter', FILL_ID, () => map.getCanvas().style.cursor = 'pointer'); map.on('mouseleave', FILL_ID, () => map.getCanvas().style.cursor = ''); map.on('click', FILL_ID, (e: MapMouseEvent) => { const name = e.features?.[0]?.properties?.name; if (name) onSelect.current?.(name); }); setError(false); setReady(true); }); map.on('error', () => { if (shouldShowMapLoadError(false, map.isStyleLoaded())) setError(true); }); mapRef.current = map; return () => { map.remove(); mapRef.current = null; }; }, [config.accessToken, config.style]);
  useEffect(() => { if (ready) (mapRef.current?.getSource(SOURCE_ID) as GeoJSONSource | undefined)?.setData(data); }, [data, ready]);
  useEffect(() => { if (firstFocus.current) { firstFocus.current = false; return; } if (!ready || !selectedKecamatan) return; const feature = data.features.find(f => f.properties.name.toLowerCase() === selectedKecamatan.toLowerCase()); if (feature) mapRef.current?.fitBounds(boundsFor(feature), { padding: 44, duration: 420, maxZoom: 13 }); }, [data, ready, selectedKecamatan]);
  if (!config.accessToken) return <div className="flex h-[360px] items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-500">Token Mapbox belum terpasang.</div>;
  return <div className="relative h-[430px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-emerald-50/30 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><div ref={container} className="h-full w-full" aria-label="Peta interaktif Kota Tangerang" />{!ready && !error && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-zinc-500">Memuat peta Kota Tangerang...</div>}{error && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 text-sm font-semibold text-rose-700">Peta Mapbox tidak dapat dimuat.</div>}<div className="absolute bottom-4 left-4 z-10 rounded-xl border border-zinc-200 bg-white/95 p-3 text-[11px] shadow-sm"><p className="mb-1.5 font-bold text-zinc-900">Intensitas {presentation.label.toLowerCase()}</p><div className="flex gap-2 text-zinc-600"><span>Rendah</span><span>Menengah</span><span>Tinggi</span></div></div></div>;
}
