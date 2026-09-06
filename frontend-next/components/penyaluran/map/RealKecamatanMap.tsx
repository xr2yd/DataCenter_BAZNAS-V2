'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl, { type ExpressionSpecification, type GeoJSONSource, type Map as MapboxMap, type MapMouseEvent } from 'mapbox-gl';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import tangerangGeoJsonRaw from '@/data/tangerangKecamatan';
import { DEMO_KECAMATAN_DATA, getChoroplethColor, getKecamatanInsight, getMapMetricPresentation, getMapMetricValue, type MapMetric } from './map-data';
import type { PenyaluranByKecamatan } from '@/lib/api/types';
import type { MapPeriodData } from '../dashboard/dashboard-data';

const geojsonData = tangerangGeoJsonRaw as unknown as FeatureCollection;
const SOURCE_ID = 'kecamatan-boundaries';
const FILL_ID = 'kecamatan-fill';
const CONNECTOR_SOURCE_ID = 'selected-kecamatan-connector';
const CONNECTOR_LINE_ID = 'selected-kecamatan-connector-line';
const CONNECTOR_ANCHOR_ID = 'selected-kecamatan-connector-anchor';
const CALLOUT_WIDTH = 224;
const CALLOUT_HEIGHT = 188;
const CALLOUT_MARGIN = 16;
const MAPBOX_CONTROL_WIDTH = 64;
const MAPBOX_CONTROL_HEIGHT = 104;
const MAP_LEGEND_HEIGHT = 70;
export const MAP_READY_EVENT = 'style.load';
type Props = { name: string; fillColor?: string; fillOpacity?: number; outlineColor?: string; outlineWidth?: number; isSelected?: boolean; metricValue?: number };
type PixelPoint = { x: number; y: number };
type Callout = { point: PixelPoint; viewport: { width: number; height: number }; placement: ReturnType<typeof getConnectedCalloutPlacement>; selectionKey: string; selectedKecamatan: string };

export function getKecamatanStyle(feature: { name: string }, selected: string | null | undefined, value: number) {
  const isSelected = selected?.toLowerCase() === feature.name.toLowerCase();
  const focus = getSelectionFocusStyle(isSelected);
  return { fillColor: getChoroplethColor(value), weight: focus.outlineWidth, opacity: 1, color: focus.outlineColor, fillOpacity: focus.fillOpacity };
}

