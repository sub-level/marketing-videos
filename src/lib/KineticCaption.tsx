import React, { useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { VerticalLayoutContext } from "../vertical-context";
import { COLORS, FONT } from "../tokens";

// Narration rendered as premium kinetic subtitles. Each cue reveals
// word-by-word (rise + blur + fade, staggered) and cross-fades to the next.
// `emphasize` substrings render in the accent color so each line lands on the
// word a founder would hit out loud.
//
// Mounted INSIDE a scene, so `useCurrentFrame` is scene-relative and matches
// the cue frame numbers in the scene's script.

export type Cue = {
  /** scene-relative frame the cue begins revealing */
  from: number;
  /** scene-relative frame the cue begins fading out */
  to: number;
  text: string;
  /** substrings rendered in the accent color */
  emphasize?: string[];
};

const STAGGER = 2.1;
const WORD_IN = 9;

const norm = (w: string) => w.replace(/[.,!?;:'"]/g, "").toLowerCase();

// Which word indices fall inside an emphasized phrase (matched as a
// contiguous run of normalized tokens).
function emphasizedIndices(words: string[], phrases: string[]): Set<number> {
  const out = new Set<number>();
  const tokens = words.map(norm);
  for (const phrase of phrases) {
    const pw = phrase.split(/\s+/).map(norm).filter(Boolean);
    if (pw.length === 0) continue;
    for (let i = 0; i + pw.length <= tokens.length; i++) {
      let hit = true;
      for (let j = 0; j < pw.length; j++) {
        if (tokens[i + j] !== pw[j]) {
          hit = false;
          break;
        }
      }
      if (hit) for (let j = 0; j < pw.length; j++) out.add(i + j);
    }
  }
  return out;
}

const CueBlock: React.FC<{ cue: Cue; vertical: boolean }> = ({
  cue,
  vertical,
}) => {
  const frame = useCurrentFrame();
  const words = cue.text.split(/\s+/);
  const emph = emphasizedIndices(words, cue.emphasize ?? []);

  const fadeOut = interpolate(frame, [cue.to - 10, cue.to], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: vertical ? "6px 12px" : "8px 14px",
        maxWidth: vertical ? 920 : 1280,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const wf = cue.from + i * STAGGER;
        const op = interpolate(frame, [wf, wf + WORD_IN], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const ty = interpolate(frame, [wf, wf + WORD_IN], [16, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const blur = interpolate(frame, [wf, wf + WORD_IN], [7, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isEmph = emph.has(i);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT.sans,
              fontSize: vertical ? 46 : 44,
              fontWeight: isEmph ? 800 : 600,
              letterSpacing: "-0.5px",
              lineHeight: 1.18,
              color: isEmph ? COLORS.accent : COLORS.text,
              opacity: op * fadeOut,
              transform: `translateY(${ty}px)`,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
              textShadow: isEmph
                ? `0 2px 18px ${COLORS.accentGlow}, 0 1px 2px rgba(0,0,0,0.6)`
                : "0 2px 14px rgba(0,0,0,0.7)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const KineticCaption: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const vertical = useContext(VerticalLayoutContext);

  // Active = any cue currently in its [from, to] window (+ a tail for the
  // fade). Drives the scrim so the dark wash only shows under live text.
  const active = cues.filter((c) => frame >= c.from - 2 && frame <= c.to + 2);
  const scrim = active.length > 0 ? 1 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: vertical ? 360 : 96,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* Localized legibility scrim — soft, only under live captions. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -120,
          height: vertical ? 520 : 360,
          background:
            "radial-gradient(80% 100% at 50% 100%, rgba(0,0,0,0.62) 0%, transparent 72%)",
          opacity: scrim,
        }}
      />
      {active.map((c) => (
        <div
          key={c.from}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "0 48px",
          }}
        >
          <CueBlock cue={c} vertical={vertical} />
        </div>
      ))}
    </div>
  );
};
