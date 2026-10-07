import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TypedLine } from "../../lib/TypedLine";
import { Ground } from "../components/Ground";
import { CLOSE_LINE, FONT, IDENTITY_LINE, palette } from "../tokens";
import { useLight } from "../../theme-context";

/**
 * The identity line, then the two-word close.
 *
 * The identity line types FAST (about three letters a frame). A closing line
 * that types at the opener's pace feels like the film forgot it was ending.
 * The close itself does not type, does not spring and does not scale: it
 * simply fades in over four frames and sits there. After 15 seconds of
 * motion, stillness is the punctuation.
 */
const IDENTITY_AT = 8;
const IDENTITY_OUT = 62;
const CLOSE_AT = 86;

export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const ink = palette(useLight()).ink;

  const closeOp = interpolate(frame, [CLOSE_AT, CLOSE_AT + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Ground seed="close" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 64px",
        }}
      >
        <TypedLine
          text={IDENTITY_LINE}
          from={IDENTITY_AT}
          cpf={3}
          outAt={IDENTITY_OUT}
          fontSize={vertical ? 66 : 88}
          fontFamily={FONT.family}
          color={ink}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div
          style={{
            opacity: closeOp,
            fontFamily: FONT.family,
            fontSize: vertical ? 72 : 104,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: ink,
          }}
        >
          {CLOSE_LINE}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
