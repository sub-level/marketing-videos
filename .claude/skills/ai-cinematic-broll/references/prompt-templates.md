# Prompt templates

Skeletons for the stills-first pipeline. Replace `{...}` slots; keep the look-bible block
byte-identical across every prompt in one film.

## Look-bible block (append to every visual prompt in the film)

```
{medium: e.g. "stop-motion claymation film still, visible fingerprints in the clay" |
 "35mm anamorphic film still, shallow depth of field"}
{grade: e.g. "warm golden-hour grade, amber highlights, teal shadows, soft bloom, fine grain"}
{light: e.g. "low late-afternoon sun, long soft shadows"}
plain clothing, no logos or crests, no brand marks, no text
generic people, not resembling any real person
```

## 1. Character reference still

```
{shot: e.g. "rooftop two-shot, waist up"} of {cast: e.g. "a woman in a plain white
football kit with navy shorts, and a man in a sky-blue and white striped kit"},
{mood/action}, looking away from camera / three-quarter view,
16:9, highly detailed
+ look-bible block
```

Iterate until approved. This image rides along as an image reference for every people shot.

## 2. Beat still (with character reference attached)

```
[image ref: the approved character reference]
Same two characters, same wardrobe, same grade.
{beat: e.g. "in a small sunlit kitchen, having their morning coffee, lifting the little
mugs"}, {framing: e.g. "medium shot, camera at counter height"}
16:9, highly detailed
+ look-bible block
```

Gotcha: the reference pulls the model back toward the reference's SETTING. For cutaways
with no people (skyline, food, product), drop the reference entirely.

## 3. Image-to-video (after the still is approved)

```
start_image: {the approved still}
duration: 5s   resolution: 720p (1080p only if a 4K master matters)   fps: 24
Prompt: {motion only: e.g. "subtle handmade stop-motion jitter, characters sip their
coffee, camera locked off" | "slow push-in, hair moves in the breeze"}
```

Keep the motion prompt about camera + physics. The still already is the content. Pin the
specs once per film so every regenerated clip is drop-in.

## 4. Edit an approved shot (re-costume / prop swap)

```
[image ref: the EXISTING approved still]
Keep EVERYTHING identical - same people, same pose, same setting, same lighting,
same camera. ONLY change {the one element: e.g. "her kit to a plain red kit"}.
```

Then re-run template 3 on the edited still with the same pinned specs.

## 5. The reverse trick (object settles pixel-perfect into UI)

```
start_image: {a still of YOUR OWN rendered final pose, screen black}
Prompt: "the {object} lifts off, spins 360 degrees, floats away from camera,
screen stays black, background unchanged"
```

Then `ffmpeg -i clip.mp4 -vf reverse out.mp4` - the clip now ends at your exact pose.
Crossfade to the live CSS layer over the last ~5 frames; fade the real UI in on the screen
after it settles.
