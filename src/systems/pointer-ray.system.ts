import {
  Color,
  createSystem,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  VisibilityState,
} from '@iwsdk/core';

// Seated offsets applied ONLY in XR hands mode (meters)
const XR_SEATED_OFFSET_Y = -0.25; // Negative lowers player down towards the chair
const XR_SEATED_OFFSET_Z = 0.20; // Positive moves player back away from the table rim

// Distinct bright cyan laser rays attached directly to player hand rays
export class PointerRaySystem extends createSystem({}) {
  init(): void {
    const rayLength = 3.0;
    const geometry = new CylinderGeometry(0.003, 0.003, rayLength, 8);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, 0, -rayLength / 2);

    const material = new MeshBasicMaterial({
      color: new Color('#58A6FF'),
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    });

    const leftRay = new Mesh(geometry, material);
    leftRay.name = 'VisualRayLeft';
    leftRay.renderOrder = 999;
    leftRay.visible = false;
    this.player.raySpaces.left.add(leftRay);

    const rightRay = new Mesh(geometry, material);
    rightRay.name = 'VisualRayRight';
    rightRay.renderOrder = 999;
    rightRay.visible = false;
    this.player.raySpaces.right.add(rightRay);

    // Only in XR mode: show laser rays and adjust seating; hide in 2D
    this.cleanupFuncs.push(
      this.world.visibilityState.subscribe((visibilityState) => {
        const isXR = visibilityState !== VisibilityState.NonImmersive;
        leftRay.visible = isXR;
        rightRay.visible = isXR;
        this.player.position.set(
          0,
          isXR ? XR_SEATED_OFFSET_Y : 0,
          isXR ? XR_SEATED_OFFSET_Z : 0,
        );
      }),
    );

    this.cleanupFuncs.push(() => {
      this.player.raySpaces.left.remove(leftRay);
      this.player.raySpaces.right.remove(rightRay);
      geometry.dispose();
      material.dispose();
    });
  }
}