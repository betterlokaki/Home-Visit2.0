import { useCallback } from 'react';
import type { MapRef } from '@vis.gl/react-maplibre';

export interface MapClickEvent {
  lngLat: { lng: number; lat: number };
  point: { x: number; y: number };
}

export function useMapClickHandler(
  mapRef: React.RefObject<MapRef>,
  onPolygonClick: (siteId: number) => void
) {
  return useCallback(
    (e: MapClickEvent) => {
      if (!mapRef.current || !e.point) return;

      const map = mapRef.current.getMap();
      const point: [number, number] = [e.point.x, e.point.y];
      const features = map.queryRenderedFeatures(point, {
        layers: ['sites-fill', 'sites-stroke'],
      });

      if (features.length > 0) {
        const feature = features[0];
        const siteId = feature.properties?.siteId as number | undefined;
        if (siteId !== undefined) {
          onPolygonClick(siteId);
        }
      }
    },
    [mapRef, onPolygonClick]
  );
}

