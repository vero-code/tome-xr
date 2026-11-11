import {
  Color,
  createSystem,
  Grabbed,
  Mesh,
  type UIKitMLAsset,
} from '@iwsdk/core';
import { VesselBody } from '../entities/vessel.component.js';

export class MooringCheckSystem extends createSystem({
  vessels: { required: [VesselBody] },
}) {
  private isDocked = false;
  private successBanner: any = null;
  private zoneMeshes: Mesh[] = [];
  private normalColor = new Color('#2EA043');
  private successColor = new Color('#FFD700');

  init(): void {
    const panel = this.world.getSceneObject<UIKitMLAsset>('welcome-panel');
    this.successBanner = panel?.getElementById('dock-success');

    const mooringGroup = this.world.getSceneObject('mooring-zone');
    if (mooringGroup != null) {
      mooringGroup.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          if (!child.userData.isCloned) {
            child.material = child.material.clone();
            child.userData.isCloned = true;
          }
          this.zoneMeshes.push(child);
        }
      });
    }
  }

  update(): void {
    const vessel = this.getPrimaryVessel();
    if (vessel == null || vessel.object3D == null) {
      return;
    }

    const obj = vessel.object3D;
    const posX = obj.position.x;
    const posZ = obj.position.z;
    const heading = obj.rotation.y;
    const vx = vessel.getValue(VesselBody, 'vx') ?? 0;
    const vz = vessel.getValue(VesselBody, 'vz') ?? 0;
    const speed = Math.hypot(vx, vz);
    const isGrabbed = vessel.hasComponent(Grabbed);

    // Mooring criteria: inside zone, parallel, stopped, released
    const inX = Math.abs(posX) <= 0.12;
    const inZ = posZ >= -0.13 && posZ <= -0.06;
    const isParallel = Math.abs(Math.sin(heading)) <= 0.35;
    const isStationary = speed <= 0.02;

    const docked = inX && inZ && isParallel && isStationary && !isGrabbed;

    if (docked !== this.isDocked) {
      this.isDocked = docked;
      this.applyDockedVisuals(docked);
    }
  }

  private applyDockedVisuals(docked: boolean): void {
    if (this.successBanner != null) {
      this.successBanner.setProperties({
        display: docked ? 'flex' : 'none',
      });
    }

    const targetColor = docked ? this.successColor : this.normalColor;
    for (const mesh of this.zoneMeshes) {
      const mat = mesh.material;
      if (mat != null && 'color' in mat && mat.color instanceof Color) {
        mat.color.copy(targetColor);
      }
    }
  }

  private getPrimaryVessel() {
    for (const entity of this.queries.vessels.entities) {
      return entity;
    }
    return null;
  }
}