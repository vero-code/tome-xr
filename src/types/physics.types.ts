export interface VesselKinematicsState {
  x: number;
  z: number;
  headingRad: number;
  vx: number;
  vz: number;
  omega: number;
}

export interface VesselPhysicsParams {
  readonly mass: number;
  readonly momentOfInertia: number;
  readonly linearDamping: number;
  readonly lateralDragMultiplier: number;
  readonly angularDamping: number;
  readonly windForceCoeff: number;
  readonly currentForceCoeff: number;
  readonly weathervaneTorqueCoeff: number;
}

export interface EnvironmentForceState {
  windSpeed: number;
  windDirectionRad: number;
  currentSpeed: number;
  currentDirectionRad: number;
  tugForceX: number;
  tugForceZ: number;
  tugTorque: number;
}

export interface BasinBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly waterSurfaceY: number;
  readonly restitution: number;
}