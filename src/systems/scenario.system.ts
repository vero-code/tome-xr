import {
  Color,
  createSystem,
  Mesh,
  MeshStandardMaterial,
  Pressed,
  type UIKitMLAsset,
} from '@iwsdk/core';
import { DEG_TO_RAD } from '../constants/physics.constants.js';
import {
  SCENARIO_BUTTON_CONFIG,
  SCENARIOS,
} from '../constants/scenario.constants.js';
import { BASIN_BOUNDS } from '../constants/physics.constants.js';
import { WeatherDial } from '../entities/controls.component.js';
import { HarborEnvironment } from '../entities/environment.component.js';
import { ScenarioButton } from '../entities/scenario.component.js';
import { Tugboat } from '../entities/tugboat.component.js';
import { VesselBody } from '../entities/vessel.component.js';
import type { ScenarioId } from '../types/scenario.types.js';

export class ScenarioSystem extends createSystem({
  buttons: { required: [ScenarioButton] },
  pressedButtons: { required: [ScenarioButton, Pressed] },
  environments: { required: [HarborEnvironment] },
  dials: { required: [WeatherDial] },
  vessels: { required: [VesselBody] },
  tugs: { required: [Tugboat] },
}) {
  private activeId: ScenarioId = 1;
  private activeColor = new Color(SCENARIO_BUTTON_CONFIG.activeColor);
  private idleColor = new Color(SCENARIO_BUTTON_CONFIG.idleColor);
  private initialized = false;

  init(): void {
    this.queries.buttons.subscribe('qualify', () => {
      this.updateButtonColors();
    });

    this.queries.pressedButtons.subscribe('qualify', (buttonEntity) => {
      const rawId = buttonEntity.getValue(ScenarioButton, 'scenarioId') ?? 1;
      const targetId = Math.max(1, Math.min(3, rawId)) as ScenarioId;
      this.switchScenario(targetId);
    });
  }

  update(): void {
    if (!this.initialized && this.queries.buttons.entities.size >= 3) {
      this.switchScenario(1);
      this.initialized = true;
    }
  }

  private switchScenario(id: ScenarioId): void {
    const config = SCENARIOS[id];
    if (config == null) {
      return;
    }
    this.activeId = id;

    // Apply environment parameters
    for (const env of this.queries.environments.entities) {
      env.setValue(HarborEnvironment, 'windSpeed', config.windSpeed);
      env.setValue(HarborEnvironment, 'windDirectionDeg', config.windDirectionDeg);
      env.setValue(HarborEnvironment, 'currentSpeed', config.currentSpeed);
      env.setValue(HarborEnvironment, 'currentDirectionDeg', config.currentDirectionDeg);
    }

    // Update weather compass dial
    for (const dial of this.queries.dials.entities) {
      dial.setValue(WeatherDial, 'windDirectionDeg', config.windDirectionDeg);
      dial.object3D?.rotation.set(0, config.windDirectionDeg * DEG_TO_RAD, 0);
    }

    // Reset cargo vessel position and kinematics
    for (const vessel of this.queries.vessels.entities) {
      const obj = vessel.object3D;
      if (obj != null) {
        obj.position.set(config.vessel.x, BASIN_BOUNDS.waterSurfaceY, config.vessel.z);
        obj.rotation.set(0, config.vessel.headingDeg * DEG_TO_RAD, 0);
      }
      vessel.setValue(VesselBody, 'vx', config.vessel.vx);
      vessel.setValue(VesselBody, 'vz', config.vessel.vz);
      vessel.setValue(VesselBody, 'omega', 0);
      vessel.setValue(VesselBody, 'tugForceX', 0);
      vessel.setValue(VesselBody, 'tugForceZ', 0);
      vessel.setValue(VesselBody, 'tugTorque', 0);
    }

    // Reset tugboats
    for (const tug of this.queries.tugs.entities) {
      const isBow = (tug.getValue(Tugboat, 'stationOffset') ?? 0) > 0;
      const tugCfg = isBow ? config.tugBow : config.tugStern;
      tug.setValue(Tugboat, 'engaged', false);
      tug.setValue(Tugboat, 'offsetX', 0);
      tug.setValue(Tugboat, 'offsetZ', -0.08);
      if (tug.object3D != null) {
        tug.object3D.visible = tugCfg.active;
        if (tugCfg.active) {
          tug.object3D.position.set(tugCfg.x, BASIN_BOUNDS.waterSurfaceY, tugCfg.z);
          tug.object3D.rotation.set(0, 0, 0);
        } else {
          tug.object3D.position.set(0, -10, 0);
        }
      }
    }

    // Update LED visual highlights on buttons
    this.updateButtonColors();

    // Update briefing board with active scenario card
    const panel = this.world.getSceneObject<UIKitMLAsset>('welcome-panel');
    if (panel != null) {
      for (let i = 1; i <= 3; i += 1) {
        const card = panel.getElementById(`scenario-card-${i}`);
        card?.setProperties({ display: i === id ? 'flex' : 'none' });
      }
    }
  }

  private updateButtonColors(): void {
    for (const btn of this.queries.buttons.entities) {
      const id = btn.getValue(ScenarioButton, 'scenarioId') ?? 1;
      const isSelected = id === this.activeId;
      const cap = btn.object3D?.getObjectByName('ButtonCap');
      if (cap instanceof Mesh && cap.material && 'color' in cap.material) {
        if (!cap.userData.isCloned) {
          cap.material = cap.material.clone();
          cap.userData.isCloned = true;
        }
        cap.material.color.copy(isSelected ? this.activeColor : this.idleColor);
      }
    }
  }
}