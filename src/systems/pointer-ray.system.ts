import {
  Color,
  createSystem,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
} from '@iwsdk/core';

// Distinct bright cyan laser rays attached directly to player hand rays
export class PointerRaySystem extends createSystem({}) {
  init(): void {
    const rayLength = 1.0;
    const geometry = new CylinderGeometry(0.001, 0.001, rayLength, 8);
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