export function getTileLayerConfig(mapTilerKey?: string, cartoAccessToken?: string) {
  if (cartoAccessToken) return { url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?api_key=${cartoAccessToken}`, attribution: '&copy; CARTO' };
  if (mapTilerKey) return { url: `https://api.maptiler.com/maps/streets-v2-light/{z}/{x}/{y}.png?key=${mapTilerKey}`, attribution: '&copy; MapTiler' };
  return { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' };
}

export function getMapboxStyleConfig(accessToken?: string) { return { accessToken, style: 'mapbox://styles/mapbox/light-v11' }; }
export function shouldShowMapLoadError(isReady: boolean, isStyleLoaded: boolean) { return !isReady && !isStyleLoaded; }
export function shouldRenderMapConnector(width: number): boolean { return width >= 640; }
export function getCalloutLayoutMode(width: number): 'compact' | 'desktop' { return shouldRenderMapConnector(width) ? 'desktop' : 'compact'; }
export function getCalloutPositionEvents(): readonly ['resize'] { return ['resize']; }
export function getConnectorPixelRoute(start: PixelPoint, anchor: PixelPoint): PixelPoint[] {
  const direction = anchor.x >= start.x ? 1 : -1;
  const elbowDistance = Math.min(96, Math.max(48, Math.abs(anchor.x - start.x) * 0.22));
  return [start, { x: start.x + direction * elbowDistance, y: start.y }, anchor];
}
export function getFillOpacityExpression(): ExpressionSpecification { return ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, ['get', 'fillOpacity']]; }
export function getSelectionFocusStyle(isSelected: boolean) { return isSelected ? { fillOpacity: 0.94, outlineColor: '#047857', outlineWidth: 3 } : { fillOpacity: 0.42, outlineColor: '#ffffff', outlineWidth: 1 }; }

export function getCalloutDecisionContext(name: string, liveData?: PenyaluranByKecamatan[], periodData?: MapPeriodData) {
  const liveValue = liveData?.find((item) => item.name.toLowerCase() === name.toLowerCase());
  const periodValue = periodData?.[name];
  const demoValue = DEMO_KECAMATAN_DATA[name];
  return {
    mustahik: liveValue?.totalMustahik ?? periodValue?.beneficiaries ?? demoValue?.totalMustahik ?? 0,
    topProgram: liveValue?.topProgram ?? periodValue?.program ?? demoValue?.topProgram ?? getKecamatanInsight(name).topProgram,
  };
}

export function getConnectedCalloutPlacement(point: PixelPoint, viewport: { width: number; height: number }): { card: { left: string; top: string }; anchor: PixelPoint; side: 'left' | 'right' } {
  const side = point.x >= viewport.width / 2 ? 'left' : 'right';
  const top = point.y > viewport.height * 0.62 ? '60%' : '14%';
  return { card: { left: side === 'left' ? '4%' : '68%', top }, anchor: point, side };
}

export function getResolvedCalloutCardPosition(
  placement: ReturnType<typeof getConnectedCalloutPlacement>,
  viewport: { width: number; height: number },
): { left: number; top: number } {
  const desiredLeft = (Number.parseFloat(placement.card.left) / 100) * viewport.width;
  const desiredTop = (Number.parseFloat(placement.card.top) / 100) * viewport.height;
  const maximumLeft = viewport.width - CALLOUT_WIDTH - CALLOUT_MARGIN;
  const maximumTop = viewport.height - CALLOUT_HEIGHT - CALLOUT_MARGIN;
  const reservedControlLeft = viewport.width - CALLOUT_WIDTH - MAPBOX_CONTROL_WIDTH - CALLOUT_MARGIN;
  const isBesideTopRightControls = placement.side === 'right' && desiredTop < MAPBOX_CONTROL_HEIGHT + CALLOUT_MARGIN;
  const isAboveLowerLeftLegend = placement.side === 'left' && desiredTop >= viewport.height / 2;

  return {
    left: Math.min(Math.max(desiredLeft, CALLOUT_MARGIN), isBesideTopRightControls ? reservedControlLeft : maximumLeft),
    top: Math.min(Math.max(desiredTop, CALLOUT_MARGIN), isAboveLowerLeftLegend ? viewport.height - MAP_LEGEND_HEIGHT - CALLOUT_HEIGHT - CALLOUT_MARGIN : maximumTop),
  };
}

function getFeatureGeographicCenter(feature: Feature<Geometry, Props>): [number, number] {
  const bbox = feature.bbox;
  if (bbox && bbox.length >= 4) return [(bbox[0]! + bbox[2]!) / 2, (bbox[1]! + bbox[3]!) / 2];
  const bounds = { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity };
  const visit = (coordinates: unknown): void => {
    if (!Array.isArray(coordinates)) return;
    if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
      bounds.west = Math.min(bounds.west, coordinates[0]); bounds.south = Math.min(bounds.south, coordinates[1]); bounds.east = Math.max(bounds.east, coordinates[0]); bounds.north = Math.max(bounds.north, coordinates[1]); return;
    }
    coordinates.forEach(visit);
  };
  if (feature.geometry.type === 'GeometryCollection') feature.geometry.geometries.forEach((geometry) => visit('coordinates' in geometry ? geometry.coordinates : undefined));
  else visit(feature.geometry.coordinates);
  return Number.isFinite(bounds.west) ? [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2] : [106.6319, -6.1783];
}

function setNativeConnector(map: MapboxMap, start?: PixelPoint, anchor?: PixelPoint) {
  const source = map.getSource(CONNECTOR_SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) return;
  if (!start || !anchor) { source.setData({ type: 'FeatureCollection', features: [] }); return; }
  const route = getConnectorPixelRoute(start, anchor).map((point) => {
    const coordinates = map.unproject([point.x, point.y]);
    return [coordinates.lng, coordinates.lat];
  });
  const marker = map.unproject([anchor.x, anchor.y]);
  source.setData({
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { kind: 'connector' }, geometry: { type: 'LineString', coordinates: route } },
      { type: 'Feature', properties: { kind: 'anchor' }, geometry: { type: 'Point', coordinates: [marker.lng, marker.lat] } },
    ],
  } as FeatureCollection);
}

