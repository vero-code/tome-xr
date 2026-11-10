export interface TableDimensions {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly rimThickness: number;
  readonly rimHeight: number;
  readonly basinDepth: number;
}

export interface PierDimensions {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly zOffset: number;
  readonly bollardRadius: number;
  readonly bollardHeight: number;
}

export interface FenderDimensions {
  readonly radius: number;
  readonly length: number;
  readonly xPositions: readonly [number, number, number];
  readonly yOffset: number;
  readonly zOffset: number;
}

export interface MooringZoneDimensions {
  readonly width: number;
  readonly depth: number;
  readonly borderThickness: number;
  readonly yOffset: number;
  readonly zOffset: number;
}

export interface VesselDimensions {
  readonly length: number;
  readonly beam: number;
  readonly hullHeight: number;
  readonly deckHeight: number;
  readonly bridgeWidth: number;
  readonly bridgeHeight: number;
  readonly bridgeDepth: number;
}