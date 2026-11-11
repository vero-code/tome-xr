import {
  Color,
  createSystem,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  VisibilityState,
} from '@iwsdk/core';

// Distance to step back ONLY in XR hands mode (meters)
const XR_SEATED_OFFSET_Z = 0.20;

// Distinct bright cyan laser rays attached directly to player hand rays
export class PointerRaySystem extends createSystem({}) {
  init(): void {
    // Only in XR mode: move player further back from table; in 2D mode keep at origin (0)
    this.cleanupFuncs.push(
      this.world.visibilityState.subscribe((visibilityState) => {
        const isXR = visibilityState !== VisibilityState.NonImmersive;
        this.player.position.set(0, 0, isXR ? XR_SEATED_OFFSET_Z : 0);
      }),
    );

    const rayLength = 3.0;
    const geometry = new CylinderGeometry(0.003, 0.003, rayLength, 8);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, 0, -rayLength / 2);

    const material = new MeshBasicMaterial({
      color: new Color('#58A6FF'),
      transparent: true,
      opacity: 0.7,
    });

    const leftRay = new Mesh(geometry, material);
    leftRay.name = 'VisualRayLeft';
    this.player.raySpaces.left.add(leftRay);

    const rightRay = new Mesh(geometry, material);
    rightRay.name = 'VisualRayRight';
    this.player.raySpaces.right.add(rightRay);

    this.cleanupFuncs.push(() => {
      this.player.raySpaces.left.remove(leftRay);
      this.player.raySpaces.right.remove(rightRay);
      geometry.dispose();
      material.dispose();
    });
  }
}