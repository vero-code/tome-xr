import { createComponent, Types } from '@iwsdk/core';

export const WeatherDial = createComponent('WeatherDial', {
  windDirectionDeg: { type: Types.Float32, default: -75 },
});

export const SimToggleButton = createComponent('SimToggleButton', {
  isRunning: { type: Types.Boolean, default: true },
});