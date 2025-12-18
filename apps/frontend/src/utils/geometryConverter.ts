import type { FeatureCollection, Feature, Polygon, MultiPolygon, Geometry } from 'geojson';
import type { Site } from '@home-visit/common';
import wkt from 'wellknown';
import { getMapColor } from './mapColors';

export function convertWktToGeoJson(wktString: string | null | unknown): Geometry | null {
  if (!wktString) {
    return null;
  }

  // Handle case where geometry might already be a GeoJSON object
  if (typeof wktString === 'object' && wktString !== null) {
    // Check if it's already a GeoJSON Polygon or MultiPolygon
    if ('type' in wktString && 'coordinates' in wktString) {
      if (wktString.type === 'Polygon' || wktString.type === 'MultiPolygon') {
        return wktString as Geometry;
      }
    }
    // If it's an object but not GeoJSON, log and return null
    console.error('Error parsing WKT: input is an object but not a valid GeoJSON Polygon/MultiPolygon', { value: wktString });
    return null;
  }

  // Ensure wktString is actually a string
  if (typeof wktString !== 'string') {
    console.error('Error parsing WKT: input is not a string or object', { type: typeof wktString, value: wktString });
    return null;
  }

  // Trim whitespace and validate it looks like WKT
  const trimmed = wktString.trim();
  if (!trimmed || trimmed.length === 0) {
    console.error('Error parsing WKT: input is empty string');
    return null;
  }

  // Basic validation - WKT should start with POLYGON or MULTIPOLYGON
  const upperTrimmed = trimmed.toUpperCase();
  if (!upperTrimmed.startsWith('POLYGON') && !upperTrimmed.startsWith('MULTIPOLYGON')) {
    console.error('Error parsing WKT: input does not start with POLYGON or MULTIPOLYGON', { wktString: trimmed });
    return null;
  }

  try {
    const geoJson = wkt.parse(trimmed);
    if (geoJson && (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon')) {
      return geoJson as Geometry;
    }
    console.error('Error parsing WKT: parsed result is not a Polygon or MultiPolygon', { geoJson });
    return null;
  } catch (error) {
    console.error('Error parsing WKT:', error, { wktString: trimmed, errorMessage: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export function sitesToGeoJson(sites: Site[]): FeatureCollection {
  const features: Feature[] = sites
    .filter((site) => site.geometry)
    .map((site) => {
      const geometry = convertWktToGeoJson(site.geometry);
      if (!geometry) {
        console.warn('Failed to convert geometry for site', { siteName: site.siteName, geometry: site.geometry });
        return null;
      }

      const mapColor = getMapColor(
        site.coverStatus,
        site.status?.seenStatus,
        false // Map doesn't track isOpen state
      );

      return {
        type: 'Feature',
        geometry: geometry,
        properties: {
          siteId: site.siteId,
          siteName: site.siteName,
          siteDisplayName: site.siteDisplayName,
          coverStatus: site.coverStatus,
          seenStatus: site.status?.seenStatus,
          fillColor: mapColor.fill,
          strokeColor: mapColor.stroke,
          fillOpacity: mapColor.fillOpacity,
          strokeWidth: mapColor.strokeWidth,
        },
      } as Feature;
    })
    .filter((feature): feature is Feature => feature !== null);

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function calculatePolygonCentroid(geometry: Polygon | MultiPolygon): [number, number] {
  if (geometry.type === 'Polygon') {
    const polygon = geometry;
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
      return [0, 0];
    }

    const ring = polygon.coordinates[0];
    let sumLon = 0;
    let sumLat = 0;
    let count = 0;

    for (const coord of ring) {
      sumLon += coord[0];
      sumLat += coord[1];
      count++;
    }

    return [sumLon / count, sumLat / count];
  } else if (geometry.type === 'MultiPolygon') {
    // For MultiPolygon, calculate centroid of the first polygon
    const multiPolygon = geometry;
    if (!multiPolygon.coordinates || multiPolygon.coordinates.length === 0) {
      return [0, 0];
    }

    const firstPolygon = multiPolygon.coordinates[0];
    if (!firstPolygon || firstPolygon.length === 0) {
      return [0, 0];
    }

    const ring = firstPolygon[0];
    let sumLon = 0;
    let sumLat = 0;
    let count = 0;

    for (const coord of ring) {
      sumLon += coord[0];
      sumLat += coord[1];
      count++;
    }

    return [sumLon / count, sumLat / count];
  }

  return [0, 0];
}

