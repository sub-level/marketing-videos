// The grammar film: a 14.8 second demonstration of the reference-derived
// motion grammar taught in the `motion-from-reference` skill. It is the second
// film in this repo on purpose: one folder per video, with its own tokens and
// its own timeline, is the pattern.
//
//   OPENER  0:00-0:02.5  a line that types on over a living dust field and
//                        sweeps off on measured mechanics
//   WORDS   0:02.5-0:09.8  five value words carried by ONE piece of geometry
//   CLOSE   0:09.8-0:14.8  a fast-typed identity line, then a two-word close
//
// Everything below is data. Retiming the film is editing these numbers.

import { geometryWordsLength } from "../lib/GeometryWords";

// Read by src/Root.tsx for every Grammar composition, so changing it here
// actually retimes the film instead of silently disagreeing with the
// registration.
export const FPS = 30;

export const FONT = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

/** Dark edition: near-black with dust, white ink. */
export const DARK = {
  bg: "#000000",
  ink: "#FFFFFF",
  line: "rgba(255,255,255,0.32)",
  lineFaint: "rgba(255,255,255,0.14)",
} as const;

/** Light edition: plain white, black ink. Same geometry, same timing. */
export const LIGHT = {
  bg: "#FFFFFF",
  ink: "#0A0A0A",
  line: "rgba(10,10,10,0.38)",
  lineFaint: "rgba(10,10,10,0.16)",
} as const;

/**
 * The palette for the edition a scene is rendering under. Every scene reads
 * its colours through this, so swapping the two tables above actually
 * rebrands the film. Primitives in `lib/` take explicit colours for the same
 * reason: they must not know about any one film's tokens.
 */
export const palette = (light: boolean) => (light ? LIGHT : DARK);

// Frames per word, as measured off a reference film: word 1 is long because
// it carries the collapse of the giant outline and its circle; the others are
// short holds; the last holds a few frames longer while it hands off.
export const WORD_FRAMES = [70, 36, 36, 36, 40] as const;
export const WORDS_LEN = geometryWordsLength(WORD_FRAMES);

export const T = {
  opener: { from: 0, len: 75 },
  words: { from: 75, len: WORDS_LEN },
  close: { from: 75 + WORDS_LEN, len: 150 },
} as const;

/** ALWAYS computed from the table above, never hardcoded. */
export const TOTAL_FRAMES = T.close.from + T.close.len;

// Copy. The film is about itself, so the words are the method.
export const OPENER_LINE = "Written by an agent.";
export const WORDS = [
  "Measure the reference.",
  "Timing is data.",
  "Geometry never restarts.",
  "Verify every frame.",
  "Six editions, one tree.",
] as const;
export const IDENTITY_LINE = "Motion design, as code.";
export const CLOSE_LINE = "Make yours.";
