import { createSystem, Grabbed } from '@iwsdk/core';
import { VESSEL_GRAB_CONFIG } from '../constants/interaction.constants.js';
import {
  BASIN_BOUNDS,
  MAX_SIMULATION_DT,
} from '../constants/physics.constants.js';
import { VesselBody } from '../entities/vessel.component.js';
import type { VesselDragTracker } from '../types/interaction.types.js';

export class VesselGrabSystem extends createSystem({
  heldVessels: { required: [VesselBody, Grabbed] },
}) {
  private tracker!: VesselDragTracker;

  init(): void {
    this.tracker = {
      prevX: 0,
      prevZ: 0,
      headingRad: 0,
      smoothedVx: 0,
      smoothedVz: 0,
      initialized: false,
    };

    this.queries.heldVessels.subscribe('qualify', (entity) => {
      const obj = entity.object3D;
      if (obj == null) {
        return;
      }
      const clampedX = Math.min(
        BASIN_BOUNDS.maxX,
        Math.max(BASIN_BOUNDS.minX, obj.position.x),
      );
      const clampedZ = Math.min(
        BASIN_BOUNDS.maxZ,
        Math.max(BASIN_BOUNDS.minZ, obj.position.z),
      );
      this.tracker.prevX = clampedX;
      this.tracker.prevZ = clampedZ;
      this.tracker.headingRad = obj.rotation.y;
      this.tracker.smoothedVx =
        Math.cos(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      this.tracker.smoothedVz =
        -Math.sin(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      this.tracker.initialized = true;
    });

    this.queries.heldVessels.subscribe('disqualify', (entity) => {
      const obj = entity.object3D;
      if (obj == null || !this.tracker.initialized) {
        return;
      }
      obj.position.y = BASIN_BOUNDS.waterSurfaceY;
      obj.rotation.set(0, this.tracker.headingRad, 0);
    });
  }

  update(delta: number): void {
    const dt = Math.min(Math.max(delta, 0.001), MAX_SIMULATION_DT);

    for (const entity of this.queries.heldVessels.entities) {
      const obj = entity.object3D;
      if (obj == null) {
        continue;
      }

      const clampedX = Math.min(
        BASIN_BOUNDS.maxX,
        Math.max(BASIN_BOUNDS.minX, obj.position.x),
      );
      const clampedZ = Math.min(
        BASIN_BOUNDS.maxZ,
        Math.max(BASIN_BOUNDS.minZ, obj.position.z),
      );
      obj.position.set(clampedX, BASIN_BOUNDS.waterSurfaceY, clampedZ);

      if (!this.tracker.initialized) {
        this.tracker.prevX = clampedX;
        this.tracker.prevZ = clampedZ;
        this.tracker.headingRad = obj.rotation.y;
        this.tracker.initialized = true;
      }

      const rawVx =
        ((clampedX - this.tracker.prevX) / dt) *
        VESSEL_GRAB_CONFIG.dragVelocityScale;
      const rawVz =
        ((clampedZ - this.tracker.prevZ) / dt) *
        VESSEL_GRAB_CONFIG.dragVelocityScale;

      this.tracker.prevX = clampedX;
      this.tracker.prevZ = clampedZ;

      const rawSpeed = Math.hypot(rawVx, rawVz);
      if (rawSpeed > VESSEL_GRAB_CONFIG.minDragSpeedForHeading) {
        const targetHeading = Math.atan2(-rawVz, rawVx);
        const angleDiff = Math.atan2(
          Math.sin(targetHeading - this.tracker.headingRad),
          Math.cos(targetHeading - this.tracker.headingRad),
        );
        this.tracker.headingRad +=
          angleDiff * Math.min(1, VESSEL_GRAB_CONFIG.headingTurnSpeed * dt);

        const clampedSpeed = Math.min(
          VESSEL_GRAB_CONFIG.maxLaunchSpeed,
          Math.max(VESSEL_GRAB_CONFIG.cruiseSpeed, rawSpeed),
        );
        const targetVx = Math.cos(this.tracker.headingRad) * clampedSpeed;
        const targetVz = -Math.sin(this.tracker.headingRad) * clampedSpeed;

        const alpha = VESSEL_GRAB_CONFIG.velocitySmoothing;
        this.tracker.smoothedVx +=
          (targetVx - this.tracker.smoothedVx) * alpha;
        this.tracker.smoothedVz +=
          (targetVz - this.tracker.smoothedVz) * alpha;
      } else {
        this.tracker.smoothedVx =
          Math.cos(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
        this.tracker.smoothedVz =
          -Math.sin(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      }

      obj.rotation.set(0, this.tracker.headingRad, 0);

      entity.setValue(VesselBody, 'vx', this.tracker.smoothedVx);
      entity.setValue(VesselBody, 'vz', this.tracker.smoothedVz);
      entity.setValue(VesselBody, 'omega', 0);
    }
  }
}