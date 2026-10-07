import React from "react";
import { AbsoluteFill } from "remotion";
import { GeometryWords } from "../../lib/GeometryWords";
import { Ground } from "../components/Ground";
import { useLight } from "../../theme-context";
import { FONT, palette, WORDS, WORD_FRAMES } from "../tokens";

/**
 * Five words, one piece of geometry. All of the choreography lives in
 * `lib/GeometryWords.tsx`; a scene's job is casting and pace, not mechanics.
 *
 * If you only steal one thing from this repo, steal the rule this scene
 * exists to demonstrate: the circle is born once and lives through every
 * word. Cutting to fresh geometry per word is what makes a sequence read as
 * slides.
 */
export const WordsScene: React.FC = () => {
  const C = palette(useLight());
  return (
    <AbsoluteFill>
      <Ground seed="words" />
      <GeometryWords
        words={WORDS}
        framesPerWord={WORD_FRAMES}
        fontFamily={FONT.family}
        colors={{ ink: C.ink, line: C.line, lineFaint: C.lineFaint }}
      />
    </AbsoluteFill>
  );
};
