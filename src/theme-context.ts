import React from "react";

/**
 * Theme editions. A film that ships a dark cut AND a light cut is not two
 * films: it is one scene tree read under a different context value, the same
 * way the portrait edition is one scene tree under
 * `VerticalLayoutContext` (see vertical-context.ts).
 *
 * Lives in its OWN file for the same reason that one does: scenes import it,
 * and the edition wrappers import the composition that pulls those scenes in.
 * Defining the context inside a wrapper creates a
 * `scenes -> Wrapper -> Video -> scenes` cycle that leaves the context
 * undefined at module evaluation and renders the studio as a white screen.
 *
 * Three editions from one tree, which is how a launch film feeds an App Store
 * set, a dark social post and a light press kit without a re-edit:
 *
 *   dark   every scene dark
 *   light  every scene light
 *   mixed  per-scene, alternating the way an App Store screenshot set does
 *
 * Crossed with 16:9 / 9:16 that is six deliverables from one `SCENE` table.
 */
export type Theme = "dark" | "light" | "mixed";

/** True while a scene is rendering on a light ground. */
export const ThemeContext = React.createContext<boolean>(false);

export const useLight = () => React.useContext(ThemeContext);

/**
 * Default ink for the current edition. Primitives in `lib/` call this so a
 * scene can drop a typed line onto either ground without passing colors
 * around; pass an explicit `color` to override.
 */
export const useInk = () => (useLight() ? "#0A0A0A" : "#FFFFFF");

/**
 * Per-scene light flags for each edition. A `mixed` film declares its
 * alternation ONCE, here, instead of scattering `theme === "mixed" && ...`
 * checks through the scenes.
 *
 *   const LIGHT = sceneThemes(["opener", "words", "close"], {
 *     mixed: { opener: true, words: true, close: false },
 *   });
 */
export function sceneThemes<K extends string>(
  scenes: readonly K[],
  overrides: { mixed: Record<K, boolean> },
): Record<Theme, Record<K, boolean>> {
  const all = (value: boolean) =>
    Object.fromEntries(scenes.map((s) => [s, value])) as Record<K, boolean>;
  return {
    dark: all(false),
    light: all(true),
    mixed: overrides.mixed,
  };
}
