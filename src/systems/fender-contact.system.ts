import { Color, createSystem, type Entity, Mesh } from '@iwsdk/core';
import { MAX_SIMULATION_DT } from '../constants/physics.constants.js';
import { VESSEL_CONFIG } from '../constants/table.constants.js';
import { FENDER_CONFIG_THRESHOLDS } from '../constants/telemetry.constants.js';
import { FenderContact } from '../entities/fender.component.js';
import { VesselBody } from '../entities/vessel.component.js';
import type { FenderRuntimeState } from '../types/telemetry.types.js';

export class FenderContactSystem extends createSystem({
  fenders: { required: [FenderContact] },
  vessels: { required: [VesselBody] },
}) {
  private idleColor = new Color(FENDER_CONFIG_THRESHOLDS.idleColor);
  private safeColor = new Color(FENDER_CONFIG_THRESHOLDS.safeColor);
  private warnColor = new Color(FENDER_CONFIG_THRESHOLDS.warnColor);
  private crashColor = new Color(FENDER_CONFIG_THRESHOLDS.crashColor);

  private states = new Map<Entity, FenderRuntimeState>();
  private prevShipZ = 0;
  private hasPrev = false;
  private approachSpeed = 0;

  update(delta: number): void {
    const shipObj = this.getPrimaryVessel()?.object3D;
    if (shipObj == null) {
      return;
    }

    const dt = Math.max(0.001, Math.min(delta, MAX_SIMULATION_DT));
    const shipX = shipObj.position.x;
    const shipZ = shipObj.position.z;
    this.updateApproachSpeed(shipZ, dt);

    const cosH = Math.cos(shipObj.rotation.y);
    const sinH = Math.sin(shipObj.rotation.y);
    const halfL = VESSEL_CONFIG.length / 2;
    const halfB = VESSEL_CONFIG.beam / 2;

    for (const fender of this.queries.fenders.entities) {
      const fenderObj = fender.object3D;
      if (fenderObj == null) {
        continue;
      }
      const state = this.getState(fender);
      if (state.color == null) {
        continue;
      }

      // Fender position in vessel local space
      const relX = fenderObj.position.x - shipX;
      const relZ = fenderObj.position.z - shipZ;
      const localX = relX * cosH - relZ * sinH;
      const localZ = relX * sinH + relZ * cosH;

      // Distance from fender center to hull rectangle
      const edgeX = Math.max(-halfL, Math.min(halfL, localX));
      const edgeZ = Math.max(-halfB, Math.min(halfB, localZ));
      const dist = Math.hypot(localX - edgeX, localZ - edgeZ);
      const inContact = dist <= FENDER_CONFIG_THRESHOLDS.contactDistance;

      if (inContact) {
        state.impactSpeed = Math.max(state.impactSpeed, this.approachSpeed);
        if (!state.wasInContact) {
          console.log(
            `[Fender ${fenderObj.name}] impact=${(state.impactSpeed * 100).toFixed(2)}cm/s`,
          );
        }
      } else {
        state.impactSpeed = 0;
      }
      state.wasInContact = inContact;

      fender.setValue(FenderContact, 'inContact', inContact);
      fender.setValue(FenderContact, 'impactSpeed', state.impactSpeed);
      state.color.copy(
        inContact ? this.pickColor(state.impactSpeed) : this.idleColor,
      );
    }
  }

  // Smoothed speed toward the pier (negative Z), ignores sliding along it
  private updateApproachSpeed(shipZ: number, dt: number): void {
    if (this.hasPrev) {
      const raw = Math.max(0, (this.prevShipZ - shipZ) / dt);
      const k = Math.min(1, FENDER_CONFIG_THRESHOLDS.speedSmoothing * dt);
      this.approachSpeed += (raw - this.approachSpeed) * k;
    }
    this.prevShipZ = shipZ;
    this.hasPrev = true;
  }

  private pickColor(speed: number): Color {
    if (speed > FENDER_CONFIG_THRESHOLDS.crashSpeedMps) {
      return this.crashColor;
    }
    if (speed > FENDER_CONFIG_THRESHOLDS.safeSpeedMps) {
      return this.warnColor;
    }
    return this.safeColor;
  }

  private getState(fender: Entity): FenderRuntimeState {
    let state = this.states.get(fender);
    if (state == null) {
      state = { color: this.cloneColor(fender), wasInContact: false, impactSpeed: 0 };
      this.states.set(fender, state);
    }
    return state;
  }

  // Clone shared fender material once, return its color handle
  private cloneColor(fender: Entity): Color | null {
    let color: Color | null = null;
    fender.object3D?.traverse((child) => {
      if (color != null || !(child instanceof Mesh)) {
        return;
      }
      const material = child.material.clone();
      child.material = material;
      if ('color' in material && material.color instanceof Color) {
        color = material.color;
      }
    });
    return color;
  }

  private getPrimaryVessel(): Entity | null {
    for (const vessel of this.queries.vessels.entities) {
      return vessel;
    }
    return null;
  }
}