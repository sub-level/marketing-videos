import React from "react";
import { Composition, Folder } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import {
  FPS,
  HEIGHT,
  HEIGHT_V,
  TOTAL_FRAMES,
  WIDTH,
  WIDTH_V,
} from "./tokens";
import { ExampleVideo } from "./example/ExampleVideo";
import { ExampleVideoVertical } from "./example/ExampleVideoVertical";
import {
  GrammarVideo,
  GrammarVideoVertical,
} from "./grammar/GrammarVideo";
import {
  FPS as GRAMMAR_FPS,
  TOTAL_FRAMES as GRAMMAR_FRAMES,
} from "./grammar/tokens";

// Fonts load ONCE here, never inside scene components.
//
// Always pass `weights` and `subsets`. The bare call loads EVERY weight and
// EVERY subset of the family: 63 network requests for Inter alone, repeated on
// every render worker, and a hard failure on a machine with no network. List
// only the weights the films actually use.
loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
loadPlexMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Example"
        component={ExampleVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ExampleVertical"
        component={ExampleVideoVertical}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH_V}
        height={HEIGHT_V}
      />

      {/* The grammar film: one scene tree, six deliverables. Three editions
          (dark / light / mixed) x two aspect ratios, all from the same three
          scenes. See src/grammar/GrammarVideo.tsx. Each film's compositions
          read THEIR OWN fps from their own tokens file, so retiming one film
          cannot silently retime another. */}
      <Folder name="Grammar">
        <Composition
          id="Grammar"
          component={GrammarVideo}
          durationInFrames={GRAMMAR_FRAMES}
          fps={GRAMMAR_FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ theme: "dark" as const }}
        />
        <Composition
          id="GrammarVertical"
          component={GrammarVideoVertical}
          durationInFrames={GRAMMAR_FRAMES}
          fps={GRAMMAR_FPS}
          width={WIDTH_V}
          height={HEIGHT_V}
          defaultProps={{ theme: "dark" as const }}
        />
        <Composition
          id="GrammarLight"
          component={GrammarVideo}
          durationInFrames={GRAMMAR_FRAMES}
          fps={GRAMMAR_FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ theme: "light" as const }}
        />
        <Composition
          id="GrammarMixed"
          component={GrammarVideo}
          durationInFrames={GRAMMAR_FRAMES}
          fps={GRAMMAR_FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ theme: "mixed" as const }}
        />
        <Composition
          id="GrammarLightVertical"
          component={GrammarVideoVertical}
          durationInFrames={GRAMMAR_FRAMES}
          fps={GRAMMAR_FPS}
          width={WIDTH_V}
          height={HEIGHT_V}
          defaultProps={{ theme: "light" as const }}
        />
        <Composition
          id="GrammarMixedVertical"
          component={GrammarVideoVertical}
          durationInFrames={GRAMMAR_FRAMES}
          fps={GRAMMAR_FPS}
          width={WIDTH_V}
          height={HEIGHT_V}
          defaultProps={{ theme: "mixed" as const }}
        />
      </Folder>
    </>
  );
};
