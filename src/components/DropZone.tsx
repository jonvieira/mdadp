import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ACCEPTED = ["image/jpeg", "image/png"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (files: FileList | File[]) => {
      const valid: File[] = [];
      Array.from(files).forEach((f) => {
        if (!ACCEPTED.includes(f.type)) {
          toast({ title: `${f.name} ignorado`, description: "Apenas JPG e PNG são aceitos.", variant: "destructive" });
        } else if (f.size > MAX_SIZE) {
          toast({ title: `${f.name} ignorado`, description: "Máximo 10 MB por imagem.", variant: "destructive" });
        } else {
          valid.push(f);
        }
      });
      if (valid.length) onFiles(valid);
    },
    [onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      validate(e.dataTransfer.files);
    },
    [validate]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer ${
        dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="h-10 w-10 text-muted-foreground" />
      <p className="text-muted-foreground text-center">
        Arraste e solte suas imagens aqui
      </p>
      <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Selecionar arquivos
      </Button>
      <p className="text-xs text-muted-foreground">JPG ou PNG, até 20 MB cada</p>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) validate(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
