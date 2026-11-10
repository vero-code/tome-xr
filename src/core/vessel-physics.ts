import type {
  BasinBounds,
  EnvironmentForceState,
  VesselKinematicsState,
  VesselPhysicsParams,
} from '../types/physics.types.js';
import { pierLimitZ } from './hull-geometry.js';

export class VesselPhysicsEngine {
  // Advances vessel 2D kinematics on water surface by dt seconds in place
  static step(
    state: VesselKinematicsState,
    params: VesselPhysicsParams,
    env: EnvironmentForceState,
    bounds: BasinBounds,
    dt: number,
  ): void {
    if (dt <= 0) {
      return;
    }

    // Forward (+X in local vessel space) and lateral unit vectors in world XZ
    // In Three.js Y-rotation by headingRad: local +X maps to (cos(h), -sin(h)) in (X, Z)
    const cosH = Math.cos(state.headingRad);
    const sinH = Math.sin(state.headingRad);
    const forwardX = cosH;
    const forwardZ = -sinH;
    const rightX = sinH;
    const rightZ = cosH;

    // Decompose velocity into surge (forward) and sway (sideways)
    const surgeVel = state.vx * forwardX + state.vz * forwardZ;
    const swayVel = state.vx * rightX + state.vz * rightZ;

    // Anisotropic water drag: hull resists sideways motion more than forward motion
    const surgeDrag = -params.linearDamping * surgeVel;
    const swayDrag =
      -params.linearDamping * params.lateralDragMultiplier * swayVel;

    const dragForceX = surgeDrag * forwardX + swayDrag * rightX;
    const dragForceZ = surgeDrag * forwardZ + swayDrag * rightZ;

    // Wind and water current forces in world XZ
    const windForceX =
      Math.cos(env.windDirectionRad) * env.windSpeed * params.windForceCoeff;
    const windForceZ =
      -Math.sin(env.windDirectionRad) * env.windSpeed * params.windForceCoeff;

    const currentForceX =
      Math.cos(env.currentDirectionRad) *
      env.currentSpeed *
      params.currentForceCoeff;
    const currentForceZ =
      -Math.sin(env.currentDirectionRad) *
      env.currentSpeed *
      params.currentForceCoeff;

    const totalForceX =
      dragForceX + windForceX + currentForceX + env.tugForceX;
    const totalForceZ =
      dragForceZ + windForceZ + currentForceZ + env.tugForceZ;

    // Crosswind torque on aft superstructure and hull
    const crossWind = windForceX * rightX + windForceZ * rightZ;
    const windTorque = -crossWind * params.weathervaneTorqueCoeff;
    const angularDrag = -params.angularDamping * state.omega;
    const totalTorque = angularDrag + windTorque + env.tugTorque;

    // Symplectic Euler integration
    state.vx += (totalForceX / params.mass) * dt;
    state.vz += (totalForceZ / params.mass) * dt;
    state.omega += (totalTorque / params.momentOfInertia) * dt;

    state.x += state.vx * dt;
    state.z += state.vz * dt;
    state.headingRad += state.omega * dt;

    // Basin boundary and pier face containment
    if (state.x < bounds.minX) {
      state.x = bounds.minX;
      if (state.vx < 0) state.vx = -state.vx * bounds.restitution;
    } else if (state.x > bounds.maxX) {
      state.x = bounds.maxX;
      if (state.vx > 0) state.vx = -state.vx * bounds.restitution;
    }

    const pierLimit = pierLimitZ(state.headingRad, params, bounds.pierFaceZ);
    if (state.z < pierLimit) {
      state.z = pierLimit;
      if (state.vz < 0) state.vz = -state.vz * bounds.restitution;
      state.omega *= 0.5;
    } else if (state.z > bounds.maxZ) {
      state.z = bounds.maxZ;
      if (state.vz > 0) state.vz = -state.vz * bounds.restitution;
    }
  }
}