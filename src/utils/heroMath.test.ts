import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeScaleFactor,
  computeScaledPx,
  computeCrossfadeState,
  resolveViewportState,
} from './heroMath';

test('computeScaleFactor calculates min(vw/2048, vh/1152) with 0.55px floor', () => {
  // At 2048x1152 artboard reference, scale is 1.0
  assert.equal(computeScaleFactor(2048, 1152), 1);

  // At 1440x960 acceptance check, 1440/2048 = 0.703125, 960/1152 = 0.833333 -> min is 0.703125
  assert.equal(computeScaleFactor(1440, 960), 1440 / 2048);

  // Small viewport hits the 0.55 floor
  assert.equal(computeScaleFactor(800, 600), 0.55);

  // Card dimensions 222x160s at 2048x1152
  assert.equal(computeScaledPx(222, 2048, 1152), 222);
  assert.equal(computeScaledPx(160, 2048, 1152), 160);
});

test('computeCrossfadeState crossfades the last 1 second into the first', () => {
  // Before last second of a 4.0s clip
  assert.deepEqual(computeCrossfadeState(2.5, 4.0, 1.0), {
    shouldCrossfade: false,
    incomingOpacity: 0,
  });

  // Exactly at start of last second (3.0s)
  assert.deepEqual(computeCrossfadeState(3.0, 4.0, 1.0), {
    shouldCrossfade: true,
    incomingOpacity: 0,
  });

  // Midpoint of last second (3.5s)
  assert.deepEqual(computeCrossfadeState(3.5, 4.0, 1.0), {
    shouldCrossfade: true,
    incomingOpacity: 0.5,
  });

  // End of clip (4.0s)
  assert.deepEqual(computeCrossfadeState(4.0, 4.0, 1.0), {
    shouldCrossfade: true,
    incomingOpacity: 1,
  });
});

test('resolveViewportState maps desktop, landscape < 1200px, portrait, and < 820px burger menu', () => {
  // Acceptance check 1440x960
  assert.deepEqual(resolveViewportState(1440, 960), {
    mode: 'desktop',
    isCompactNav: false,
    isUltraWide: false,
  });

  // Ultra-wide 2560x1080 (> 2:1)
  assert.deepEqual(resolveViewportState(2560, 1080), {
    mode: 'desktop',
    isCompactNav: false,
    isUltraWide: true,
  });

  // Landscape below 1200px (e.g. 1024x768)
  assert.deepEqual(resolveViewportState(1024, 768), {
    mode: 'landscape-grid',
    isCompactNav: false,
    isUltraWide: false,
  });

  // Landscape below 820px (e.g. 780x500)
  assert.deepEqual(resolveViewportState(780, 500), {
    mode: 'landscape-grid',
    isCompactNav: true,
    isUltraWide: false,
  });

  // Portrait phone (390x844)
  assert.deepEqual(resolveViewportState(390, 844), {
    mode: 'portrait',
    isCompactNav: true,
    isUltraWide: false,
  });
});
