import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LetterLine, letterSweep } from "./TypedLine";
import { useLight } from "../theme-context";

/**
 * The value-words sequence, built as ONE CONTINUOUS PIECE OF GEOMETRY.
 *
 * This is the difference between motion design and a slideshow, and it is the
 * single most useful thing in this repo. The naive version of "three words
 * with some line art" fades each word in at its final size inside its own
 * fresh circle. It reads as SLIDES, every time, no matter how nice the
 * easing is. The fix is that the geometry never restarts: one circle is born
 * oversized, collapses, rests, hardens, grows, spawns siblings, and leaves,
 * while the words hard-cut and crossfade THROUGH it.
 *
 * The choreography, per word index:
 *
 *   0  the word arrives as a GIANT hairline outline, wider than the frame,
 *      inside a dashed circle bigger than the frame. Word and circle SHRINK
 *      together on one ease-out over `collapse` frames (44 by default, the
 *      measured number) into the small word.
 *      At the end of the collapse the word HARD-FILLS solid (a cut, not a
 *      fade) and dashed rails run out of the circle to both frame edges.
 *   1  a hard word cut, but the SAME circle: its dashes close up into a solid
 *      line, it grows slightly, and two more circles slide out of it to the
 *      sides into a Venn that keeps drifting apart.
 *   2+ ALL the circles leave: the siblings slide off the sides and the centre
 *      goes with them, while the words crossfade MIRRORED - the outgoing
 *      letters fade left-to-right while the incoming ones arrive
 *      right-to-left dim, then brighten left-to-right. Two opposite waves in
 *      one beat is what makes a plain crossfade feel authored.
 *
 *      The last words therefore stand on a bare ground, on purpose: in the
 *      reference the device rises under them, and the geometry leaving is
 *      what makes room for it. If your film has nothing to hand off to, raise
 *      `framesPerWord` for the first two words and use fewer words rather
 *      than letting three bare cards sit there.
 *  last the line leaves as a whole-line fade with a scale-up and a blur,
 *      written as an exit so whatever comes next (a device rising, a logo)
 *      can start underneath it instead of after it.
 *
 * Timing is data: `framesPerWord` carries the measured pace. Word 0 is long
 * because it owns the collapse; the rest are short holds. If a cut feels
 * slow, shorten the holds before you shorten the collapse. The collapse IS
 * the shot.
 */
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Absolute start frame (sequence-local) of each word. */
export const geometryWordStarts = (framesPerWord: readonly number[]): number[] =>
  framesPerWord.reduce<number[]>(
    (acc, _, i) => (acc.push(i ? acc[i - 1] + framesPerWord[i - 1] : 0), acc),
    [],
  );

/** Total length of the sequence, so the caller's SCENE table stays computed. */
export const geometryWordsLength = (framesPerWord: readonly number[]): number =>
  framesPerWord.reduce((a, b) => a + b, 0);

type Props = {
  /** At least three. See the choreography above. */
  words: readonly string[];
  /**
   * Frames per word. MUST be the same length as `words`, and word 0 must
   * cover `collapse` plus a hold.
   */
  framesPerWord: readonly number[];
  fontSize?: number;
  fontFamily?: string;
  /** Frames the opening collapse takes. */
  collapse?: number;
  /** Start scale of the outline word and its circle (4.4 = wider than frame). */
  bigScale?: number;
  colors?: { ink?: string; line?: string; lineFaint?: string };
  /** Frames of the final fade/scale/blur exit. */
  exitLen?: number;
};

/** Letters across the per-letter sweeps. */
const SWEEP = 8;
/** Frames the Venn takes to open, and to clear the frame. */
const VENN_IN = 12;
const VENN_OUT = 10;

