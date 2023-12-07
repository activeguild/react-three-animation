import { useEffect, useRef, useState } from "react";
import framesWorker from "./worker.js?worker&inline";
import * as THREE from "three";

interface UseAnimationTextureArgs {
  url: string;
  enabledInterval?: boolean;
  interval?: number;
  enabledLoop?: boolean;
}

const DEFAULT_ENABLED_INTERVAL = true;
const DEFAULT_INTERVAL = 100;
const DEFAULT_ENABLED_LOOP = true;

const framesMap = new Map<
  string,
  {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    images: ImageData[];
  }
>();
let worker: Worker;

const load = (url: UseAnimationTextureArgs["url"]) => {
  initializeWorker();

  if (framesMap.get(url)) {
    return;
  }

  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((arrayBuffer) => {
      worker.postMessage({ url, arrayBuffer });
    });
};

export const preLoad = (url: UseAnimationTextureArgs["url"]) => {
  load(url);
};

const initializeWorker = () => {
  if (!worker) {
    worker = new framesWorker();
    worker.onmessage = (event) => {
      const { url, img, frames } = event.data;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }
      const images = frames.map((frame) => {
        const isGif = url.endsWith(".gif");
        const width = isGif ? frame.dims.width : img.width;
        const height = isGif ? frame.dims.height : img.height;

        canvas.width = width;
        canvas.height = height;
        const imageData = new ImageData(
          isGif ? frame.patch : new Uint8ClampedArray(frame),
          width,
          height
        );

        return imageData;
      });
      framesMap.set(url, { ctx, canvas, images });
    };
  }
};

export const useAnimationTexture = ({
  url,
  enabledInterval = DEFAULT_ENABLED_INTERVAL,
  interval = DEFAULT_INTERVAL,
  enabledLoop = DEFAULT_ENABLED_LOOP,
}: UseAnimationTextureArgs) => {
  const [animationTexture, setAnimationTexture] =
    useState<THREE.CanvasTexture | null>(null);
  const currentFrame = useRef(0);

  useEffect(() => {
    initializeWorker();
    load(url);

    const intervalForClear =
      enabledInterval &&
      setInterval(() => {
        const currentFrames = getFrameses(url);

        if (
          !enabledLoop &&
          currentFrames &&
          currentFrame.current + 1 === currentFrames.images.length
        ) {
          return;
        }

        if (currentFrames?.images.length === 1 && framesMap.size == 1) {
          return;
        }

        if (currentFrames && currentFrames.images.length > 0) {
          currentFrame.current =
            (currentFrame.current + 1) % currentFrames.images.length;
          const image = currentFrames.images[currentFrame.current];
          if (!animationTexture) {
            currentFrames.ctx.putImageData(image, 0, 0);
            const texture = new THREE.CanvasTexture(currentFrames.canvas);
            texture.premultiplyAlpha = true;
            texture.minFilter = THREE.LinearFilter;
            setAnimationTexture(texture);
          } else {
            currentFrames.ctx.putImageData(image, 0, 0);
            animationTexture.needsUpdate = true;
          }
        }
      }, interval);

    return () => {
      intervalForClear && clearInterval(intervalForClear);
    };
  }, [animationTexture, enabledInterval, enabledLoop, interval, url]);

  useEffect(() => {
    return () => {
      worker?.terminate();
    };
  }, []);

  const getFrameses = (url: UseAnimationTextureArgs["url"]) => {
    return framesMap.get(url);
  };

  return { getFrameses, preLoad, animationTexture };
};
