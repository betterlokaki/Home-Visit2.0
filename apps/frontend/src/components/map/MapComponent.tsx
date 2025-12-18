import React, { useImperativeHandle, forwardRef, useMemo } from 'react';
import { Map } from '@vis.gl/react-maplibre';
import type { MapRef } from '@vis.gl/react-maplibre';
import type { Site } from '@home-visit/common';
import { MapPolygonLayer } from './MapPolygonLayer';
import { useMapClickHandler } from './useMapClickHandler';
import { useMapFlyTo } from './useMapFlyTo';
import { calculateInitialViewState } from '../../utils/mapInitialView';
import { useMapConfig } from '../../hooks/useMapConfig';

interface MapComponentProps {
  sites: Site[];
  onPolygonClick: (siteId: number) => void;
}

export interface MapComponentRef {
  flyToSite: (siteId: number) => void;
}

export const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(
  ({ sites, onPolygonClick }, ref) => {
    const mapRef = React.useRef<MapRef>(null);
    const flyToSite = useMapFlyTo(mapRef, sites);
    const handleMapClick = useMapClickHandler(mapRef, onPolygonClick);
    const mapConfig = useMapConfig();
    
    // #region agent log
    React.useEffect(() => {
      fetch('http://127.0.0.1:7243/ingest/47422ed6-64a0-40b5-9e52-57242e82b502', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapComponent.tsx:render', message: 'MapComponent rendered', data: { sitesCount: sites.length, mapStyle: mapConfig?.mapStyle || 'default' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => {});
    }, [sites.length, mapConfig?.mapStyle]);
    // #endregion

    useImperativeHandle(ref, () => ({
      flyToSite,
    }));

    const initialViewState = useMemo(
      () => calculateInitialViewState(sites),
      [sites]
    );

    const mapStyle = mapConfig?.mapStyle || 'https://demotiles.maplibre.org/style.json';

    return (
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onClick={handleMapClick}
        onLoad={() => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/47422ed6-64a0-40b5-9e52-57242e82b502', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapComponent.tsx:onLoad', message: 'Map onLoad event fired', data: { sitesCount: sites.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => {});
          // #endregion
          // Map is loaded and ready
        }}
      >
        <MapPolygonLayer sites={sites} />
      </Map>
    );
  }
);

MapComponent.displayName = 'MapComponent';
