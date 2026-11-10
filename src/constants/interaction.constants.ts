import type { VesselGrabConfig } from '../types/interaction.types.js';

export const VESSEL_GRAB_CONFIG: VesselGrabConfig = {
  cruiseSpeed: 0.018,
  maxLaunchSpeed: 0.036,
  dragVelocityScale: 0.45,
  velocitySmoothing: 0.25,
  minDragSpeedForHeading: 0.006,
  headingTurnSpeed: 10.0,
};