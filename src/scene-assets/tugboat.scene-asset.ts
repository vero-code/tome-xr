import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import { HARBOR_COLORS } from '../constants/table.constants.js';

const tugHullMaterial = createSceneMaterial({
  id: 'tome-tug-hull-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.tugHull,
  roughness: 0.45,
});

const tugCabinMaterial = createSceneMaterial({
  id: 'tome-tug-cabin-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.tugCabin,
  roughness: 0.6,
});

const towLineMaterial = createSceneMaterial({
  id: 'tome-tow-line-mat',
  model: 'basic',
  baseColor: HARBOR_COLORS.towLine,
});

// Harbor tugboat with extensible towline (-X) and forward thrust arrow (+X)
export function createTugboat(): Group {
  const root = new Group();
  root.name = 'TugboatAsset';

  const hull = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [0.042, 0.012, 0.022],
        radius: 0.005,
        segments: 2,
      },
    },
    tugHullMaterial,
  );
  hull.position.y = 0.006;

  const cabin = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [0.016, 0.012, 0.014],
        radius: 0.002,
        segments: 2,
      },
    },
    tugCabinMaterial,
  );
  cabin.position.set(0.004, 0.016, 0);

  // Unit-length towline along local X, scaled dynamically by TugboatSystem
  const towLine = createScenePrimitiveObject(
    {
      geometry: {
        type: 'box',
        size: [1.0, 0.0025, 0.003],
      },
    },
    towLineMaterial,
  );
  towLine.name = 'TowLine';
  towLine.position.set(-0.03, 0.006, 0);
  towLine.scale.x = 0.001;

  // Forward thrust indicator arrow in front of tug bow
  const thrustArrow = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cone',
        radius: 0.006,
        height: 0.016,
        segments: 10,
      },
    },
    towLineMaterial,
  );
  thrustArrow.name = 'ThrustArrow';
  thrustArrow.rotation.z = -Math.PI / 2;
  thrustArrow.position.set(0.032, 0.006, 0);

  root.add(hull, cabin, towLine, thrustArrow);
  return root;
}