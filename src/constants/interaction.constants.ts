import type { VesselGrabConfig } from '../types/interaction.types.js';

export const VESSEL_GRAB_CONFIG: VesselGrabConfig = {
  cruiseSpeed: 0.022,
  maxLaunchSpeed: 0.045,
  dragVelocityScale: 0.35,
  velocitySmoothing: 0.2,
  minDragSpeedForHeading: 0.015,
  headingTurnSpeed: 8.0,
};