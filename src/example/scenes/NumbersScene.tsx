import React, { useContext } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VerticalLayoutContext } from "../../vertical-context";
import { COLORS, FONT, RADIUS } from "../../tokens";
import { KineticCaption } from "../../lib/KineticCaption";
import { NUMBERS_CUES, STATS } from "../script";

// The money shot: stat tiles whose numbers count up. Numbers animate as
// NUMBERS (interpolate the value, format at render) — never animate a
// formatted string.

const TILE_AT = [8, 26, 44];
const COUNT_LEN = 40;

const StatTile: React.FC<{
  value: number;
  suffix: string;
  label: string;
  at: number;
  vertical: boolean;
}> = ({ value, suffix, label, at, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - at,
    fps,
    config: { damping: 16, stiffness: 140 },
  });
  const counted = Math.round(
    interpolate(frame, [at, at + COUNT_LEN], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <div
      style={{
        width: vertical ? 760 : 500,
        padding: "44px 48px",
        borderRadius: RADIUS.lg,
        background: COLORS.panel,
        border: `1px solid ${COLORS.borderSoft}`,
        opacity: s,
        transform: `scale(${0.92 + s * 0.08})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: vertical ? 110 : 104,
          color: COLORS.green,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {counted}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: 26,
          color: COLORS.textDim,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const NumbersScene: React.FC = () => {
  const vertical = useContext(VerticalLayoutContext);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: vertical ? 28 : 36,
          paddingBottom: vertical ? 540 : 240,
          paddingTop: vertical ? 100 : 0,
        }}
      >
        {STATS.map((st, i) => (
          <StatTile
            key={st.label}
            value={st.value}
            suffix={st.suffix}
            label={st.label}
            at={TILE_AT[i]}
            vertical={vertical}
          />
        ))}
      </div>
      <KineticCaption cues={NUMBERS_CUES} />
    </AbsoluteFill>
  );
};
