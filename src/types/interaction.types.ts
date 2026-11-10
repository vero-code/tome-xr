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

export interface TugConfig {
  readonly bowStationOffset: number;
  readonly sternStationOffset: number;
  readonly engageRadius: number;
  readonly minPullDistance: number;
  readonly maxPullDistance: number;
  readonly maxThrustForce: number;
  readonly torqueScale: number;
}

export interface WeatherDialConfig {
  readonly radius: number;
  readonly height: number;
  readonly pressedOffsetY: number;
}

export interface TrackingGuardConfig {
  readonly maxDisplacementPerFrame: number;
  readonly positionSmoothing: number;
  readonly velocityClamp: number;
}

export interface FilteredVector2 {
  x: number;
  z: number;
  valid: boolean;
}