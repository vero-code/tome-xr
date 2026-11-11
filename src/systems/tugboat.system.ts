import { createSystem, type Entity, Grabbed, type Object3D } from '@iwsdk/core';
import {
  TUG_CONFIG,
  TRACKING_GUARD_CONFIG,
} from '../constants/interaction.constants.js';
import { BASIN_BOUNDS } from '../constants/physics.constants.js';
import { TrackingGuard } from '../core/tracking-guard.js';
import { Tugboat } from '../entities/tugboat.component.js';
import { VesselBody } from '../entities/vessel.component.js';
import type { FilteredVector2 } from '../types/interaction.types.js';

interface TugTracker {
  prevX: number;
  prevZ: number;
  isHeld: boolean;
}

export class TugboatSystem extends createSystem({
  tugs: { required: [Tugboat] },
  vessels: { required: [VesselBody] },
}) {
  private filtered: FilteredVector2 = { x: 0, z: 0, valid: true };
  private trackers = new Map<Entity, TugTracker>();

  update(): void {
    const vesselEntity = this.getPrimaryVessel();
    if (vesselEntity == null || vesselEntity.object3D == null) {
      return;
    }

    const vesselObj = vesselEntity.object3D;
    const shipX = vesselObj.position.x;
    const shipZ = vesselObj.position.z;
    const heading = vesselObj.rotation.y;
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);

    let totalFx = 0;
    let totalFz = 0;
    let totalTorque = 0;

    for (const tugEntity of this.queries.tugs.entities) {
      const tugObj = tugEntity.object3D;
      if (tugObj == null) {
        continue;
      }

      let tracker = this.trackers.get(tugEntity);
      if (tracker == null) {
        tracker = {
          prevX: tugObj.position.x,
          prevZ: tugObj.position.z,
          isHeld: false,
        };
        this.trackers.set(tugEntity, tracker);
      }

      const stationOffset =
        tugEntity.getValue(Tugboat, 'stationOffset') ??
        TUG_CONFIG.bowStationOffset;
      const attachX = shipX + cosH * stationOffset;
      const attachZ = shipZ - sinH * stationOffset;

      const isGrabbed = tugEntity.hasComponent(Grabbed);
      let engaged = Boolean(tugEntity.getValue(Tugboat, 'engaged'));
      let offsetX = tugEntity.getValue(Tugboat, 'offsetX') ?? 0;
      let offsetZ = tugEntity.getValue(Tugboat, 'offsetZ') ?? -0.06;

      if (isGrabbed) {
        // Reset anchor point on initial grab
        if (!tracker.isHeld) {
          tracker.prevX = tugObj.position.x;
          tracker.prevZ = tugObj.position.z;
          tracker.isHeld = true;
        }

        TrackingGuard.filter(
          tugObj.position.x,
          tugObj.position.z,
          tracker.prevX,
          tracker.prevZ,
          TRACKING_GUARD_CONFIG,
          this.filtered,
        );

        const clampedX = Math.min(
          BASIN_BOUNDS.maxX - 0.01,
          Math.max(BASIN_BOUNDS.minX + 0.01, this.filtered.x),
        );
        const clampedZ = Math.min(
          BASIN_BOUNDS.maxZ - 0.01,
          Math.max(BASIN_BOUNDS.minZ + 0.01, this.filtered.z),
        );

        tugObj.position.set(clampedX, BASIN_BOUNDS.waterSurfaceY, clampedZ);
        tracker.prevX = clampedX;
        tracker.prevZ = clampedZ;

        const rawDx = clampedX - attachX;
        const rawDz = clampedZ - attachZ;
        const rawDist = Math.hypot(rawDx, rawDz);

        if (rawDist <= TUG_CONFIG.engageRadius && rawDist > 0.005) {
          engaged = true;
          const clampedDist = Math.min(
            TUG_CONFIG.maxPullDistance,
            Math.max(TUG_CONFIG.minPullDistance, rawDist),
          );
          offsetX = (rawDx / rawDist) * clampedDist;
          offsetZ = (rawDz / rawDist) * clampedDist;
          tugEntity.setValue(Tugboat, 'engaged', true);
          tugEntity.setValue(Tugboat, 'offsetX', offsetX);
          tugEntity.setValue(Tugboat, 'offsetZ', offsetZ);
        } else {
          engaged = false;
          tugEntity.setValue(Tugboat, 'engaged', false);
        }
      } else {
        tracker.isHeld = false;
      }

      const towLine = tugObj.getObjectByName('TowLine');
      const thrustArrow = tugObj.getObjectByName('ThrustArrow');

      if (!engaged) {
        // Keep idle tugboat bounded within the basin
        const idleX = Math.min(
          BASIN_BOUNDS.maxX - 0.01,
          Math.max(BASIN_BOUNDS.minX + 0.01, tugObj.position.x),
        );
        const idleZ = Math.min(
          BASIN_BOUNDS.maxZ - 0.01,
          Math.max(BASIN_BOUNDS.minZ + 0.01, tugObj.position.z),
        );
        tugObj.position.set(idleX, BASIN_BOUNDS.waterSurfaceY, idleZ);
        tugObj.rotation.set(0, 0, 0);
        tracker.prevX = idleX;
        tracker.prevZ = idleZ;

        this.updateVisualVector(towLine, thrustArrow, 0, false);
        continue;
      }

      const dist = Math.hypot(offsetX, offsetZ);
      if (dist < 0.005) {
        this.updateVisualVector(towLine, thrustArrow, 0, false);
        continue;
      }

      // If engaged and released, keep moving with the vessel
      if (!isGrabbed) {
        const posX = attachX + offsetX;
        const posZ = attachZ + offsetZ;
        tugObj.position.set(posX, BASIN_BOUNDS.waterSurfaceY, posZ);
        tracker.prevX = posX;
        tracker.prevZ = posZ;
      }

      const pullAngle = Math.atan2(-offsetZ, offsetX);
      tugObj.rotation.set(0, pullAngle, 0);

      const activeDist = Math.hypot(
        tugObj.position.x - attachX,
        tugObj.position.z - attachZ,
      );
      this.updateVisualVector(towLine, thrustArrow, activeDist, true);

      const pullRatio = Math.min(
        1,
        Math.max(
          0,
          (dist - TUG_CONFIG.minPullDistance) /
            (TUG_CONFIG.maxPullDistance - TUG_CONFIG.minPullDistance),
        ),
      );
      const forceMag = (0.25 + 0.75 * pullRatio) * TUG_CONFIG.maxThrustForce;
      const fx = (offsetX / dist) * forceMag;
      const fz = (offsetZ / dist) * forceMag;

      const rx = attachX - shipX;
      const rz = attachZ - shipZ;
      const torque = (rz * fx - rx * fz) * TUG_CONFIG.torqueScale;

      totalFx += fx;
      totalFz += fz;
      totalTorque += torque;
    }

    vesselEntity.setValue(VesselBody, 'tugForceX', totalFx);
    vesselEntity.setValue(VesselBody, 'tugForceZ', totalFz);
    vesselEntity.setValue(VesselBody, 'tugTorque', totalTorque);
  }

  private getPrimaryVessel(): Entity | null {
    for (const entity of this.queries.vessels.entities) {
      return entity;
    }
    return null;
  }

  private updateVisualVector(
    towLine: Object3D | undefined,
    thrustArrow: Object3D | undefined,
    distance: number,
    visible: boolean,
  ): void {
    if (towLine != null) {
      towLine.visible = visible;
      if (visible) {
        const lineLen = Math.max(0.005, distance - 0.02);
        towLine.scale.x = lineLen;
        towLine.position.x = -0.02 - lineLen * 0.5;
      }
    }
    if (thrustArrow != null) {
      thrustArrow.visible = visible;
    }
  }
}