import {
  Color,
  createSystem,
  Mesh,
  MeshStandardMaterial,
  Pressed,
} from '@iwsdk/core';
import {
  RAD_TO_DEG,
  WEATHER_DIAL_CONFIG,
} from '../constants/interaction.constants.js';
import { DEG_TO_RAD, MAX_SIMULATION_DT } from '../constants/physics.constants.js';
import { HARBOR_COLORS } from '../constants/table.constants.js';
import {
  SimToggleButton,
  WeatherDial,
} from '../entities/controls.component.js';
import { HarborEnvironment } from '../entities/environment.component.js';
import { VesselBody } from '../entities/vessel.component.js';

const COMPASS_STEP_RAD = 45 * DEG_TO_RAD;
const TAP_MAX_DURATION_SEC = 0.25;
const ROTATION_SPEED_RAD_PER_SEC = 90 * DEG_TO_RAD;

export class TableControlsSystem extends createSystem({
  dials: { required: [WeatherDial] },
  pressedDials: { required: [WeatherDial, Pressed] },
  buttons: { required: [SimToggleButton] },
  pressedButtons: { required: [SimToggleButton, Pressed] },
  environments: { required: [HarborEnvironment] },
  vessels: { required: [VesselBody] },
}) {
  private activeColor!: Color;
  private pausedColor!: Color;
  private dialYaw = -75 * DEG_TO_RAD;
  private pressDuration = 0;

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

    this.queries.pressedDials.subscribe('qualify', () => {
      this.pressDuration = 0;
    });

    // On release: if was a short tap, step 45 degrees
    this.queries.pressedDials.subscribe('disqualify', (dialEntity) => {
      if (this.pressDuration <= TAP_MAX_DURATION_SEC) {
        this.stepRotation(dialEntity);
      }
      this.pressDuration = 0;
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

  update(delta: number): void {
    const dt = Math.min(Math.max(delta, 0.001), MAX_SIMULATION_DT);

    for (const dialEntity of this.queries.pressedDials.entities) {
      this.pressDuration += dt;

      // Start smooth rotation only after hold threshold is exceeded
      if (this.pressDuration > TAP_MAX_DURATION_SEC) {
        this.dialYaw += ROTATION_SPEED_RAD_PER_SEC * dt;
        if (this.dialYaw > Math.PI) {
          this.dialYaw -= 2 * Math.PI;
        }

        const obj = dialEntity.object3D;
        if (obj != null) {
          obj.rotation.set(0, this.dialYaw, 0);
        }

        this.syncEnvironment(dialEntity);
      }
    }
  }

  private stepRotation(dialEntity: import('@iwsdk/core').Entity): void {
    this.dialYaw += COMPASS_STEP_RAD;
    if (this.dialYaw > Math.PI) {
      this.dialYaw -= 2 * Math.PI;
    }

    const obj = dialEntity.object3D;
    if (obj != null) {
      obj.rotation.set(0, this.dialYaw, 0);
    }

    this.syncEnvironment(dialEntity);
  }

  private syncEnvironment(dialEntity: import('@iwsdk/core').Entity): void {
    const windDeg = this.dialYaw * RAD_TO_DEG;
    dialEntity.setValue(WeatherDial, 'windDirectionDeg', windDeg);

    for (const envEntity of this.queries.environments.entities) {
      envEntity.setValue(HarborEnvironment, 'windDirectionDeg', windDeg);
    }
  }
}