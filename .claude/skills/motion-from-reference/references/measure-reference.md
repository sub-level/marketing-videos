# Measuring a reference film

Copy-paste recipes. Everything here needs `ffmpeg`, `ffprobe` and Python with Pillow +
numpy, neither of which ships with a default macOS python3:

```bash
python3 -m pip install pillow numpy
```

Run the recipes against the extracted frame folder, not the mp4.

```bash
mkdir -p ref/frames
ffmpeg -i reference.mp4 -vsync 0 ref/frames/%04d.png
ffprobe -v error -select_streams v \
  -show_entries stream=r_frame_rate,width,height,nb_frames -of default=nw=1 reference.mp4
```

Frame `0001.png` is frame 0. Keep that mapping straight or every number you report is off
by one.

## 1. Ink bounding box per frame

The workhorse. Everything else is built on knowing, for each frame, where the bright
pixels are. (Invert the threshold for a light-ground reference.)

```python
import numpy as np, glob
from PIL import Image

def ink_bbox(path, thresh=110, light_ground=False):
    a = np.array(Image.open(path).convert("L"))
    mask = a < (255 - thresh) if light_ground else a > thresh
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None
    return xs.min(), ys.min(), xs.max(), ys.max()

for p in sorted(glob.glob("ref/frames/*.png"))[0:60]:
    print(p[-8:-4], ink_bbox(p))
```

Read the columns:

- `x_min` marching RIGHT across a run of frames = a sweep-out. Note the frame it starts,
  the frame the ink is ~70% gone, and the frame it disappears entirely.
- `x_max` marching RIGHT = a type-on.
- `y_min`/`y_max` creeping DOWN together = the drift that rides the sweep. Divide by the
  cap height to express it in ems (half a cap height is typical).

## 2. Cap height, and the type-to-frame ratio

Measure a frame where one full line is standing, on a capital-only crop so descenders do
not lie to you.

```python
x0, y0, x1, y1 = ink_bbox("ref/frames/0050.png")
cap = y1 - y0           # px, for a line with no descenders in the crop
print("cap", cap, "ratio", cap / 1080)
```

A cap height of 62px on a 1080-high frame is ratio 0.057. To hit that ratio in CSS, a
geometric sans at weight 500 wants roughly `fontSize = cap / 0.72`, i.e. ~86px. Check it
by rendering your own still and running the same measurement on it. Matching the NUMBER
is the point; matching your memory of the reference is not.

## 3. Per-letter arrival frames

Diff consecutive frames and look at where new ink appears.

```python
import numpy as np
from PIL import Image

prev = None
for i in range(1, 70):
    a = np.array(Image.open(f"ref/frames/{i:04d}.png").convert("L")).astype(int)
    if prev is not None:
        d = np.abs(a - prev)
        xs = np.where(d.max(axis=0) > 40)[0]
        if len(xs):
            print(i, "new ink x", xs.min(), "-", xs.max())
    prev = a
```

A new ink band ~1 letter wide per frame = one letter per frame. Gaps of 2-3 frames
cluster after spaces: those are the breaths. Write the pattern down, do not average it
away.

## 4. Hold lengths

```python
# frames where the ink bbox is unchanged = the hold
```

Diff the bbox tuple frame to frame; a run of identical tuples is the hold. Count it.
Holds in a tight reference run 5 to 15 frames, which is shorter than anybody guesses.

## 5. Side-by-side verification

```bash
# your frame vs the reference frame at the same beat
ffmpeg -i mine/frames/0119.png -i ref/frames/0119.png -filter_complex hstack out/compare.png
```

Look at type size first, position second, weight third. Those three carry most of the
"it doesn't feel the same" note.

## 6. Checking a particle field is alive, not a star field

Composite three frames one second apart into the R, G and B channels. Each mote should
trail in its own direction; parallel trails mean a linear drift, which reads as stars.

```python
import numpy as np
from PIL import Image
f = [np.array(Image.open(f"mine/frames/{n:04d}.png").convert("L")) for n in (60, 90, 120)]
Image.fromarray(np.dstack(f)).save("out/motes-rgb.png")
```
