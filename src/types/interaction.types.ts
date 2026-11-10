export interface VesselGrabConfig {
  readonly cruiseSpeed: number;
  readonly maxLaunchSpeed: number;
  readonly dragVelocityScale: number;
  readonly velocitySmoothing: number;
  readonly minDragSpeedForHeading: number;
  readonly headingTurnSpeed: number;
}

export interface VesselDragTracker {
  prevX: number;
  prevZ: number;
  headingRad: number;
  smoothedVx: number;
  smoothedVz: number;
  initialized: boolean;
}