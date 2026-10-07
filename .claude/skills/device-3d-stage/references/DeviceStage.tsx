/**
 * DeviceStage: a real 3D device inside a Remotion composition, with product
 * recordings playing on its screen.
 *
 * REFERENCE IMPLEMENTATION. Not compiled by this repo's tsconfig (which only
 * includes `src`). Copy it into `src/<video>/device/` and install:
 *
 *   npm i @remotion/three@<v> @remotion/media@<v> @react-three/fiber three
 *   npm i -D @types/three
 *
 * where <v> EQUALS the `remotion` version already in package.json. Those
 * packages pin remotion as an exact peer, so an unpinned install resolves the
 * latest and npm nests a SECOND copy of remotion under them. Two copies means
 * two useCurrentFrame contexts: the ThreeCanvas subtree reads the wrong one
 * and the stage renders empty, with nothing in the output naming versions.
 *
 * You supply:
 *   - public/device/phone.glb      a model whose screen is its own material
 *   - public/<video>/clips/*.mp4   the product recordings
 *   - DeviceModel.tsx              shipped beside this file; point its MODEL
 *                                  constant at your GLB and map your own
 *                                  material names. Its contract is below.
 *
 * DEVICEMODEL'S CONTRACT (get this wrong and the screen is subtly graded or
 * dimmed, which is worse than broken because it still looks plausible):
 *
 *   SCREEN mesh gets its OWN ShaderMaterial with `toneMapped: false`, whose
 *   whole fragment shader is a raw passthrough:
 *
 *     new ShaderMaterial({
 *       uniforms: { videoMap: { value: null } },
 *       vertexShader: `varying vec2 vScreenUv;
 *         void main() { vScreenUv = uv;
 *           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
 *       fragmentShader: `uniform sampler2D videoMap; varying vec2 vScreenUv;
 *         void main() { gl_FragColor = texture2D(videoMap, vScreenUv); }`,
 *       toneMapped: false,
 *     })
 *
 *   The renderer is on ACES filmic tone mapping for the body and the glass.
 *   Any stock material lets ACES grade the UI inside the recording. Tagging
 *   the texture sRGB and re-encoding here instead looks right for a still on
 *   a desktop GPU and DOUBLES the encode on iOS Safari, where a video texture
 *   is sampled raw: the whole screen washes out.
 *
 *   GLASS mesh is additive over black, never a translucent dark film:
 *     blending: AdditiveBlending, color: "#000", opacity ~0.24,
 *     depthWrite: false, clearcoat: 1, envMapIntensity ~2.2
 *   so it only ADDS reflections and the screen underneath stays pixel-true.
 *
 *   Bind the texture from an effect keyed on BOTH the loaded model and the
 *   texture: `material.uniforms.videoMap.value = screenTexture`, then
 *   `material.needsUpdate = true`.
 *
 * Render with --gl=angle or the canvas comes out blank.
 *
 * Every non-obvious line below is a bug someone already shipped. Read the
 * comments before you simplify anything.
 */
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useThree } from "@react-three/fiber";
import { Video } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import {
  Sequence,
  useCurrentFrame,
  useDelayRender,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  NoColorSpace,
  PMREMGenerator,
  type PerspectiveCamera,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DeviceModel } from "./DeviceModel"; // your GLTF component

/** The screen recording's native pixel size. The texture is drawn at this. */
const TEX = { width: 720, height: 1558 };

export type Vec3 = readonly [number, number, number];
export type CameraPose = { position: Vec3; lookAt: Vec3; fov?: number };
export type DevicePose = { position: Vec3; rotation: Vec3; scale?: number };

export type ScreenSegment = {
  src: string;
  /** Stage-local frame this clip starts showing. */
  from: number;
  durationInFrames: number;
  /** Frames to skip at the head of the source clip. */
  trimBefore?: number;
  playbackRate?: number;
};

type Props = {
  segments: ScreenSegment[];
  /** A PNG drawn on the screen once, for stills. `segments` may be empty. */
  still?: string;
  camera: (frame: number) => CameraPose;
  device: (frame: number) => DevicePose;
  exposure?: number;
};

/**
 * An image-based lighting environment. A device model without one looks like
 * untextured plastic: the highlights rolling across the glass ARE the shot.
 */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  React.useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    scene.environment = target.texture;
    return () => {
      scene.environment = previous;
      target.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);
  return null;
}

/**
 * GOTCHA 2. Sets the camera for the current frame BEFORE ThreeCanvas's manual
 * frame renderer advances. That renderer runs from a PASSIVE effect, so a
 * passive camera update lands one frame late and every push-in is off by one.
 * A layout effect always runs first.
 */
function CameraRig({ pose }: { pose: CameraPose }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const [px, py, pz] = pose.position;
  const [lx, ly, lz] = pose.lookAt;
  const fov = pose.fov ?? 35;
  useLayoutEffect(() => {
    camera.position.set(px, py, pz);
    camera.lookAt(lx, ly, lz);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, px, py, pz, lx, ly, lz, fov]);
  return null;
}

