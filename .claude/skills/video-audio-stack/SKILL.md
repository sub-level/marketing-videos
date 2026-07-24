---
name: video-audio-stack
description: Sound design for Remotion marketing videos - the three-layer audio stack (music bed, transition impacts, tactile UI sounds), frame-keyed volume curves, and music validation with ffmpeg. Use when scoring a composition, swapping a music track, or debugging why the music dies before the video ends.
---

# Video Audio Stack

The sound design language of good launch films (Anthropic, Figma, Linear) is three layers:

| Layer | Volume range | Job |
| --- | --- | --- |
| Music bed | 0.18-0.70 | One track, end to end, with a frame-keyed volume curve that traces the narrative arc |
| Transition impacts | 0.55-0.65 | whoosh/whip on big physical moments (hero entrance, smash cut) - dominant for ~30 frames |
| Tactile UI | 0.04-0.45 | clicks, keystrokes, dings on individual UI events - present, never competing |

## Music bed

- ONE track for the whole film. The volume curve is a keyframe table of
  `[frame, volume]` pairs interpolated in the `volume={(f) => ...}` callback (both
  extrapolations clamped). Shape it like a narrator: warm fade-in, build through the
  middle, DUCK under key spoken/typed moments so they sit in a quiet pocket, swell into
  the climax, settle on the outro.
- Fade in over ~1s and out over ~1.5s minimum. Never remove the ramps.
- **Clamp the fade-out to a `MUSIC_LEN` constant**, not to the composition length - then a
  growing cut can never hard-stop the track mid-note.
- Duck under impacts; the impact owns the moment, the bed recovers after.

## SFX cues

Wrap each one-shot in a `<Sequence from={at}>` so the sample's internal frame is 0 at
trigger time (see `src/lib/SfxCue.tsx`):

```tsx
<SfxCue id="whoosh" at={155} volume={0.55} />
<SfxCue id="ding"   at={235} volume={0.4} pitch={1.1} />
```

- `pitch` is `playbackRate` doubling as pitch shift - vary the SAME sample (1.3 higher,
  0.85 lower) so repeated pops/drops feel distinct without authoring new files.
- Related events share one voice: if a purchase gets a bright ding, later confirmations
  echo a quieter, pitched version of the same ding.
- Pull SFX from an attribution-free pack (e.g. `@remotion/sfx`, peak-normalized ~-3dB) and
  **mirror the files into `public/` so headless renders never touch the network**.

## Validating a music track BEFORE you cut to it

**Audible length is not file length.** Tracks bake in long fades and quiet intros; a "46s"
file may carry energy for only 29s, and the film's climax lands on silence.

1. Get real duration: `ffprobe -v error -show_entries format=duration -of csv=p=0 track.wav`
2. Profile per-second loudness:
   `for t in $(seq 0 44); do ffmpeg -ss $t -t 1 -i track.wav -af astats=metadata=1 -f null - 2>&1 | grep 'RMS level'; done`
   Find where RMS falls off a cliff - that is the track's true end.
3. A quiet intro (first ~10s) means the hook plays over near-silence - trim the track or
   skip into it with `startFrom`.

**Do not assume a track can be loop-extended.** Most produced tracks have no self-similar
splice region; an eyeballed crossfade splice audibly lurches. Check first (autocorrelate
the waveform/onset envelope, or just listen to a test splice). If it cannot loop, pick a
longer track - do not ship the lurch.

## Fit the cut to the track (or the track to the cut)

When the cut grows past the track's energy, you have three honest options, in order of
preference: (1) get a re-export of the track at the new length, (2) retime the cut so the
climax lands inside the track's energy window, (3) swap tracks. The dishonest option -
letting the outro play over dead air - reads as a mistake to every viewer.

## Licensing

The bed track is usually the ONLY licensed asset in the film. Placeholder tracks are fine
in dev; before public publication, confirm the license covers distribution and swap if not.
Never commit a track to a public repo unless its license explicitly allows redistribution.
