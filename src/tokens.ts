// Design tokens for the example film. This is the pattern every video in this
// repo follows: palette, fonts, and ALL timing live here as data. Swap the
// palette + fonts for your brand; keep the structure.
//
// The palette is deliberately tight and cinematic so the piece reads as one
// continuous film rather than a slideshow: one surface family, one text
// family, one accent for punch words, semantic green/red.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const WIDTH_V = 1080;
export const HEIGHT_V = 1920;

export const COLORS = {
  // Surfaces (deep cinematic near-black with a hint of warmth)
  bg: "#0B0B0E",
  panel: "#141419",
  card: "#1A1A21",
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.06)",

  // Type
  text: "#F0EEE8",
  textDim: "rgba(240,238,232,0.62)",
  textMuted: "rgba(240,238,232,0.40)",

  // Accent — placeholder blue. Swap for your brand color.
  accent: "#5B8CFF",
  accentGlow: "rgba(91,140,255,0.55)",
  accentSoft: "rgba(91,140,255,0.16)",

  // Semantic
  green: "#34C759",
  greenSoft: "rgba(52,199,89,0.16)",
  red: "#FF453A",
} as const;

export const FONT = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
} as const;

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

// Scene durations in frames @ 30fps. Stitched with a plain <Series> (no
// transition overlap) so the total is an exact sum and every caption frame
// number stays trustworthy.
//   HOOK    0:00-0:04  "This film was not edited." / "It was compiled."
//   METHOD  0:04-0:15  the three moves: story first, stills then spend, code
//   NUMBERS 0:15-0:22  the stats
//   CLOSE   0:22-0:27  "Make yours." + repo URL
export const SCENE = {
  hook: 120,
  method: 330,
  numbers: 210,
  close: 150,
} as const;

// ALWAYS computed, never hardcoded. A wrong total silently desyncs audio.
export const TOTAL_FRAMES =
  SCENE.hook + SCENE.method + SCENE.numbers + SCENE.close;

// Absolute composition frame each scene starts at — for the persistent
// backdrop + chrome, which sit OUTSIDE the <Series> and read absolute frames.
// (Inside a scene, useCurrentFrame() is scene-relative.)
export const SCENE_START = {
  hook: 0,
  method: SCENE.hook,
  numbers: SCENE.hook + SCENE.method,
  close: SCENE.hook + SCENE.method + SCENE.numbers,
} as const;
