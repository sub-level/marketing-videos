/**
 * Projecting a DOM layer onto the 3D device's screen.
 *
 * REFERENCE IMPLEMENTATION. Copy it into your video folder.
 *
 * When you want crisp DOM on the device (an app dock, a QR code, a label that
 * belongs to the UI) instead of baking it into the recording, you need to know
 * exactly where the screen's rectangle lands in frame pixels.
 *
 * It is exact ONLY when the device is flat to the camera (no yaw, no pitch)
 * and the camera looks straight down -z. Any rotation and you must render the
 * layer into the screen TEXTURE instead.
 *
 * Derivation: a perspective camera at distance d with vertical field of view f
 * shows a world height of 2 * d * tan(f/2) across `height` pixels. So one world
 * unit is S = (height / 2) / (d * tan(f / 2)) pixels, and a world point maps to
 *
 *     px = width  / 2 + (x - camX) * S
 *     py = height / 2 - (y - camY) * S      (y is up in world, down in CSS)
 *
 * MEASURE your model's screen rectangle once, in world units at the group
 * scale you render at, and keep the numbers in a comment. One real phone at
 * group scale 0.91:
 *
 *     body    x +-1.39, y +-2.873
 *     screen  x +-1.296, y +-2.79, corner radius ~0.2
 */
export type ScreenRect = {
  /** Half-width of the screen in world units. */
  halfWidth: number;
  /** Top and bottom edge of the screen in world units (device-local). */
  top: number;
  bottom: number;
};

export function projectScreen({
  frame,
  camera,
  device,
  screen,
  fov = 35,
}: {
  frame: { width: number; height: number };
  camera: { x: number; y: number; z: number };
  device: { x: number; y: number };
  screen: ScreenRect;
  fov?: number;
}) {
  const S =
    frame.height / 2 / (camera.z * Math.tan((fov / 2) * (Math.PI / 180)));
  const px = (x: number) => frame.width / 2 + (x - camera.x) * S;
  const py = (y: number) => frame.height / 2 - (y - camera.y) * S;

  const left = px(device.x - screen.halfWidth);
  const right = px(device.x + screen.halfWidth);
  const top = py(device.y + screen.top);
  const bottom = py(device.y + screen.bottom);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    /** Pixels per world unit. Use it to scale anything measured on the model. */
    unit: S,
    /**
     * Texture-pixel to frame-pixel scale, if your layer is authored at the
     * recording's resolution: multiply by this and it lines up exactly.
     */
    textureScale: (textureWidth: number) => (right - left) / textureWidth,
  };
}

/**
 * Blend the projected layer `lighten` over the canvas so the model's cover
 * glass still reflects across it. A plain opaque div on top looks pasted on;
 * the reflections are what sell it as being ON the glass.
 *
 *   style={{ position: "absolute", left, top, width, height,
 *            mixBlendMode: "lighten" }}
 */
