import React from "react";
import { VerticalLayoutContext } from "../vertical-context";
import { ExampleVideo } from "./ExampleVideo";

// 9:16 (1080x1920) edition for TikTok / Reels / Stories. Same scene code,
// rendered NATIVELY at portrait dimensions — every scene reads
// VerticalLayoutContext and branches its layout (row -> column, caption
// position, corner anchors) rather than being scaled-and-cropped.

export const ExampleVideoVertical: React.FC = () => (
  <VerticalLayoutContext.Provider value={true}>
    <ExampleVideo />
  </VerticalLayoutContext.Provider>
);
