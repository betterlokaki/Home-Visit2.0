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
          // Map is loaded and ready
        }}
      >
        <MapPolygonLayer sites={sites} />
      </Map>
    );
  }
);

MapComponent.displayName = 'MapComponent';
