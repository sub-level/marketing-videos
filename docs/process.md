# The process: brief to published film

This is the end-to-end playbook we follow to make marketing videos with a coding agent.
The three skills in `.claude/skills/` are the deep dives; this is the order of operations
and the decision points between them.

## 0. The stack

- **Remotion** - the film is a React app. Every frame is a pure function of the frame
  number, which makes timing data, edits diffs, and variants props.
- **Claude Code** - the agent that writes scenes, times cues, generates footage through
  MCP tools, and runs the render + verification loop.
- **Higgsfield MCP** (or any image + image-to-video provider) - character-consistent
  stills and identity-preserving motion.
- **remotion-bits** - a searchable library of working animation examples, with its own
  agent skill. Check it before hand-rolling a common effect.
- **ffmpeg** - the truth-teller: audio profiling, frame extraction, clip surgery.

## 1. Brief → story

Do not open the editor. Write:

- **The one message.** A film carries ONE promise ("a browser that shops for you", "an AI
  replaced my cloud bill"). Every scene either advances it or gets cut - widening the
  promise right before the title card is how films go mushy.
- **The story.** A specific protagonist, a specific place, a specific day with a
  destination. Even a 40-second product film wants narrative shape: hook, escalation,
  payoff, close.
- **The script as data.** The voiceover (or silent narration) becomes frame-timed cues in
  `script.ts` - `{ from, to, text, emphasize }` per line. This file is the single source
  of truth for captions, scene timing, and sound cues. House style: no em-dashes in
  on-screen copy; lines short enough to fit three caption rows in portrait.

Truthfulness rule: details in-shot must be true or invented. A real date, a real venue, a
real match number are great; a third party's trademark or domain is not - invent a
truthful stand-in instead.

## 2. Look bible + design tokens

Two lock-ins before any pixel:

- **Look bible** (for AI footage): medium, grade, lens, light, wardrobe, recurring props.
  Written once, pasted into every prompt. See the `ai-cinematic-broll` skill.
- **Design tokens** (for the code world): palette, fonts, radii, scene durations - all in
  `tokens.ts`. The palette is tight and cinematic: one background family, one text family,
  one brand accent for punch words, semantic green/red. If the film shows product UI, the
  tokens mirror the product's real design system so the demo cannot drift off-brand.

## 3. Split the film: what is code, what is footage

Walk the story beats and assign each to a medium:

- **Code** (Remotion): anything UI, typographic, numeric, or diagrammatic. Chat
  conversations, dashboards, counters, kinetic captions, charts. Code is free, infinitely
  revisable, and pixel-exact.
- **AI footage**: the filmed world - people, places, atmosphere. Expensive and
  probabilistic, so it gets the stills-first pipeline below.
- **Hybrid**: footage as a blurred/graded backdrop with frosted UI on top; stills with
  code-side drift standing in for clips; real app components running inside the render
  behind a runtime shim.

Real product recordings and screenshots beat both when they exist - use them, and use AI
footage for the world around them.

## 4. Generate footage (the stills-first approval gate)

The single most important cost-and-quality control in the whole process:

1. Lock a **character reference still** and iterate until the human loves it.
2. Generate every beat as a **still** (cheap, ~2 credits) with the reference + look bible.
3. **STOP. Present the stills to the human and get explicit approval.** Re-roll rejects
   as stills. No clip is generated from an unapproved still - clips are 10-20x the cost,
   and a rejected clip is money burned.
4. Animate approved stills with image-to-video (`start_image` = the still, pinned specs,
   motion-only prompts).
5. Commit the results to `public/` so renders never depend on the provider.

The gate catches continuity errors, brand-mark leaks, and identity drift while they cost
2 credits, not 45. See `ai-cinematic-broll` for the recipes (edit-not-regenerate, the
reverse trick, stills-as-footage).

## 5. Build the composition

Per the `remotion-marketing-video` skill:

- One folder per video; `SCENE` durations in `tokens.ts`; `TOTAL_FRAMES` computed, never
  hardcoded; plain `<Series>` when captions are frame-timed.
- Persistent `Backdrop` (emotional color arc) + `GlobalChrome` (progress bar, brand mark)
  bracket the scenes so the piece feels like one film.
- Kinetic captions render the script; springs for entrances; every `interpolate` clamped
  both sides.
- Write scenes aspect-aware from day one: the 9:16 edition is the same tree under
  `VerticalLayoutContext`, not a re-edit.

## 6. Score it

Per the `video-audio-stack` skill: one music bed with a frame-keyed volume curve that
ducks under key moments; whoosh/whip impacts on physical transitions; tactile UI sounds on
individual events. **Profile the track with ffmpeg before cutting to it** - audible length
is not file length, and the climax landing on dead air is the classic failure.

## 7. Review loops

- **Agent self-review**: stills at exact frames after every change; pixel-probe alignment;
  frame-step anything that morphs; preview the longest copy variant.
- **Human review**: at the still set (gate), at the first assembled cut, and at picture
  lock. Show, don't describe - render the actual mp4.
- **A fresh viewer** catches what both miss: if they cannot finish reading a line, add
  time (do not cut copy); if a montage feels like stock footage, the story or the grade is
  broken - fix the system, not the shot.
- Feedback is applied decisively: build the strong default, then offer levers ("swap the
  track", "retime beat 3", "flip this media slot") instead of asking configuration
  questions up front.

## 8. Render + publish

- 16:9 master for YouTube / website / deck; 9:16 native edition for TikTok, Reels,
  Stories; optional square. All from the same scene code.
- High-quality master: `--scale=2 --crf=14 --image-format=png --color-space=bt709
  --x264-preset=veryslow --pixel-format=yuv420p`.
- Thumbnails and posters: crop frames from your own film with ffmpeg.
- Confirm the music license covers publication before upload.

## 9. Variants are cheap - exploit it

Because the film is code, a partner edition, a locale, or a campaign-specific cut is a
context provider with different content data - not a re-edit. Budget one day for the first
film and an hour for each variant after.
