import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera as PerspectiveCameraComponent,
} from "@react-three/drei";
import * as THREE from "three";
import { AnimationTexture } from "./AnimationTexture";
import { preLoad } from "animation-texture";

export default function App() {
  const framePngUrl = "/frame.png";
  const framesPngUrl = "/frames.png";
  const frameGifUrl = "/frame.gif";
  const framesGifUrl = "/frames.gif";
  preLoad(framePngUrl);
  preLoad(framesPngUrl);
  preLoad(frameGifUrl);
  preLoad(framesGifUrl);

  return (
    <>
      <Suspense fallback={null}>
        <Canvas
          style={{ position: "absolute" }}
          camera={{ position: [-5, 2, 10], fov: 60 }}
          flat={false}
        >
          <PerspectiveCameraComponent
            makeDefault
            position={new THREE.Vector3(0, 0, 4)}
          />
          <OrbitControls makeDefault maxDistance={20} minDistance={0.5} />
          <ambientLight intensity={2} />
          <Suspense fallback={null}>
            <AnimationTexture
              url={framePngUrl}
              position={new THREE.Vector3(0, 0, 0)}
            />
            <AnimationTexture
              url={framesPngUrl}
              position={new THREE.Vector3(1, 0, 0)}
            />
            <AnimationTexture
              url={frameGifUrl}
              position={new THREE.Vector3(0, 1, 0)}
            />
            <AnimationTexture
              url={framesGifUrl}
              position={new THREE.Vector3(1, 1, 0)}
            />
          </Suspense>
          <gridHelper
            rotation={[0, 0, 0]}
            args={[30, 30, 0xc7cdd9, 0xc7cdd9]}
          />
        </Canvas>
      </Suspense>
    </>
  );
}
