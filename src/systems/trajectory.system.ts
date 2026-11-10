import { createSystem, type Object3D } from '@iwsdk/core';
import {
  BASIN_BOUNDS,
  DEG_TO_RAD,
  TRAJECTORY_CONFIG,
  VESSEL_PHYSICS,
} from '../constants/physics.constants.js';
import { TrajectoryPredictor } from '../core/trajectory-predictor.js';
import { HarborEnvironment } from '../entities/environment.component.js';
import { VesselBody } from '../entities/vessel.component.js';
import type {
  EnvironmentForceState,
  TrajectoryBuffer,
  VesselKinematicsState,
} from '../types/physics.types.js';

export class TrajectorySystem extends createSystem({
  vessels: { required: [VesselBody] },
  environments: { required: [HarborEnvironment] },
}) {
  private predictor!: TrajectoryPredictor;
  private buffer!: TrajectoryBuffer;
  private initial!: VesselKinematicsState;
  private envState!: EnvironmentForceState;
  private markers: Object3D[] = [];
  private ghostHull: Object3D | null = null;

  init(): void {
    this.predictor = new TrajectoryPredictor();
    this.buffer = {
      x: new Float32Array(TRAJECTORY_CONFIG.sampleCount),
      z: new Float32Array(TRAJECTORY_CONFIG.sampleCount),
      headingRad: new Float32Array(TRAJECTORY_CONFIG.sampleCount),
    };
    this.initial = { x: 0, z: 0, headingRad: 0, vx: 0, vz: 0, omega: 0 };
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

  update(): void {
    if (!this.resolveTrajectoryNodes()) {
      return;
    }

    this.readEnvironment();

    for (const entity of this.queries.vessels.entities) {
      const obj = entity.object3D;
      if (obj == null) {
        continue;
      }

      this.initial.x = obj.position.x;
      this.initial.z = obj.position.z;
      this.initial.headingRad = obj.rotation.y;
      this.initial.vx = entity.getValue(VesselBody, 'vx') ?? 0;
      this.initial.vz = entity.getValue(VesselBody, 'vz') ?? 0;
      this.initial.omega = entity.getValue(VesselBody, 'omega') ?? 0;

      this.envState.tugForceX = entity.getValue(VesselBody, 'tugForceX') ?? 0;
      this.envState.tugForceZ = entity.getValue(VesselBody, 'tugForceZ') ?? 0;
      this.envState.tugTorque = entity.getValue(VesselBody, 'tugTorque') ?? 0;

      this.predictor.predict(
        this.initial,
        VESSEL_PHYSICS,
        this.envState,
        BASIN_BOUNDS,
        TRAJECTORY_CONFIG,
        this.buffer,
      );

      for (let i = 0; i < this.markers.length; i += 1) {
        const marker = this.markers[i];
        marker.position.set(
          this.buffer.x[i],
          TRAJECTORY_CONFIG.markerY,
          this.buffer.z[i],
        );
        marker.rotation.y = this.buffer.headingRad[i];
      }

      const last = TRAJECTORY_CONFIG.sampleCount - 1;
      if (this.ghostHull != null) {
        this.ghostHull.position.set(
          this.buffer.x[last],
          TRAJECTORY_CONFIG.markerY,
          this.buffer.z[last],
        );
        this.ghostHull.rotation.y = this.buffer.headingRad[last];
      }
      break;
    }
  }

  private resolveTrajectoryNodes(): boolean {
    if (this.markers.length === TRAJECTORY_CONFIG.sampleCount) {
      return true;
    }
    const root = this.world.getSceneObject('drift-trajectory');
    if (root == null) {
      return false;
    }
    this.markers.length = 0;
    for (let i = 0; i < TRAJECTORY_CONFIG.sampleCount; i += 1) {
      const marker = root.getObjectByName(`Marker_${i}`);
      if (marker != null) {
        this.markers.push(marker);
      }
    }
    this.ghostHull = root.getObjectByName('GhostHull') ?? null;
    return this.markers.length === TRAJECTORY_CONFIG.sampleCount;
  }

  private readEnvironment(): void {
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