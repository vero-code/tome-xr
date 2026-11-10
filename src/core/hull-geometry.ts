import type { VesselPhysicsParams } from '../types/physics.types.js';

// Minimum vessel center Z that keeps the rotated hull off the pier face
export function pierLimitZ(
  headingRad: number,
  params: VesselPhysicsParams,
  pierFaceZ: number,
): number {
  const extent =
    params.hullHalfLength * Math.abs(Math.sin(headingRad)) +
    params.hullHalfBeam * Math.abs(Math.cos(headingRad));
  return pierFaceZ + extent;
}