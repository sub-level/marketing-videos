import React, { useContext } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VerticalLayoutContext } from "../../vertical-context";
import { COLORS, FONT, RADIUS, SCENE } from "../../tokens";
import { CLOSE } from "../script";

// Sign-off: headline spring, URL pill, then a clean fade to black. The film
// always ends on a held, quiet frame — never mid-motion.

export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useContext(VerticalLayoutContext);

  const headlineIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const pillIn = spring({
    frame: frame - 34,
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const fadeOut = interpolate(
    frame,
    [SCENE.close - 24, SCENE.close - 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 36,
      }}
    >
      <div
        style={{
          opacity: headlineIn,
          transform: `translateY(${(1 - headlineIn) * 40}px)`,
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: vertical ? 96 : 112,
          letterSpacing: "-0.02em",
          color: COLORS.text,
        }}
      >
        {CLOSE.headline}
      </div>
      <div
        style={{
          opacity: pillIn,
          transform: `translateY(${(1 - pillIn) * 24}px)`,
          padding: "16px 30px",
          borderRadius: RADIUS.pill,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.accentSoft,
          fontFamily: FONT.mono,
          fontSize: vertical ? 26 : 28,
          color: COLORS.text,
        }}
      >
        {CLOSE.url}
      </div>
      {/* Fade to black */}
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
