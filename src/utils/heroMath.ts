/**
 * Pure scale, crossfade, and responsive viewport calculations for the Halora hero stage.
 */

export const ARTBOARD_WIDTH = 2048;
export const ARTBOARD_HEIGHT = 1152;
export const DESKTOP_SCALE_FLOOR = 0.55;

export function computeScaleFactor(vw: number, vh: number, applyDesktopFloor = true): number {
  if (vw <= 0 || vh <= 0) return DESKTOP_SCALE_FLOOR;
  const raw = Math.min(vw / ARTBOARD_WIDTH, vh / ARTBOARD_HEIGHT);
  return applyDesktopFloor ? Math.max(DESKTOP_SCALE_FLOOR, raw) : raw;
}

export function computeScaledPx(refUnits: number, vw: number, vh: number): number {
  return refUnits * computeScaleFactor(vw, vh, true);
}

export interface CrossfadeState {
  shouldCrossfade: boolean;
  incomingOpacity: number;
}

export function computeCrossfadeState(
  currentTime: number,
  duration: number,
  fadeWindowSec = 1.0
): CrossfadeState {
  if (!Number.isFinite(duration) || duration <= fadeWindowSec || currentTime < 0) {
    return { shouldCrossfade: false, incomingOpacity: 0 };
  }
  const fadeStart = duration - fadeWindowSec;
  if (currentTime < fadeStart) {
    return { shouldCrossfade: false, incomingOpacity: 0 };
  }
  const progress = Math.min(1, Math.max(0, (currentTime - fadeStart) / fadeWindowSec));
  return {
    shouldCrossfade: true,
    incomingOpacity: Number(progress.toFixed(4)),
  };
}

export type ViewportMode = 'desktop' | 'landscape-grid' | 'portrait';

export interface ViewportState {
  mode: ViewportMode;
  isCompactNav: boolean;
  isUltraWide: boolean;
}

export function resolveViewportState(vw: number, vh: number): ViewportState {
  const isPortrait = vh > vw;
  const isCompactNav = vw <= 820;
  const isUltraWide = !isPortrait && vw / vh > 2;

  let mode: ViewportMode = 'desktop';
  if (isPortrait) {
    mode = 'portrait';
  } else if (vw < 1200) {
    mode = 'landscape-grid';
  }

  return {
    mode,
    isCompactNav,
    isUltraWide,
  };
}
