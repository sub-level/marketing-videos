import React from "react";
import { AbsoluteFill } from "remotion";
import { DustField } from "../../lib/DustField";
import { useLight } from "../../theme-context";
import { DARK, LIGHT } from "../tokens";

/**
 * The persistent world under every scene. Dark scenes get the living dust
 * field; light scenes get plain white, because dust on white reads as dirt.
 *
 * One component owning the ground is what keeps the editions honest: no scene
 * paints its own background, so no scene can disagree with the edition.
 */
export const Ground: React.FC<{ seed: string; dust?: number }> = ({
  seed,
  dust = 70,
}) => {
  const light = useLight();
  if (light) return <AbsoluteFill style={{ background: LIGHT.bg }} />;
  return (
    <>
      <AbsoluteFill style={{ background: DARK.bg }} />
      <DustField seed={seed} count={dust} />
    </>
  );
};
