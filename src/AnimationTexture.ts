import { Texture, LinearFilter } from "three";

class AnimationTexture extends Texture {
  isAnimationTexture: boolean;
  animate: () => void;
  pause: () => void;
  reset: () => void;
  constructor(
    canvas?,
    mapping?,
    wrapS?,
    wrapT?,
    magFilter?,
    minFilter?,
    format?,
    type?,
    anisotropy?
  ) {
    super(
      canvas,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      format,
      type,
      anisotropy
    );

    this.isAnimationTexture = true;
    this.animate = () => {};
    this.pause = () => {};
    this.reset = () => {};
    this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
    this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;
    this.generateMipmaps = false;
    this.needsUpdate = true;
  }
}

export { AnimationTexture };
