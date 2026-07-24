import React, { useContext } from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VerticalLayoutContext } from "../../vertical-context";
import { COLORS, FONT, RADIUS } from "../../tokens";
import { KineticCaption } from "../../lib/KineticCaption";
import { METHOD_CUES, MOVES } from "../script";

// The three moves as cards, each springing in as its narration cue begins so
// picture and words stay in lockstep. Landscape: a row. Portrait: a column
// (the dual-aspect rule: hardcoded row widths would overflow 1080).

const CARD_AT = [10, 106, 214]; // mirrors METHOD_CUES[i].from

const MoveCard: React.FC<{
  index: string;
  title: string;
  sub: string;
  at: number;
  vertical: boolean;
}> = ({ index, title, sub, at, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - at,
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  return (
    <div
      style={{
        width: vertical ? 720 : 480,
        padding: "36px 40px",
        borderRadius: RADIUS.lg,
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 22,
          color: COLORS.accent,
          letterSpacing: "0.1em",
        }}
      >
        {index}
      </div>
      <div
        style={{
          fontFamily: FONT.sans,
          fontWeight: 800,
          fontSize: vertical ? 44 : 40,
          letterSpacing: "-0.01em",
          color: COLORS.text,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 22,
          color: COLORS.textDim,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

export const MethodScene: React.FC = () => {
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
          gap: vertical ? 32 : 40,
          // Leave room for the caption bar below.
          paddingBottom: vertical ? 560 : 260,
          paddingTop: vertical ? 120 : 0,
        }}
      >
        {MOVES.map((m, i) => (
          <MoveCard
            key={m.index}
            index={m.index}
            title={m.title}
            sub={m.sub}
            at={CARD_AT[i]}
            vertical={vertical}
          />
        ))}
      </div>
      <KineticCaption cues={METHOD_CUES} />
    </AbsoluteFill>
  );
};
