import { describe, expect, it } from 'vitest';
import { MAP_READY_EVENT, getCalloutDecisionContext, getCalloutLayoutMode, getCalloutPositionEvents, getConnectedCalloutPlacement, getConnectorPixelRoute, getFillOpacityExpression, getKecamatanStyle, getMapboxStyleConfig, getResolvedCalloutCardPosition, getSelectionFocusStyle, getTileLayerConfig, shouldRenderMapConnector, shouldShowMapLoadError } from './RealKecamatanMap';

describe('getKecamatanStyle', () => {
  it('uses a BAZNAS green focus border instead of a harsh black border', () => {
    expect(getKecamatanStyle({ name: 'Cipondoh' }, 'Cipondoh', 180)).toMatchObject({
      color: '#047857',
      weight: 3,
    });
  });

  it('uses a no-key OSM fallback until a restricted MapTiler key is configured', () => {
    expect(getTileLayerConfig(undefined).url).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });

  it('uses MapTiler Light when the domain-restricted public key is configured', () => {
    expect(getTileLayerConfig('restricted-key').url).toContain('api.maptiler.com/maps/streets-v2-light');
  });

  it('prefers CARTO Voyager when a CARTO access token is configured', () => {
    const tileLayer = getTileLayerConfig(undefined, 'carto-token');

    expect(tileLayer.url).toContain('basemaps.cartocdn.com/rastertiles/voyager');
    expect(tileLayer.url).toContain('api_key=carto-token');
  });

  it('configures the professional Mapbox Light basemap with the supplied public token', () => {
    expect(getMapboxStyleConfig('mapbox-public-token')).toEqual({
      accessToken: 'mapbox-public-token',
      style: 'mapbox://styles/mapbox/light-v11',
    });
  });

  it('does not cover a loaded map for a non-fatal Mapbox resource error', () => {
    expect(shouldShowMapLoadError(true, true)).toBe(false);
    expect(shouldShowMapLoadError(true, false)).toBe(false);
    expect(shouldShowMapLoadError(false, false)).toBe(true);
  });

  it('uses a complete Mapbox case expression for polygon opacity', () => {
    expect(getFillOpacityExpression()).toEqual([
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.95,
      ['get', 'fillOpacity'],
    ]);
  });

  it('uses a lifted focus treatment without requesting a camera zoom', () => {
    expect(getSelectionFocusStyle(true)).toEqual({
      fillOpacity: 0.94,
      outlineColor: '#047857',
      outlineWidth: 3,
    });
    expect(getSelectionFocusStyle(false)).toEqual({
      fillOpacity: 0.42,
      outlineColor: '#ffffff',
      outlineWidth: 1,
    });
  });

  it('attaches custom GeoJSON layers when the Mapbox style is ready', () => {
    expect(MAP_READY_EVENT).toBe('style.load');
  });
});

describe('getConnectedCalloutPlacement', () => {
  it('places the callout in the opposing upper-left safe zone for an upper-right point', () => {
    const point = { x: 640, y: 250 };

    expect(getConnectedCalloutPlacement(point, { width: 900, height: 430 })).toEqual({
      card: { left: '4%', top: '14%' },
      anchor: point,
      side: 'left',
    });
  });
});

describe('shouldRenderMapConnector', () => {
  it('keeps the map readable on compact viewports while showing the connector at desktop width', () => {
    expect(shouldRenderMapConnector(639)).toBe(false);
    expect(shouldRenderMapConnector(640)).toBe(true);
  });

  it('uses the same container-width threshold for compact callout layout', () => {
    expect(getCalloutLayoutMode(639)).toBe('compact');
    expect(getCalloutLayoutMode(640)).toBe('desktop');
  });

  it('recalculates the single connector only when the map size changes', () => {
    expect(getCalloutPositionEvents()).toEqual(['resize']);
  });

  it('uses one deterministic leader route from the card to the selected area', () => {
    expect(getConnectorPixelRoute({ x: 240, y: 74 }, { x: 900, y: 264 })).toEqual([
      { x: 240, y: 74 },
      { x: 336, y: 74 },
      { x: 900, y: 264 },
    ]);
  });
});

describe('getResolvedCalloutCardPosition', () => {
  it('keeps the upper-right placement clear of Mapbox controls at the 640px connector breakpoint', () => {
    const placement = getConnectedCalloutPlacement({ x: 160, y: 50 }, { width: 640, height: 430 });

    expect(getResolvedCalloutCardPosition(placement, { width: 640, height: 430 })).toEqual({ left: 336, top: 60.2 });
  });

  it('moves a lower-left callout above the map legend without changing its placement decision', () => {
    const placement = getConnectedCalloutPlacement({ x: 500, y: 380 }, { width: 640, height: 430 });

    expect(placement.card).toEqual({ left: '4%', top: '60%' });
    expect(getResolvedCalloutCardPosition(placement, { width: 640, height: 430 })).toEqual({ left: 25.6, top: 156 });
  });
});

describe('getCalloutDecisionContext', () => {
  it('uses the active period snapshot before demo data when live data is unavailable', () => {
    expect(getCalloutDecisionContext('Cipondoh', undefined, {
      Cipondoh: { amount: 42_000_000, beneficiaries: 27, program: 'Tangerang Takwa' },
    })).toEqual({ mustahik: 27, topProgram: 'Tangerang Takwa' });
  });
});
