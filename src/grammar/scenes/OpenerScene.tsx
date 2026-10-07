import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TypedLine } from "../../lib/TypedLine";
import { Ground } from "../components/Ground";
import { useLight } from "../../theme-context";
import { FONT, OPENER_LINE, palette, T } from "../tokens";

/**
 * The announcement. One small line, typed, held, swept off.
 *
 * Type size is measured, not eyeballed: the reference's cap height was 62px on
 * a 1080-high frame, which is an 84-88px Inter. Portrait is NOT the same
 * number scaled: 1080 wide cannot hold a 108px line, so it gets its own.
 */
export const OpenerScene: React.FC = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const fontSize = vertical ? 66 : 88;
  const C = palette(useLight());

  // Types from frame 6, sweeps out so the snap lands just before the cut.
  const outAt = T.opener.len - 20;

  return (
    <AbsoluteFill>
      <Ground seed="opener" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 64px",
        }}
      >
        <TypedLine
          text={OPENER_LINE}
          from={6}
          outAt={outAt}
          fontSize={fontSize}
          fontFamily={FONT.family}
          color={C.ink}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
