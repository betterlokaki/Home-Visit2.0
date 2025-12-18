import type { Site } from '@home-visit/common';
import { convertWktToGeoJson } from './geometryConverter';
import { calculatePolygonCentroid } from './geometryConverter';

export interface InitialViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

const DEFAULT_CENTER: [number, number] = [34.8516, 31.0461]; // Default to Israel center
const DEFAULT_ZOOM = 10;

export function calculateInitialViewState(sites: Site[]): InitialViewState {
  const sitesWithGeometry = sites.filter((site) => site.geometry);

  if (sitesWithGeometry.length === 0) {
    return {
      longitude: DEFAULT_CENTER[0],
      latitude: DEFAULT_CENTER[1],
      zoom: DEFAULT_ZOOM,
    };
  }

  const firstSite = sitesWithGeometry[0];
  const geometry = convertWktToGeoJson(firstSite.geometry);
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    return {
      longitude: DEFAULT_CENTER[0],
      latitude: DEFAULT_CENTER[1],
      zoom: DEFAULT_ZOOM,
    };
  }

  const center = calculatePolygonCentroid(geometry);
  return {
    longitude: center[0],
    latitude: center[1],
    zoom: DEFAULT_ZOOM,
  };
}

