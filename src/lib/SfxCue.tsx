import React from "react";
import { Audio, Sequence } from "remotion";

// Plays a one-shot sound effect at a specific scene-local frame. Wrapped in a
// `<Sequence from={at}>` so the audio's internal frame is 0 at trigger time.
//
// Usage (inside a scene):
//
//   <SfxCue src={staticFile("sfx/whoosh.wav")} at={155} volume={0.55} />
//   <SfxCue src={staticFile("sfx/ding.wav")}   at={235} volume={0.4} pitch={1.1} />
//
// `pitch` is `playbackRate` doubling as a pitch shift (1.3 = higher,
// 0.85 = lower) — vary the SAME sample so repeated pops feel distinct without
// authoring separate files.

type Props = {
  /** Asset path, from staticFile(). */
  src: string;
  /** Scene-local frame at which the sound fires. */
  at: number;
  /** Playback volume, 0-1. Defaults low so cues never blow past the bed. */
  volume?: number;
  /** Playback rate; doubles as pitch shift. */
  pitch?: number;
  /** Duration in frames. Defaults to 90 (3s @ 30fps) so the sample plays out. */
  durationInFrames?: number;
};

export const SfxCue: React.FC<Props> = ({
  src,
  at,
  volume = 0.5,
  pitch = 1,
  durationInFrames = 90,
}) => {
  return (
    <Sequence from={at} durationInFrames={durationInFrames} layout="none">
      <Audio src={src} volume={volume} playbackRate={pitch} />
    </Sequence>
  );
};
