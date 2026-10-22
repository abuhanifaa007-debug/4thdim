/**
 * Spacetime & 4D Temporal Mathematics Library
 * Implements 4D-to-3D projection, Minkowski metric calculations,
 * 4D plane rotations (SO(4)), temporal slicing coordinates, and spacetime velocity estimation.
 */

export interface Vector4D {
  x: number;
  y: number;
  z: number;
  w: number; // Temporal dimension (time / ct)
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 4D Minkowski spacetime interval ds^2 = c^2 dt^2 - (dx^2 + dy^2 + dz^2)
 * In video coordinates: c = 1 (temporal scale factor), w = t
 */
export function calculateMinkowskiInterval(
  p1: Vector4D,
  p2: Vector4D,
  temporalSpeed: number = 1.0
): { intervalSquared: number; type: 'timelike' | 'spacelike' | 'lightlike' } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  const dt = p2.w - p1.w;

  const spatialDistSq = dx * dx + dy * dy + dz * dz;
  const temporalDistSq = (temporalSpeed * dt) * (temporalSpeed * dt);
  const intervalSq = temporalDistSq - spatialDistSq;

  let type: 'timelike' | 'spacelike' | 'lightlike' = 'lightlike';
  if (intervalSq > 0.0001) {
    type = 'timelike';
  } else if (intervalSq < -0.0001) {
    type = 'spacelike';
  }

  return {
    intervalSquared: intervalSq,
    type,
  };
}

/**
 * 4D Rotation in SO(4).
 * Rotates a 4D point around one of the 6 canonical orthogonal planes:
 * 'xy', 'xz', 'xw', 'yz', 'yw', 'zw'
 * where 'w' is the temporal coordinate.
 */
export function rotate4DPoint(
  p: Vector4D,
  plane: 'xy' | 'xz' | 'xw' | 'yz' | 'yw' | 'zw',
  angleRad: number
): Vector4D {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const res: Vector4D = { ...p };

  switch (plane) {
    case 'xy':
      res.x = p.x * cos - p.y * sin;
      res.y = p.x * sin + p.y * cos;
      break;
    case 'xz':
      res.x = p.x * cos - p.z * sin;
      res.z = p.x * sin + p.z * cos;
      break;
    case 'xw':
      // Temporal rotation mixing X and Time (Lorentz-like rotation)
      res.x = p.x * cos - p.w * sin;
      res.w = p.x * sin + p.w * cos;
      break;
    case 'yz':
      res.y = p.y * cos - p.z * sin;
      res.z = p.y * sin + p.z * cos;
      break;
    case 'yw':
      // Temporal rotation mixing Y and Time
      res.y = p.y * cos - p.w * sin;
      res.w = p.y * sin + p.w * cos;
      break;
    case 'zw':
      // Temporal rotation mixing Z and Time
      res.z = p.z * cos - p.w * sin;
      res.w = p.z * sin + p.w * cos;
      break;
  }

  return res;
}

/**
 * Projects a 4D point into 3D space.
 * Supports:
 * - 'orthographic': ignores w or sets w as depth offset
 * - 'perspective': 4D perspective projection with eye distance d
 * - 'temporal_extrude': maps (x, y) to (x, y) and w (time) to z
 */
export function project4DTo3D(
  p: Vector4D,
  mode: 'orthographic' | 'perspective' | 'temporal_extrude' = 'temporal_extrude',
  eyeDistance: number = 2.5
): Vector3D {
  if (mode === 'temporal_extrude') {
    return {
      x: p.x,
      y: p.y,
      z: p.w,
    };
  }

  if (mode === 'perspective') {
    // 4D perspective projection: factor = d / (d - w)
    const factor = eyeDistance / Math.max(0.1, eyeDistance - p.w);
    return {
      x: p.x * factor,
      y: p.y * factor,
      z: p.z * factor,
    };
  }

  // Orthographic
  return {
    x: p.x,
    y: p.y,
    z: p.z,
  };
}

/**
 * Calculate velocity in spacetime from two points in (x, y, time) space
 * Returns spatial distance, elapsed time, and apparent velocity
 */
export function calculateSpacetimeVelocity(
  p1: { x: number; y: number; timeSec: number },
  p2: { x: number; y: number; timeSec: number }
): {
  dx: number;
  dy: number;
  spatialDistance: number;
  dt: number;
  velocity: number; // units per second
  angleRad: number; // direction of motion
} {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const spatialDistance = Math.hypot(dx, dy);
  const dt = Math.abs(p2.timeSec - p1.timeSec);
  const velocity = dt > 1e-6 ? spatialDistance / dt : 0;
  const angleRad = Math.atan2(dy, dx);

  return {
    dx,
    dy,
    spatialDistance,
    dt,
    velocity,
    angleRad,
  };
}

/**
 * Maps a continuous normalized time t in [0, 1] to slice index and blend factor
 */
export function getFrameInterpolation(
  normalizedTime: number,
  totalFrames: number
): {
  indexA: number;
  indexB: number;
  fraction: number;
  clampedTime: number;
} {
  if (totalFrames <= 1) {
    return { indexA: 0, indexB: 0, fraction: 0, clampedTime: 0 };
  }

  const clamped = Math.max(0, Math.min(1, normalizedTime));
  const exactFrame = clamped * (totalFrames - 1);
  const indexA = Math.floor(exactFrame);
  const indexB = Math.min(totalFrames - 1, indexA + 1);
  const fraction = exactFrame - indexA;

  return {
    indexA,
    indexB,
    fraction,
    clampedTime: clamped,
  };
}

/**
 * Generates an array of evenly spaced slice offsets along the temporal Z axis
 */
export function generateTemporalSlicePositions(
  sliceCount: number,
  depthLength: number
): number[] {
  if (sliceCount <= 0) return [];
  if (sliceCount === 1) return [0];

  const positions: number[] = [];
  const start = -depthLength / 2;
  const step = depthLength / (sliceCount - 1);

  for (let i = 0; i < sliceCount; i++) {
    positions.push(start + i * step);
  }
  return positions;
}

/**
 * Calculates normalized time step per frame for 60fps or high-speed playback
 */
export function calculateFrameStepForFps(
  fps: number,
  durationSec: number
): number {
  if (durationSec <= 0 || fps <= 0) return 0.01;
  const totalExpectedFrames = fps * durationSec;
  return 1 / totalExpectedFrames;
}

/**
 * Scales normalized [0, 1] spacetime coordinates to full 4K UHD pixel grid (3840x2160)
 */
export function scaleTo4KGrid(
  normX: number,
  normY: number
): { pixelX: number; pixelY: number; resolutionLabel: string } {
  const clampedX = Math.max(0, Math.min(1, normX));
  const clampedY = Math.max(0, Math.min(1, normY));

  return {
    pixelX: Math.round(clampedX * 3840),
    pixelY: Math.round(clampedY * 2160),
    resolutionLabel: '3840 × 2160 (4K UHD)',
  };
}

