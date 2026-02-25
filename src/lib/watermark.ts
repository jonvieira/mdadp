export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const PADDING_X = 12;
const PADDING_Y = 24;

let cachedWatermark: HTMLImageElement | null = null;

export async function loadWatermarkImage(src: string): Promise<HTMLImageElement> {
  if (cachedWatermark && cachedWatermark.src === src) return cachedWatermark;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cachedWatermark = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load ${file.name}`));
    };
    img.src = url;
  });
}

function getWatermarkCoords(
  imgW: number,
  imgH: number,
  wmW: number,
  wmH: number,
  position: WatermarkPosition
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: PADDING_X, y: PADDING_Y };

    case "top-center":
      return { x: (imgW - wmW) / 2, y: PADDING_Y };

    case "top-right":
      return { x: imgW - wmW - PADDING_X, y: PADDING_Y };

    case "center":
      return { x: (imgW - wmW) / 2, y: (imgH - wmH) / 2 };

    case "bottom-left":
      return { x: PADDING_X, y: imgH - wmH - PADDING_Y };

    case "bottom-center":
      return { x: (imgW - wmW) / 2, y: imgH - wmH - PADDING_Y };

    case "bottom-right":
      return { x: imgW - wmW - PADDING_X, y: imgH - wmH - PADDING_Y };
  }
}

export async function applyWatermark(
  file: File,
  watermarkSrc: string,
  position: WatermarkPosition,
  sizeRatio: number = 0.1,
  opacity: number = 0.5
): Promise<Blob> {
  const [img, wm] = await Promise.all([
    loadImage(file),
    loadWatermarkImage(watermarkSrc),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  // Release object URL
  URL.revokeObjectURL(img.src);

  const wmW = img.naturalWidth * sizeRatio;
  const wmH = (wm.naturalHeight / wm.naturalWidth) * wmW;

  const { x, y } = getWatermarkCoords(
    canvas.width,
    canvas.height,
    wmW,
    wmH,
    position
  );

  ctx.globalAlpha = opacity;
  ctx.drawImage(wm, x, y, wmW, wmH);
  ctx.globalAlpha = 1;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export canvas"));
      },
      "image/png",
      1
    );
  });
}

export function getOutputFilename(originalName: string): string {
  const dotIdx = originalName.lastIndexOf(".");
  const base = dotIdx > 0 ? originalName.substring(0, dotIdx) : originalName;
  return `${base}_wm.png`;
}
