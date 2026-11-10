import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import { HARBOR_COLORS, VESSEL_CONFIG } from '../constants/table.constants.js';

const hullMaterial = createSceneMaterial({
  id: 'tome-vessel-hull-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.vesselHull,
  roughness: 0.6,
});

const deckMaterial = createSceneMaterial({
  id: 'tome-vessel-deck-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.vesselDeck,
  roughness: 0.7,
});

const bridgeMaterial = createSceneMaterial({
  id: 'tome-vessel-bridge-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.vesselBridge,
  roughness: 0.4,
});

const containerBlueMaterial = createSceneMaterial({
  id: 'tome-container-blue-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.containerBlue,
  roughness: 0.6,
});

const containerOrangeMaterial = createSceneMaterial({
  id: 'tome-container-orange-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.containerOrange,
  roughness: 0.6,
});

// Container vessel with tapered bow (+X), aft bridge (-X) and cargo stacks
export function createCargoVessel(): Group {
  const {
    length,
    beam,
    hullHeight,
    deckHeight,
    bridgeWidth,
    bridgeHeight,
    bridgeDepth,
  } = VESSEL_CONFIG;

  const root = new Group();
  root.name = 'CargoVessel';

  const halfL = length / 2;
  const halfB = beam / 2;
  const bowStart = halfL * 0.55;
  const sternStart = -halfL * 0.82;

  // Tapered ship hull extruded vertically
  const hull = createScenePrimitiveObject(
    {
      geometry: {
        type: 'extrude',
        points: [
          [sternStart, -halfB * 0.85],
          [bowStart, -halfB],
          [halfL, 0],
          [bowStart, halfB],
          [sternStart, halfB * 0.85],
          [-halfL, halfB * 0.65],
          [-halfL, -halfB * 0.65],
        ],
        depth: hullHeight,
        bevel: {
          enabled: true,
          size: 0.0015,
          thickness: 0.0015,
          segments: 2,
        },
      },
    },
    hullMaterial,
  );
  hull.rotation.x = -Math.PI / 2;
  hull.position.y = 0.0015;
  hull.name = 'Hull';

  // Main deck slab
  const deck = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [length * 0.76, deckHeight, beam * 0.86],
        radius: 0.001,
        segments: 2,
      },
    },
    deckMaterial,
  );
  deck.position.set(-length * 0.05, hullHeight + deckHeight / 2, 0);
  deck.name = 'Deck';

  // Aft superstructure bridge (high and far aft, creating forward blind zone)
  const bridge = createScenePrimitiveObject(
    {
      geometry: {
        type: 'roundedBox',
        size: [bridgeWidth, bridgeHeight, bridgeDepth],
        radius: 0.002,
        segments: 2,
      },
    },
    bridgeMaterial,
  );
  bridge.position.set(
    -halfL * 0.68,
    hullHeight + deckHeight + bridgeHeight / 2,
    0,
  );
  bridge.name = 'Bridge';

  // Cargo container bays forward of the bridge
  const cargoGroup = new Group();
  cargoGroup.name = 'CargoBay';
  const bayX = [-0.035, 0.01, 0.055];
  for (let i = 0; i < bayX.length; i += 1) {
    const mat = i % 2 === 0 ? containerBlueMaterial : containerOrangeMaterial;
    const stack = createScenePrimitiveObject(
      {
        geometry: {
          type: 'box',
          size: [0.036, 0.018, beam * 0.74],
        },
      },
      mat,
    );
    stack.position.set(bayX[i], hullHeight + deckHeight + 0.009, 0);
    cargoGroup.add(stack);
  }

  root.add(hull, deck, bridge, cargoGroup);
  return root;
}