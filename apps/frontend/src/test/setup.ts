import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock services that make network calls to prevent unhandled promise rejections
vi.mock('../services/mapConfigService', () => ({
  mapConfigService: {
    getMapConfig: vi.fn().mockResolvedValue({
      mapStyle: {
        version: 8,
        sources: {},
        layers: [],
      },
      flyToZoom: 15,
    }),
  },
}));

vi.mock('../services/usersService', () => ({
  usersService: {
    getUsersByGroup: vi.fn().mockResolvedValue([]),
  },
}));

