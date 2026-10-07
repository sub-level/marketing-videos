---
name: video-audio-stack
description: Sound design for Remotion marketing videos - the three-layer audio stack (music bed, transition impacts, tactile UI sounds), frame-keyed volume curves, sourcing licensed music and SFX from Epidemic Sound, and music validation with ffmpeg. Use when scoring a composition, picking or swapping a music track, deciding what should be silent, or debugging why the music dies before the video ends.
---

# Video Audio Stack

The sound design language of good launch films (Anthropic, Figma, Linear) is three layers:

| Layer | Volume range | Job |
| --- | --- | --- |
| Music bed | 0.18-0.70 | One track, end to end, with a frame-keyed volume curve that traces the narrative arc |
| Transition impacts | 0.55-0.65 | whoosh/whip on big physical moments (hero entrance, smash cut) - dominant for ~30 frames |
| Tactile UI | 0.04-0.45 | clicks, keystrokes, dings on individual UI events - present, never competing |

## Where the music and SFX come from

**Epidemic Sound** (<https://www.epidemicsound.com>) is the source for both layers in
every film made with this method: the bed track and most of the one-shots (swooshes,
morphs, UI confirms, taps, crowd swells). A subscription covers use in marketing videos
and ads while it is active, which is what a launch film needs; read your own plan's terms
before publishing, because coverage differs between personal, commercial and client work.

It ships an **MCP server**, so the agent can search the catalog and pull candidates
itself instead of asking you to go hunting:

```jsonc
// .mcp.json  (or `claude mcp add`)
{
  "mcpServers": {
    "epidemic-sound": {
      "type": "http",
      "url": "https://www.epidemicsound.com/a/mcp-service/mcp",
      "headers": { "Authorization": "Bearer ${EPIDEMIC_SOUND_TOKEN}" }
    }
  }
}
```

Notes that cost time if you learn them the hard way:

- The token is **yours** and belongs in the environment, never in a committed file.
  Setting an explicit `Authorization` header disables the OAuth fallback, so when the
  token expires the server fails to connect with a bare 401 and no prompt to re-auth -
  refresh the token rather than debugging the URL.
- Once connected, read the server's own tool list; search by mood, genre, BPM and energy,
  and audition candidates before downloading.
- Whatever you use, **write the track title and artist into the audio README next to the
  file**. Six months later "which track was this?" is unanswerable from a waveform, and
  you need it for re-licensing and for the video platform's rights screens.

Free and attribution-free alternatives for one-shots: `@remotion/sfx` (peak-normalized to
about -3 dB). Mix the two freely - the bed is what matters.

**Never commit a licensed track to a public repo.** Keep the audio folder out of git, or
ship only the placeholder, and say in the README where the real one comes from.

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
<SfxCue src={staticFile("sfx/whoosh.wav")} at={155} volume={0.55} />
<SfxCue src={staticFile("sfx/ding.wav")}   at={235} volume={0.4} pitch={1.1} />
```

- `pitch` is `playbackRate` doubling as pitch shift - vary the SAME sample (1.3 higher,
  0.85 lower) so repeated pops/drops feel distinct without authoring new files.
- Related events share one voice: if a purchase gets a bright ding, later confirmations
  echo a quieter, pitched version of the same ding.
- Pull SFX from an attribution-free pack (e.g. `@remotion/sfx`, peak-normalized ~-3dB) and
  **mirror the files into `public/` so headless renders never touch the network**.

## Silence is a design choice, not a gap

The reflex is to put a sound on everything that moves. Resist it. On one film every
per-letter typing click, every UI tap and every cut inside the on-screen recording was
removed, and the cut got better: the typed lines, the device tap and the screen's own
edits all play silent, carried by the music and one or two real impacts.

Rules of thumb:

- A typed line does not need a click per letter. It sounds like a stock typewriter.
- A tap you can SEE does not need a tap you can hear. If a tile lights up, the light is
  the tap.
- Reserve dings for things the viewer should feel good about, and then use at most one.
  Pings on a reveal and on the final title card both got cut from the same film for
  making it feel like a tutorial.
- One real, recorded, specific sound (a pack tearing, a keyboard, a shutter) is worth ten
  library whooshes. Duck the music under it and let it own its moment.

## Timing a one-shot to the picture

- **Measure the sample's attack**, do not assume it peaks at its start. Profile it in
  100ms slices (`ffmpeg -ss T -t 0.1 -i s.wav -af volumedetect -f null -`) and find the
  real peak. A whoosh that peaks at 0.5s fired ON a cut blooms 15 frames into the new
  shot, which feels late. Do not eyeball it off a waveform view either: on one sample the
  visible crest at 1.25s was reverb tail and the real transient was at 0.5s. Only the
  per-100ms numbers tell you which.
- For INSTANT events (a hard cut), trim the sample's head so the peak lands ~6 frames
  after it fires, and fire it on the cut. Keep the trimmed variant as its own file with
  the measurement in its name or comment.
- Supplied organic recordings usually carry handling noise at the head. Trim it
  (`trimBefore` on the `<Html5Audio>`, or re-cut the file) so the first transient meets
  the frame it belongs to.
- When the music should start on its downbeat, start it at source zero on that frame
  rather than fading it in - a fade across a drop wastes the drop.

## Revising audio without re-rendering the video

A picture-locked film whose mix changed does not need a re-render. Render the composition
to WAV and remux onto the existing master with a video stream copy:

```bash
npx remotion render MyFilm out/audio.wav --codec=wav
ffmpeg -i out/film.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
  -movflags +faststart out/film-remix.mp4
```

Seconds instead of an hour, and the video stream is bit-identical to the approved one.
Both aspect ratios share the same mix, so one WAV serves both.

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

A subscription library (Epidemic Sound and friends) covers you while the subscription is
active and generally does NOT transfer to a client who later takes the film. If the film
is being handed over, say so before you score it - that decision belongs upstream of the
mix, not after picture lock.
