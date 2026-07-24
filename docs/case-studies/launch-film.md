# Case study: the launch film ("We're Building the Annotated Internet.")

**Watch it: [youtu.be/tUO-Oa_W4Zc](https://youtu.be/tUO-Oa_W4Zc)** · ~80s · 16:9 master +
9:16 vertical + a partner edition, all from one scene tree.

The launch film for a consumer browser. Structure: a typographic timelapse through
internet-history eras → a hard cut into the product hero → a live in-app conversation
where the community AI answers a question with a scored digest. Built by Claude Code in
Remotion; it shipped on YouTube, the website hero, and the investor deck.

## What the film had to do

Establish a worldview ("the internet lost its people") before showing the product, then
prove the product with a REAL demo - and ship in three formats plus a partner variant
without re-editing.

## How it was made

### A timelapse told in typography

The opening travels 1991 → today using era fonts (CRT terminal → typewriter → serif web →
modern sans) over era-appropriate backdrops. Type is the cheapest cinematic material there
is: no footage credits, perfectly gradeable, and it sets tone faster than b-roll.

### The real product, running inside the render

The demo section does not use mockups. The product's actual UI components (from its
browser-extension codebase) run inside the Remotion composition behind a **runtime shim**:

- a fake `globalThis.chrome` (runtime, storage, tabs, identity) so extension components
  mount without a browser;
- canned responses registered per message type (auth, profile, presence, history);
- the app's state store reset and re-seeded **every frame** from a frame-tagged script, so
  renders are deterministic.

The payoff: the demo cannot drift from the shipped product, and a UI change in the app is
a re-render away from being in the film. This pattern is described in the
`remotion-marketing-video` skill ("Real UI beats mockups").

### Editions: a partner cut as a context provider

A partner edition (same choreography, crypto-flavored conversation, different digest
stats, different chart points, different source logos) is just a React context providing
an `EditionContent` object that scenes read. Bubble timing, springs, the digest morph -
all untouched. The variant cost hours, not days. The same mechanism handles locales.

### Dual aspect, natively

The 9:16 edition is the 16:9 composition wrapped in `VerticalLayoutContext.Provider
value={true}` and rendered natively at 1080x1920. Earlier scale-and-crop wrappers pushed
corner elements off-canvas; the fix was per-scene `vertical ?` branches for corner
anchors, hardcoded widths, and center constants, while centered flex rails and
`AbsoluteFill` backgrounds adapt for free. The context lives in its own file - importing
it from the wrapper creates a module cycle that renders the studio as a white screen.

### Sound: the three-layer stack

This film is where the audio grammar was established (see `video-audio-stack`):

1. One music bed end-to-end with a frame-keyed volume curve that fades in over the
   timelapse, DUCKS under the typed closer line so it sits in a quiet pocket, climbs into
   the color smash-cut, dips under the hero impact, and swells for the digest reveal.
2. whoosh/whip impacts on the physical moments (the hero splash, the phone rise).
3. Tactile clicks, keystrokes, ripples, and dings on individual UI events.

All SFX mirrored locally so headless renders never depend on the network.

### The hard bug worth remembering

A camera zoom implemented with `transform: scale(N)` on an absolute element leaked its
visual overflow into the iframe body layout and shifted every absolute sibling left by an
amount that VARIED PER RENDER (-69px to -904px) - it looked like a flaky centering bug for
days. Diagnosis: debug dots at known x positions, pixel-read from rendered stills. Fix:
every scaled element gets its OWN composition-sized `overflow: hidden` viewport
(`AbsoluteFill`'s clipping is not sufficient). Full write-up in `docs/gotchas.md`.

### Publishing detail that saved a deploy

The film was scheduled on YouTube, and a scheduled video is private until publish time -
its embed says "Video unavailable" and its thumbnail 404s. The website probed YouTube's
oEmbed endpoint server-side (200 = watchable, 403 = still private) and kept showing the
previous film until the new one went live. No deploy timing, no dead player.

## What to copy

Typography as footage, the runtime-shim demo, editions-as-context, native dual aspect,
the volume-curve-as-narrator, and pixel-probe debugging. The film is the reference
implementation for the composition grammar in `remotion-marketing-video`.
