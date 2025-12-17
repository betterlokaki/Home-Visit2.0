import type { CoverStatus, SeenStatus } from '@home-visit/common';
import { getStatusDisplay } from './statusDisplay';

export interface MapColor {
  fill: string;
  stroke: string;
  fillOpacity: number;
  strokeWidth: number;
}

export function getMapColor(
  coverStatus: CoverStatus | 'no data available' | undefined,
  seenStatus: SeenStatus | undefined,
  isOpen: boolean
): MapColor {
  const statusDisplay = getStatusDisplay(coverStatus, seenStatus, isOpen);

  // Map status colors to map-optimized colors
  // Similar theme but adjusted for better visibility on map background
  switch (statusDisplay.color) {
    case 'red':
      return {
        fill: '#ef4444', // red-500
        stroke: '#dc2626', // red-600
        fillOpacity: 0.6,
        strokeWidth: 2,
      };
    case 'yellow':
      return {
        fill: '#eab308', // yellow-500
        stroke: '#ca8a04', // yellow-600
        fillOpacity: 0.6,
        strokeWidth: 2,
      };
    case 'orange':
      return {
        fill: '#f97316', // orange-500
        stroke: '#ea580c', // orange-600
        fillOpacity: 0.6,
        strokeWidth: 2,
      };
    case 'green':
      return {
        fill: '#22c55e', // green-500
        stroke: '#16a34a', // green-600
        fillOpacity: 0.6,
        strokeWidth: 2,
      };
    case 'blue':
      return {
        fill: '#3b82f6', // blue-500
        stroke: '#2563eb', // blue-600
        fillOpacity: 0.6,
        strokeWidth: 2,
      };
    default:
      return {
        fill: '#6b7280', // gray-500
        stroke: '#4b5563', // gray-600
        fillOpacity: 0.6,
        strokeWidth: 2,
      };
  }
}
