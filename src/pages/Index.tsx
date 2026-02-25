import { useState, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import DropZone from "@/components/DropZone";
import ImageGrid from "@/components/ImageGrid";
import PositionSelector from "@/components/PositionSelector";
import WatermarkPreview from "@/components/WatermarkPreview";
import { applyWatermark, getOutputFilename, type WatermarkPosition } from "@/lib/watermark";
import { Trash2, Download, Loader2, Droplets, Upload, X, Plus } from "lucide-react";

export default function Index() {
  const [files, setFiles] = useState<File[]>([]);
  const [position, setPosition] = useState<WatermarkPosition>("bottom-center");
  const [sizeRatio, setSizeRatio] = useState(0.08);
  const [opacity, setOpacity] = useState(0.45);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [watermarkSrc, setWatermarkSrc] = useState<string | null>(null);
  const [watermarkName, setWatermarkName] = useState<string>("");
  const wmInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setZipBlob(null);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setZipBlob(null);
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setZipBlob(null);
  }, []);

  const handleWatermarkUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie uma imagem PNG ou JPG.", variant: "destructive" });
      return;
    }
    if (watermarkSrc) URL.revokeObjectURL(watermarkSrc);
    const url = URL.createObjectURL(file);
    setWatermarkSrc(url);
    setWatermarkName(file.name);
    setZipBlob(null);
    e.target.value = "";
  }, [watermarkSrc]);

  const removeWatermark = useCallback(() => {
    if (watermarkSrc) URL.revokeObjectURL(watermarkSrc);
    setWatermarkSrc(null);
    setWatermarkName("");
    setZipBlob(null);
  }, [watermarkSrc]);

  useEffect(() => {
    return () => {
      if (watermarkSrc) URL.revokeObjectURL(watermarkSrc);
    };
  }, []);

  const handleApply = useCallback(async () => {
    if (!files.length || !watermarkSrc) return;
    setProcessing(true);
    setProgress({ done: 0, total: files.length });
    setZipBlob(null);

    const zip = new JSZip();

    try {
      for (let i = 0; i < files.length; i++) {
        const blob = await applyWatermark(files[i], watermarkSrc, position, sizeRatio, opacity);
        zip.file(getOutputFilename(files[i].name), blob);
        setProgress({ done: i + 1, total: files.length });
        await new Promise((r) => setTimeout(r, 0));
      }

      const content = await zip.generateAsync({ type: "blob" });
      setZipBlob(content);
      toast({ title: "Concluído!", description: `${files.length} imagens processadas com sucesso.` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Falha ao processar imagens.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }, [files, position, sizeRatio, opacity, watermarkSrc]);

  const handleDownload = useCallback(() => {
    if (zipBlob) saveAs(zipBlob, "imagens_marca_dagua.zip");
  }, [zipBlob]);

  return (
    <div className="dark min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex flex-col items-center gap-4 mb-4">
    <img 
      src="/logo.png" 
      alt="Logo" 
      className="h-20 object-contain"
    />

    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      Marca d'Água em Lote
    </h1>
  </div>
          <p className="text-muted-foreground">
            Aplique sua marca d'água em múltiplas imagens de uma só vez
          </p>
        </header>

        {/* Step 1: Watermark upload */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            1 — Marca d'água
          </h2>
          {!watermarkSrc ? (
            <div
              onClick={() => wmInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 transition-colors cursor-pointer hover:border-primary/50"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Clique para enviar sua marca d'água (PNG recomendado)</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-4">
              <img src={watermarkSrc} alt="Marca d'água" className="h-16 max-w-[200px] object-contain rounded bg-secondary p-2" />
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">{watermarkName}</p>
                <p className="text-xs text-muted-foreground">Marca d'água carregada</p>
              </div>
              <Button size="sm" onClick={removeWatermark}> 
                <X className="h-4 w-4" />
                Remover
              </Button>
            </div>
          )}
          <input
            ref={wmInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleWatermarkUpload}
          />
        </section>

        {/* Step 2: Upload images */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            2 — Imagens
          </h2>
          {files.length === 0 ? (
            <DropZone onFiles={addFiles} />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{files.length} imagem(ns)</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => document.getElementById("add-more")?.click()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                  <Button size="sm" onClick={clearAll}>
                    <Trash2 className="h-4 w-4 mr-1" /> Limpar todas
                  </Button>
                  <input
                    id="add-more"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addFiles(Array.from(e.target.files));
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <ImageGrid files={files} onRemove={removeFile} />
            </div>
          )}
        </section>

        {/* Step 3: Position + Size + Opacity */}
        {files.length > 0 && watermarkSrc && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              3 — Configurações da marca d'água
            </h2>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex flex-col gap-5">
                <PositionSelector value={position} onChange={setPosition} />
                <div className="space-y-4 w-[200px]">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Tamanho: {Math.round(sizeRatio * 100)}%
                    </label>
                    <Slider
                      value={[sizeRatio]}
                      onValueChange={([v]) => { setSizeRatio(v); setZipBlob(null); }}
                      min={0.05}
                      max={0.5}
                      step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Opacidade: {Math.round(opacity * 100)}%
                    </label>
                    <Slider
                      value={[opacity]}
                      onValueChange={([v]) => { setOpacity(v); setZipBlob(null); }}
                      min={0.05}
                      max={1}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <WatermarkPreview
                  file={files[0] ?? null}
                  watermarkSrc={watermarkSrc}
                  position={position}
                  sizeRatio={sizeRatio}
                  opacity={opacity}
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 4: Process & Export */}
        {files.length > 0 && watermarkSrc && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              4 — Processar e Exportar
            </h2>
            <div className="flex flex-col gap-4">
              {processing && (
                <div className="space-y-2">
                  <Progress value={(progress.done / progress.total) * 100} />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress.done}/{progress.total} imagens processadas
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleApply} disabled={processing || files.length === 0}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processando…
                    </>
                  ) : (
                    "Aplicar Marca d'Água"
                  )}
                </Button>
                {zipBlob && (
                  <Button variant="secondary" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Baixar ZIP
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
