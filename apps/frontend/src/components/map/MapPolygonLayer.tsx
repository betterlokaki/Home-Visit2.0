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
  const [isStyleLoaded, setIsStyleLoaded] = React.useState(false);
  const geoJsonData = useMemo<FeatureCollection>(() => {
    try {
      return sitesToGeoJson(sites);
    } catch (error) {
      console.error('Error converting sites to GeoJSON:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }, [sites]);

  // Wait for style to load before adding source (important for JSON styles)
  useEffect(() => {
    if (!map) return;
    
    let mounted = true;
    let cleanup: (() => void) | undefined;
    
    const checkStyleLoad = () => {
      if (!mounted) return;
      
      try {
        const mapInstance = map as unknown as maplibregl.Map;
        if (typeof mapInstance.isStyleLoaded !== 'function') {
          setIsStyleLoaded(true);
          return;
        }

        if (mapInstance.isStyleLoaded()) {
          setIsStyleLoaded(true);
        } else {
          const onStyleLoad = () => {
            if (mounted) {
              setIsStyleLoaded(true);
            }
          };
          mapInstance.on('style.load', onStyleLoad);
          cleanup = () => {
            mapInstance.off('style.load', onStyleLoad);
          };
        }
      } catch (error) {
        console.error('Error checking style load:', error);
        if (mounted) {
          setIsStyleLoaded(true);
        }
      }
    };
    
    // Use setTimeout to avoid synchronous setState
    const timeoutId = setTimeout(checkStyleLoad, 0);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (cleanup) {
        cleanup();
      }
    };
  }, [map]);

  // Update source data when sites change
  useEffect(() => {
    if (!map || !geoJsonData || !isStyleLoaded) return;
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
  }, [map, geoJsonData, isStyleLoaded]);

  if (geoJsonData.features.length === 0 || !isStyleLoaded) {
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
