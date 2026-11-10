import type { TableDimensions } from '../types/harbor.types.js';

// Tabletop placed at sitting height (0.74m) within 60cm reach
export const HARBOR_TABLE: TableDimensions = {
  width: 0.9,
  depth: 0.6,
  height: 0.74,
  rimThickness: 0.03,
  rimHeight: 0.04,
  basinDepth: 0.02,
};

export const HARBOR_COLORS = {
  floor: '#161B22',
  pedestal: '#21262D',
  rim: '#30363D',
  water: '#0D416B',
  pier: '#6E7681',
} as const;