export default function RealKecamatanMap({ metric = 'funds', selectedKecamatan, onSelectKecamatan, liveData, periodData, mapboxAccessToken }: { metric?: MapMetric; selectedKecamatan?: string | null; onSelectKecamatan?: (name: string) => void; liveData?: PenyaluranByKecamatan[]; periodData?: MapPeriodData; mapboxAccessToken?: string }) {
  const container = useRef<HTMLDivElement | null>(null); const mapRef = useRef<MapboxMap | null>(null); const onSelect = useRef(onSelectKecamatan);
  const calloutRef = useRef<Callout | null>(null);
  const [ready, setReady] = useState(false); const [error, setError] = useState(false); const [lastSelected, setLastSelected] = useState<string | null>(selectedKecamatan ?? null); const [callout, setCallout] = useState<Callout | null>(null);
  const presentation = getMapMetricPresentation(metric); const config = getMapboxStyleConfig(mapboxAccessToken ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const data = useMemo(() => ({ ...geojsonData, features: geojsonData.features.map((feature) => { const name = (feature.properties as Props).name; const raw = getMapMetricValue(name, metric, liveData, periodData); const scale = metric === 'funds' ? raw / 1_000_000 : metric === 'asnafNeed' ? raw * 2 : raw; const style = getKecamatanStyle({ name }, selectedKecamatan, scale); return { ...feature, properties: { ...feature.properties, fillColor: style.fillColor, isSelected: style.color === '#047857', fillOpacity: style.fillOpacity, outlineColor: style.color, outlineWidth: style.weight, metricValue: raw } }; }) }) as FeatureCollection<Geometry, Props>, [liveData, metric, periodData, selectedKecamatan]);
  useEffect(() => { onSelect.current = onSelectKecamatan; }, [onSelectKecamatan]);
  useEffect(() => { setLastSelected(selectedKecamatan ?? null); }, [selectedKecamatan]);
  useEffect(() => {
    if (!container.current || !config.accessToken || mapRef.current) return;
    const map = new mapboxgl.Map({ container: container.current, accessToken: config.accessToken, style: config.style, center: [106.6319, -6.1783], zoom: 11.8, minZoom: 10, maxZoom: 15 });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right'); map.scrollZoom.disable();
    map.once(MAP_READY_EVENT, () => { map.addSource(SOURCE_ID, { type: 'geojson', data, generateId: true }); map.addLayer({ id: FILL_ID, type: 'fill', source: SOURCE_ID, paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': getFillOpacityExpression() } }); map.addLayer({ id: 'kecamatan-outline', type: 'line', source: SOURCE_ID, paint: { 'line-color': ['get', 'outlineColor'], 'line-width': ['get', 'outlineWidth'], 'line-opacity': .95 } }); map.addSource(CONNECTOR_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }); map.addLayer({ id: CONNECTOR_LINE_ID, type: 'line', source: CONNECTOR_SOURCE_ID, filter: ['==', ['get', 'kind'], 'connector'], paint: { 'line-color': '#059669', 'line-width': 2.5, 'line-opacity': 0.9 } }); map.addLayer({ id: CONNECTOR_ANCHOR_ID, type: 'circle', source: CONNECTOR_SOURCE_ID, filter: ['==', ['get', 'kind'], 'anchor'], paint: { 'circle-radius': 5, 'circle-color': '#047857', 'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff' } }); map.on('mouseenter', FILL_ID, () => { map.getCanvas().style.cursor = 'pointer'; }); map.on('mouseleave', FILL_ID, () => { map.getCanvas().style.cursor = ''; }); map.on('click', FILL_ID, (event: MapMouseEvent) => { const name = event.features?.[0]?.properties?.name; if (name) { setLastSelected(name); onSelect.current?.(name); } }); setError(false); setReady(true); });
    map.on('error', () => { if (shouldShowMapLoadError(false, map.isStyleLoaded())) setError(true); }); mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [config.accessToken, config.style]);
  useEffect(() => { if (ready) (mapRef.current?.getSource(SOURCE_ID) as GeoJSONSource | undefined)?.setData(data); }, [data, ready]);
  useEffect(() => {
    const map = mapRef.current; if (!map || !ready || !lastSelected) { if (map) setNativeConnector(map); calloutRef.current = null; setCallout(null); return; }
    const selectionKey = `${lastSelected}-${metric}`;
    const updateCallout = () => { const feature = data.features.find((candidate) => candidate.properties.name.toLowerCase() === lastSelected.toLowerCase()); if (!feature) { setNativeConnector(map); calloutRef.current = null; setCallout(null); return; } const viewport = { width: map.getContainer().clientWidth, height: map.getContainer().clientHeight }; const projected = map.project(getFeatureGeographicCenter(feature)); const point = { x: projected.x, y: projected.y }; const nextCallout = { point, viewport, placement: getConnectedCalloutPlacement(point, viewport), selectionKey, selectedKecamatan: lastSelected }; const position = getResolvedCalloutCardPosition(nextCallout.placement, viewport); const start = { x: nextCallout.placement.side === 'left' ? position.left + CALLOUT_WIDTH : position.left, y: position.top + 74 }; setNativeConnector(map, shouldRenderMapConnector(viewport.width) ? start : undefined, shouldRenderMapConnector(viewport.width) ? point : undefined); calloutRef.current = nextCallout; setCallout(nextCallout); };
    updateCallout(); getCalloutPositionEvents().forEach((eventName) => map.on(eventName, updateCallout));
    return () => { getCalloutPositionEvents().forEach((eventName) => map.off(eventName, updateCallout)); };
  }, [data, lastSelected, metric, ready]);
  if (!config.accessToken) return <div className="flex h-[360px] items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-500">Token Mapbox belum terpasang.</div>;
  const focusedFeature = data.features.find((feature) => feature.properties.name.toLowerCase() === lastSelected?.toLowerCase()); const focusedValue = focusedFeature?.properties.metricValue ?? 0;
  const formatValue = metric === 'funds' ? `Rp ${(focusedValue / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M` : `${focusedValue.toLocaleString('id-ID')} ${metric === 'beneficiaries' ? 'jiwa' : 'KK'}`;
  const decisionContext = lastSelected ? getCalloutDecisionContext(lastSelected, liveData, periodData) : { mustahik: 0, topProgram: '' };
  const resolvedCalloutPosition = callout ? getResolvedCalloutCardPosition(callout.placement, callout.viewport) : null;
  return <div className="relative h-[430px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-emerald-50/30 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
    <div ref={container} className="h-full w-full" aria-label="Peta interaktif Kota Tangerang" />
    {!ready && !error && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-zinc-500">Memuat peta Kota Tangerang...</div>}
    {error && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 text-sm font-semibold text-rose-700">Peta Mapbox tidak dapat dimuat.</div>}
    {ready && lastSelected && callout && resolvedCalloutPosition && <div key={callout.selectionKey} className={`map-focus-card-position absolute z-20 ${getCalloutLayoutMode(callout.viewport.width) === 'compact' ? 'map-focus-card-compact' : ''}`} style={{ left: resolvedCalloutPosition.left, top: resolvedCalloutPosition.top }}><div className="map-focus-card h-[188px] w-56 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-[0_14px_32px_rgba(6,78,59,0.16)] backdrop-blur"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">Fokus wilayah</p><p className="mt-1 text-sm font-extrabold text-slate-950">{lastSelected}</p><p className="mt-0.5 truncate text-xs font-semibold text-emerald-700">{presentation.label} · {formatValue}</p><dl className="mt-2 grid grid-cols-2 gap-2 border-t border-emerald-50 pt-2 text-[10px]"><div><dt className="font-semibold text-slate-400">Mustahik</dt><dd className="font-extrabold text-slate-800">{decisionContext.mustahik.toLocaleString('id-ID')}</dd></div><div><dt className="font-semibold text-slate-400">Program</dt><dd className="truncate font-extrabold text-slate-800" title={decisionContext.topProgram}>{decisionContext.topProgram}</dd></div></dl><a href={`/penyaluran/mustahik?kecamatan=${encodeURIComponent(lastSelected)}`} className="mt-3 inline-flex text-xs font-extrabold text-emerald-700 transition hover:text-emerald-900">Lihat detail <span aria-hidden="true">→</span></a></div></div>}
    <div className={`map-map-legend absolute left-4 z-10 rounded-xl border border-zinc-200 bg-white/95 p-3 text-[11px] shadow-sm ${callout && getCalloutLayoutMode(callout.viewport.width) === 'compact' ? 'map-map-legend-compact' : ''}`}><p className="mb-1.5 font-bold text-zinc-900">Intensitas {presentation.label.toLowerCase()}</p><div className="flex gap-2 text-zinc-600"><span>Rendah</span><span>Menengah</span><span>Tinggi</span></div></div>
  </div>;
}
