import type {
  FenderDimensions,
  MooringZoneDimensions,
  PierDimensions,
  TableDimensions,
  VesselDimensions,
} from '../types/harbor.types.js';

// Tabletop placed at sitting height (0.74m) within 60cm reach
export const HARBOR_TABLE: TableDimensions = {
  width: 0.9,
  depth: 0.6,
  height: 0.74,
  rimThickness: 0.03,
  rimHeight: 0.04,
  basinDepth: 0.02,
};

export const PIER_CONFIG: PierDimensions = {
  width: 0.58,
  height: 0.028,
  depth: 0.1,
  zOffset: -0.2,
  bollardRadius: 0.006,
  bollardHeight: 0.014,
};

export const FENDER_CONFIG: FenderDimensions = {
  radius: 0.009,
  length: 0.048,
  xPositions: [-0.18, 0, 0.18],
  yOffset: 0.756,
  zOffset: -0.144,
};

export const MOORING_ZONE_CONFIG: MooringZoneDimensions = {
  width: 0.3,
  depth: 0.075,
  borderThickness: 0.004,
  yOffset: 0.748,
  zOffset: -0.095,
};

export const VESSEL_CONFIG: VesselDimensions = {
  length: 0.24,
  beam: 0.052,
  hullHeight: 0.018,
  deckHeight: 0.004,
  bridgeWidth: 0.028,
  bridgeHeight: 0.032,
  bridgeDepth: 0.042,
};

export const HARBOR_COLORS = {
  floor: '#161B22',
  pedestal: '#21262D',
  rim: '#30363D',
  water: '#0D416B',
  pier: '#6E7681',
  pierCurb: '#D29922',
  bollard: '#21262D',
  fender: '#2EA043',
  mooringZone: '#2EA043',
  vesselHull: '#8B2635',
  vesselDeck: '#3B434C',
  vesselBridge: '#E6EDF3',
  containerBlue: '#1F6FEB',
  containerOrange: '#BD561D',
  trajectoryMarker: '#58A6FF',
  ghostHull: '#79C0FF',
  tugHull: '#E3B341',
  tugCabin: '#21262D',
  towLine: '#F0883E',
} as const;