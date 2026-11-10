import type { Color } from '@iwsdk/core';

export interface LaserGuideConfig {
  readonly maxActiveDistance: number;
  readonly pierFaceZ: number;
  readonly safeSpeedMps: number;
  readonly warningSpeedMps: number;
  readonly bowProbeOffset: number;
  readonly sternProbeOffset: number;
  readonly beamThickness: number;
}

export interface TelemetryReading {
  distanceMeters: number;
  speedCmPerSec: number;
  active: boolean;
}

export interface FenderContactConfig {
  readonly contactDistance: number;
  readonly safeSpeedMps: number;
  readonly crashSpeedMps: number;
  readonly speedSmoothing: number;
  readonly idleColor: string;
  readonly safeColor: string;
  readonly warnColor: string;
  readonly crashColor: string;
}

export interface FenderRuntimeState {
  color: Color | null;
  wasInContact: boolean;
  impactSpeed: number;
}