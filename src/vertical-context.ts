import React from "react";

/**
 * True while a scene is being rendered through the 9:16 portrait wrapper.
 * Scenes read this to reposition corner elements and tighten widths so the
 * portrait edition renders natively (never scale-and-crop).
 *
 * Lives in its OWN file on purpose: scenes import it, and the vertical
 * wrapper imports the composition that pulls those scenes in — defining the
 * context inside the wrapper would create a
 * `scenes -> Wrapper -> Video -> scenes` cycle that leaves the context
 * undefined at module evaluation and renders the studio as a white screen.
 */
export const VerticalLayoutContext = React.createContext<boolean>(false);
