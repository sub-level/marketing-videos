import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, SCENE_START, TOTAL_FRAMES } from "../../tokens";

// Persistent backdrop with an emotional color arc. Sits OUTSIDE the <Series>
// so it reads the ABSOLUTE composition frame, and the whole piece feels like
// one continuous film: neutral through the hook, accent-tinted through the
// method, a green lift on the numbers (the win), settling on the close.

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();

  // Accent wash rises through METHOD, hands off to green through NUMBERS.
  const accentGlow = interpolate(
    frame,
    [SCENE_START.method, SCENE_START.method + 60, SCENE_START.numbers, SCENE_START.numbers + 40],
    [0, 0.5, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const greenGlow = interpolate(
    frame,
    [SCENE_START.numbers, SCENE_START.numbers + 50, SCENE_START.close, SCENE_START.close + 50],
    [0, 0.4, 0.4, 0.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Slow drift so stills never feel frozen.
  const driftX = interpolate(frame, [0, TOTAL_FRAMES], [-60, 60]);
  const driftY = interpolate(frame, [0, TOTAL_FRAMES], [30, -30]);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          left: `calc(20% + ${driftX}px)`,
          top: `calc(-40% + ${driftY}px)`,
          background: `radial-gradient(circle, ${COLORS.accentSoft} 0%, transparent 62%)`,
          opacity: 0.35 + accentGlow,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          right: `calc(10% + ${-driftX}px)`,
          bottom: `calc(-45% + ${-driftY}px)`,
          background: `radial-gradient(circle, ${COLORS.greenSoft} 0%, transparent 60%)`,
          opacity: greenGlow,
          filter: "blur(40px)",
        }}
      />
      {/* Fine vignette keeps edges cinematic. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
