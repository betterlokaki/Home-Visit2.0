import type { FeatureCollection, Feature, Polygon, MultiPolygon, Geometry } from 'geojson';
import type { Site } from '@home-visit/common';
import wkt from 'wellknown';
import { getMapColor } from './mapColors';

export function convertWktToGeoJson(wktString: string | null | unknown): Geometry {
  // Check for null or undefined first
  if (wktString === null || wktString === undefined) {
    throw new Error('WKT string is null or undefined');
  }

  // Handle case where geometry might already be a GeoJSON object
  if (typeof wktString === 'object' && wktString !== null) {
    // Check if it's already a GeoJSON Polygon or MultiPolygon
    if ('type' in wktString && 'coordinates' in wktString) {
      if (wktString.type === 'Polygon' || wktString.type === 'MultiPolygon') {
        return wktString as Geometry;
      }
      throw new Error(`Invalid GeoJSON type: expected Polygon or MultiPolygon, got ${wktString.type}`);
    }
    throw new Error('Input is an object but not a valid GeoJSON Polygon/MultiPolygon');
  }

  // Ensure wktString is actually a string
  if (typeof wktString !== 'string') {
    throw new Error(`Invalid WKT input type: expected string, got ${typeof wktString}`);
  }

  // Trim whitespace and validate it looks like WKT
  const trimmed = wktString.trim();
  if (!trimmed || trimmed.length === 0) {
    throw new Error('WKT string is empty');
  }

  // Basic validation - WKT should start with POLYGON or MULTIPOLYGON
  const upperTrimmed = trimmed.toUpperCase();
  if (!upperTrimmed.startsWith('POLYGON') && !upperTrimmed.startsWith('MULTIPOLYGON')) {
    throw new Error(`Invalid WKT format: must start with POLYGON or MULTIPOLYGON, got ${trimmed.substring(0, 20)}...`);
  }

  const geoJson = wkt.parse(trimmed);
  if (!geoJson) {
    throw new Error('Failed to parse WKT string');
  }
  if (geoJson.type !== 'Polygon' && geoJson.type !== 'MultiPolygon') {
    throw new Error(`Parsed WKT is not a Polygon or MultiPolygon, got ${geoJson.type}`);
  }
  return geoJson as Geometry;
}

export function sitesToGeoJson(sites: Site[]): FeatureCollection {
  const features: Feature[] = sites
    .filter((site) => site.geometry)
    .map((site) => {
      const geometry = convertWktToGeoJson(site.geometry);
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
    });

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function calculatePolygonCentroid(geometry: Polygon | MultiPolygon): [number, number] {
  if (geometry.type === 'Polygon') {
    const polygon = geometry as Polygon;
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
      throw new Error('Polygon has no coordinates');
    }

    const ring = polygon.coordinates[0];
    if (!ring || ring.length === 0) {
      throw new Error('Polygon ring is empty');
    }

    let sumLon = 0;
    let sumLat = 0;
    let count = 0;

    for (const coord of ring) {
      sumLon += coord[0];
      sumLat += coord[1];
      count++;
    }

    if (count === 0) {
      throw new Error('Polygon ring has no coordinates');
    }

    return [sumLon / count, sumLat / count];
  }
  
  if (geometry.type === 'MultiPolygon') {
    // For MultiPolygon, calculate centroid of the first polygon
    const multiPolygon = geometry as MultiPolygon;
    if (!multiPolygon.coordinates || multiPolygon.coordinates.length === 0) {
      throw new Error('MultiPolygon has no coordinates');
    }

    const firstPolygon = multiPolygon.coordinates[0];
    if (!firstPolygon || firstPolygon.length === 0) {
      throw new Error('MultiPolygon first polygon is empty');
    }

    const ring = firstPolygon[0];
    if (!ring || ring.length === 0) {
      throw new Error('MultiPolygon first ring is empty');
    }

    let sumLon = 0;
    let sumLat = 0;
    let count = 0;

    for (const coord of ring) {
      sumLon += coord[0];
      sumLat += coord[1];
      count++;
    }

    if (count === 0) {
      throw new Error('MultiPolygon ring has no coordinates');
    }

    return [sumLon / count, sumLat / count];
  }

  throw new Error(`Unsupported geometry type: ${(geometry as Geometry).type}`);
}

