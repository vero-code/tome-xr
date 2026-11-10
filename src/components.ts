import { defineComponents } from '@iwsdk/core';
import {
  SimToggleButton,
  WeatherDial,
} from './entities/controls.component.js';
import { HarborEnvironment } from './entities/environment.component.js';
import { FenderContact } from './entities/fender.component.js';
import { Tugboat } from './entities/tugboat.component.js';
import { VesselBody } from './entities/vessel.component.js';
import { ScenarioButton } from './entities/scenario.component.js';

export default defineComponents([
  VesselBody,
  HarborEnvironment,
  Tugboat,
  WeatherDial,
  SimToggleButton,
  FenderContact,
  ScenarioButton,
]);