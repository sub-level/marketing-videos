# Lifting UI off the glass

The shot: a card, a row or a control from the RECORDING detaches from the screen, floats
forward past the bezel in 3D, and settles back into the video exactly where it left. It is
the most "how did they do that" move available to a product film, and it needs no new
assets - everything is already in the recording.

It is also fiddly and brittle. Read the whole page before starting, and budget a day.

## The idea

Every frame, you have one decoded video frame. You:

1. **cut** the surface out of that frame with a mask,
2. **erase** it from the base image and restore plausible background underneath,
3. **draw** the cut-out as its own textured plane in the 3D scene, transformed forward
   and sideways by a per-frame envelope,
4. **return** it to its source coordinates before the recording's next cut.

Because the extracted pixels keep coming from the live video, the lifted card keeps
UPDATING while it floats. That is the detail that makes it read as real UI rather than a
screenshot on a plane.

## Share one decoder

Decode once per frame and share that frame between the screen texture and every active
layer. One `<Video onVideoFrame>` feeding N layers; never one decoder per card. The
per-frame work is then a handful of `getImageData` reads, not N video decodes.

## Masks

Two kinds, and they fail differently:

- **Fixed rectangles** for surfaces whose bounds you measured on the committed take
  (a verification card, a settings row). Cheap and exact, and silently wrong the moment
  the recording is re-cut.
- **Perimeter-connected background removal** for surfaces with soft or coloured edges
  (chat bubbles). Flood from the rectangle's perimeter inward, removing only pixels
  connected to the border, so interior darks - black text, a logo's interior - survive.
  A naive "remove everything near the background colour" eats the text.

Write the bounds and the take they were measured on into a comment. A mask calibrated to
one recording is calibrated to ONE recording.

## Restoring what was underneath

Erasing a card leaves a hole. What you fill it with decides whether the shot works.

- **Flat or near-flat background:** sample a clean strip from the same frame, outside the
  card, and tile it.
- **A gradient or a glow:** continue each scanline's colour AND its slope under the hole
  with a cubic Hermite patch, sampling broad exterior windows on both sides so
  compression noise and particles do not drive the fit. Feather the patch outside the
  original silhouette so no rectangular plate edge and no baked-in drop shadow remains
  once the card has moved away.
- **Anything with structure under the card** (text, another card): you cannot inpaint it
  honestly. Pick a different surface to lift.

The giveaway of a bad restoration is a faint rectangle that stays behind after the card
leaves. Render the peak frame of every lift and look for it.

## Motion envelopes

Keep each beat's timing, masks, source rectangles and camera envelope in ONE data file
(`featureMotion.ts`), not scattered through components:

```ts
{ id: "verification",
  rect: [138, 940, 547, 407],   // source pixels in the recording
  radius: 42,                   // the surface's corner radius
  timing: [184, 201, 219, 238], // start, arrived, starts leaving, back home
  move: [-0.67, 0.24, 1.8],     // dx, dy, dz in world units at the peak
  portraitX: -0.6,              // portrait's own lateral distance
  yaw: 0.07, roll: 0.016 }
```

The timing is FOUR points, not two: ease-out into the hold (a `bezier(0.22, 1, 0.36, 1)`
works), then ease-in-out back. A two-point ramp has no hold and the lift never reads. The
camera's envelope is its own four-point window with its own amount, offset wider on both
sides.

Rules that came out of doing it:

- The camera's pullback curve is LONGER than the individual lift. The card moves, then
  the camera reacts - simultaneous identical curves read as a zoom, not a lift.
- Portrait needs its own lateral distances: the same `dx` that crosses the bezel at 16:9
  pushes the card out of a 1080-wide frame.
- Stagger grouped elements (two message rows, two list rows) by ~4 frames. Simultaneous
  is robotic.
- Return to the source coordinates BEFORE the recording's own cut, every time. A card
  still floating when the underlying video cuts is an instant tell.

## Shadows and contact

Draw the floating plane with the model's real screen UV geometry, and give it a soft
contact shadow on an ENLARGED shadow plane with transparent sampling outside the texture
- otherwise the shadow ends in a hard rectangle at the crop boundary, which announces the
whole trick.

## Verify

- A still at the PEAK of every lift, in both aspect ratios.
- A still at the return frame: the surface must be back at source coordinates, with no
  residual plate edge.
- A continuous render across all lifts: scrubbing must not require a previous frame to
  establish crop bounds (read decoder-updated bounds just before WebGL renders).
