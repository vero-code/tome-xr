import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import { SCENARIO_BUTTON_CONFIG } from '../constants/scenario.constants.js';

const baseMaterial = createSceneMaterial({
  id: 'tome-scenario-btn-base-mat',
  model: 'standard',
  baseColor: SCENARIO_BUTTON_CONFIG.baseColor,
  roughness: 0.6,
});

const capMaterial = createSceneMaterial({
  id: 'tome-scenario-btn-cap-mat',
  model: 'standard',
  baseColor: SCENARIO_BUTTON_CONFIG.idleColor,
  roughness: 0.35,
});

// Single tactile round button with housing and pressable cap
export function createScenarioButton(): Group {
  const root = new Group();
  root.name = 'ScenarioButtonAsset';

  const housing = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cylinder',
        radius: 0.018,
        height: 0.008,
        segments: 20,
      },
    },
    baseMaterial,
  );
  housing.position.y = 0.004;

  const cap = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cylinder',
        radius: 0.013,
        height: 0.01,
        segments: 20,
      },
    },
    capMaterial,
  );
  cap.name = 'ButtonCap';
  cap.position.y = 0.009;

  root.add(housing, cap);
  return root;
}