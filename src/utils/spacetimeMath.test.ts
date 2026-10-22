import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMinkowskiInterval,
  rotate4DPoint,
  project4DTo3D,
  calculateSpacetimeVelocity,
  getFrameInterpolation,
  generateTemporalSlicePositions,
  calculateFrameStepForFps,
  scaleTo4KGrid,
  Vector4D,
} from './spacetimeMath.js';

test('calculateMinkowskiInterval correctly classifies timelike, spacelike, and lightlike intervals', () => {
  // Purely timelike: dt = 5, dx = 1 (c=1 -> dt^2 - dx^2 = 25 - 1 = 24 > 0)
  const p1: Vector4D = { x: 0, y: 0, z: 0, w: 0 };
  const p2Timelike: Vector4D = { x: 1, y: 0, z: 0, w: 5 };
  const resTime = calculateMinkowskiInterval(p1, p2Timelike, 1.0);
  assert.equal(resTime.type, 'timelike');
  assert.equal(Math.round(resTime.intervalSquared), 24);

  // Purely spacelike: dt = 1, dx = 5 (c=1 -> 1 - 25 = -24 < 0)
  const p2Spacelike: Vector4D = { x: 5, y: 0, z: 0, w: 1 };
  const resSpace = calculateMinkowskiInterval(p1, p2Spacelike, 1.0);
  assert.equal(resSpace.type, 'spacelike');
  assert.equal(Math.round(resSpace.intervalSquared), -24);

  // Lightlike (null): dt = 3, dx = 3 (c=1 -> 9 - 9 = 0)
  const p2Lightlike: Vector4D = { x: 3, y: 0, z: 0, w: 3 };
  const resLight = calculateMinkowskiInterval(p1, p2Lightlike, 1.0);
  assert.equal(resLight.type, 'lightlike');
  assert.equal(Math.abs(resLight.intervalSquared) < 0.0001, true);
});

test('rotate4DPoint in temporal plane XW mixes space and time coordinates', () => {
  const p: Vector4D = { x: 1, y: 2, z: 3, w: 0 };
  const angle = Math.PI / 2; // 90 degree rotation in XW
  const rotated = rotate4DPoint(p, 'xw', angle);

  // At 90 deg: cos=0, sin=1. x' = x*cos - w*sin = 0, w' = x*sin + w*cos = 1
  assert.equal(Math.abs(rotated.x) < 1e-6, true);
  assert.equal(Math.abs(rotated.w - 1) < 1e-6, true);
  assert.equal(rotated.y, 2);
  assert.equal(rotated.z, 3);
});

test('project4DTo3D temporal extrude maps temporal w to z', () => {
  const p: Vector4D = { x: 1.5, y: -2.5, z: 0, w: 4.2 };
  const p3 = project4DTo3D(p, 'temporal_extrude');
  assert.equal(p3.x, 1.5);
  assert.equal(p3.y, -2.5);
  assert.equal(p3.z, 4.2);
});

test('calculateSpacetimeVelocity accurately computes velocity and trajectory distance', () => {
  const p1 = { x: 10, y: 20, timeSec: 1.0 };
  const p2 = { x: 13, y: 24, timeSec: 2.0 }; // dx = 3, dy = 4 -> dist = 5, dt = 1.0 -> v = 5.0
  const vel = calculateSpacetimeVelocity(p1, p2);

  assert.equal(vel.dx, 3);
  assert.equal(vel.dy, 4);
  assert.equal(vel.spatialDistance, 5);
  assert.equal(vel.dt, 1);
  assert.equal(vel.velocity, 5);
});

test('getFrameInterpolation handles boundary conditions and fractional scrubbing', () => {
  const total = 100;
  // Normalized 0.0 -> index 0
  assert.deepEqual(getFrameInterpolation(0, total), {
    indexA: 0,
    indexB: 1,
    fraction: 0,
    clampedTime: 0,
  });

  // Normalized 1.0 -> last frame 99
  assert.deepEqual(getFrameInterpolation(1.0, total), {
    indexA: 99,
    indexB: 99,
    fraction: 0,
    clampedTime: 1.0,
  });

  // Normalized 0.5 with 11 frames -> exactFrame = 5.0
  const mid = getFrameInterpolation(0.5, 11);
  assert.equal(mid.indexA, 5);
  assert.equal(mid.indexB, 6);
  assert.equal(mid.fraction, 0);
});

test('generateTemporalSlicePositions creates symmetric depth distribution', () => {
  const count = 5;
  const depth = 4.0;
  const positions = generateTemporalSlicePositions(count, depth);
  assert.equal(positions.length, 5);
  assert.equal(positions[0], -2.0);
  assert.equal(positions[2], 0.0);
  assert.equal(positions[4], 2.0);
});

test('calculateFrameStepForFps correctly computes single frame interval at 60fps', () => {
  // 60 fps over 2 seconds = 120 total frames -> step = 1 / 120
  const step60 = calculateFrameStepForFps(60, 2.0);
  assert.equal(Math.round(step60 * 120), 1);

  // 60 fps over 1 second = 60 frames -> step = 1 / 60
  const step1s = calculateFrameStepForFps(60, 1.0);
  assert.equal(Math.round(step1s * 60), 1);
});

test('scaleTo4KGrid converts normalized coordinates to 3840x2160 UHD pixels', () => {
  const center = scaleTo4KGrid(0.5, 0.5);
  assert.equal(center.pixelX, 1920);
  assert.equal(center.pixelY, 1080);

  const corner = scaleTo4KGrid(1.0, 1.0);
  assert.equal(corner.pixelX, 3840);
  assert.equal(corner.pixelY, 2160);
});

