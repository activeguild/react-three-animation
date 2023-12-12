import { useCallback, useEffect, useRef, useState } from "react";
import framesWorker from "./worker.js?worker&inline";
import { LinearFilter } from "three";
import { AnimationTexture } from "./AnimationTexture";

interface UseAnimationTextureArgs {
  url: string;
  // enabledInterval?: boolean;
  interval?: number;
  loop?: boolean;
  autoplay?: boolean;
}

const DEFAULT_INTERVAL = 100;
const DEFAULT_ENABLED_LOOP = true;
const DEFAULT_AUTOPLAY = true;

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
  tempCanvas.width = dims.width;
  tempCanvas.height = dims.height;
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
      const isGif = url.endsWith(".gif");
      canvas.width = isGif ? frames[0].dims.width : img.width;
      canvas.height = isGif ? frames[0].dims.height : img.height;

      if (!ctx) {
        return null;
      }

      const images = frames.map((frame) => {
        const width = isGif ? frame.dims.width : img.width;
        const height = isGif ? frame.dims.height : img.heigh;

        const imageData = new ImageData(
          isGif ? frame.patch : new Uint8ClampedArray(frame),
          width,
          height
        );
        return imageData;
      });
      if (!framesMap.has(url)) {
        framesMap.set(url, { ctx, canvas, images, frames });
      }
    };
  }
};

export const useAnimationTexture = ({
  url,
  interval = DEFAULT_INTERVAL,
  loop = DEFAULT_ENABLED_LOOP,
  autoplay = DEFAULT_AUTOPLAY,
}: UseAnimationTextureArgs) => {
  const [animationTexture, setAnimationTexture] =
    useState<AnimationTexture | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const isGif = url.endsWith(".gif");
  const needsDisposal = useRef(false);
  const [playing, setPlaying] = useState(autoplay);
  const frameUpdate = useCallback(() => {
    const currentFrames = getFrameses(url);
    if (
      animationTexture &&
      !loop &&
      currentFrames &&
      currentFrame + 1 === currentFrames.images.length
    ) {
      return;
    }

    if (animationTexture && currentFrames?.images.length === 1) {
      return;
    }

    if (currentFrames && currentFrames.images.length > 0) {
      const image = currentFrames.images[currentFrame];
      const frame = currentFrames.frames[currentFrame];
      if (!animationTexture) {
        currentFrames.ctx.putImageData(image, 0, 0);
        const texture = new AnimationTexture(currentFrames.canvas);
        texture.animate = () => {
          setPlaying(true);
        };
        texture.pause = () => {
          setPlaying(false);
        };
        texture.reset = () => {
          setCurrentFrame(0);
        };
        texture.premultiplyAlpha = true;
        texture.minFilter = LinearFilter;
        setAnimationTexture(texture);
      } else {
        if (isGif) {
          if (needsDisposal.current) {
            currentFrames.ctx.clearRect(
              0,
              0,
              currentFrames.frames[0].dims.width,
              currentFrames.frames[0].dims.height
            );
            needsDisposal.current = false;
          }

          drawPatch(currentFrames.ctx, image, frame);
          needsDisposal.current = frame.disposalType === 2;
        } else {
          animationTexture.image = image;
        }
        animationTexture.needsUpdate = true;
      }
      const nextCurrentFrame = (currentFrame + 1) % currentFrames.images.length;
      setCurrentFrame(nextCurrentFrame);
    }
  }, [animationTexture, currentFrame, loop, isGif, url]);

  useEffect(() => {
    initializeWorker();
    load(url);

    const intervalForClear =
      playing &&
      setInterval(() => requestAnimationFrame(frameUpdate), interval);

    return () => {
      intervalForClear && clearInterval(intervalForClear);
    };
  }, [playing, frameUpdate, interval, url]);

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
