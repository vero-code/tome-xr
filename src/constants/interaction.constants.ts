import type { VesselGrabConfig, TugConfig, WeatherDialConfig } from '../types/interaction.types.js';

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
  engageRadius: 0.16,
  minPullDistance: 0.032,
  maxPullDistance: 0.13,
  maxThrustForce: 0.015,
  torqueScale: 1.8,
};

export const WEATHER_DIAL_CONFIG: WeatherDialConfig = {
  radius: 0.042,
  height: 0.012,
  pressedOffsetY: -0.004,
};

export const RAD_TO_DEG = 180 / Math.PI;