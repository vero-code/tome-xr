import { createComponent, Types } from '@iwsdk/core';

export const HarborEnvironment = createComponent('HarborEnvironment', {
  windSpeed: { type: Types.Float32, default: 0.35 },
  windDirectionDeg: { type: Types.Float32, default: -75 },
  currentSpeed: { type: Types.Float32, default: 0.15 },
  currentDirectionDeg: { type: Types.Float32, default: 0 },
});