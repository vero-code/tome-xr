import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { PanelSystem } from './systems/panel.system.js';
import { TableControlsSystem } from './systems/table-controls.system.js';
import { TrajectorySystem } from './systems/trajectory.system.js';
import { TugboatSystem } from './systems/tugboat.system.js';
import { VesselGrabSystem } from './systems/vessel-grab.system.js';
import { VesselPhysicsSystem } from './systems/vessel-physics.system.js';
import { LaserGuidesSystem } from './systems/laser-guides.system.js';
import { FenderContactSystem } from './systems/fender-contact.system.js';
import { ScenarioSystem } from './systems/scenario.system.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(PanelSystem);
  world.registerSystem(TableControlsSystem);
  world.registerSystem(VesselGrabSystem);
  world.registerSystem(TugboatSystem);
  world.registerSystem(VesselPhysicsSystem);
  world.registerSystem(TrajectorySystem);
  world.registerSystem(LaserGuidesSystem);
  world.registerSystem(FenderContactSystem);
  world.registerSystem(ScenarioSystem);
});