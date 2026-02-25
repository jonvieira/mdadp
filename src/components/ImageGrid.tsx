import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ImageGridProps {
  files: File[];
  onRemove: (index: number) => void;
}

function Thumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-secondary">
      {url && <img src={url} alt={file.name} className="h-full w-full object-cover" />}
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <span className="absolute bottom-0 left-0 right-0 truncate bg-background/70 px-1.5 py-0.5 text-[10px] text-foreground">
        {file.name}
      </span>
    </div>
  );
}

export default function ImageGrid({ files, onRemove }: ImageGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
      {files.map((f, i) => (
        <Thumb key={`${f.name}-${f.lastModified}-${i}`} file={f} onRemove={() => onRemove(i)} />
      ))}
    </div>
  );
}
