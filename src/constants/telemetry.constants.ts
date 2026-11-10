import type { LaserGuideConfig, FenderContactConfig } from '../types/telemetry.types.js';

export const TELEMETRY_CONFIG: LaserGuideConfig = {
  maxActiveDistance: 0.22,
  pierFaceZ: -0.135,
  safeSpeedMps: 0.008,
  warningSpeedMps: 0.016,
  bowProbeOffset: 0.08,
  sternProbeOffset: -0.08,
  beamThickness: 0.002,
};

export const TELEMETRY_COLORS = {
  safe: '#2EA043',
  warning: '#D29922',
  danger: '#F85149',
} as const;

export const FENDER_CONFIG_THRESHOLDS: FenderContactConfig = {
  contactDistance: 0.042,
  safeSpeedMps: 0.007,
  crashSpeedMps: 0.015,
  idleColor: '#38414A',
  safeColor: '#2EA043',
  warnColor: '#D29922',
  crashColor: '#F85149',
};