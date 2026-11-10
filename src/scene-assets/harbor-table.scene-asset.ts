import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import { HARBOR_COLORS, HARBOR_TABLE } from '../constants/table.constants.js';

const floorMaterial = createSceneMaterial({
  id: 'tome-floor-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.floor,
  roughness: 0.9,
});

const pedestalMaterial = createSceneMaterial({
  id: 'tome-pedestal-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.pedestal,
  roughness: 0.7,
});

const rimMaterial = createSceneMaterial({
  id: 'tome-rim-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.rim,
  roughness: 0.5,
});

const waterMaterial = createSceneMaterial({
  id: 'tome-water-mat',
  model: 'physical',
  baseColor: HARBOR_COLORS.water,
  roughness: 0.2,
  clearcoat: 0.8,
  clearcoatRoughness: 0.1,
});

const pierMaterial = createSceneMaterial({
  id: 'tome-pier-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.pier,
  roughness: 0.8,
});

// Bridge floor with origin at y = 0
export function createBridgeFloor(size = 24): Group {
  const floor = createScenePrimitiveObject(
    { geometry: { type: 'plane', size: [size, size] } },
    floorMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  const root = new Group();
  root.add(floor);
  return root;
}

// Tactical diorama table with water basin and pier slab
export function createHarborTable(): Group {
  const { width, depth, height, rimThickness, rimHeight, basinDepth } =
    HARBOR_TABLE;
  const root = new Group();

  // Support column
  const pedestal = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [width * 0.35, height - basinDepth, depth * 0.35],
        radius: 0.015,
        segments: 3,
      },
    },
    pedestalMaterial,
  );
  pedestal.position.y = (height - basinDepth) / 2;

  // Table base slab
  const slab = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [width, rimHeight, depth],
        radius: 0.01,
        segments: 3,
      },
    },
    rimMaterial,
  );
  slab.position.y = height - rimHeight / 2;

  // Water surface inside the table
  const waterWidth = width - rimThickness * 2;
  const waterDepth = depth - rimThickness * 2;
  const water = createScenePrimitiveObject(
    {
      geometry: {
        type: 'box',
        size: [waterWidth, 0.01, waterDepth],
      },
    },
    waterMaterial,
  );
  water.position.y = height + 0.002;

  // North pier wall inside basin
  const pierDepth = 0.1;
  const pier = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [waterWidth * 0.7, 0.025, pierDepth],
        radius: 0.004,
        segments: 2,
      },
    },
    pierMaterial,
  );
  pier.position.set(0, height + 0.012, -waterDepth / 2 + pierDepth / 2 + 0.02);

  root.add(pedestal, slab, water, pier);
  return root;
}