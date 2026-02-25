import type { WatermarkPosition } from "@/lib/watermark";
import { cn } from "@/lib/utils";

const positions: { value: WatermarkPosition; label: string; row: number; col: number }[] = [
  { value: "top-left", label: "↖", row: 1, col: 1 },
  { value: "top-center", label: "↑", row: 1, col: 2 },
  { value: "top-right", label: "↗", row: 1, col: 3 },
  { value: "center", label: "✦", row: 2, col: 2 },
  { value: "bottom-left", label: "↙", row: 3, col: 1 },
  { value: "bottom-center", label: "↓", row: 3, col: 2 },
  { value: "bottom-right", label: "↘", row: 3, col: 3 },
];

interface Props {
  value: WatermarkPosition;
  onChange: (v: WatermarkPosition) => void;
}

export default function PositionSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 w-[140px] h-[140px]">
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3) + 1;
        const col = (i % 3) + 1;
        const pos = positions.find((p) => p.row === row && p.col === col);
        if (!pos) return <div key={i} />;
        const active = value === pos.value;
        return (
          <button
            key={pos.value}
            onClick={() => onChange(pos.value)}
            className={cn(
              "flex items-center justify-center rounded-lg text-lg font-bold transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {pos.label}
          </button>
        );
      })}
    </div>
  );
}
