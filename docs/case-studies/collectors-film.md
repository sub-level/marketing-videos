# Case study: the collectors launch film ("Rebuilt for collectors.")

**Watch it: [youtu.be/5LKApvTGNPg](https://youtu.be/5LKApvTGNPg)** · ~35s · six editions
(dark / light / mixed, each 16:9 and 9:16) from one scene tree.

The launch film for a collector-focused browser. It is the most motion-design-heavy film
made with this method and the one that produced two new skills:
[`motion-from-reference`](../../.claude/skills/motion-from-reference/SKILL.md) and
[`device-3d-stage`](../../.claude/skills/device-3d-stage/SKILL.md).

Almost no AI footage. The whole film is type, geometry, a 3D phone and the real app.

## What the film had to do

Match the grammar of a reference film supplied as the brief (a platform's "rebuilt from
the ground up" app launch), tell a five-beat product story in roughly its 26 seconds, and
show the actual shipped app rather than a mockup - mocked UI had been rejected repeatedly.

## How it was made

### The grammar came from measurement, not from memory

Every frame of the 26-second reference was extracted with ffmpeg, 773 of them, and the
four text moments were studied letter by letter. That produced numbers, not impressions:

- **Type size is a ratio.** Their cap height was 62px on a 1080-high frame, so the small
  lines are 84-88px and the value words ~96px. The first pass had been visibly smaller;
  the note was "the text to screen ratio seems larger on theirs", and the fix was
  arithmetic.
- **The type-on** is one letter per frame with a two-frame breath after each word and the
  odd one-frame hitch mid-word, no cursor, holding about five frames.
- **The type-off is not a fade.** Over 13 frames the visible ink's left edge runs right
  until ~70% of the line is gone through a soft eight-letter edge, the line drifts down
  about half a cap height on an ease-in, the standing part dims a touch, and then it
  SNAPS. Rebuilt from the measured frames after a first pass that just faded.
- **Holds are short.** Cut 2 ran 58 seconds against a 26-second reference and was called
  too long. Cut 3 shortened every hold, gave the five words 70/36/36/36/40 frames (the
  first one carries the collapse) and each product clip its strongest 2-4 seconds, and
  landed at 33. The final cut is 34.8s.

### The value words are one continuous piece of geometry

The first pass faded each word in at final size inside its own fresh circle. The verdict
was that it read as slides, not motion design - and it did. The rebuild keeps ONE circle
alive across all five words: it is born oversized and dashed around a giant outline word,
collapses with it over ~44 frames, hard-fills the word solid, runs dashed rails out to
both frame edges, closes its dashes into a solid line, grows, spawns two siblings into a
drifting Venn, and finally slides off the sides while the words crossfade mirrored.

This is now `src/lib/GeometryWords.tsx` in this repo, demonstrated by the `Grammar`
composition.

### The phone is the product's real 3D device, running the real app

Not a CSS bezel, not a PNG mockup: the same GLB the product's website hero uses, loaded
into the Remotion composition through `@remotion/three`, with the website's own camera,
environment map and lights copied over so the film's device and the site's device are one
device. The screen is a `CanvasTexture` fed by headless `<Video onVideoFrame>` tags
playing the actual product recordings.

The camera does the storytelling - the phone rises small, the camera pushes in through
five product beats, pulls back, and the phone drops away. No captions over the device.

Everything that went wrong on the way is now the gotcha list in the `device-3d-stage`
skill: `--gl=angle` or the canvas is blank; the camera belongs in a `useLayoutEffect`;
`advance()` while rendering and `invalidate()` only in the studio; `delayRender` until the
GLB loads; memoized load callbacks; a still screen needs its first advance to run from the
PARENT's effect rather than from the load callback. Each cost an afternoon.

One more, which looks like a product bug and is not: a clip window that started 0.2s
before a hard cut inside the source recording flashed the outgoing shot for five frames
and read as a lag hiccup. The window now starts one frame after the cut.

### Later, the UI started leaving the glass

A follow-up pass lifts surfaces out of the recording itself - a control, two chat rows, a
verification card, a slab, two list rows - forward past the bezel and back. The pixels
keep coming from the live video, so a lifted card keeps updating while it floats. One
decoder feeds the screen and every layer; masks remove only perimeter-connected
background so black text survives; the slab's burgundy glow is rebuilt underneath with a
feathered cubic Hermite patch so no plate edge remains. Method in
`device-3d-stage/references/ui-off-the-glass.md`.

### Six editions from three scenes

A light edition was asked for mid-build, then a mixed one that alternates grounds the way
an App Store screenshot set does. Neither was a re-edit: both are the same scene tree
under a theme context, with a per-scene table deciding which scenes run light. Crossed
with the portrait layouts, six deliverables ship from one `SCENE` table and one render
script.

Portrait is its own layout, not a crop: its type sizes, its framing of the device corner,
its own camera distances.

### Sound: mostly silence

The direction was that the typed lines, the device tap and the cuts inside the screen are
all SILENT. What survives is a music bed from its own drop, a handful of
whooshes under the geometry, one real recorded pack tear at 22.5s with the music ducked
to half under it, and nothing on the final title card. The clicks and dings in the first
pass made it feel like a tutorial.

Music and most one-shots came from Epidemic Sound. Audio revisions after picture lock
were rendered to WAV and remuxed onto the approved master with a video stream copy -
seconds, not another hour of render.

### Finals are supersampled

At 1x the rotated stickers, CSS clips and the WebGL bezel came out stair-stepped: "rough
around the edges, cheap". Every edition now renders at `--scale=2` and downscales with
Lanczos. The dock's icon PNGs also carry a hard one-bit alpha edge, so they are clipped
with a CSS squircle rather than trusting the asset's own edge.

## What to copy

Measuring a reference instead of impersonating it. One continuous piece of geometry
across a word sequence. A real device with real recordings, with the camera as narrator.
Themes and aspect ratios as context, not as edits. Silence as a deliberate layer.
Supersampled deliveries.

## What not to copy

Building the impression of a reference from memory; fresh geometry per card; starting a
clip window near a cut inside the source; shipping a 1x render as a final.
