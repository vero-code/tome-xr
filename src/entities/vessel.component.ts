import { createComponent, Types } from '@iwsdk/core';

export const VesselBody = createComponent('VesselBody', {
  vx: { type: Types.Float32, default: 0.024 },
  vz: { type: Types.Float32, default: -0.015 },
  omega: { type: Types.Float32, default: 0 },
  tugForceX: { type: Types.Float32, default: 0 },
  tugForceZ: { type: Types.Float32, default: 0 },
  tugTorque: { type: Types.Float32, default: 0 },
  active: { type: Types.Boolean, default: true },
});