<h1 align="center">AnimationTexture ⚡ Welcome 😀</h1>

<p align="left">
  <a href="https://github.com/actions/setup-node"><img alt="GitHub Actions status" src="https://github.com/activeguild/AnimationTexture/workflows/automatic%20release/badge.svg" style="max-width:100%;"></a>
</p>

# AnimationTexture

A library supports image animation using `react-three-fiber`. The target files are `APNG` files. <br/>
Support is also planned for `GIF` files, etc.

## Install

```bash
npm i -D AnimationTexture
```

## Usage

```ts
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAnimationTexture } from "./useAnimationTexture";

interface Props {
  url: string;
}

export function Model({ url }: Props) {
  const { currentCanvasTexture } = useAnimationTexture({ url });
  const meshRef =
    useRef<
      THREE.Mesh<
        THREE.BufferGeometry<THREE.NormalBufferAttributes>,
        THREE.MeshPhongMaterial,
        THREE.Object3DEventMap
      >
    >();

  useFrame(() => {
    if (meshRef.current && currentCanvasTexture) {
      meshRef.current.material.map = currentCanvasTexture;
      meshRef.current.material.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={new THREE.Vector3(0, 0, 0)}>
      <planeGeometry args={[1, 1, 1]} />
      <meshPhongMaterial transparent side={THREE.FrontSide} />
    </mesh>
  );
}
```


#### Pre-load if necessary.
```ts
import React from "react";
import * as THREE from "three";
import { preLoad } from "./useAnimationTexture";

export default function App() {
  preLoad('/sample.png');
  return ...
}

```

## Principles of conduct

Please see [the principles of conduct](https://github.com/activeguild/AnimationTexture/blob/main/.github/CONTRIBUTING.md) when building a site.

## License

This library is licensed under the [MIT license](https://github.com/activeguild/AnimationTexture/blob/main/LICENSE).
