import {
  Color,
  createSystem,
  Mesh,
  MeshStandardMaterial,
} from '@iwsdk/core';
import { FENDER_CONFIG_THRESHOLDS } from '../constants/telemetry.constants.js';
import { VESSEL_CONFIG } from '../constants/table.constants.js';
import { FenderContact } from '../entities/fender.component.js';
import { VesselBody } from '../entities/vessel.component.js';

export class FenderContactSystem extends createSystem({
  fenders: { required: [FenderContact] },
  vessels: { required: [VesselBody] },
}) {
  private idleColor!: Color;
  private safeColor!: Color;
  private warnColor!: Color;
  private crashColor!: Color;

  init(): void {
    this.idleColor = new Color(FENDER_CONFIG_THRESHOLDS.idleColor);
    this.safeColor = new Color(FENDER_CONFIG_THRESHOLDS.safeColor);
    this.warnColor = new Color(FENDER_CONFIG_THRESHOLDS.warnColor);
    this.crashColor = new Color(FENDER_CONFIG_THRESHOLDS.crashColor);

    // Clone material per fender for independent color states
    const sub = this.queries.fenders.subscribe('qualify', (fender) => {
      const mesh = fender.object3D?.children[0];
      if (mesh instanceof Mesh && mesh.material instanceof MeshStandardMaterial) {
        mesh.material = mesh.material.clone();
        mesh.material.color.copy(this.idleColor);
      }
    });
    this.cleanupFuncs.push(sub);
  }

  update(): void {
    const vessel = this.getPrimaryVessel();
    if (vessel == null || vessel.object3D == null) {
      return;
    }

    const shipObj = vessel.object3D;
    const shipX = shipObj.position.x;
    const shipZ = shipObj.position.z;
    const heading = shipObj.rotation.y;
    const vz = vessel.getValue(VesselBody, 'vz') ?? 0;
    const approachSpeed = -vz;

    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);
    const halfL = VESSEL_CONFIG.length / 2;
    const halfB = VESSEL_CONFIG.beam / 2;

    for (const fender of this.queries.fenders.entities) {
      const fenderObj = fender.object3D;
      if (fenderObj == null) {
        continue;
      }

      // Transform fender coordinates into vessel local space
      const dx = fenderObj.position.x - shipX;
      const dz = fenderObj.position.z - shipZ;
      const localX = dx * cosH + dz * sinH;
      const localZ = -dx * sinH + dz * cosH;

      // Distance from fender center to vessel bounding box
      const clampedX = Math.max(-halfL, Math.min(halfL, localX));
      const clampedZ = Math.max(-halfB, Math.min(halfB, localZ));
      const dist = Math.hypot(localX - clampedX, localZ - clampedZ);

      const inContact = dist < FENDER_CONFIG_THRESHOLDS.contactDistance;
      fender.setValue(FenderContact, 'inContact', inContact);
      fender.setValue(FenderContact, 'impactSpeed', inContact ? approachSpeed : 0);

      const mesh = fenderObj.children[0];
      if (mesh instanceof Mesh && mesh.material instanceof MeshStandardMaterial) {
        if (!inContact) {
          mesh.material.color.copy(this.idleColor);
        } else if (approachSpeed > FENDER_CONFIG_THRESHOLDS.crashSpeedMps) {
          mesh.material.color.copy(this.crashColor);
        } else if (approachSpeed > FENDER_CONFIG_THRESHOLDS.safeSpeedMps) {
          mesh.material.color.copy(this.warnColor);
        } else {
          mesh.material.color.copy(this.safeColor);
        }
      }
    }
  }

  private getPrimaryVessel() {
    for (const vessel of this.queries.vessels.entities) {
      return vessel;
    }
    return null;
  }
}