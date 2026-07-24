import React from "react";
import { Audio, interpolate } from "remotion";

// Single-track music bed with a frame-keyed volume curve that traces the
// narrative arc: warm fade-in, build, DUCK under key spoken/typed moments,
// swell into the climax, settle on the outro.
//
// Keyframes are [absoluteFrame, volume] pairs. Shape guidance (see the
// video-audio-stack skill): bed 0.18-0.70, fade in over ~1s, fade out over
// ~1.5s minimum, and clamp the fade-out to the TRACK's usable length (not the
// composition length) so a growing cut can never hard-stop the music mid-note.
//
//   <MusicBed
//     src={staticFile("audio/bed.mp3")}
//     keyframes={[[0, 0], [30, 0.3], [500, 0.3], [720, 0.5], [820, 0.22], ...]}
//   />

type Props = {
  src: string;
  keyframes: ReadonlyArray<readonly [number, number]>;
};

export const MusicBed: React.FC<Props> = ({ src, keyframes }) => {
  const frames = keyframes.map(([f]) => f);
  const volumes = keyframes.map(([, v]) => v);
  return (
    <Audio
      src={src}
      volume={(f) =>
        interpolate(f, frames, volumes, {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};
