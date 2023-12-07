import { useEffect, useRef, useState } from "react";
import framesWorker from "./worker.js?worker";
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

const framesMap = new Map<string, THREE.CanvasTexture[]>();
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
      const canvases = frames.map((frame) => {
        const canvas = document.createElement("canvas");
        const isGif = url.endsWith(".gif");
        const width = isGif ? frame.dims.width : img.width;
        const height = isGif ? frame.dims.height : img.height;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const imageData = new ImageData(
          isGif ? frame.patch : new Uint8ClampedArray(frame),
          width,
          height
        );

        if (!ctx) {
          return null;
        }
        ctx.putImageData(imageData, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return texture;
      });
      framesMap.set(url, canvases);
    };
  }
};

export const useAnimationTexture = ({
  url,
  enabledInterval = DEFAULT_ENABLED_INTERVAL,
  interval = DEFAULT_INTERVAL,
  enabledLoop = DEFAULT_ENABLED_LOOP,
}: UseAnimationTextureArgs) => {
  const [currentCanvasTexture, setCurrentCanvasTexture] =
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
          currentFrame.current + 1 === currentFrames.length
        ) {
          return;
        }

        if (currentFrames?.length === 1 && framesMap.size == 1) {
          return;
        }

        if (currentFrames && currentFrames.length > 0) {
          currentFrame.current =
            (currentFrame.current + 1) % currentFrames.length;
          const canvasTexture = currentFrames[currentFrame.current];
          setCurrentCanvasTexture(canvasTexture);
        }
      }, interval);

    return () => {
      worker?.terminate();
      intervalForClear && clearInterval(intervalForClear);
    };
  }, [enabledInterval, enabledLoop, interval, url]);

  const getFrameses = (url: UseAnimationTextureArgs["url"]) => {
    return framesMap.get(url);
  };

  return { getFrameses, preLoad, currentCanvasTexture };
};
