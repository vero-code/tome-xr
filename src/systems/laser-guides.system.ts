import {
  Color,
  createSystem,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
} from '@iwsdk/core';
import { BASIN_BOUNDS } from '../constants/physics.constants.js';
import {
  TELEMETRY_COLORS,
  TELEMETRY_CONFIG,
} from '../constants/telemetry.constants.js';
import { VesselBody } from '../entities/vessel.component.js';

export class LaserGuidesSystem extends createSystem({
  vessels: { required: [VesselBody] },
}) {
  private safeColor!: Color;
  private warnColor!: Color;
  private dangerColor!: Color;
  private bowBeam: Object3D | null = null;
  private sternBeam: Object3D | null = null;
  private bowDot: Object3D | null = null;
  private sternDot: Object3D | null = null;

  init(): void {
    this.safeColor = new Color(TELEMETRY_COLORS.safe);
    this.warnColor = new Color(TELEMETRY_COLORS.warning);
    this.dangerColor = new Color(TELEMETRY_COLORS.danger);
  }

  update(): void {
    if (!this.resolveNodes()) {
      return;
    }

    for (const vessel of this.queries.vessels.entities) {
      const shipObj = vessel.object3D;
      if (shipObj == null) {
        continue;
      }

      const shipX = shipObj.position.x;
      const shipZ = shipObj.position.z;
      const heading = shipObj.rotation.y;
      const vz = vessel.getValue(VesselBody, 'vz') ?? 0;
      const approachSpeed = -vz;

      const cosH = Math.cos(heading);
      const sinH = Math.sin(heading);

      // Bow probe coordinates
      const bowX = shipX + cosH * TELEMETRY_CONFIG.bowProbeOffset;
      const bowZ = shipZ - sinH * TELEMETRY_CONFIG.bowProbeOffset;

      // Stern probe coordinates
      const sternX = shipX + cosH * TELEMETRY_CONFIG.sternProbeOffset;
      const sternZ = shipZ - sinH * TELEMETRY_CONFIG.sternProbeOffset;

      const pierZ = TELEMETRY_CONFIG.pierFaceZ;
      const bowDist = bowZ - pierZ;
      const sternDist = sternZ - pierZ;

      const color = this.pickColor(approachSpeed);

      this.updateLaser(this.bowBeam, this.bowDot, bowX, bowZ, bowDist, color);
      this.updateLaser(
        this.sternBeam,
        this.sternDot,
        sternX,
        sternZ,
        sternDist,
        color,
      );
      break;
    }
  }

  private updateLaser(
    beam: Object3D | null,
    dot: Object3D | null,
    originX: number,
    originZ: number,
    dist: number,
    color: Color,
  ): void {
    if (beam == null || dot == null) {
      return;
    }

    if (dist <= 0 || dist > TELEMETRY_CONFIG.maxActiveDistance) {
      beam.visible = false;
      dot.visible = false;
      return;
    }

    beam.visible = true;
    dot.visible = true;

    const y = BASIN_BOUNDS.waterSurfaceY + 0.003;
    beam.position.set(originX, y, originZ - dist * 0.5);
    beam.scale.set(1, 1, dist);

    dot.position.set(originX, y, TELEMETRY_CONFIG.pierFaceZ);

    this.applyColor(beam, color);
    this.applyColor(dot, color);
  }

  private applyColor(obj: Object3D, color: Color): void {
    if (obj instanceof Mesh && obj.material instanceof MeshBasicMaterial) {
      obj.material.color.copy(color);
    }
  }

  private pickColor(approachSpeedMps: number): Color {
    if (approachSpeedMps > TELEMETRY_CONFIG.warningSpeedMps) {
      return this.dangerColor;
    }
    if (approachSpeedMps > TELEMETRY_CONFIG.safeSpeedMps) {
      return this.warnColor;
    }
    return this.safeColor;
  }

  private resolveNodes(): boolean {
    if (this.bowBeam != null) {
      return true;
    }
    const root = this.world.getSceneObject('laser-guides');
    if (root == null) {
      return false;
    }
    this.bowBeam = root.getObjectByName('BowBeam') ?? null;
    this.sternBeam = root.getObjectByName('SternBeam') ?? null;
    this.bowDot = root.getObjectByName('BowDot') ?? null;
    this.sternDot = root.getObjectByName('SternDot') ?? null;
    return this.bowBeam != null;
  }
}