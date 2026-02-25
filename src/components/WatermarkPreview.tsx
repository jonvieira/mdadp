import { useEffect, useRef } from "react";
import type { WatermarkPosition } from "@/lib/watermark";

interface Props {
  file: File | null;
  watermarkSrc: string;
  position: WatermarkPosition;
  sizeRatio: number;
  opacity: number;
}

export default function WatermarkPreview({ file, watermarkSrc, position, sizeRatio, opacity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    const wm = new Image();

    let cancelled = false;

    Promise.all([
      new Promise<void>((r) => { img.onload = () => r(); img.src = imgUrl; }),
      new Promise<void>((r) => { wm.onload = () => r(); wm.src = watermarkSrc; }),
    ]).then(() => {
      if (cancelled) return;

      const maxW = 480;
      const maxH = 320;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(imgUrl);

      const wmW = w * sizeRatio;
      const wmH = (wm.naturalHeight / wm.naturalWidth) * wmW;
      const pad = 24 * scale;

      let x = 0, y = 0;
      switch (position) {
        case "top-left": x = pad; y = pad; break;
        case "top-center": x = (w - wmW) / 2; y = pad; break;
        case "top-right": x = w - wmW - pad; y = pad; break;
        case "center": x = (w - wmW) / 2; y = (h - wmH) / 2; break;
        case "bottom-left": x = pad; y = h - wmH - pad; break;
        case "bottom-center": x = (w - wmW) / 2; y = h - wmH - pad; break;
        case "bottom-right": x = w - wmW - pad; y = h - wmH - pad; break;
      }
      ctx.globalAlpha = opacity;
      ctx.drawImage(wm, x, y, wmW, wmH);
      ctx.globalAlpha = 1;
    });

    return () => { cancelled = true; URL.revokeObjectURL(imgUrl); };
  }, [file, watermarkSrc, position, sizeRatio, opacity]);

  if (!file) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-secondary/50 h-[320px] text-muted-foreground text-sm">
        Carregue imagens para ver o preview
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-secondary/30 p-4">
      <canvas ref={canvasRef} className="max-w-full rounded-lg" />
    </div>
  );
}
