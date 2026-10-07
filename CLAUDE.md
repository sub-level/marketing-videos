# Marketing Videos: Agent Instructions

This repo makes marketing videos as code. Five skills in `.claude/skills/` carry the
method. Load the one that matches the work:

- **remotion-marketing-video**: building/editing any composition (structure, timing,
  motion grammar, dual aspect, themes, rendering). Start here for every video task.
- **motion-from-reference**: when the brief is "make it like THIS video", or when a
  sequence reads as slides instead of motion design. Measuring a reference frame by
  frame, the continuous-geometry rule, casting your story into a borrowed grammar.
- **device-3d-stage**: a real 3D device on screen with product recordings playing on its
  glass. The three.js stage, video-as-texture, and the lifecycle gotchas behind black
  frames.
- **ai-cinematic-broll**: generating AI footage (look bible, character refs, the
  stills-first approval gate, image-to-video, editing recipes, presenter ads).
- **video-audio-stack**: scoring (three-layer audio, volume curves, Epidemic Sound,
  music validation, and what to leave silent).

The end-to-end order of operations is `docs/process.md`. Failures we already paid for are
in `docs/gotchas.md`. Read it before debugging a layout or audio mystery. `CONTRIBUTING.md`
says what belongs in this repo and what does not.

## Invariants (non-negotiable)

1. `TOTAL_FRAMES` is computed from the `SCENE` table, never hardcoded.
2. Every `interpolate` over a time range clamps both sides.
3. Every composition ships 16:9 AND 9:16 from the same scene tree via
   `VerticalLayoutContext` (which lives in its own file, never in the wrapper). A light
   or mixed edition is `ThemeContext`, the same way. Editions are context, never re-edits.
4. Any `transform: scale(N)` element gets its own composition-sized `overflow: hidden`
   viewport.
5. **No AI video clip is generated before a human approves the still it animates.**
   Stills are cheap; clips are where the credits go.
6. No unlicensed assets in the repo: no proprietary fonts, no music without a
   redistribution-friendly license, no third-party trademarks in-shot.
7. No em-dashes anywhere: on-screen copy, docs, or code comments. They read as
   AI-generated. Use a period, a comma or a colon.
8. On-screen copy makes no claim that is not literally true, and no real person's
   likeness is generated without verifiable consent.
9. Anything a human reviews for polish, and every delivery, is rendered supersampled
   (`scripts/render-supersampled.sh`). 1x stair-steps every rotated edge and reads cheap.
10. Primitives in `src/lib/` never import a film's tokens. They take explicit colours and
    sizes, so a film can rebrand by editing its own `tokens.ts` and nothing else.
11. Each film's compositions read THEIR OWN `FPS` and `TOTAL_FRAMES` from their own
    `tokens.ts`. Borrowing another film's constant makes a retime silently fail.

## Verify like an engineer

- After meaningful changes: `npx remotion still <Comp> out/f.png --frame=<n>` and LOOK at
  it. Frames inside a scene are scene-relative, so validate at `SCENE_START + offset`.
  Add `--gl=angle` for any composition with a WebGL canvas, or the still is blank.
- When matching a reference, verify against the REFERENCE's frames, not against taste:
  extract both and compare them side by side at the same beat.
- `npm run typecheck` before calling anything done.
- Watch the full render at 1x with sound before shipping; frame-step anything that morphs.

## Commands

```bash
npm run dev                      # Remotion Studio
npm run render                   # 16:9 -> out/example.mp4
npm run render:vertical          # 9:16 -> out/example-vertical.mp4
npm run render:grammar           # the grammar film
npm run render:grammar:vertical  # its portrait edition
npm run render:best              # 4K archival master
npm run render:masters           # all 8 editions, supersampled + Lanczos (needs ffmpeg)
npm run still                    # one frame of the example film
npm run still:grammar            # one frame of the grammar film
npm run typecheck
```

## Working style

Build decisively: strong default first, assumptions stated inline, then offer specific
adjustment levers. Reserve questions for genuinely blocking, expensive-to-reverse forks
(e.g. "spend 200 credits re-shooting the world in a new style?").
