<h1 align="center">react-three-animation ⚡ Welcome 😀</h1>

<p align="left">
  <a href="https://github.com/actions/setup-node"><img alt="GitHub Actions status" src="https://github.com/activeguild/react-three-animation/workflows/automatic%20release/badge.svg" style="max-width:100%;"></a>
</p>

# react-three-animation

A library supports image animation using `react-three-fiber`. The target files are `APNG` and `GIF` files. <br/>
If there is only one frame, a still image is displayed.<br/>
The animate, pause, and reset methods can be called from the texture.

## Install

```bash
npm i react-three-animation
```

## Demo

<img src="https://github.com/activeguild/react-three-animation/assets/39351982/00acf5d7-2077-4618-aef3-8a0be4b609d2" height="160" />

## Usage

```ts
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useAnimationTexture } from "react-three-animation";

interface Props {
  url: string;
}

export function Model({ url }: Props) {
  const { animationTexture } = useAnimationTexture({ url });
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current && animationTexture) {
      meshRef.current.material.map = animationTexture;
      meshRef.current.material.needsUpdate = true;
    }
  }, [animationTexture]);

  return (
    <mesh ref={meshRef} position={new THREE.Vector3(0, 0, 0)}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent side={THREE.FrontSide} />
    </mesh>
  );
}
```

#### Pre-load if necessary.

```ts
import React from "react";
import * as THREE from "three";
import { preLoad } from "react-three-animation";

export default function App() {
  preLoad('/sample.png');
  return ...
}

```

## Principles of conduct

Please see [the principles of conduct](https://github.com/activeguild/react-three-animation/blob/main/.github/CONTRIBUTING.md) when building a site.

## License

This library is licensed under the [MIT license](https://github.com/activeguild/react-three-animation/blob/main/LICENSE).
