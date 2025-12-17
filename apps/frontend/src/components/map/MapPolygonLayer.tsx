import React, { useMemo, useEffect } from 'react';
import { Source, Layer, useMap } from '@vis.gl/react-maplibre';
import type { FeatureCollection } from 'geojson';
import type { Site } from '@home-visit/common';
import { sitesToGeoJson } from '../../utils/geometryConverter';

interface MapPolygonLayerProps {
  sites: Site[];
}

export const MapPolygonLayer: React.FC<MapPolygonLayerProps> = ({ sites }) => {
  const map = useMap();
  const geoJsonData = useMemo<FeatureCollection>(() => {
    try {
      return sitesToGeoJson(sites);
    } catch (error) {
      console.error('Error converting sites to GeoJSON:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }, [sites]);

  // Update source data when sites change
  useEffect(() => {
    if (!map || !geoJsonData) return;
    try {
      const mapInstance = map as unknown as maplibregl.Map;

      if (typeof mapInstance.getSource !== 'function') return;

      const source = mapInstance.getSource('sites-source');
      if (source && 'setData' in source && typeof source.setData === 'function') {
        (source as maplibregl.GeoJSONSource).setData(geoJsonData);
      }
    } catch (error) {
      console.error('Error updating map source data:', error);
    }
  }, [map, geoJsonData]);

  if (geoJsonData.features.length === 0) {
    return null;
  }

  try {
    return (
      <Source id="sites-source" type="geojson" data={geoJsonData}>
        <Layer
          id="sites-fill"
          type="fill"
          paint={{
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': ['get', 'fillOpacity'],
          }}
        />
        <Layer
          id="sites-stroke"
          type="line"
          paint={{
            'line-color': ['get', 'strokeColor'],
            'line-width': ['get', 'strokeWidth'],
          }}
        />
      </Source>
    );
  } catch (error) {
    console.error('Error rendering MapPolygonLayer:', error);
    return null;
  }
};
