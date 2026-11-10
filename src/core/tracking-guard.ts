import type {
  FilteredVector2,
  TrackingGuardConfig,
} from '../types/interaction.types.js';

export class TrackingGuard {
  // Filters raw hand coordinates against sudden tracking loss spikes and NaN
  static filter(
    rawX: number,
    rawZ: number,
    prevX: number,
    prevZ: number,
    config: TrackingGuardConfig,
    out: FilteredVector2,
  ): void {
    if (!Number.isFinite(rawX) || !Number.isFinite(rawZ)) {
      out.x = prevX;
      out.z = prevZ;
      out.valid = false;
      return;
    }

    const dx = rawX - prevX;
    const dz = rawZ - prevZ;
    const stepDist = Math.hypot(dx, dz);

    // If hand jumped farther than max allowed frame step, freeze at previous position
    if (stepDist > config.maxDisplacementPerFrame) {
      out.x = prevX;
      out.z = prevZ;
      out.valid = false;
      return;
    }

    // Low-pass exponential smoothing against hand tremor
    const alpha = config.positionSmoothing;
    out.x = prevX + dx * alpha;
    out.z = prevZ + dz * alpha;
    out.valid = true;
  }
}