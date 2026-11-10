import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import { TRAJECTORY_CONFIG } from '../constants/physics.constants.js';
import { HARBOR_COLORS, VESSEL_CONFIG } from '../constants/table.constants.js';

const markerMaterial = createSceneMaterial({
  id: 'tome-trajectory-marker-mat',
  model: 'basic',
  baseColor: HARBOR_COLORS.trajectoryMarker,
  opacity: 0.8,
});

const ghostMaterial = createSceneMaterial({
  id: 'tome-ghost-hull-mat',
  model: 'basic',
  baseColor: HARBOR_COLORS.ghostHull,
  opacity: 0.45,
});

// Pre-allocated 3D markers and ghost ship outline updated in place at runtime
export function createDriftTrajectory(): Group {
  const root = new Group();
  root.name = 'DriftTrajectory';

  for (let i = 0; i < TRAJECTORY_CONFIG.sampleCount; i += 1) {
    const scale = 1 - (i / TRAJECTORY_CONFIG.sampleCount) * 0.45;
    const marker = createScenePrimitiveObject(
      {
        geometry: {
          type: 'box',
          size: [0.012 * scale, 0.002, 0.004 * scale],
        },
      },
      markerMaterial,
    );
    marker.name = `Marker_${i}`;
    root.add(marker);
  }

  // Ghost vessel frame showing predicted hull position at horizon end
  const ghostGroup = new Group();
  ghostGroup.name = 'GhostHull';
  const { length, beam } = VESSEL_CONFIG;
  const barThickness = 0.003;

  const portSide = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [length * 0.85, 0.002, barThickness] } },
    ghostMaterial,
  );
  portSide.position.z = -beam / 2;

  const starboardSide = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [length * 0.85, 0.002, barThickness] } },
    ghostMaterial,
  );
  starboardSide.position.z = beam / 2;

  const sternBar = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [barThickness, 0.002, beam] } },
    ghostMaterial,
  );
  sternBar.position.x = -length * 0.425;

  const bowBar = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [barThickness, 0.002, beam] } },
    ghostMaterial,
  );
  bowBar.position.x = length * 0.425;

  ghostGroup.add(portSide, starboardSide, sternBar, bowBar);
  root.add(ghostGroup);

  return root;
}