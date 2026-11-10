import type { ScenarioDefinition, ScenarioId } from '../types/scenario.types.js';

export const SCENARIO_BUTTON_CONFIG = {
  spacingX: 0.05,
  baseWidth: 0.16,
  baseDepth: 0.045,
  baseHeight: 0.008,
  buttonRadius: 0.014,
  buttonHeight: 0.01,
  pressedOffsetY: -0.003,
  activeColor: '#58A6FF',
  idleColor: '#21262D',
  baseColor: '#161B22',
} as const;

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
  // Scenario 1: Calm water, basic mooring, no tugs needed
  1: {
    id: 1,
    windSpeed: 0,
    windDirectionDeg: 0,
    currentSpeed: 0,
    currentDirectionDeg: 0,
    vessel: {
      x: -0.14,
      z: 0.08,
      headingDeg: 12,
      vx: 0.016,
      vz: -0.01,
    },
    tugBow: { active: false, x: 0.28, z: 0.18 },
    tugStern: { active: false, x: -0.28, z: 0.18 },
  },
  // Scenario 2: Crosswind pushing offshore, 1 bow tug available
  2: {
    id: 2,
    windSpeed: 0.45,
    windDirectionDeg: -80,
    currentSpeed: 0,
    currentDirectionDeg: 0,
    vessel: {
      x: -0.18,
      z: 0.12,
      headingDeg: 18,
      vx: 0.02,
      vz: -0.008,
    },
    tugBow: { active: true, x: 0.02, z: 0.16 },
    tugStern: { active: false, x: -0.32, z: 0.2 },
  },
  // Scenario 3: Wind and current in narrow dock, 2 tugs required
  3: {
    id: 3,
    windSpeed: 0.4,
    windDirectionDeg: -65,
    currentSpeed: 0.22,
    currentDirectionDeg: 0,
    vessel: {
      x: -0.22,
      z: 0.14,
      headingDeg: 24,
      vx: 0.024,
      vz: -0.014,
    },
    tugBow: { active: true, x: 0.04, z: 0.16 },
    tugStern: { active: true, x: -0.26, z: 0.22 },
  },
};