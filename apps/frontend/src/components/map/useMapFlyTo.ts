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
      if (!site) {
        throw new Error(`Site with id ${siteId} not found`);
      }
      if (!site.geometry) {
        throw new Error(`Site ${site.siteName} (id: ${siteId}) has no geometry`);
      }
      if (!mapRef.current) {
        throw new Error('Map ref is null');
      }

      const geometry = convertWktToGeoJson(site.geometry);
      if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
        throw new Error(`Site ${site.siteName} (id: ${siteId}) has invalid geometry type: ${geometry.type}`);
      }

      const center = calculatePolygonCentroid(geometry);
      const map = mapRef.current.getMap();
      
      if (!map) {
        throw new Error('Map instance not available');
      }

      if (typeof map.flyTo !== 'function') {
        throw new Error('flyTo method not available on map instance');
      }

      // Ensure coordinates are in correct format [lng, lat]
      if (!Array.isArray(center) || center.length !== 2) {
        throw new Error(`Invalid center coordinates: expected [lng, lat], got ${JSON.stringify(center)}`);
      }

      if (!mapConfig) {
        throw new Error('Map config is not available');
      }
      if (!mapConfig.flyToZoom) {
        throw new Error('Map config flyToZoom is required');
      }

      map.flyTo({
        center: [center[0], center[1]] as [number, number],
        zoom: mapConfig.flyToZoom,
        duration: 1500,
        essential: true,
      });
    },
    [mapRef, sites, mapConfig]
  );
}

