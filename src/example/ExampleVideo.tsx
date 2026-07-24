import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { COLORS, FONT, SCENE } from "../tokens";
import { Backdrop } from "./components/Backdrop";
import { GlobalChrome } from "./components/GlobalChrome";
import { HookScene } from "./scenes/HookScene";
import { MethodScene } from "./scenes/MethodScene";
import { NumbersScene } from "./scenes/NumbersScene";
import { CloseScene } from "./scenes/CloseScene";

// The example film — a 27 second demonstration of the grammar this repo
// teaches:
//
//   HOOK    120f / 4s   "This film was not edited." / "It was compiled."
//   METHOD  330f / 11s  the three moves, cards in lockstep with captions
//   NUMBERS 210f / 7s   stat tiles with counting numbers
//   CLOSE   150f / 5s   sign-off + repo URL + fade to black
//
// A persistent Backdrop (emotional color arc) + GlobalChrome (progress
// hairline, series chip) bracket the Series so the piece feels like one
// continuous film. Both sit OUTSIDE the Series and read absolute frames;
// scenes read scene-relative frames.
//
// Audio is intentionally not mounted (no assets ship with the repo). To score
// it, drop files into public/audio + public/sfx and mount <MusicBed> here and
// <SfxCue> inside scenes — see the video-audio-stack skill.

export const ExampleVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT.sans }}>
    <Backdrop />

    <Series>
      <Series.Sequence durationInFrames={SCENE.hook}>
        <HookScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE.method}>
        <MethodScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE.numbers}>
        <NumbersScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE.close}>
        <CloseScene />
      </Series.Sequence>
    </Series>

    <GlobalChrome />
  </AbsoluteFill>
);
