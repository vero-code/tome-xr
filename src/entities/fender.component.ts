import { createComponent, Types } from '@iwsdk/core';

export const FenderContact = createComponent('FenderContact', {
  inContact: { type: Types.Boolean, default: false },
  impactSpeed: { type: Types.Float32, default: 0 },
});