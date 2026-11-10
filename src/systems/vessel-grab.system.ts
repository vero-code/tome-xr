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
      obj.position.set(clampedX, BASIN_BOUNDS.waterSurfaceY, clampedZ);
      obj.rotation.x = 0;
      obj.rotation.z = 0;

      this.tracker.prevX = clampedX;
      this.tracker.prevZ = clampedZ;
      this.tracker.smoothedVx =
        Math.cos(obj.rotation.y) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      this.tracker.smoothedVz =
        -Math.sin(obj.rotation.y) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      this.tracker.initialized = true;
    });
  }

  update(delta: number): void {
    const dt = Math.min(Math.max(delta, 0.001), MAX_SIMULATION_DT);

    for (const entity of this.queries.heldVessels.entities) {
      const obj = entity.object3D;
      if (obj == null) {
        continue;
      }

      // Clamp grabbed vessel to water surface and basin boundaries
      const clampedX = Math.min(
        BASIN_BOUNDS.maxX,
        Math.max(BASIN_BOUNDS.minX, obj.position.x),
      );
      const clampedZ = Math.min(
        BASIN_BOUNDS.maxZ,
        Math.max(BASIN_BOUNDS.minZ, obj.position.z),
      );
      obj.position.set(clampedX, BASIN_BOUNDS.waterSurfaceY, clampedZ);
      obj.rotation.x = 0;
      obj.rotation.z = 0;

      if (!this.tracker.initialized) {
        this.tracker.prevX = clampedX;
        this.tracker.prevZ = clampedZ;
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
        // Align vessel bow with hand drag direction
        const targetHeading = Math.atan2(-rawVz, rawVx);
        const angleDiff = Math.atan2(
          Math.sin(targetHeading - obj.rotation.y),
          Math.cos(targetHeading - obj.rotation.y),
        );
        obj.rotation.y +=
          angleDiff * Math.min(1, VESSEL_GRAB_CONFIG.headingTurnSpeed * dt);

        const clampedSpeed = Math.min(
          VESSEL_GRAB_CONFIG.maxLaunchSpeed,
          Math.max(VESSEL_GRAB_CONFIG.cruiseSpeed, rawSpeed),
        );
        const targetVx = Math.cos(obj.rotation.y) * clampedSpeed;
        const targetVz = -Math.sin(obj.rotation.y) * clampedSpeed;

        const alpha = VESSEL_GRAB_CONFIG.velocitySmoothing;
        this.tracker.smoothedVx +=
          (targetVx - this.tracker.smoothedVx) * alpha;
        this.tracker.smoothedVz +=
          (targetVz - this.tracker.smoothedVz) * alpha;
      } else {
        // Maintain forward cruise vector along current vessel heading
        this.tracker.smoothedVx =
          Math.cos(obj.rotation.y) * VESSEL_GRAB_CONFIG.cruiseSpeed;
        this.tracker.smoothedVz =
          -Math.sin(obj.rotation.y) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      }

      entity.setValue(VesselBody, 'vx', this.tracker.smoothedVx);
      entity.setValue(VesselBody, 'vz', this.tracker.smoothedVz);
      entity.setValue(VesselBody, 'omega', 0);
    }
  }
}