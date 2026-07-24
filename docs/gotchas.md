# Gotchas

Every entry here cost real time or real money on a shipped film. Each is stated as the
failure, then the fix.

## Composition

- **`useCurrentFrame()` inside a scene is scene-relative.** Validating a still at the raw
  composition frame shows you the wrong scene. Always render at
  `SCENE_START.<scene> + offset`.
- **Hardcoded totals drift.** `TOTAL_FRAMES` is computed from the `SCENE` table; with
  `TransitionSeries` it is `sum(scenes) - numTransitions * TRANSITION_DURATION`. A wrong
  total silently desyncs audio.
- **Unclamped `interpolate` bleeds.** Every time-range interpolation needs both
  `extrapolateLeft/Right: "clamp"` or values continue past the range into neighboring
  beats.
- **`transform: scale(N)` on an absolute element leaks layout.** The visual bounding box
  (N times the layout box) leaks into the iframe body, scrolls it, and shifts every
  absolute sibling left by an amount that varies per render (measured -69 to -904px). Wrap
  EACH scaled element in its own composition-sized `overflow: hidden` viewport -
  `AbsoluteFill`'s own clipping is NOT sufficient. Verify with debug dots at known x
  values, pixel-read from a rendered still.
- **Context in the wrapper file = white screen.** `VerticalLayoutContext` must live in its
  own file; importing it from the vertical wrapper creates a
  `scenes -> Wrapper -> Video -> scenes` cycle that leaves the context undefined at module
  evaluation.
- **Scale-and-crop portrait wrappers push corner elements off-canvas.** Render portrait
  natively at 1080x1920 with per-scene `vertical ?` branches instead.
- **`withAnimation`-style imperative animation can be snapped by unrelated re-renders**
  (the general lesson: drive animation declaratively from the frame, never from
  side-effectful state). In Remotion this is free - everything derives from
  `useCurrentFrame()` - so keep it that way; do not introduce `useState`/`useEffect`
  animation state.
- **Load fonts once at the Root**, never inside scene components.

## AI footage

- **Disconnected clips read as stock footage** no matter how pretty. One story, one cast,
  one place, one grade - locked before generating.
- **Clips before still approval is burned money.** Stills ~2 credits, clips 20-45. The
  human approves the still SET, then clips are generated - only from approved stills.
- **Image models paint real brand marks** (sportswear logos, team crests) on clothing
  unless prompted "plain, no logos or crests" - and AI lettering is gibberish anyway.
- **Generic-person prompts can produce celebrity likenesses.** Always add "generic, not
  resembling any real person".
- **A strong character reference pulls new scenes back to the reference's setting.** Keep
  no-people cutaways reference-free.
- **Moderation false-positives happen on innocent prompts.** Reword the physical action
  and retry before assuming the shot is impossible.
- **i2v frame 0 equals the seed still** - that is the identity guarantee. Pin duration/
  resolution/fps once per film so any regenerated clip is drop-in.
- **Don't re-shoot what you can edit.** "Keep EVERYTHING identical, ONLY change X" on the
  existing approved still, then re-run i2v with identical specs.

## Audio

- **Audible length is not file length.** Profile per-second RMS with ffmpeg before
  cutting to a track; a "46s" file can die at 29s and land your climax on silence.
- **Most tracks cannot be loop-extended.** No self-similar splice region means an audible
  lurch. Verify before promising a longer cut on the same track.
- **Clamp the music fade-out to a `MUSIC_LEN` constant**, not the composition length, so
  a growing cut can never hard-stop the track mid-note.
- **Mirror SFX locally.** A headless render that fetches audio from the network is a
  flaky render.

## Process

- **Reading time is sacred.** If a viewer cannot finish a line, add time - do not cut
  copy. Budget roughly reading time plus a beat per message.
- **Show, don't describe.** Approval happens on rendered stills and mp4s, not on prose
  descriptions of what a scene will do.
- **Frame-step the motion.** Morphs that "snap" instead of animating are invisible at 1x
  and obvious at frame-step.
- **On-screen copy: no em-dashes** (reads as AI-generated), and check claims against
  reality (a 3PM kickoff is not "tonight").
- **Trademarks: invent truthful stand-ins.** A domain you do not own never appears
  in-shot; find a name that is both fictional and true.
- **Scheduled YouTube videos are private until publish time** - embeds render "Video
  unavailable" and thumbnails 404. If a site embeds the film, probe oEmbed server-side
  and fall back to the previous film until the new one is watchable.
- **Licensed fonts and music never get committed to a public repo.** Outline the
  wordmark; link the font; keep the bed track out of git unless its license allows
  redistribution.
