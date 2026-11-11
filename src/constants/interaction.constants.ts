import type {
  FilteredVector2,
  TrackingGuardConfig,
  TugBounds,
  TugConfig,
  VesselGrabConfig,
  WeatherDialConfig,
} from '../types/interaction.types.js';

export const VESSEL_GRAB_CONFIG: VesselGrabConfig = {
  cruiseSpeed: 0.018,
  maxLaunchSpeed: 0.036,
  dragVelocityScale: 0.45,
  velocitySmoothing: 0.25,
  minDragSpeedForHeading: 0.006,
  headingTurnSpeed: 10.0,
};

export const TUG_CONFIG: TugConfig = {
  bowStationOffset: 0.075,
  sternStationOffset: -0.075,
  engageRadius: 0.20,
  minPullDistance: 0.08,
  maxPullDistance: 0.18,
  maxThrustForce: 0.075,
  torqueScale: 2.5,
};

export const TUG_BOUNDS: TugBounds = {
  minX: -0.40,
  maxX: 0.40,
  minZ: -0.13,
  maxZ: 0.25,
};

export const TUG_HULL_CLEARANCE = {
  halfLength: 0.13,
  minClearance: 0.052,
} as const;

export const WEATHER_DIAL_CONFIG: WeatherDialConfig = {
  radius: 0.042,
  height: 0.012,
  pressedOffsetY: -0.004,
};

export const RAD_TO_DEG = 180 / Math.PI;

export const TRACKING_GUARD_CONFIG: TrackingGuardConfig = {
  maxDisplacementPerFrame: 0.045,
  positionSmoothing: 0.35,
  velocityClamp: 0.05,
  outOfBoundsMargin: 0.02,
};