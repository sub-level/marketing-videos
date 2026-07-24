import React from "react";
import { Composition } from "remotion";
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

// Fonts load ONCE here, never inside scene components.
loadInter();
loadPlexMono();

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
    </>
  );
};
