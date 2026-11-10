import { createComponent, Types } from '@iwsdk/core';

export const ScenarioButton = createComponent('ScenarioButton', {
  scenarioId: { type: Types.Int32, default: 1 },
});