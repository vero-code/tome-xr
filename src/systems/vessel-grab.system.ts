import { createSystem, Grabbed } from '@iwsdk/core';
import {
  TRACKING_GUARD_CONFIG,
  VESSEL_GRAB_CONFIG,
} from '../constants/interaction.constants.js';
import {
  BASIN_BOUNDS,
  MAX_SIMULATION_DT,
  VESSEL_PHYSICS,
} from '../constants/physics.constants.js';
import { TrackingGuard } from '../core/tracking-guard.js';
import { VesselBody } from '../entities/vessel.component.js';
import type {
  FilteredVector2,
  VesselDragTracker,
} from '../types/interaction.types.js';
import { pierLimitZ } from '../core/hull-geometry.js';

export class VesselGrabSystem extends createSystem({
  heldVessels: { required: [VesselBody, Grabbed] },
}) {
  private tracker!: VesselDragTracker;
  private filtered!: FilteredVector2;

  init(): void {
    this.tracker = {
      prevX: 0,
      prevZ: 0,
      headingRad: 0,
      smoothedVx: 0,
      smoothedVz: 0,
      initialized: false,
    };
    this.filtered = { x: 0, z: 0, valid: true };

    this.queries.heldVessels.subscribe('qualify', (entity) => {
      const obj = entity.object3D;
      if (obj == null) {
        return;
      }
      this.tracker.prevX = obj.position.x;
      this.tracker.prevZ = obj.position.z;
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
      obj.position.set(
        this.tracker.prevX,
        BASIN_BOUNDS.waterSurfaceY,
        this.tracker.prevZ,
      );
      obj.rotation.set(0, this.tracker.headingRad, 0);

      // Reset to calm cruise vector on release
      const cruiseVx =
        Math.cos(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      const cruiseVz =
        -Math.sin(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      entity.setValue(VesselBody, 'vx', cruiseVx);
      entity.setValue(VesselBody, 'vz', cruiseVz);
      entity.setValue(VesselBody, 'omega', 0);
    });
  }

  update(delta: number): void {
    const dt = Math.min(Math.max(delta, 0.001), MAX_SIMULATION_DT);

    for (const entity of this.queries.heldVessels.entities) {
      const obj = entity.object3D;
      if (obj == null) {
        continue;
      }

      if (!this.tracker.initialized) {
        this.tracker.prevX = obj.position.x;
        this.tracker.prevZ = obj.position.z;
        this.tracker.headingRad = obj.rotation.y;
        this.tracker.initialized = true;
      }

      const rawX = obj.position.x;
      const rawZ = obj.position.z;

      // Detect hand tracking loss outside basin area
      const margin = TRACKING_GUARD_CONFIG.outOfBoundsMargin;
      const isOutOfBounds =
        rawX < BASIN_BOUNDS.minX - margin ||
        rawX > BASIN_BOUNDS.maxX + margin ||
        rawZ < BASIN_BOUNDS.minZ - margin ||
        rawZ > BASIN_BOUNDS.maxZ + margin;

      if (isOutOfBounds) {
        // Freeze ship at last known valid position
        obj.position.set(
          this.tracker.prevX,
          BASIN_BOUNDS.waterSurfaceY,
          this.tracker.prevZ,
        );
        obj.rotation.set(0, this.tracker.headingRad, 0);
        continue;
      }

      TrackingGuard.filter(
        rawX,
        rawZ,
        this.tracker.prevX,
        this.tracker.prevZ,
        TRACKING_GUARD_CONFIG,
        this.filtered,
      );

      if (!this.filtered.valid) {
        obj.position.set(
          this.tracker.prevX,
          BASIN_BOUNDS.waterSurfaceY,
          this.tracker.prevZ,
        );
        obj.rotation.set(0, this.tracker.headingRad, 0);
        continue;
      }

      const clampedX = Math.min(
        BASIN_BOUNDS.maxX,
        Math.max(BASIN_BOUNDS.minX, this.filtered.x),
      );
      const clampedZ = Math.min(
        BASIN_BOUNDS.maxZ,
        Math.max(BASIN_BOUNDS.minZ, this.filtered.z),
      );

      const rawVx = ((clampedX - this.tracker.prevX) / dt) * 0.2;
      const rawVz = ((clampedZ - this.tracker.prevZ) / dt) * 0.2;
      const rawSpeed = Math.hypot(rawVx, rawVz);

      if (rawSpeed > VESSEL_GRAB_CONFIG.minDragSpeedForHeading) {
        const targetHeading = Math.atan2(-rawVz, rawVx);
        const angleDiff = Math.atan2(
          Math.sin(targetHeading - this.tracker.headingRad),
          Math.cos(targetHeading - this.tracker.headingRad),
        );
        this.tracker.headingRad +=
          angleDiff * Math.min(1, VESSEL_GRAB_CONFIG.headingTurnSpeed * dt);
      }

      const safeZ = Math.max(
        clampedZ,
        pierLimitZ(this.tracker.headingRad, VESSEL_PHYSICS, BASIN_BOUNDS.pierFaceZ),
      );

      this.tracker.prevX = clampedX;
      this.tracker.prevZ = safeZ;

      this.tracker.smoothedVx =
        Math.cos(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;
      this.tracker.smoothedVz =
        -Math.sin(this.tracker.headingRad) * VESSEL_GRAB_CONFIG.cruiseSpeed;

      obj.position.set(clampedX, BASIN_BOUNDS.waterSurfaceY, safeZ);

      obj.position.set(clampedX, BASIN_BOUNDS.waterSurfaceY, clampedZ);
      obj.rotation.set(0, this.tracker.headingRad, 0);

      entity.setValue(VesselBody, 'vx', this.tracker.smoothedVx);
      entity.setValue(VesselBody, 'vz', this.tracker.smoothedVz);
      entity.setValue(VesselBody, 'omega', 0);
    }
  }
}