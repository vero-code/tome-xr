import type {
  BasinBounds,
  VesselPhysicsParams,
  TrajectoryConfig,
} from '../types/physics.types.js';

export const VESSEL_PHYSICS: VesselPhysicsParams = {
  mass: 12.0,
  momentOfInertia: 0.45,
  linearDamping: 0.28,
  lateralDragMultiplier: 2.6,
  angularDamping: 0.9,
  windForceCoeff: 0.08,
  currentForceCoeff: 0.18,
  weathervaneTorqueCoeff: 0.012,
};

export const BASIN_BOUNDS: BasinBounds = {
  minX: -0.28,
  maxX: 0.28,
  minZ: -0.112,
  maxZ: 0.21,
  waterSurfaceY: 0.747,
  restitution: 0.15,
};

export const MAX_SIMULATION_DT = 0.05;
export const DEG_TO_RAD = Math.PI / 180;

// 30 samples * 3 substeps * 0.5s = 45 seconds prediction horizon
export const TRAJECTORY_CONFIG: TrajectoryConfig = {
  sampleCount: 30,
  subStepsPerSample: 3,
  stepDt: 0.5,
  markerY: 0.75,
};