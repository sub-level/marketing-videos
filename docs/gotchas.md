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
- **Load fonts once at the Root**, never inside scene components, and pass `weights` and
  `subsets` to `loadFont()`. The default loads every weight and every subset, which is
  60-130 network requests per family on every render and a hard failure offline.
- **Remotion upgrades are family upgrades.** Every `@remotion/*` package must sit on the
  exact same version as `remotion` itself, and a minor bump can force a peer with it
  (Zod moved 3.x to 4.x for the version checker). Bump them in one commit and run
  `npx remotion versions`; it refuses a mixed family, and a mixed family fails at render
  time with errors that point nowhere near the cause. After any upgrade, re-render a
  short frame range from each composition at half resolution and LOOK at a frame.
- **Never crop a logo with an overflow box.** To use part of a wordmark (the letters
  without the mark, say), export that path alone and fit the SVG's viewBox to its own ink
  with a one-unit margin. An `overflow: hidden` crop of the full asset shaves the first
  glyph AND keeps the dead width in the layout box, so the lockup also sits off centre.
  Verify by pixel-measuring the rendered still: the lockup's centre should land within a
  pixel of the frame's axis.
- **Fresh geometry per card reads as slides.** Fading a word in at final size inside its
  own new circle, then cutting to the next, is a slideshow with easing no matter how good
  the curves are. Keep ONE piece of geometry alive and transform it across the sequence:
  born oversized, collapsing, hardening, spawning, leaving. See `src/lib/GeometryWords.tsx`.
- **Type size is a measurement, not a feel.** Films read smaller on a phone than in the
  studio preview. Measure the reference's CAP HEIGHT as a ratio of frame height (a 62px
  cap on a 1080-high frame is an 84-88px font) and measure your own render the same way.
  Portrait gets its own sizes, never the landscape number scaled.
- **A particle field on a linear drift with a twinkle is a star field**, and it looks
  cheap. Dust is alive because each mote has its OWN path, depth and breathing period.
  Verify by compositing three frames a second apart into R/G/B: parallel trails mean you
  built stars.
- **Editions multiply the surfaces you forget to check.** A white mark on a light ground
  and a corner layout in portrait are both invisible until someone opens that one
  edition. Render a still per edition at every scene you touched.

## 3D device stages (WebGL)

- **A render or still without `--gl=angle` is blank**, and nothing in the output says so.
- **The camera must be set in a `useLayoutEffect`.** ThreeCanvas advances the scene from
  a passive effect, so a passive camera update lands a frame late.
- **`invalidate()` is not enough while rendering.** It only schedules; at concurrency > 1
  it hands you a stale frame. Call `advance(performance.now())` when rendering, from the
  video-frame callback and when the model loads.
- **Hold a `delayRender()` until the model loads**, and release it on failure too.
- **Unmemoized `onLoaded`/`onFailure` reload the GLB every frame.** They are effect deps.
- **A still screen draws black if you advance on load.** The model reports loaded before
  React commits the texture binding; video frames self-heal on the next frame, a still
  never does. Flip state on load and advance from the parent's effect.
- **`useVideoTexture` / `useOffthreadVideoTexture` are deprecated.** Draw decoded frames
  into an OffscreenCanvas and mark a `CanvasTexture` dirty instead.
- **A clip window that starts just before a hard cut inside the source recording** flashes
  the outgoing shot for a few frames and reads as a lag hiccup, not an edit. Trim to one
  frame after the cut, and re-measure when the source is re-cut.
- **1x renders stair-step every rotated edge, CSS clip and WebGL bezel.** Deliver at
  `--scale=2` downscaled with Lanczos. Icon PNGs with a hard one-bit alpha edge also need
  clipping with a CSS squircle rather than trusting the asset's own edge.

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
- **Never generate a real person's likeness without verifiable consent.** "They are on a
  retainer" is not verification and a profile screenshot is not a release. Build a
  fictional presenter styled after the look instead; in practice that is accepted.
- **Identity drifts even with the same reference.** A presenter take came back as a
  visibly different person from the same approved frame. Contact-sheet EVERY take before
  cutting, and spell the identity out feature by feature in the retake prompt.
- **Submit video jobs one at a time.** Two simultaneous submissions can race on the credit
  check and the second fails "out of credits" while the balance covered both.
- **Some endpoints only accept the `image` media role** for a reference frame and reject
  `avatar` / `reference` outright.

## Audio

- **Audible length is not file length.** Profile per-second RMS with ffmpeg before
  cutting to a track; a "46s" file can die at 29s and land your climax on silence.
- **Most tracks cannot be loop-extended.** No self-similar splice region means an audible
  lurch. Verify before promising a longer cut on the same track.
- **Clamp the music fade-out to a `MUSIC_LEN` constant**, not the composition length, so
  a growing cut can never hard-stop the track mid-note.
- **Mirror SFX locally.** A headless render that fetches audio from the network is a
  flaky render.
- **`Audio` is now `Html5Audio`, and `startFrom` / `endAt` are now `trimBefore` /
  `trimAfter`.** The old names still work and are marked deprecated in the types. A repo
  that warns about `useVideoTexture` should not be shipping them.
- **A sound on everything makes a film feel like a tutorial.** A click per typed letter, a
  tap sound on a visible tap, a ding on every reveal: all three got cut from a film and it
  improved. Silence is a layer.
- **A sample does not peak at its start.** Profile the attack in 100ms slices; a whoosh
  that peaks at 0.5s fired on a cut blooms 15 frames into the next shot. Trim the head so
  the peak lands ~6 frames after firing.
- **An audio revision does not need a re-render.** Render the composition to WAV and remux
  onto the approved master with `-c:v copy`. Seconds, and the video stream stays
  bit-identical.
- **A licensed track from a subscription library is licensed to YOU while you subscribe.**
  It does not transfer with the film to a client. Settle that before scoring, not after
  picture lock.

## Process

- **"Like this video" means measure it, not watch it.** Building your impression of a
  reference produces type that is too small and holds that are too long, every time.
  Extract the frames and read the numbers.
- **A cut that runs twice its reference's length has a hold problem, not a content
  problem.** Shorten the holds and give each clip only its strongest few seconds before
  you start cutting beats.
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
