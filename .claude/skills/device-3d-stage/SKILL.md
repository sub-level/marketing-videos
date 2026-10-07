---
name: device-3d-stage
description: Put a real 3D device (phone, laptop, watch) inside a Remotion composition and play actual product recordings on its screen, with the camera doing the storytelling. Use when a film needs a product demo on hardware instead of a CSS bezel or a flat screen recording. Covers the three.js stage, video-as-texture, the render flags and lifecycle gotchas that produce black frames, DOM-to-screen projection, and lifting UI off the glass.
---

# Device 3D Stage

A screen recording in a drawn bezel looks like a screen recording in a drawn bezel. A real
model, lit properly, with the real recording playing on its glass and a camera that moves,
reads as a product film. It is also the cheapest cinematic material you have left once the
AI footage budget is spent: it costs render time, not credits.

The whole technique is five moving parts and about eight gotchas, most of which present as
"my render is black" and none of which are obvious.

## The stack

```
@remotion/three   ThreeCanvas - a three.js canvas that renders deterministically per frame
three             the scene, the GLTF loader, the environment map
@react-three/fiber the React bindings (peer of @remotion/three)
@remotion/media   headless <Video onVideoFrame> - the decoded frames that feed the screen
```

```bash
# The @remotion/* version must EQUAL the `remotion` version already in
# package.json. Those packages pin `remotion` as an EXACT peer, so an
# unpinned install resolves the latest and npm nests a SECOND copy of
# remotion under them. Two copies means two useCurrentFrame contexts: the
# ThreeCanvas subtree reads the wrong one and the stage renders empty, with
# nothing in the output pointing at versions.
npm i @remotion/three@4.0.454 @remotion/media@4.0.454 @react-three/fiber three
npm i -D @types/three
```

A working, annotated, brand-neutral implementation is in
`references/DeviceStage.tsx`, with the projection helper in
`references/screen-projection.ts`. Bring your own GLB (`public/device/phone.glb`); a
model with a flat screen plane and a separate screen material is what you want.

## The screen is a CanvasTexture fed by a headless video

This is the part people get wrong. You do not point a texture at an mp4. You draw each
decoded video frame into an `OffscreenCanvas` and mark a `CanvasTexture` dirty:

```tsx
<Sequence layout="none" from={seg.from} durationInFrames={seg.len}>
  <Video src={seg.src} trimBefore={seg.trim} playbackRate={1.3}
         onVideoFrame={onVideoFrame} muted headless />
</Sequence>
```

```tsx
const onVideoFrame = useCallback((f: CanvasImageSource) => {
  ctx.drawImage(f, 0, 0, TEX_W, TEX_H);
  texture.needsUpdate = true;
  isRendering ? advance(performance.now()) : invalidate();
}, [ctx, texture, isRendering, advance, invalidate]);
```

`useVideoTexture` and `useOffthreadVideoTexture` are **deprecated** - do not reach for
them.

Two halves make the screen pixel-true, and one of them alone is not enough:

1. **Tag the texture `NoColorSpace`**, so the sampler hands back the recording's encoded
   sRGB bytes instead of decoding them.
2. **Give the screen mesh its own `ShaderMaterial` with `toneMapped: false`**, whose
   entire fragment shader is `gl_FragColor = texture2D(videoMap, vScreenUv);`.

Step 2 is the one people skip, and it is the expensive one. The renderer is on ACES
filmic tone mapping, which it has to be for the body and the glass to look like hardware,
and ACES grades the UI inside the recording unless the screen material opts out. Tagging
the texture sRGB and re-encoding in the shader instead looks correct for a still on a
desktop GPU and doubles the encode on iOS Safari, where a video texture is sampled raw:
the whole screen comes out washed out.

Bind the texture as a uniform (`material.uniforms.videoMap.value = screenTexture`) and set
`needsUpdate`, from an effect keyed on BOTH the loaded model and the texture.

## The eight gotchas, in the order they will bite you

1. **Renders and stills need `--gl=angle`.** Without it the WebGL canvas comes out blank
   and nothing in the error output says why. Pair it with `--concurrency=2`: ANGLE
   contexts are expensive, and the `advance` / `onVideoFrame` handshake in gotcha 3 is
   exactly what goes wrong at high worker counts.

2. **Set the camera in a `useLayoutEffect`, not a `useEffect`.** ThreeCanvas's manual
   frame renderer advances the scene from a passive effect, so a passive camera update
   lands one frame LATE - every push-in is off by a frame and the first frame is wrong.

