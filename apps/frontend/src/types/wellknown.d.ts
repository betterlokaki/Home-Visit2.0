declare module 'wellknown' {
  import type { Geometry } from 'geojson';

  function parse(wkt: string): Geometry | null;
  function stringify(geoJson: Geometry): string;

  export default {
    parse,
    stringify,
  };
}

