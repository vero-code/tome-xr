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