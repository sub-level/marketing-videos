import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { OpenerScene } from "./scenes/OpenerScene";
import { WordsScene } from "./scenes/WordsScene";
import { CloseScene } from "./scenes/CloseScene";
import { DARK, LIGHT, T } from "./tokens";
import {
  sceneThemes,
  ThemeContext,
  type Theme,
} from "../theme-context";
import { VerticalLayoutContext } from "../vertical-context";

/**
 * The grammar film. Three scenes, plain `<Sequence>`s at the frames in
 * `tokens.ts`, so every number in that table is still true at render time.
 *
 * Editions: `theme` picks which scenes run light. `mixed` alternates the way
 * an App Store screenshot set does (light, light, dark), which is how one
 * film feeds a dark social cut AND a light press kit without a re-edit.
 * Crossed with the portrait wrapper below, that is six deliverables from
 * these three scenes.
 */
const LIGHT_BY_SCENE = sceneThemes(["opener", "words", "close"] as const, {
  mixed: { opener: true, words: true, close: false },
});

export const GrammarVideo: React.FC<{ theme?: Theme }> = ({
  theme = "dark",
}) => {
  const L = LIGHT_BY_SCENE[theme];
  return (
    // The sequences below tile 0..TOTAL_FRAMES exactly, so this background is
    // only ever seen if someone retimes a scene and leaves a gap. It follows
    // the OPENER so a gap at the head is not a black flash in a light cut.
    <AbsoluteFill style={{ background: L.opener ? LIGHT.bg : DARK.bg }}>
      <Sequence from={T.opener.from} durationInFrames={T.opener.len}>
        <ThemeContext.Provider value={L.opener}>
          <OpenerScene />
        </ThemeContext.Provider>
      </Sequence>
      <Sequence from={T.words.from} durationInFrames={T.words.len}>
        <ThemeContext.Provider value={L.words}>
          <WordsScene />
        </ThemeContext.Provider>
      </Sequence>
      <Sequence from={T.close.from} durationInFrames={T.close.len}>
        <ThemeContext.Provider value={L.close}>
          <CloseScene />
        </ThemeContext.Provider>
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * Portrait edition: the same tree at 1080x1920, never a scale-and-crop. The
 * scenes read `VerticalLayoutContext` and pick their own type sizes.
 */
export const GrammarVideoVertical: React.FC<{ theme?: Theme }> = ({
  theme = "dark",
}) => (
  <VerticalLayoutContext.Provider value={true}>
    <GrammarVideo theme={theme} />
  </VerticalLayoutContext.Provider>
);
