"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area, type MediaSize } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/image/crop-image";

type ImageCropModalProps = {
  imageSrc: string;
  aspect: number;
  title?: string;
  onCancel: () => void;
  onComplete: (blob: Blob) => void;
};

// react-easy-crop's zoom=1 is a "cover" baseline — the image is scaled so
// its SHORTER dimension exactly fills the crop frame, which is already a
// tight crop for any photo whose aspect ratio doesn't match the frame's.
// The library has no built-in way to zoom out past that to see the whole
// image, so this floor lets users shrink well below it.
const MIN_ZOOM_FLOOR = 0.1;
const MAX_ZOOM = 5;

export function ImageCropModal({ imageSrc, aspect, title, onCancel, onComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Used to compute the exact "fit whole image in frame" zoom level for the
  // reset button — react-easy-crop exposes the loaded media's natural size
  // and the crop viewport's rendered size via these two callbacks; zoom is a
  // multiplier on top of the "cover" baseline, so fitZoom = (scale needed to
  // fit) / (scale needed to cover).
  const naturalSizeRef = useRef<{ width: number; height: number } | null>(null);
  const cropSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [fitZoom, setFitZoom] = useState<number | null>(null);

  function maybeComputeFitZoom() {
    const natural = naturalSizeRef.current;
    const cropSize = cropSizeRef.current;
    if (!natural || !cropSize) return;
    const coverScale = Math.max(cropSize.width / natural.width, cropSize.height / natural.height);
    const fitScale = Math.min(cropSize.width / natural.width, cropSize.height / natural.height);
    setFitZoom(fitScale / coverScale);
  }

  function handleMediaLoaded(mediaSize: MediaSize) {
    naturalSizeRef.current = { width: mediaSize.naturalWidth, height: mediaSize.naturalHeight };
    maybeComputeFitZoom();
  }

  function handleCropSizeChange(size: { width: number; height: number }) {
    cropSizeRef.current = size;
    maybeComputeFitZoom();
  }

  function handleFitToFrame() {
    setCrop({ x: 0, y: 0 });
    setZoom(fitZoom ?? minZoom);
  }

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

  // Always let the slider reach at least a little below the computed fit
  // point (once known) so "the whole image visible" is reachable by drag,
  // not just via the Fit button.
  const minZoom = fitZoom !== null ? Math.min(MIN_ZOOM_FLOOR, fitZoom * 0.9) : MIN_ZOOM_FLOOR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{title ?? "Crop image"}</h2>
          <button
            className="text-xs font-medium text-primary hover:underline"
            onClick={handleFitToFrame}
            type="button"
          >
            Fit to frame
          </button>
        </div>

        {/* Letterboxing choice: when zoom is low enough that the image is
            smaller than the crop viewport, the gap shows this container's
            bg-muted rather than restricting zoom to always fill the frame —
            preserves the user's exact intended framing (e.g. showing a full
            logo or storefront) instead of forcing a crop they don't want. */}
        <div className="relative h-72 w-full overflow-hidden rounded-card bg-muted">
          <Cropper
            aspect={aspect}
            crop={crop}
            image={imageSrc}
            maxZoom={MAX_ZOOM}
            minZoom={minZoom}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onCropSizeChange={handleCropSizeChange}
            onMediaLoaded={handleMediaLoaded}
            onZoomChange={setZoom}
            zoom={zoom}
            zoomWithScroll
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground" htmlFor="crop-zoom">
            Zoom
          </label>
          <input
            className="flex-1"
            id="crop-zoom"
            max={MAX_ZOOM}
            min={minZoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            step={0.02}
            type="range"
            value={zoom}
          />
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          Drag to reposition · scroll or pinch to zoom · zoom out to fit the whole image
        </p>

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
