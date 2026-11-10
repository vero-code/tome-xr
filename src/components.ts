import { defineComponents } from '@iwsdk/core';
import { HarborEnvironment } from './entities/environment.component.js';
import { Tugboat } from './entities/tugboat.component.js';
import { VesselBody } from './entities/vessel.component.js';

export default defineComponents([VesselBody, HarborEnvironment, Tugboat]);