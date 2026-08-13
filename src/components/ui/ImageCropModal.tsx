"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/image/crop-image";

type ImageCropModalProps = {
  imageSrc: string;
  aspect: number;
  title?: string;
  onCancel: () => void;
  onComplete: (blob: Blob) => void;
};

export function ImageCropModal({ imageSrc, aspect, title, onCancel, onComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onComplete(blob);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg">
        <h2 className="text-lg font-bold text-foreground">{title ?? "Crop image"}</h2>

        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
          <Cropper
            aspect={aspect}
            crop={crop}
            image={imageSrc}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            zoom={zoom}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground" htmlFor="crop-zoom">
            Zoom
          </label>
          <input
            className="flex-1"
            id="crop-zoom"
            max={3}
            min={1}
            onChange={(e) => setZoom(Number(e.target.value))}
            step={0.05}
            type="range"
            value={zoom}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30"
            disabled={isProcessing}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isProcessing || !croppedAreaPixels}
            onClick={handleConfirm}
            type="button"
          >
            {isProcessing ? "Processing…" : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
