// The narration as data — frame-timed cues, SCENE-RELATIVE (each scene's
// local frame 0). This file is the single source of truth the scenes,
// captions, and sound cues all read. House style: no em-dashes; every line
// fits three caption rows in portrait.

import type { Cue } from "../lib/KineticCaption";

// HOOK renders its lines as centered hero type (see HookScene), not the
// caption bar, so it exports plain strings.
export const HOOK = {
  line1: "This film was not edited.",
  line2: "It was compiled.",
} as const;

// METHOD — narration under the three move cards.
export const METHOD_CUES: Cue[] = [
  {
    from: 10,
    to: 100,
    text: "Write the story first, as data the scenes can read.",
    emphasize: ["story first"],
  },
  {
    from: 106,
    to: 208,
    text: "Generate stills, get them approved, then spend on motion.",
    emphasize: ["approved", "then spend"],
  },
  {
    from: 214,
    to: 320,
    text: "Assemble everything in code, where timing is just numbers.",
    emphasize: ["in code"],
  },
];

// The three moves, kept beside their cues so cards and captions stay in
// lockstep.
export type Move = { index: string; title: string; sub: string };
export const MOVES: Move[] = [
  { index: "01", title: "Story first", sub: "script.ts before pixels" },
  { index: "02", title: "Stills, then spend", sub: "approve before animating" },
  { index: "03", title: "Assembled in code", sub: "every frame reproducible" },
];

// NUMBERS — the stats. Single source of truth so the counters and the
// caption never disagree.
export const STATS = [
  { value: 810, suffix: "", label: "frames, all from code" },
  { value: 2, suffix: "", label: "aspect ratios, one scene tree" },
  { value: 0, suffix: "", label: "timeline edits" },
] as const;

export const NUMBERS_CUES: Cue[] = [
  {
    from: 96,
    to: 200,
    text: "Same scenes render landscape and portrait, natively.",
    emphasize: ["natively"],
  },
];

export const CLOSE = {
  headline: "Make yours.",
  url: "github.com/sub-level/marketing-videos",
} as const;
