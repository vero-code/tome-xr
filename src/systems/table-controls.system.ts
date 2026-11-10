import {
  Color,
  createSystem,
  Grabbed,
  Mesh,
  MeshStandardMaterial,
  Pressed,
} from '@iwsdk/core';
import {
  RAD_TO_DEG,
  WEATHER_DIAL_CONFIG,
} from '../constants/interaction.constants.js';
import { DEG_TO_RAD } from '../constants/physics.constants.js';
import { HARBOR_COLORS } from '../constants/table.constants.js';
import {
  SimToggleButton,
  WeatherDial,
} from '../entities/controls.component.js';
import { HarborEnvironment } from '../entities/environment.component.js';
import { VesselBody } from '../entities/vessel.component.js';

export class TableControlsSystem extends createSystem({
  dials: { required: [WeatherDial] },
  heldDials: { required: [WeatherDial, Grabbed] },
  buttons: { required: [SimToggleButton] },
  pressedButtons: { required: [SimToggleButton, Pressed] },
  environments: { required: [HarborEnvironment] },
  vessels: { required: [VesselBody] },
}) {
  private activeColor!: Color;
  private pausedColor!: Color;
  private dialYaw = -75 * DEG_TO_RAD;

  init(): void {
    this.activeColor = new Color(HARBOR_COLORS.buttonActive);
    this.pausedColor = new Color(HARBOR_COLORS.buttonPaused);

    this.queries.dials.subscribe('qualify', (entity) => {
      const deg = entity.getValue(WeatherDial, 'windDirectionDeg') ?? -75;
      this.dialYaw = deg * DEG_TO_RAD;
      if (entity.object3D != null) {
        entity.object3D.rotation.set(0, this.dialYaw, 0);
      }
    });

    this.queries.pressedButtons.subscribe('qualify', (buttonEntity) => {
      const current = Boolean(
        buttonEntity.getValue(SimToggleButton, 'isRunning'),
      );
      const nextState = !current;
      buttonEntity.setValue(SimToggleButton, 'isRunning', nextState);

      for (const vessel of this.queries.vessels.entities) {
        vessel.setValue(VesselBody, 'active', nextState);
      }

      const cap = buttonEntity.object3D?.getObjectByName('ButtonCap');
      if (cap != null) {
        cap.position.y = 0.012 + WEATHER_DIAL_CONFIG.pressedOffsetY;
        if (
          cap instanceof Mesh &&
          cap.material instanceof MeshStandardMaterial
        ) {
          cap.material.color.copy(
            nextState ? this.activeColor : this.pausedColor,
          );
        }
      }
    });

    this.queries.pressedButtons.subscribe('disqualify', (buttonEntity) => {
      const cap = buttonEntity.object3D?.getObjectByName('ButtonCap');
      if (cap != null) {
        cap.position.y = 0.012;
      }
    });
  }

  update(): void {
    for (const dialEntity of this.queries.heldDials.entities) {
      const obj = dialEntity.object3D;
      if (obj == null) {
        continue;
      }

      // Lock dial rotation strictly to horizontal Y axis
      this.dialYaw = obj.rotation.y;
      obj.rotation.set(0, this.dialYaw, 0);

      const windDeg = this.dialYaw * RAD_TO_DEG;
      dialEntity.setValue(WeatherDial, 'windDirectionDeg', windDeg);

      for (const envEntity of this.queries.environments.entities) {
        envEntity.setValue(HarborEnvironment, 'windDirectionDeg', windDeg);
      }
    }
  }
}