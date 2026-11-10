import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import {
  FENDER_CONFIG,
  HARBOR_COLORS,
  HARBOR_TABLE,
  MOORING_ZONE_CONFIG,
  PIER_CONFIG,
} from '../constants/table.constants.js';

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

const curbMaterial = createSceneMaterial({
  id: 'tome-pier-curb-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.pierCurb,
  roughness: 0.5,
});

const bollardMaterial = createSceneMaterial({
  id: 'tome-bollard-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.bollard,
  roughness: 0.4,
  metalness: 0.6,
});

const fenderMaterial = createSceneMaterial({
  id: 'tome-fender-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.fender,
  roughness: 0.5,
});

const mooringZoneMaterial = createSceneMaterial({
  id: 'tome-mooring-zone-mat',
  model: 'basic',
  baseColor: HARBOR_COLORS.mooringZone,
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

// Tactical diorama table with water basin, pier wall, curb and bollards
export function createHarborTable(): Group {
  const { width, depth, height, rimThickness, rimHeight, basinDepth } =
    HARBOR_TABLE;
  const root = new Group();

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

  // Pier group with safety curb and mooring bollards
  const pierGroup = new Group();
  pierGroup.name = 'PierWall';
  pierGroup.position.set(0, height + PIER_CONFIG.height / 2, PIER_CONFIG.zOffset);

  const pierSlab = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [PIER_CONFIG.width, PIER_CONFIG.height, PIER_CONFIG.depth],
        radius: 0.004,
        segments: 2,
      },
    },
    pierMaterial,
  );

  const safetyCurb = createScenePrimitiveObject(
    {
      geometry: {
        type: 'box',
        size: [PIER_CONFIG.width - 0.02, 0.003, 0.008],
      },
    },
    curbMaterial,
  );
  safetyCurb.position.set(
    0,
    PIER_CONFIG.height / 2 + 0.0015,
    PIER_CONFIG.depth / 2 - 0.008,
  );

  pierGroup.add(pierSlab, safetyCurb);

  const bollardX = [-0.22, -0.08, 0.08, 0.22];
  for (const bx of bollardX) {
    const bollard = createScenePrimitiveObject(
      {
        geometry: {
          type: 'cylinder',
          radius: PIER_CONFIG.bollardRadius,
          height: PIER_CONFIG.bollardHeight,
          segments: 12,
        },
      },
      bollardMaterial,
    );
    bollard.position.set(
      bx,
      PIER_CONFIG.height / 2 + PIER_CONFIG.bollardHeight / 2,
      PIER_CONFIG.depth / 2 - 0.02,
    );
    pierGroup.add(bollard);
  }

  root.add(pedestal, slab, water, pierGroup);
  return root;
}

// Single cylindrical fender bumper mounted horizontally along pier face
export function createPierFender(): Group {
  const root = new Group();
  root.name = 'PierFender';
  const cylinder = createScenePrimitiveObject(
    {
      geometry: {
        type: 'capsule',
        radius: FENDER_CONFIG.radius,
        length: FENDER_CONFIG.length,
        capSegments: 6,
        radialSegments: 12,
      },
    },
    fenderMaterial,
  );
  cylinder.rotation.z = Math.PI / 2;
  root.add(cylinder);
  return root;
}

// Rectangular target outline on the water surface for vessel berthing
export function createMooringZone(): Group {
  const { width, depth, borderThickness } = MOORING_ZONE_CONFIG;
  const root = new Group();
  root.name = 'MooringZone';

  const northBar = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [width, 0.002, borderThickness] } },
    mooringZoneMaterial,
  );
  northBar.position.z = -depth / 2;

  const southBar = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [width, 0.002, borderThickness] } },
    mooringZoneMaterial,
  );
  southBar.position.z = depth / 2;

  const westBar = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [borderThickness, 0.002, depth] } },
    mooringZoneMaterial,
  );
  westBar.position.x = -width / 2;

  const eastBar = createScenePrimitiveObject(
    { geometry: { type: 'box', size: [borderThickness, 0.002, depth] } },
    mooringZoneMaterial,
  );
  eastBar.position.x = width / 2;

  root.add(northBar, southBar, westBar, eastBar);
  return root;
}