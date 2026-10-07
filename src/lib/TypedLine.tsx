import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useInk } from "../theme-context";

/**
 * A sentence that TYPES on and SWEEPS off, with the mechanics measured off a
 * reference film rather than guessed. See the `motion-from-reference` skill
 * for how the numbers below were obtained; they are the defaults because they
 * are what a hand-made title card actually does:
 *
 * ON   one letter a frame, with a two-frame breath after every space and a
 *      one-frame hitch every seventh character or so, so the rhythm is human
 *      instead of metronomic. No cursor. The line is centred on its FINISHED
 *      width (letters appear into a block that already occupies the line) so
 *      nothing reflows while it types.
 *
 * OFF  not a fade. Over `outLen` frames the visible ink's left edge runs
 *      RIGHT until ~70% of the line is gone, through a soft edge about eight
 *      letters wide; the whole line drifts DOWN about half a cap height on an
 *      ease-in; the part still standing dims a touch; then it SNAPS out. A
 *      full fade reads as a slide transition. A sweep reads as motion design.
 *
 * SIZE type-to-frame ratio is a look, not an accident. Measure the reference's
 *      cap height in pixels at its delivery height and scale: a 62px cap on a
 *      1080-high frame is roughly an 84-88px font. Films read SMALLER on
 *      screen than they do in the studio preview, so measure, don't eyeball.
 *
 * Deliberately silent by default. A click per letter sounds like a stock
 * typewriter effect; the sweep and the music carry it. `clickSrc` is here for
 * the cut where a keyboard is diegetic, and it stays off unless asked for.
 */
type Props = {
  text: string;
  /** Scene-local frame the type-on starts. */
  from: number;
  /** Characters per frame. 1 = the measured reference; ~3 for a fast close. */
  cpf?: number;
  /** Scene-local frame the sweep-out starts. Omit to hold to the cut. */
  outAt?: number;
  /** Frames the sweep takes before it snaps. */
  outLen?: number;
  /** Letters across the sweep's soft edge. */
  outEdge?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  /** Letters land at +tracking em and settle to 0 over `trackingLen`. */
  tracking?: number;
  trackingLen?: number;
  /** Optional per-letter click. Off by default on purpose. See above. */
  clickSrc?: string;
  clickVolume?: number;
  /** Rendered for each click when `clickSrc` is set. */
  renderClick?: (args: {
    at: number;
    pitch: number;
    volume: number;
    key: string;
  }) => React.ReactNode;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Frame (relative to `from`) each character appears at, carrying the breaths
 * that make a typed line feel typed instead of ticked out by a clock.
 */
export function letterArrivals(text: string, cpf: number): number[] {
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    out.push(t);
    t += 1 / cpf;
    if (text[i] === " ") t += 2;
    else if (cpf <= 1 && i % 7 === 3) t += 1;
  }
  return out;
}

export const TypedLine: React.FC<Props> = ({
  text,
  from,
  cpf = 1,
  outAt,
  outLen = 13,
  outEdge = 8,
  fontSize = 84,
  fontFamily = "inherit",
  fontWeight = 500,
  color,
  tracking = 0,
  trackingLen = 24,
  clickSrc,
  clickVolume = 0.12,
  renderClick,
}) => {
  const frame = useCurrentFrame();
  const themeInk = useInk();
  const ink = color ?? themeInk;
  const n = text.length;
  const at = React.useMemo(() => letterArrivals(text, cpf), [text, cpf]);
  const typeDone = from + (at[n - 1] ?? 0) + 1;

  // Letters land wide-tracked and tighten, or (tracking = 0) land tight.
  const settle = interpolate(
    frame,
    [from, typeDone + trackingLen],
    [tracking, 0],
    CLAMP,
  );

  // The sweep: one progress value drives the ink edge, the drift and the dim.
  const outP =
    outAt === undefined
      ? 0
      : interpolate(frame, [outAt, outAt + outLen], [0, 1], CLAMP);
  const outEdgeAt = outAt === undefined ? -Infinity : outP * (n * 0.7 + outEdge);
  const snapped = outAt !== undefined && frame >= outAt + outLen;
  const drift = outP * outP * 0.5; // em, ease-in
  const lineDim = interpolate(outP, [0.7, 1], [1, 0.85], CLAMP);

  return (
    <>
      {clickSrc && renderClick
        ? text
            .split("")
            .map((c, i) =>
              c === " "
                ? null
                : renderClick({
                    at: from + Math.round(at[i]),
                    pitch: 1.5 + (i % 3) * 0.08,
                    volume: clickVolume,
                    key: `click-${i}`,
                  }),
            )
        : null}
      <div
        style={{
          fontFamily,
          fontSize,
          fontWeight,
          color: ink,
          letterSpacing: `${settle}em`,
          whiteSpace: "pre",
          lineHeight: 1.2,
          transform: `translateY(${drift}em)`,
          opacity: snapped ? 0 : lineDim,
        }}
      >
        {text.split("").map((c, i) => {
          const inOp = frame - from >= at[i] ? 1 : 0;
          const outOp = interpolate(outEdgeAt, [i, i + outEdge], [1, 0], CLAMP);
          return (
            <span key={i} style={{ opacity: inOp * outOp }}>
              {c}
            </span>
          );
        })}
      </div>
    </>
  );
};

/**
 * A line whose letters take their opacity from a function of their index.
 * This is the primitive under every per-letter effect: sweeps, mirrored
 * crossfades (old letters leave left-to-right while new ones arrive
 * right-to-left), brightness waves. Keep the choreography in the caller's
 * `opacityAt` and this component stays dumb.
 */
export const LetterLine: React.FC<{
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  /** Draw the glyphs as hairline outlines instead of solid ink. */
  outline?: boolean;
  outlineColor?: string;
  lineOpacity?: number;
  scale?: number;
  opacityAt: (i: number, n: number) => number;
}> = ({
  text,
  fontSize,
  fontFamily = "inherit",
  fontWeight = 700,
  color,
  outline = false,
  outlineColor,
  lineOpacity = 1,
  scale = 1,
  opacityAt,
}) => {
  const themeInk = useInk();
  const ink = color ?? themeInk;
  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color: outline ? "transparent" : ink,
        WebkitTextStroke: outline
          ? `1.4px ${outlineColor ?? ink}`
          : undefined,
        letterSpacing: -fontSize * 0.025,
        whiteSpace: "pre",
        lineHeight: 1.1,
        opacity: lineOpacity,
        transform: `scale(${scale})`,
      }}
    >
      {text.split("").map((c, i) => (
        <span key={i} style={{ opacity: opacityAt(i, text.length) }}>
          {c}
        </span>
      ))}
    </div>
  );
};

/**
 * Sweep helper: progress 0-1 across `n` letters with a soft `edge`, returning
 * the 0-1 factor for letter `i`. Both the ink-edge sweep and the mirrored
 * crossfade are built from this.
 */
export const letterSweep = (
  progress: number,
  i: number,
  n: number,
  edge = 3,
) => interpolate(progress * (n + edge), [i, i + edge], [0, 1], CLAMP);
