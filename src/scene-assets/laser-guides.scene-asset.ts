import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import {
  TELEMETRY_COLORS,
  TELEMETRY_CONFIG,
} from '../constants/telemetry.constants.js';

const laserMaterial = createSceneMaterial({
  id: 'tome-laser-beam-mat',
  model: 'basic',
  baseColor: TELEMETRY_COLORS.safe,
});

// Dual laser guide lines projecting from bow and stern toward pier face
export function createLaserGuides(): Group {
  const root = new Group();
  root.name = 'LaserGuidesAsset';

  const t = TELEMETRY_CONFIG.beamThickness;

  // Bow laser beam unit box scaled dynamically along Z
  const bowBeam = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [t, t, 1.0] } },
    laserMaterial,
  );
  bowBeam.name = 'BowBeam';
  bowBeam.visible = false;

  // Stern laser beam unit box scaled dynamically along Z
  const sternBeam = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [t, t, 1.0] } },
    laserMaterial,
  );
  sternBeam.name = 'SternBeam';
  sternBeam.visible = false;

  // Pier contact target dots
  const bowDot = createScenePrimitiveObject(
    { geometry: { type: 'sphere', radius: 0.003, segments: 8 } },
    laserMaterial,
  );
  bowDot.name = 'BowDot';
  bowDot.visible = false;

  const sternDot = createScenePrimitiveObject(
    { geometry: { type: 'sphere', radius: 0.003, segments: 8 } },
    laserMaterial,
  );
  sternDot.name = 'SternDot';
  sternDot.visible = false;

  root.add(bowBeam, sternBeam, bowDot, sternDot);
  return root;
}