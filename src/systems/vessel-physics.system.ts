import {
  createSystem,
  Grabbed,
  VisibilityState,
} from '@iwsdk/core';
import {
  BASIN_BOUNDS,
  DEG_TO_RAD,
  MAX_SIMULATION_DT,
  VESSEL_PHYSICS,
} from '../constants/physics.constants.js';
import { VesselPhysicsEngine } from '../core/vessel-physics.js';
import { HarborEnvironment } from '../entities/environment.component.js';
import { VesselBody } from '../entities/vessel.component.js';
import type {
  EnvironmentForceState,
  VesselKinematicsState,
} from '../types/physics.types.js';

export class VesselPhysicsSystem extends createSystem({
  vessels: { required: [VesselBody], excluded: [Grabbed] },
  environments: { required: [HarborEnvironment] },
}) {
  private kinematics!: VesselKinematicsState;
  private envState!: EnvironmentForceState;

  init(): void {
    this.kinematics = {
      x: 0,
      z: 0,
      headingRad: 0,
      vx: 0,
      vz: 0,
      omega: 0,
    };
    this.envState = {
      windSpeed: 0,
      windDirectionRad: 0,
      currentSpeed: 0,
      currentDirectionRad: 0,
      tugForceX: 0,
      tugForceZ: 0,
      tugTorque: 0,
    };
  }

  update(delta: number): void {
    if (this.world.visibilityState.peek() === VisibilityState.VisibleBlurred) {
      return;
    }

    const dt = Math.min(delta, MAX_SIMULATION_DT);
    this.readEnvironment();

    for (const entity of this.queries.vessels.entities) {
      if (!entity.getValue(VesselBody, 'active')) {
        continue;
      }
      const obj = entity.object3D;
      if (obj == null) {
        continue;
      }

      this.kinematics.x = obj.position.x;
      this.kinematics.z = obj.position.z;
      this.kinematics.headingRad = obj.rotation.y;
      this.kinematics.vx = entity.getValue(VesselBody, 'vx') ?? 0;
      this.kinematics.vz = entity.getValue(VesselBody, 'vz') ?? 0;
      this.kinematics.omega = entity.getValue(VesselBody, 'omega') ?? 0;

      this.envState.tugForceX = entity.getValue(VesselBody, 'tugForceX') ?? 0;
      this.envState.tugForceZ = entity.getValue(VesselBody, 'tugForceZ') ?? 0;
      this.envState.tugTorque = entity.getValue(VesselBody, 'tugTorque') ?? 0;

      VesselPhysicsEngine.step(
        this.kinematics,
        VESSEL_PHYSICS,
        this.envState,
        BASIN_BOUNDS,
        dt,
      );

      obj.position.set(
        this.kinematics.x,
        BASIN_BOUNDS.waterSurfaceY,
        this.kinematics.z,
      );
      obj.rotation.y = this.kinematics.headingRad;

      entity.setValue(VesselBody, 'vx', this.kinematics.vx);
      entity.setValue(VesselBody, 'vz', this.kinematics.vz);
      entity.setValue(VesselBody, 'omega', this.kinematics.omega);
    }
  }

  private readEnvironment(): void {
    this.envState.windSpeed = 0;
    this.envState.windDirectionRad = 0;
    this.envState.currentSpeed = 0;
    this.envState.currentDirectionRad = 0;

    for (const envEntity of this.queries.environments.entities) {
      this.envState.windSpeed =
        envEntity.getValue(HarborEnvironment, 'windSpeed') ?? 0;
      const windDeg =
        envEntity.getValue(HarborEnvironment, 'windDirectionDeg') ?? 0;
      this.envState.windDirectionRad = windDeg * DEG_TO_RAD;

      this.envState.currentSpeed =
        envEntity.getValue(HarborEnvironment, 'currentSpeed') ?? 0;
      const currentDeg =
        envEntity.getValue(HarborEnvironment, 'currentDirectionDeg') ?? 0;
      this.envState.currentDirectionRad = currentDeg * DEG_TO_RAD;
      break;
    }
  }
}