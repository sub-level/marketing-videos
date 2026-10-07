/**
 * DeviceModel: the GLB half of the device stage. DeviceStage.tsx imports this.
 *
 * REFERENCE IMPLEMENTATION. Not compiled by this repo's tsconfig (which only
 * includes `src`). Copy it next to DeviceStage.tsx and point MODEL at your own
 * GLB. Same version-pinning rules as DeviceStage.
 *
 * This file is where the two materials that decide whether the shot works
 * live. Both of them are counter-intuitive, and both of them fail by looking
 * PLAUSIBLE rather than broken:
 *
 *   SCREEN  a raw-passthrough ShaderMaterial with toneMapped: false. The
 *           renderer runs ACES filmic tone mapping, which it must for the body
 *           and the glass to look like hardware, and ACES would otherwise
 *           grade the UI inside your recording. Tagging the texture sRGB and
 *           re-encoding in the shader instead looks right for a still on a
 *           desktop GPU and DOUBLES the encode on iOS Safari, where a video
 *           texture is sampled raw: the whole screen washes out.
 *
 *   GLASS   additive over black, never a translucent dark film. A dark
 *           transparent plane over the screen is a grey veil on every UI
 *           pixel, and a transmission pass re-samples the screen through that
 *           tint on top of it.
 *
 * Your GLB's material names will differ. Open it once (three.js editor, Blender,
 * or log `scene.traverse`) and map the names in MATERIAL_FOR below.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { staticFile } from "remotion";
import {
  AdditiveBlending,
  Mesh,
  MeshPhysicalMaterial,
  ShaderMaterial,
  type Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL = staticFile("device/phone.glb");

/** Map YOUR GLB's material names onto the three roles this file knows about. */
const MATERIAL_FOR: Record<string, "screen" | "glass" | "body"> = {
  screen: "screen",
  cover_glass: "glass",
  body: "body",
  frame: "body",
};

type Props = {
  /** Fires once the model is in the scene. MEMOIZE IT: it is an effect dep. */
  onLoaded: () => void;
  /** Fires if the GLB cannot load, so the caller can release its delayRender. */
  onFailure: () => void;
  /** null leaves the screen black (before the first clip, or in a cold still). */
  screenTexture: Texture | null;
};

/**
 * Raw passthrough. The entire point is that nothing happens to the pixels
 * between the texture and the framebuffer.
 */
function makeScreenMaterial() {
  return new ShaderMaterial({
    uniforms: { videoMap: { value: null } },
    vertexShader: `
      varying vec2 vScreenUv;
      void main() {
        vScreenUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D videoMap;
      varying vec2 vScreenUv;
      void main() {
        gl_FragColor = texture2D(videoMap, vScreenUv);
      }
    `,
    toneMapped: false,
  });
}

/**
 * Additive over black: it can only ADD its reflections and clearcoat
 * highlights, never subtract light from the screen underneath. Those moving
 * highlights are most of what sells the device as a real object, so keep
 * clearcoat at 1 and envMapIntensity high.
 */
function makeGlassMaterial() {
  return new MeshPhysicalMaterial({
    color: "#000000",
    transparent: true,
    opacity: 0.24,
    blending: AdditiveBlending,
    depthWrite: false,
    roughness: 0.035,
    thickness: 0.055,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    envMapIntensity: 2.2,
  });
}

export const DeviceModel: React.FC<Props> = ({
  onLoaded,
  onFailure,
  screenTexture,
}) => {
  const gltf = useLoader(GLTFLoader, MODEL);
  const [failed, setFailed] = useState(false);

  const screenMaterial = useMemo(makeScreenMaterial, []);
  const glassMaterial = useMemo(makeGlassMaterial, []);
  useEffect(
    () => () => {
      screenMaterial.dispose();
      glassMaterial.dispose();
    },
    [screenMaterial, glassMaterial],
  );

  // Swap the GLB's own materials for ours, once per loaded model.
  const scene = gltf.scene;
  useEffect(() => {
    try {
      scene.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        const name = (node.material?.name || node.name || "").toLowerCase();
        const role = MATERIAL_FOR[name];
        if (role === "screen") node.material = screenMaterial;
        if (role === "glass") node.material = glassMaterial;
        // "body" keeps whatever the GLB ships; that is usually the right call.
      });
    } catch {
      setFailed(true);
    }
  }, [scene, screenMaterial, glassMaterial]);

  // Bind the screen texture. Keyed on BOTH the material and the texture, so a
  // texture that arrives after the model still lands.
  useEffect(() => {
    screenMaterial.uniforms.videoMap.value = screenTexture;
    screenMaterial.needsUpdate = true;
  }, [screenMaterial, screenTexture]);

  /**
   * Report loaded from an effect, AFTER the binding effects above have run in
   * this same commit. Calling onLoaded during render (or from the loader's own
   * callback) reports ready while the screen material still has a null
   * uniform: a video frame would self-heal on the next frame, a still never
   * does, and you ship a black screen.
   */
  const report = useCallback(() => {
    if (failed) onFailure();
    else onLoaded();
  }, [failed, onLoaded, onFailure]);
  useEffect(() => {
    report();
  }, [report]);

  return <primitive object={scene} />;
};
