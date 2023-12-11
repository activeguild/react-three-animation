import { useCallback, useEffect, useState } from "react";
import framesWorker from "./worker.js?worker&inline";
import { CanvasTexture, LinearFilter } from "three";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frames: any[];
  }
>();
let worker: Worker | null;

const load = (url: UseAnimationTextureArgs["url"]) => {
  initializeWorker();

  if (framesMap.get(url)) {
    return;
  }

  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((arrayBuffer) => {
      worker?.postMessage({ url, arrayBuffer });
    });
};

export const preLoad = (url: UseAnimationTextureArgs["url"]) => {
  load(url);
};

const drawPatch = (
  ctx: CanvasRenderingContext2D,
  image: ImageData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frame: any
) => {
  const dims = frame.dims;
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    return null;
  }
  tempCtx.putImageData(image, 0, 0);
  ctx.drawImage(
    tempCanvas,
    0,
    0,
    dims.width,
    dims.height,
    dims.left,
    dims.top,
    dims.width,
    dims.height
  );
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
        canvas.width = isGif ? frame.dims.width : img.width;
        canvas.height = isGif ? frame.dims.height : img.height;
        const imageData = new ImageData(
          isGif ? frame.patch : new Uint8ClampedArray(frame),
          isGif ? frame.dims.width : img.width,
          isGif ? frame.dims.height : img.height
        );
        return imageData;
      });
      framesMap.set(url, { ctx, canvas, images, frames });
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
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameUpdate = useCallback(() => {
    const currentFrames = getFrameses(url);

    if (
      !enabledLoop &&
      currentFrames &&
      currentFrame + 1 === currentFrames.images.length
    ) {
      return;
    }

    if (currentFrames?.images.length === 1 && framesMap.size == 1) {
      return;
    }

    if (currentFrames && currentFrames.images.length > 0) {
      const tmpCurrentFrame = currentFrame + 1;
      const nextCurrentFrame = tmpCurrentFrame % currentFrames.images.length;
      const image = currentFrames.images[nextCurrentFrame];
      const frame = currentFrames.frames[nextCurrentFrame];
      if (!animationTexture) {
        if (url.endsWith("gif")) {
          currentFrames.ctx.putImageData(
            image,
            frame.dims.left,
            frame.dims.top
          );
        } else {
          currentFrames.ctx.putImageData(image, 0, 0);
        }
        const texture = new CanvasTexture(currentFrames.canvas);
        texture.premultiplyAlpha = true;
        texture.minFilter = LinearFilter;
        setAnimationTexture(texture);
      } else {
        if (url.endsWith(".gif")) {
          drawPatch(currentFrames.ctx, image, frame);
        } else {
          animationTexture.image = image;
        }
        animationTexture.needsUpdate = true;
      }

      setCurrentFrame(nextCurrentFrame);
    }
  }, [animationTexture, currentFrame, enabledLoop, url]);

  useEffect(() => {
    initializeWorker();
    load(url);

    const intervalForClear =
      enabledInterval &&
      setInterval(() => requestAnimationFrame(frameUpdate), interval);

    return () => {
      intervalForClear && clearInterval(intervalForClear);
    };
  }, [enabledInterval, frameUpdate, interval, url]);

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
