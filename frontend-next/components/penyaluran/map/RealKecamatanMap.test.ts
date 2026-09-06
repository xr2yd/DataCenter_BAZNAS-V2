import { describe, expect, it } from 'vitest';
import { MAP_READY_EVENT, getFillOpacityExpression, getKecamatanStyle, getMapboxStyleConfig, getSelectionFocusStyle, getTileLayerConfig, shouldShowMapLoadError } from './RealKecamatanMap';

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