3. **`advance(performance.now())` while rendering; `invalidate()` only in the studio.**
   `invalidate()` merely schedules a re-render, which at concurrency > 1 hands you stale
   frames from another worker's state. Call `advance` when the model finishes loading and
   inside every `onVideoFrame`.

4. **Hold a `delayRender()` until the GLB is loaded**, and release it on success AND on
   failure. A render that starts before the model arrives captures an empty scene.

5. **Memoize `onLoaded` / `onFailure`.** They are effect dependencies inside the model
   component; a fresh closure identity per render reloads the GLB on every frame, which
   looks like a mysteriously slow render.

6. **A still screen needs its first advance deferred.** The model reports "loaded" in the
   same tick it sets state, BEFORE React commits the effect that binds the screen texture
   - advancing right there draws an untextured screen. Video frames self-heal on the next
   frame; a still does not, so flip state on load and advance from the PARENT's effect
   (which React runs after the child's binding effect in the same commit).

7. **Never start a clip window right before a hard cut inside the source.** If the
   recording has its own cut at 5.00s and you trim to 4.8s, the outgoing shot flashes for
   five frames and reads as a lag hiccup, not an edit. Trim to one frame AFTER the cut.
   Re-measure every window when the source recordings are re-cut.

8. **Final renders must be supersampled.** At 1x the browser stair-steps rotated
   elements, CSS clips and the WebGL bezel, and the result reads as cheap. Render at
   `--scale=2` and downscale with Lanczos - see `scripts/render-supersampled.sh`.

## Framing: let the camera tell it

The camera is the narrator, so the film needs no captions over the device. Slow push-ins
onto the screen during the beat that matters, a slow pull back out, then the device
leaves frame. Resist labelling what the viewer can see.

Measure your model once and write the numbers into a comment block, because every camera
pose afterwards is arithmetic on them. From one real film's phone at group scale 0.91:

```
body    2.78 units wide (x +-1.39), 5.75 tall (y +-2.873)
screen  x +-1.296, y +-2.79, corner radius ~0.2
fov 35: z=11 shows the whole phone at ~85% of a 1080-high frame
        z=13 ~70%; z=6.5 fills the frame with the screen (cropped);
        z=3.6 at (-0.5, 1.85) frames the top corner
```

Portrait is its own framing, not a crop: multiply the push-in dolly by ~1.3 so the screen
edges stay in frame, and re-frame any corner shot so the subject sits on the 1080 axis.

## Projecting DOM onto the screen

Sometimes you want a crisp DOM layer ON the device (an app dock, a QR code, a caption
that belongs to the UI) rather than inside the recording. With the device flat to the
camera (no yaw) and the camera looking straight down -z, the projection is exact:

```ts
const S = (height / 2) / (camZ * Math.tan((fov / 2) * Math.PI / 180));
const px = (x: number) => width / 2 + (x - camX) * S;
const py = (y: number) => height / 2 - (y - camY) * S;
```

Place the layer with those pixel coordinates and blend it `lighten` so the model's cover
glass still reflects over it. `references/screen-projection.ts` has it as a helper with
the derivation. Any yaw at all and this breaks - use a real texture instead.

## Lifting UI off the glass

The advanced move: a card or a row from the RECORDING detaches, floats forward past the
bezel in 3D, and settles back into the video. It is the single most "how did they do
that" shot available, and it is pure compositing:
`references/ui-off-the-glass.md` has the method, the masking and the background
restoration, plus the warning that masks are calibrated to one specific recording.

## The same stage also makes your stills

Register a `<Still>` on the stage with a transparent clear colour and `segments: []`, and
pass a screenshot through the `still` prop. One render with
`--props='{"shot":"/stills/x.png"}' --image-format=png --scale=2 --gl=angle` gives you a
device-on-transparent PNG. Crop to the alpha bounding box and it drops into an App Store
slide, a press kit or a landing-page card.

Because it is the same camera, the same lights and the same scale as the film, the whole
marketing set reads as ONE device, which is the thing nobody can name but everybody
notices when it is wrong. It is also why the still path needs the deferred first advance
in gotcha 6: a still has no second frame to self-heal on.

## Keep the model in sync with the product

If the device model also lives in a website or app, copy it rather than reimplementing
it, and say so in a comment at the top of the file ("verbatim copy of X, only the asset
paths changed"). Two hand-maintained copies of a material drift, and the drift shows up
as the film's device looking subtly unlike the product's device.
