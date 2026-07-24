import React, { useContext } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VerticalLayoutContext } from "../../vertical-context";
import { COLORS, FONT } from "../../tokens";
import { HOOK } from "../script";

// Centered hero type: line 1 rises word-by-word, then line 2 lands with a
// spring and line 1 dims. Demonstrates the two workhorses: word-stagger via
// interpolate (clamped both sides), entrances via spring with a frame delay.

const LINE2_AT = 55;

const StaggeredLine: React.FC<{
  text: string;
  startAt: number;
  dimAfter?: number;
  fontSize: number;
  color: string;
}> = ({ text, startAt, dimAfter, fontSize, color }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const dim =
    dimAfter === undefined
      ? 1
      : interpolate(frame, [dimAfter, dimAfter + 18], [1, 0.35], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 18px",
        opacity: dim,
      }}
    >
      {words.map((w, i) => {
        const wf = startAt + i * 3;
        const op = interpolate(frame, [wf, wf + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const ty = interpolate(frame, [wf, wf + 12], [26, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize,
              letterSpacing: "-0.02em",
              color,
              opacity: op,
              transform: `translateY(${ty}px)`,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useContext(VerticalLayoutContext);

  const line2Spring = spring({
    frame: frame - LINE2_AT,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const fontSize = vertical ? 78 : 96;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        padding: "0 64px",
      }}
    >
      <StaggeredLine
        text={HOOK.line1}
        startAt={8}
        dimAfter={LINE2_AT + 6}
        fontSize={fontSize}
        color={COLORS.text}
      />
      <div
        style={{
          opacity: line2Spring,
          transform: `translateY(${(1 - line2Spring) * 30}px) scale(${
            0.96 + line2Spring * 0.04
          })`,
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize,
          letterSpacing: "-0.02em",
          color: COLORS.accent,
          textShadow: `0 4px 40px ${COLORS.accentGlow}`,
        }}
      >
        {HOOK.line2}
      </div>
    </AbsoluteFill>
  );
};
