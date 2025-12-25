import type { Site } from '@home-visit/common';
import { convertWktToGeoJson } from './geometryConverter';
import { calculatePolygonCentroid } from './geometryConverter';

export interface InitialViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

const DEFAULT_INITIAL_VIEW_STATE: InitialViewState = {
  longitude: 0,
  latitude: 0,
  zoom: 10,
};

export function calculateInitialViewState(sites: Site[]): InitialViewState {
  const sitesWithGeometry = sites.filter((site) => site.geometry);

  if (sitesWithGeometry.length === 0) {
    return DEFAULT_INITIAL_VIEW_STATE;
  }

  const firstSite = sitesWithGeometry[0];
  if (!firstSite.geometry) {
    return DEFAULT_INITIAL_VIEW_STATE;
  }

  const geometry = convertWktToGeoJson(firstSite.geometry);
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return DEFAULT_INITIAL_VIEW_STATE;
  }

  const center = calculatePolygonCentroid(geometry);
  return {
    longitude: center[0],
    latitude: center[1],
    zoom: 10,
  };
}

