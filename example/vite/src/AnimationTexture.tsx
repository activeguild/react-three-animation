import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useAnimationTexture } from "animation-texture";

interface Props {
  url: string;
  position: THREE.Vector3;
  isPlaying?: boolean;
}

export function AnimationTexture({ url, position, isPlaying = true }: Props) {
  const { animationTexture } = useAnimationTexture({
    url,
  });
  const meshRef =
    useRef<
      THREE.Mesh<
        THREE.BufferGeometry<THREE.NormalBufferAttributes>,
        THREE.MeshPhongMaterial,
        THREE.Object3DEventMap
      >
    >(null);

  useEffect(() => {
    if (meshRef.current && animationTexture) {
      meshRef.current.material.map = animationTexture;
      meshRef.current.material.needsUpdate = true;
    }
  }, [animationTexture]);

  useEffect(() => {
    if (!animationTexture) {
      return;
    }

    if (isPlaying) {
      animationTexture.animate();
    } else {
      animationTexture.pause();
    }
  }, [animationTexture, isPlaying]);

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent side={THREE.FrontSide} />
    </mesh>
  );
}
