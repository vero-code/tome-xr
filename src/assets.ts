import { AssetType, defineAssets } from '@iwsdk/core';
import {
  createBridgeFloor,
  createHarborTable,
  createMooringZone,
  createPierFender,
} from './scene-assets/harbor-table.scene-asset.js';
import { createCargoVessel } from './scene-assets/vessel.scene-asset.js';
import { createDriftTrajectory } from './scene-assets/trajectory.scene-asset.js';
import { createTugboat } from './scene-assets/tugboat.scene-asset.js';

const publicAssetUrl = (filePath: string): string =>
  `${import.meta.env.BASE_URL}${filePath.replace(/^\/+/u, '')}`;

const uikitml = (fileName: string, name: string) => ({
  url: publicAssetUrl(`ui/${fileName}`),
  type: AssetType.UIKitML,
  name,
});

export default defineAssets({
  'bridge-floor': createBridgeFloor(),
  'harbor-table': createHarborTable(),
  'pier-fender': createPierFender(),
  'mooring-zone': createMooringZone(),
  'cargo-vessel': createCargoVessel(),
  'welcome-panel': uikitml('welcome.uikitml', 'Welcome Panel'),
  'drift-trajectory': createDriftTrajectory(),
  'tugboat': createTugboat(),
});