function Screen({
  segments,
  still,
}: {
  segments: ScreenSegment[];
  still?: string;
}) {
  const frame = useCurrentFrame();
  const { invalidate, advance } = useThree();
  const { isRendering } = useRemotionEnvironment();
  const { delayRender, continueRender } = useDelayRender();

  // GOTCHA 4. Hold the render open until the model is on screen.
  const [loadHandle] = useState(() => delayRender("Loading the device model"));

  const [surface] = useState(() => {
    const canvas = new OffscreenCanvas(TEX.width, TEX.height);
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#000";
    context.fillRect(0, 0, TEX.width, TEX.height);
    const texture = new CanvasTexture(canvas);
    // Raw passthrough: anything else double-applies a transfer curve and the
    // UI greys in the recording come out wrong.
    texture.colorSpace = NoColorSpace;
    return { canvas, context, texture };
  });

  /**
   * GOTCHA 3. While RENDERING, drive the scene forward yourself with
   * `advance`. `invalidate` only schedules a re-render, and at concurrency > 1
   * that hands you a stale frame from another worker's state.
   */
  const onVideoFrame = useCallback(
    (f: CanvasImageSource) => {
      surface.context.drawImage(f, 0, 0, TEX.width, TEX.height);
      surface.texture.needsUpdate = true;
      if (isRendering) advance(performance.now());
      else invalidate();
    },
    [surface, isRendering, advance, invalidate],
  );

  // A still screen: decode the PNG once, paint it, re-render.
  const [stillHandle] = useState(() =>
    still ? delayRender("Loading the screen still") : null,
  );
  React.useEffect(() => {
    if (!still || stillHandle === null) return;
    const img = new Image();
    img.onload = () => {
      surface.context.drawImage(img, 0, 0, TEX.width, TEX.height);
      surface.texture.needsUpdate = true;
      if (isRendering) advance(performance.now());
      else invalidate();
      continueRender(stillHandle);
    };
    img.onerror = () => continueRender(stillHandle);
    img.src = still;
  }, [still, stillHandle, surface, isRendering, advance, invalidate, continueRender]);

  /**
   * GOTCHA 6. DeviceModel reports loaded in the same tick it sets its own
   * state, BEFORE React commits the effect that binds this texture to the
   * screen material. Advancing right there draws an untextured screen; video
   * frames self-heal on the next frame, a still never does. So the load flips
   * state, and the advance runs from THIS component's effect, which React runs
   * after the child's binding effect in the same commit.
   *
   * GOTCHA 5. Both callbacks are memoized: they are effect deps inside
   * DeviceModel and a fresh identity reloads the GLB every single frame.
   */
  const [loaded, setLoaded] = useState(false);
  const onLoaded = useCallback(() => setLoaded(true), []);
  const onFailure = useCallback(
    () => continueRender(loadHandle),
    [continueRender, loadHandle],
  );
  React.useEffect(() => {
    if (!loaded) return;
    if (isRendering) advance(performance.now());
    else invalidate();
    continueRender(loadHandle);
  }, [loaded, isRendering, advance, invalidate, continueRender, loadHandle]);

  // Between segments the screen keeps the last drawn frame, which is what a
  // real device does at a cut. Before the first segment it is black.
  const active = segments.some(
    (s) => frame >= s.from && frame < s.from + s.durationInFrames,
  );

  return (
    <>
      <DeviceModel
        onLoaded={onLoaded}
        onFailure={onFailure}
        screenTexture={active || still || frame > 0 ? surface.texture : null}
      />
      {segments.map((s, i) => (
        <Sequence
          key={i}
          layout="none"
          from={s.from}
          durationInFrames={s.durationInFrames}
        >
          {/*
            GOTCHA 7. `trimBefore` must land AFTER any hard cut inside the
            source recording. Trim 0.2s before one and the outgoing shot
            flashes for five frames, which reads as a lag hiccup rather than
            an edit. Re-measure when the recordings are re-cut.

            `headless` = decode only, never mount a visible <video>.
          */}
          <Video
            src={s.src}
            trimBefore={s.trimBefore}
            playbackRate={s.playbackRate}
            onVideoFrame={onVideoFrame}
            muted
            headless
          />
        </Sequence>
      ))}
    </>
  );
}

export const DeviceStage: React.FC<Props> = ({
  segments,
  still,
  camera,
  device,
  exposure = 0.9,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = useMemo(() => camera(frame), [camera, frame]);
  const pose = useMemo(() => device(frame), [device, frame]);

  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0.1, 10], fov: 35 }}
      dpr={1}
      gl={{ alpha: true, antialias: true, toneMapping: ACESFilmicToneMapping }}
      onCreated={(state) => {
        // Transparent clear colour: the composition's own ground shows
        // through, so the device can sit on any edition's background.
        state.gl.setClearColor(0x000000, 0);
        state.gl.toneMappingExposure = exposure;
      }}
    >
      <StudioEnvironment />
      {/* A key, a warm fill from the opposite side, and a soft bounce from
          below. Tune the colours to your brand's product photography. */}
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#fff8ef", "#5b2d1d", 1.7]} />
      <directionalLight position={[4.5, 5.5, 6]} color="#fff8ef" intensity={4.2} />
      <directionalLight position={[-4, 1, 3]} color="#ff8a55" intensity={2.75} />
      <directionalLight position={[0, -3.5, 4]} color="#ffe1cc" intensity={0.7} />
      <CameraRig pose={cam} />
      <group
        position={[pose.position[0], pose.position[1], pose.position[2]]}
        rotation={[pose.rotation[0], pose.rotation[1], pose.rotation[2]]}
        scale={pose.scale ?? 1}
      >
        <Screen segments={segments} still={still} />
      </group>
    </ThreeCanvas>
  );
};
