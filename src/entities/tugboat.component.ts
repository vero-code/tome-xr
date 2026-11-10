import { createComponent, Types } from '@iwsdk/core';

export const Tugboat = createComponent('Tugboat', {
  stationOffset: { type: Types.Float32, default: 0.075 },
  engaged: { type: Types.Boolean, default: false },
  offsetX: { type: Types.Float32, default: 0 },
  offsetZ: { type: Types.Float32, default: -0.06 },
});