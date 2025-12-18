import React, { useMemo } from 'react';
import { Source, Layer } from '@vis.gl/react-maplibre';
import type { FeatureCollection } from 'geojson';
import type { Site } from '@home-visit/common';
import { sitesToGeoJson } from '../../utils/geometryConverter';

interface MapPolygonLayerProps {
  sites: Site[];
}

export const MapPolygonLayer: React.FC<MapPolygonLayerProps> = ({ sites }) => {
  const geoJsonData = useMemo<FeatureCollection>(() => {
    try {
      return sitesToGeoJson(sites);
    } catch (error) {
      console.error('Error converting sites to GeoJSON:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }, [sites]);

  if (geoJsonData.features.length === 0) {
    return null;
  }

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
};
