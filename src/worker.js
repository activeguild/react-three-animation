import UPNG from "./upngjs.js";
import { parseGIF, decompressFrames } from "gifuct-js";

self.addEventListener("message", (message) => {
  const { url, arrayBuffer } = message.data;

  if (url.endsWith(".gif")) {
    const img = parseGIF(arrayBuffer);

    const frames = decompressFrames(img, true);
    self.postMessage({ url, img, frames });
  } else {
    const img = UPNG.decode(arrayBuffer);

    const frames = UPNG.toRGBA8(img);
    self.postMessage({ url, img, frames });
  }
});

export default {};
