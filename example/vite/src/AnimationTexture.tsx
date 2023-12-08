import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useAnimationTexture } from "animation-texture";

interface Props {
  url: string;
  position: THREE.Vector3;
}

export function AnimationTexture({ url, position }: Props) {
  const { animationTexture } = useAnimationTexture({ url });
  const meshRef =
    useRef<
      THREE.Mesh<
        THREE.BufferGeometry<THREE.NormalBufferAttributes>,
        THREE.MeshPhongMaterial,
        THREE.Object3DEventMap
      >
    >();

  useEffect(() => {
    if (meshRef.current && animationTexture) {
      meshRef.current.material.map = animationTexture;
      meshRef.current.material.needsUpdate = true;
    }
  }, [animationTexture]);

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1, 1, 1]} />
      <meshPhongMaterial transparent side={THREE.FrontSide} color={"white"} />
    </mesh>
  );
}
