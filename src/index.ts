import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { PanelSystem } from './systems/panel.system.js';
import { VesselGrabSystem } from './systems/vessel-grab.system.js';
import { VesselPhysicsSystem } from './systems/vessel-physics.system.js';
import { TrajectorySystem } from './systems/trajectory.system.js';
import { TugboatSystem } from './systems/tugboat.system.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(PanelSystem);
  world.registerSystem(VesselGrabSystem);
  world.registerSystem(VesselPhysicsSystem);
  world.registerSystem(TrajectorySystem);
  world.registerSystem(TugboatSystem);
});