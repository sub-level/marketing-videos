# Marketing Videos — Agent Instructions

This repo makes marketing videos as code. Three skills in `.claude/skills/` carry the
method — load the one that matches the work:

- **remotion-marketing-video** — building/editing any composition (structure, timing,
  motion grammar, dual aspect, rendering). Start here for every video task.
- **ai-cinematic-broll** — generating AI footage (look bible, character refs, the
  stills-first approval gate, image-to-video, editing recipes).
- **video-audio-stack** — scoring (three-layer audio, volume curves, music validation).

The end-to-end order of operations is `docs/process.md`. Failures we already paid for are
in `docs/gotchas.md` — read it before debugging a layout or audio mystery.

## Invariants (non-negotiable)

1. `TOTAL_FRAMES` is computed from the `SCENE` table, never hardcoded.
2. Every `interpolate` over a time range clamps both sides.
3. Every composition ships 16:9 AND 9:16 from the same scene tree via
   `VerticalLayoutContext` (which lives in its own file — never in the wrapper).
4. Any `transform: scale(N)` element gets its own composition-sized `overflow: hidden`
   viewport.
5. **No AI video clip is generated before a human approves the still it animates.**
   Stills are cheap; clips are where the credits go.
6. No unlicensed assets in the repo: no proprietary fonts, no music without a
   redistribution-friendly license, no third-party trademarks in-shot.
7. On-screen copy has no em-dashes and no claims that are not literally true.

## Verify like an engineer

- After meaningful changes: `npx remotion still <Comp> out/f.png --frame=<n>` and LOOK at
  it. Frames inside a scene are scene-relative — validate at `SCENE_START + offset`.
- `npm run typecheck` before calling anything done.
- Watch the full render at 1x with sound before shipping; frame-step anything that morphs.

## Commands

```bash
npm run dev              # Remotion Studio
npm run render           # 16:9  -> out/example.mp4
npm run render:vertical  # 9:16  -> out/example-vertical.mp4
npm run render:best      # 4K archival master
npm run typecheck
```

## Working style

Build decisively: strong default first, assumptions stated inline, then offer specific
adjustment levers. Reserve questions for genuinely blocking, expensive-to-reverse forks
(e.g. "spend 200 credits re-shooting the world in a new style?").
