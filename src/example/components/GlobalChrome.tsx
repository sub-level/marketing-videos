import React, { useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { VerticalLayoutContext } from "../../vertical-context";
import { COLORS, FONT, RADIUS, TOTAL_FRAMES } from "../../tokens";

// Thin persistent chrome bracketing the whole film: a hairline progress bar
// plus a series chip. Sits OUTSIDE the <Series>, reads the absolute frame.
// Corner-anchored, so it branches on the portrait flag (rule: anything
// anchored to a corner is a candidate for repositioning in 9:16).

export const GlobalChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const vertical = useContext(VerticalLayoutContext);

  const progress = interpolate(frame, [0, TOTAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipIn = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Progress hairline */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 4,
          width: `${progress * 100}%`,
          background: COLORS.accent,
          zIndex: 90,
        }}
      />
      {/* Series chip */}
      <div
        style={{
          position: "absolute",
          top: vertical ? 52 : 36,
          left: vertical ? 40 : 48,
          padding: "8px 14px",
          borderRadius: RADIUS.pill,
          border: `1px solid ${COLORS.border}`,
          background: "rgba(255,255,255,0.04)",
          color: COLORS.textDim,
          fontFamily: FONT.mono,
          fontSize: 20,
          letterSpacing: "0.08em",
          opacity: chipIn,
          zIndex: 90,
        }}
      >
        MADE WITH CODE
      </div>
    </>
  );
};
