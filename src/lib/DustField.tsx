import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Dust motes in a dark frame: the texture that keeps a black background from
 * reading as a dead PowerPoint slide.
 *
 * The note that matters: a field of points on a linear drift with a sine
 * twinkle reads as a STAR FIELD, which is a different thing and looks cheap.
 * Dust feels alive because every mote has its own movement pattern, not a
 * phase offset into a shared one. So each mote here gets:
 *
 *   - its own depth (0 far .. 1 near), skewed so most are far. Depth drives
 *     size, blur, glow and how far it travels. Near motes are big, soft and
 *     roam; far motes are pinpoints that barely move.
 *   - a path summed from TWO sine pairs with its own frequencies, phases and
 *     amplitudes, plus a slow personal drift, so no two paths rhyme.
 *   - its own opacity breathing period.
 *
 * Seeded through Remotion's `random()`, so every render and every still is
 * identical. A field that re-randomizes per frame strobes.
 *
 * Verify it by compositing three frames a second apart into the R, G and B
 * channels of one image: each mote should trail in its own direction. If the
 * trails are parallel, you built a star field again.
 */
type Mote = {
  x: number;
  y: number;
  depth: number;
  size: number;
  alpha: number;
  a1: number; a2: number; b1: number; b2: number; // amplitudes, px
  w1: number; w2: number; v1: number; v2: number; // angular speeds, rad/frame
  p1: number; p2: number; q1: number; q2: number; // phases
  dx: number; dy: number;                          // personal drift, px/frame
  breath: number; breathPhase: number;
};

function makeMotes(
  count: number,
  seed: string,
  width: number,
  height: number,
  fps: number,
): Mote[] {
  const r = (k: string) => random(`${seed}-${k}`);
  const out: Mote[] = [];
  for (let i = 0; i < count; i++) {
    const depth = Math.pow(r(`d${i}`), 1.6); // most motes are far away
    // Periods between 6 and 22 seconds: slower than the eye tracks, fast
    // enough that the field is never static.
    const period = (s: number) => (Math.PI * 2) / (fps * (6 + s * 16));
    out.push({
      x: r(`x${i}`) * width,
      y: r(`y${i}`) * height,
      depth,
      size: 1.2 + depth * 5.5 + r(`s${i}`) * 1.2,
      alpha: 0.18 + r(`a${i}`) * 0.42,
      a1: (10 + r(`a1${i}`) * 40) * (0.4 + depth),
      a2: (4 + r(`a2${i}`) * 16) * (0.4 + depth),
      b1: (10 + r(`b1${i}`) * 40) * (0.4 + depth),
      b2: (4 + r(`b2${i}`) * 16) * (0.4 + depth),
      w1: period(r(`w1${i}`)),
      w2: period(r(`w2${i}`)) * 2.3,
      v1: period(r(`v1${i}`)),
      v2: period(r(`v2${i}`)) * 1.9,
      p1: r(`p1${i}`) * Math.PI * 2,
      p2: r(`p2${i}`) * Math.PI * 2,
      q1: r(`q1${i}`) * Math.PI * 2,
      q2: r(`q2${i}`) * Math.PI * 2,
      dx: (r(`dx${i}`) - 0.5) * 0.12 * (0.5 + depth),
      dy: (r(`dy${i}`) - 0.5) * 0.08 * (0.5 + depth) - 0.02,
      breath: period(r(`br${i}`)) * 1.5,
      breathPhase: r(`bp${i}`) * Math.PI * 2,
    });
  }
  return out;
}

export const DustField: React.FC<{
  count?: number;
  /** Any string. Different seeds give different fields; the same seed is stable. */
  seed?: string;
  opacity?: number;
  /** SIX-DIGIT HEX only: the near motes' glow appends an alpha suffix to it. */
  color?: string;
}> = ({ count = 70, seed = "dust", opacity = 1, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const motes = React.useMemo(
    () => makeMotes(count, seed, width, height, fps),
    [count, seed, width, height, fps],
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, overflow: "hidden" }}>
      {motes.map((m, i) => {
        const wx =
          m.a1 * Math.sin(m.w1 * frame + m.p1) +
          m.a2 * Math.sin(m.w2 * frame + m.p2);
        const wy =
          m.b1 * Math.sin(m.v1 * frame + m.q1) +
          m.b2 * Math.cos(m.v2 * frame + m.q2);
        // Wrap rather than clamp, so a mote that leaves re-enters elsewhere
        // and the field never thins out over a long cut.
        const x = (((m.x + wx + m.dx * frame) % width) + width) % width;
        const y = (((m.y + wy + m.dy * frame) % height) + height) % height;
        const breath = 0.7 + 0.3 * Math.sin(m.breath * frame + m.breathPhase);
        const blur = 0.2 + m.depth * 1.6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: m.size,
              height: m.size,
              marginLeft: -m.size / 2,
              marginTop: -m.size / 2,
              borderRadius: 999,
              background: color,
              opacity: m.alpha * breath,
              filter: `blur(${blur}px)`,
              boxShadow:
                m.depth > 0.55
                  ? // 59 is hex alpha 0.35, which is why `color` must be
                    // six-digit hex. A named colour or rgba() here produces
                    // invalid CSS and the glow silently disappears.
                    `0 0 ${m.size * 1.5}px ${color}59`
                  : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