export const GeometryWords: React.FC<Props> = ({
  words,
  framesPerWord,
  fontSize,
  fontFamily = "inherit",
  collapse: COLLAPSE = 44,
  bigScale: BIG = 4.4,
  colors,
  exitLen = 10,
}) => {
  // Fail loudly and early. Changing the word list is the first edit anyone
  // makes, and the choreography has shape: without a third word the Venn has
  // nothing to hand off to, and the internal interpolations run on Infinity,
  // which throws from deep inside Remotion naming nothing in this file.
  if (words.length < 3) {
    throw new Error(
      `GeometryWords needs at least 3 words (got ${words.length}). The ` +
        "choreography is collapse (word 0), Venn (word 1), mirrored " +
        "crossfades (word 2+); with fewer, the geometry has nowhere to go.",
    );
  }
  if (framesPerWord.length !== words.length) {
    throw new Error(
      `GeometryWords: framesPerWord has ${framesPerWord.length} entries for ` +
        `${words.length} words. They must be the same length.`,
    );
  }

  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const light = useLight();
  const vertical = height > width;

  const ink = colors?.ink ?? (light ? "#0A0A0A" : "#FFFFFF");
  const line = colors?.line ?? (light ? "rgba(10,10,10,0.38)" : "rgba(255,255,255,0.32)");
  const lineFaint =
    colors?.lineFaint ?? (light ? "rgba(10,10,10,0.16)" : "rgba(255,255,255,0.14)");

  // Portrait is its own layout, not a crop: the longest word has to fit 1080.
  const size = fontSize ?? (vertical ? 64 : 120);

  const starts = React.useMemo(
    () => geometryWordStarts(framesPerWord),
    [framesPerWord],
  );
  const last = words.length - 1;
  const s1 = starts[1] ?? Infinity;
  const s2 = starts[2] ?? Infinity;

  const cx = width / 2;
  const cy = height / 2;
  const R0 = Math.min(width, height) * 0.3; // the resting circle

  // ---- word 0: collapse, then hard fill ----
  const collapseP = interpolate(frame, [0, COLLAPSE], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const scale1 = BIG - (BIG - 1) * collapseP;
  const filled = frame >= COLLAPSE;
  const outlineOp = interpolate(frame, [0, 6], [0, 1], CLAMP);
  const rails = interpolate(frame, [COLLAPSE - 8, COLLAPSE + 16], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });

  // ---- the circle's whole life, as one value set ----
  const toSolid = interpolate(frame, [s1 - 6, s1 + 4], [0, 1], CLAMP);
  const grow = interpolate(frame, [s1 - 6, s1 + VENN_IN], [1, 1.12], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const vennIn = interpolate(frame, [s1, s1 + VENN_IN], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const vennDrift = interpolate(frame, [s1 + VENN_IN, s2], [0, 0.06], CLAMP);
  const vennOut = interpolate(frame, [s2 - VENN_OUT, s2 + 2], [0, 1], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });
  const circleOn = frame < s2 + 2;
  const r = R0 * (frame < COLLAPSE ? scale1 * 1.03 : 1) * grow;
  const circumference = 2 * Math.PI * r;
  // Dashes "close" by growing each dash to the full circumference.
  const dashOn = interpolate(toSolid, [0, 1], [14 * (r / R0), circumference], CLAMP);
  const dashOff = interpolate(toSolid, [0, 1], [10 * (r / R0), 0], CLAMP);
  const rotation = frame * 0.45;
  const sideX = r * (0.78 + vennDrift) * vennIn + vennOut * width * 0.7;
  const centreOp = 1 - vennOut;
  const circleOp = interpolate(frame, [0, 6], [0, 1], CLAMP);

  // ---- per-word letter opacity ----
  const wordOpacity = (w: number): ((i: number, n: number) => number) => {
    const start = starts[w];
    const end = start + framesPerWord[w];
    return (i, n) => {
      if (frame < start - SWEEP || frame >= end + SWEEP) return 0;
      let inOp = 1;
      if (w === 0) inOp = filled ? 1 : 0;        // the hard fill
      else if (w === 1) inOp = frame >= start ? 1 : 0; // the hard cut
      else {
        // mirrored crossfade: arrive right-to-left dim, brighten left-to-right
        const arrive = interpolate(frame, [start - SWEEP, start], [0, 1], CLAMP);
        const dimIn = letterSweep(arrive, n - 1 - i, n);
        const bright = letterSweep(
          interpolate(frame, [start, start + 12], [0, 1], CLAMP),
          i,
          n,
          4,
        );
        inOp = dimIn * (0.45 + 0.55 * bright);
      }
      let outOp = 1;
      if (w < last) {
        if (w + 1 === 1) outOp = frame >= end ? 0 : 1; // cut, not a fade
        else
          outOp =
            1 -
            letterSweep(
              interpolate(frame, [end - SWEEP, end], [0, 1], CLAMP),
              i,
              n,
            );
      }
      return inOp * outOp;
    };
  };

  // `total` is the frame AFTER the last one rendered, so the exit has to
  // finish at `total - 1` or the line hard-cuts while it is still visible
  // (with exitLen 10 and an ease-in, it was cutting at 19% opacity).
  const total = starts[last] + framesPerWord[last];
  const exit = interpolate(frame, [total - exitLen, total - 1], [0, 1], {
    ...CLAMP,
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* Sound, if you score it (see the video-audio-stack skill): a morph
          swoosh under the collapse at 0, a UI switch ON the hard fill at
          COLLAPSE, a wider whoosh as the Venn spawns at starts[1], a tight
          whoosh as it leaves at starts[2] - VENN_OUT, then a soft switch per
          later word. Mount the cues in the caller, not in here. */}
      {circleOn && (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, opacity: circleOp }}
        >
          {/* The centre circle: dashed and turning while it collapses, solid
              after. One <circle> for the whole film, never a new one. */}
          <g
            transform={`rotate(${rotation * (1 - toSolid)} ${cx} ${cy})`}
            opacity={centreOp}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={line}
              strokeWidth={1.5}
              strokeDasharray={`${dashOn} ${dashOff}`}
            />
          </g>
          {/* Rails running out of the resting circle to both frame edges. */}
          {frame < s1 && (
            <>
              <line
                x1={cx - r - 30}
                y1={cy}
                x2={cx - r - 30 - rails * (cx - r)}
                y2={cy}
                stroke={lineFaint}
                strokeWidth={1.5}
                strokeDasharray="14 10"
              />
              <line
                x1={cx + r + 30}
                y1={cy}
                x2={cx + r + 30 + rails * (cx - r)}
                y2={cy}
                stroke={lineFaint}
                strokeWidth={1.5}
                strokeDasharray="14 10"
              />
            </>
          )}
          {/* The siblings slide OUT of the centre circle, then off the sides. */}
          {frame >= s1 &&
            [-1, 1].map((k) => (
              <circle
                key={k}
                cx={cx + k * sideX}
                cy={cy}
                r={r}
                fill="none"
                stroke={lineFaint}
                strokeWidth={1.5}
                opacity={vennIn}
              />
            ))}
        </svg>
      )}

      {/* Word 0's giant outline, collapsing in lockstep with the circle.
          The scale(4.4) needs its OWN composition-sized overflow:hidden
          viewport: a scaled absolute element keeps its layout box but grows
          its VISUAL box, and that overflow leaks into the body and shifts
          every absolute sibling. AbsoluteFill does not set overflow itself. */}
      {!filled && (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              // The outline is a hairline on a coloured ground. At the dark
              // edition's stroke alpha 0.55 reads correctly; on white the
              // same multiplier leaves the word fainter than the circle
              // beside it, so the light edition carries more of it.
              opacity: outlineOp * (light ? 0.85 : 0.55),
            }}
          >
            <div
              style={{ transform: `scale(${scale1})`, whiteSpace: "nowrap" }}
            >
              <LetterLine
                text={words[0]}
                fontSize={size}
                fontFamily={fontFamily}
                outline
                outlineColor={line}
                opacityAt={() => 1}
              />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {words.map((w, idx) => (
        <AbsoluteFill
          key={idx}
          style={{
            alignItems: "center",
            justifyContent: "center",
            // the last word scales up on its exit: same reason as above
            overflow: "hidden",
          }}
        >
          <div style={idx === last ? { filter: `blur(${exit * 6}px)` } : undefined}>
            <LetterLine
              text={w}
              fontSize={size}
              fontFamily={fontFamily}
              color={ink}
              opacityAt={wordOpacity(idx)}
              lineOpacity={idx === last ? 1 - exit : 1}
              scale={idx === last ? 1 + exit * 0.08 : 1}
            />
          </div>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
