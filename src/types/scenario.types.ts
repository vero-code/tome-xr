export type ScenarioId = 1 | 2 | 3;

export interface VesselSpawnConfig {
  readonly x: number;
  readonly z: number;
  readonly headingDeg: number;
  readonly vx: number;
  readonly vz: number;
}

export interface TugboatSpawnConfig {
  readonly active: boolean;
  readonly x: number;
  readonly z: number;
}

export interface ScenarioDefinition {
  readonly id: ScenarioId;
  readonly windSpeed: number;
  readonly windDirectionDeg: number;
  readonly currentSpeed: number;
  readonly currentDirectionDeg: number;
  readonly vessel: VesselSpawnConfig;
  readonly tugBow: TugboatSpawnConfig;
  readonly tugStern: TugboatSpawnConfig;
}