import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
} from '@iwsdk/core';
import { WEATHER_DIAL_CONFIG } from '../constants/interaction.constants.js';
import { HARBOR_COLORS } from '../constants/table.constants.js';

const dialBaseMaterial = createSceneMaterial({
  id: 'tome-dial-base-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.dialBase,
  roughness: 0.5,
  metalness: 0.3,
});

const dialArrowMaterial = createSceneMaterial({
  id: 'tome-dial-arrow-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.dialArrow,
  roughness: 0.3,
});

const buttonCapMaterial = createSceneMaterial({
  id: 'tome-sim-btn-cap-mat',
  model: 'standard',
  baseColor: HARBOR_COLORS.buttonActive,
  roughness: 0.35,
});

// Rotatable compass dial showing wind direction vector (+X in local space)
export function createWeatherDial(): Group {
  const { radius, height } = WEATHER_DIAL_CONFIG;
  const root = new Group();
  root.name = 'WeatherDialAsset';

  const disc = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cylinder',
        radius,
        height,
        segments: 24,
      },
    },
    dialBaseMaterial,
  );
  disc.position.y = height / 2;

  const gripRing = createScenePrimitiveObject(
    {
      geometry: {
        type: 'torus',
        radius: radius - 0.003,
        tube: 0.004,
        radialSegments: 10,
        tubularSegments: 32,
      },
    },
    dialArrowMaterial,
  );
  gripRing.rotation.x = -Math.PI / 2;
  gripRing.position.y = height;

  const arrowShaft = createScenePrimitiveObject(
    {
      geometry: {
        type: 'box',
        size: [radius * 1.1, 0.005, 0.007],
      },
    },
    dialArrowMaterial,
  );
  arrowShaft.position.set(-0.004, height + 0.003, 0);

  const arrowHead = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cone',
        radius: 0.01,
        height: 0.02,
        segments: 12,
      },
    },
    dialArrowMaterial,
  );
  arrowHead.rotation.z = -Math.PI / 2;
  arrowHead.position.set(radius * 0.55, height + 0.003, 0);

  root.add(disc, gripRing, arrowShaft, arrowHead);
  return root;
}

// Push button for toggling simulation play/pause state
export function createSimToggleButton(): Group {
  const root = new Group();
  root.name = 'SimToggleButtonAsset';

  const housing = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cylinder',
        radius: 0.032,
        height: 0.01,
        segments: 24,
      },
    },
    dialBaseMaterial,
  );
  housing.position.y = 0.005;

  const cap = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cylinder',
        radius: 0.025,
        height: 0.012,
        segments: 24,
      },
    },
    buttonCapMaterial,
  );
  cap.name = 'ButtonCap';
  cap.position.y = 0.012;

  root.add(housing, cap);
  return root;
}