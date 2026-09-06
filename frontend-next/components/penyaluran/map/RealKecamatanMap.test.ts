import { describe, expect, it } from 'vitest';
import { getKecamatanStyle, getMapboxStyleConfig, getTileLayerConfig } from './RealKecamatanMap';

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
});
