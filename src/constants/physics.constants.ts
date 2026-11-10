import type {
  BasinBounds,
  TrajectoryConfig,
  VesselPhysicsParams,
} from '../types/physics.types.js';

export const VESSEL_PHYSICS: VesselPhysicsParams = {
  mass: 12.0,
  momentOfInertia: 0.45,
  linearDamping: 0.04,
  lateralDragMultiplier: 6.5,
  angularDamping: 0.9,
  windForceCoeff: 0.009,
  currentForceCoeff: 0.014,
  weathervaneTorqueCoeff: 0.004,
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

// 30 samples * 2 substeps * 0.5s = 30 seconds prediction horizon
export const TRAJECTORY_CONFIG: TrajectoryConfig = {
  sampleCount: 30,
  subStepsPerSample: 2,
  stepDt: 0.5,
  markerY: 0.75,
};