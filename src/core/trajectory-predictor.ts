import { VesselPhysicsEngine } from './vessel-physics.js';
import type {
  BasinBounds,
  EnvironmentForceState,
  TrajectoryBuffer,
  TrajectoryConfig,
  VesselKinematicsState,
  VesselPhysicsParams,
} from '../types/physics.types.js';

export class TrajectoryPredictor {
  private readonly scratchState: VesselKinematicsState = {
    x: 0,
    z: 0,
    headingRad: 0,
    vx: 0,
    vz: 0,
    omega: 0,
  };

  // Simulates future vessel drift into pre-allocated typed arrays
  predict(
    initial: VesselKinematicsState,
    params: VesselPhysicsParams,
    env: EnvironmentForceState,
    bounds: BasinBounds,
    config: TrajectoryConfig,
    out: TrajectoryBuffer,
  ): void {
    this.scratchState.x = initial.x;
    this.scratchState.z = initial.z;
    this.scratchState.headingRad = initial.headingRad;
    this.scratchState.vx = initial.vx;
    this.scratchState.vz = initial.vz;
    this.scratchState.omega = initial.omega;

    for (let i = 0; i < config.sampleCount; i += 1) {
      for (let s = 0; s < config.subStepsPerSample; s += 1) {
        VesselPhysicsEngine.step(
          this.scratchState,
          params,
          env,
          bounds,
          config.stepDt,
        );
      }
      out.x[i] = this.scratchState.x;
      out.z[i] = this.scratchState.z;
      out.headingRad[i] = this.scratchState.headingRad;
    }
  }
}