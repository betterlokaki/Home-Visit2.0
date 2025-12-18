import { useCallback } from 'react';
import type { MapRef } from '@vis.gl/react-maplibre';
import type { Site } from '@home-visit/common';
import { convertWktToGeoJson } from '../../utils/geometryConverter';
import { calculatePolygonCentroid } from '../../utils/geometryConverter';
import { useMapConfig } from '../../hooks/useMapConfig';

export function useMapFlyTo(
  mapRef: React.RefObject<MapRef>,
  sites: Site[]
) {
  const mapConfig = useMapConfig();
  return useCallback(
    (siteId: number) => {
      const site = sites.find((s) => s.siteId === siteId);
      if (!site || !site.geometry || !mapRef.current) {
        console.warn('FlyTo: Site not found or missing geometry or map ref', { siteId, hasSite: !!site, hasGeometry: !!site?.geometry, hasMapRef: !!mapRef.current, geometryType: typeof site?.geometry });
        return;
      }

      // Pass geometry directly to converter - it will handle string, object, or null
      // Don't convert to string if it's already an object, as it might be GeoJSON
      const polygon = convertWktToGeoJson(site.geometry);
      if (!polygon) {
        console.warn('FlyTo: Failed to convert geometry to polygon', { siteId, geometry: site.geometry, geometryType: typeof site.geometry });
        return;
      }

      try {
        const center = calculatePolygonCentroid(polygon);
        
        if (!mapRef.current) {
          console.error('FlyTo: Map ref is null');
          return;
        }

        const map = mapRef.current.getMap();
        
        if (!map) {
          console.error('FlyTo: Map instance not available');
          return;
        }

        if (typeof map.flyTo !== 'function') {
          console.error('FlyTo: flyTo method not available on map instance', { map, availableMethods: Object.keys(map) });
          return;
        }

        // Ensure coordinates are in correct format [lng, lat]
        if (!Array.isArray(center) || center.length !== 2) {
          console.error('FlyTo: Invalid center coordinates', { center });
          return;
        }

        const zoom = mapConfig?.flyToZoom || 15;
        map.flyTo({
          center: [center[0], center[1]] as [number, number],
          zoom: zoom,
          duration: 1500,
          essential: true,
        });
      } catch (error) {
        console.error('FlyTo: Error during flyTo operation', error);
      }
    },
    [mapRef, sites]
  );
}

