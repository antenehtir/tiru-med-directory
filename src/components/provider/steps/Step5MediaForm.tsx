"use client";

import { useRef, useState, useTransition } from "react";
import { getProviderBrowserClient } from "@/lib/supabase/provider-browser-client";
import {
  autoSaveStep5,
  saveStep5AndContinue,
  type Step5Data,
} from "@/app/provider/(console)/onboarding/media/actions";
import { AutoSaveIndicator } from "@/components/provider/AutoSaveIndicator";
import { Spinner } from "@/components/provider/Spinner";
import { Badge } from "@/components/ui/Badge";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { deleteImageFromBucket, extensionFromFile, uploadImageToBucket } from "@/lib/storage/upload-image";

const MAX_ENTRANCE_PHOTOS = 4;
const ENTRANCE_PHOTO_ASPECT = 16 / 9;
const LOGO_ASPECT = 1;

type UploadStatus = "idle" | "uploading";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


async function uploadToBucket(bucket: string, path: string, file: File): Promise<string> {
  const supabase = getProviderBrowserClient();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function Step5MediaForm({
  claimId,
  initialData,
  backHref = "/provider/onboarding/doctors",
  claimStatus = null,
}: {
  claimId: string;
  initialData: Step5Data;
  backHref?: string;
  claimStatus?: string | null;
}) {
  // Photos/other fields lock only while the submission is actively under
  // review (this replaces the old full-page "cannot be edited" block — the
  // fields are now visible and clearly locked instead of hidden entirely).
  const photosLocked = claimStatus === "pending_review";
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urls, setUrls] = useState<Step5Data>(initialData);

  const [entranceStatus, setEntranceStatus] = useState<UploadStatus>("idle");
  const [entranceError, setEntranceError] = useState<string | null>(null);
  const entranceInputRef = useRef<HTMLInputElement>(null);
  // Set right before opening the file picker so its onChange handler knows
  // whether this upload appends (null) or replaces a specific slot.
  const entranceSlotTarget = useRef<number | null>(null);
  // null slotIndex = the pending crop is for a new (appended) photo;
  // a number targets the existing photo at that index being replaced.
  const [entranceCrop, setEntranceCrop] = useState<{ objectUrl: string; slotIndex: number | null } | null>(
    null,
  );

  const [logoStatus, setLogoStatus] = useState<UploadStatus>("idle");
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoCrop, setLogoCrop] = useState<{ objectUrl: string } | null>(null);



  const [permissionChecked, setPermissionChecked] = useState(
    Boolean(
      initialData.entrance_photo_urls.length > 0 && initialData.logo_url,
    ),
  );


  function autoSave(partial: Partial<Step5Data>) {
    startTransition(async () => {
      const result = await autoSaveStep5(partial);
      if (result.ok) {
        setSaveError(null);
        setLastSaved(new Date());
      } else {
        // Previously this always called setLastSaved(), so a failed save
        // (e.g. an expired session) still showed "Draft saved" — the
        // provider had no way to know their upload hadn't actually
        // persisted. See src/lib/supabase/provider-browser-client.ts for
        // the session-corruption root cause this was masking.
        setSaveError(result.error ?? "Save failed — please try again.");
      }
    });
  }

  const pendingEntranceFileRef = useRef<File | null>(null);
  const pendingLogoFileRef = useRef<File | null>(null);

  function onEntranceFileSelected(file: File | undefined, slotIndex: number | null) {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setEntranceError("Invalid file type");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEntranceError("File too large — max 5MB");
      return;
    }

    setEntranceError(null);
    pendingEntranceFileRef.current = file;
    setEntranceCrop({ objectUrl: URL.createObjectURL(file), slotIndex });
  }

  function cancelEntranceCrop() {
    if (entranceCrop) URL.revokeObjectURL(entranceCrop.objectUrl);
    setEntranceCrop(null);
    pendingEntranceFileRef.current = null;
    if (entranceInputRef.current) entranceInputRef.current.value = "";
  }

  async function handleEntranceCropComplete(blob: Blob) {
    const file = pendingEntranceFileRef.current;
    const slotIndex = entranceCrop?.slotIndex ?? null;
    if (entranceCrop) URL.revokeObjectURL(entranceCrop.objectUrl);
    setEntranceCrop(null);
    if (entranceInputRef.current) entranceInputRef.current.value = "";

    setEntranceStatus("uploading");
    try {
      const previousUrl = slotIndex !== null ? urls.entrance_photo_urls[slotIndex] : null;
      const url = await uploadImageToBucket(
        "facility-photos",
        claimId,
        blob,
        file ? extensionFromFile(file) : "jpg",
        previousUrl,
      );
      const next =
        slotIndex !== null
          ? urls.entrance_photo_urls.map((u, i) => (i === slotIndex ? url : u))
          : [...urls.entrance_photo_urls, url].slice(0, MAX_ENTRANCE_PHOTOS);
      setUrls((prev) => ({ ...prev, entrance_photo_urls: next }));
      autoSave({ entrance_photo_urls: next });
    } catch (err) {
      console.error("Entrance photo upload failed:", err);
      setEntranceError("Upload failed — please try again");
    } finally {
      setEntranceStatus("idle");
      pendingEntranceFileRef.current = null;
    }
  }

  function removeEntrancePhoto(index: number) {
    const removedUrl = urls.entrance_photo_urls[index];
    const next = urls.entrance_photo_urls.filter((_, i) => i !== index);
    setUrls((prev) => ({ ...prev, entrance_photo_urls: next }));
    autoSave({ entrance_photo_urls: next });
    void deleteImageFromBucket("facility-photos", removedUrl);
  }

  function moveEntrancePhoto(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= urls.entrance_photo_urls.length) return;
    const next = [...urls.entrance_photo_urls];
    [next[index], next[target]] = [next[target], next[index]];
    setUrls((prev) => ({ ...prev, entrance_photo_urls: next }));
    autoSave({ entrance_photo_urls: next });
  }

  function onLogoFileSelected(file: File | undefined) {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setLogoError("Invalid file type");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("File too large — max 2MB");
      return;
    }

    // SVGs are vector — cropping to a raster canvas would lose their point;
    // upload directly instead of routing through the crop modal.
    if (file.type === "image/svg+xml") {
      void uploadLogoDirect(file);
      return;
    }

    setLogoError(null);
    pendingLogoFileRef.current = file;
    setLogoCrop({ objectUrl: URL.createObjectURL(file) });
  }

  async function uploadLogoDirect(file: File | Blob, extHint = "svg") {
    setLogoError(null);
    setLogoStatus("uploading");
    try {
      const url = await uploadImageToBucket("facility-photos", claimId, file, extHint, urls.logo_url);
      setUrls((prev) => ({ ...prev, logo_url: url }));
      autoSave({ logo_url: url });
    } catch (err) {
      console.error("Logo upload failed:", err);
      setLogoError("Upload failed — please try again");
    } finally {
      setLogoStatus("idle");
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  function cancelLogoCrop() {
    if (logoCrop) URL.revokeObjectURL(logoCrop.objectUrl);
    setLogoCrop(null);
    pendingLogoFileRef.current = null;
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  async function handleLogoCropComplete(blob: Blob) {
    const file = pendingLogoFileRef.current;
    if (logoCrop) URL.revokeObjectURL(logoCrop.objectUrl);
    setLogoCrop(null);
    await uploadLogoDirect(blob, file ? extensionFromFile(file) : "jpg");
    pendingLogoFileRef.current = null;
  }



  function handleSaveAndContinue() {
    startTransition(async () => {
      await saveStep5AndContinue(urls);
    });
  }

  return (
    <div className="space-y-6">
      {photosLocked ? (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground">
          <span aria-hidden="true">🔒</span>
          <span>
            Your listing is under review — everything below is locked until an admin approves or
            rejects it. You can still view what you submitted.
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          Photos significantly improve patient trust and your listing&apos;s completeness score.
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {saveError}
        </div>
      )}

      {/* Entrance photos */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Facility photos ({urls.entrance_photo_urls.length}/{MAX_ENTRANCE_PHOTOS})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Up to {MAX_ENTRANCE_PHOTOS} photos of your facility&apos;s entrance and interior help
              patients find and recognize you. The first photo is used as the main banner.
            </p>
          </div>
          <AutoSaveIndicator isPending={isPending} lastSaved={lastSaved} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {urls.entrance_photo_urls.map((url, index) => (
            <div
              className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-background"
              key={url}
            >
              <img alt={`Facility photo ${index + 1}`} className="h-full w-full object-cover" src={url} />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 px-1.5 py-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    className="rounded px-1 text-xs font-bold text-white disabled:opacity-30"
                    disabled={index === 0 || photosLocked}
                    onClick={() => moveEntrancePhoto(index, -1)}
                    title="Move left"
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    className="rounded px-1 text-xs font-bold text-white disabled:opacity-30"
                    disabled={index === urls.entrance_photo_urls.length - 1 || photosLocked}
                    onClick={() => moveEntrancePhoto(index, 1)}
                    title="Move right"
                    type="button"
                  >
                    ›
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs font-medium text-white hover:underline disabled:opacity-30"
                    disabled={entranceStatus === "uploading" || photosLocked}
                    onClick={() => {
                      entranceSlotTarget.current = index;
                      entranceInputRef.current?.click();
                    }}
                    type="button"
                  >
                    Replace
                  </button>
                  <button
                    className="text-xs font-medium text-red-300 hover:underline disabled:opacity-30"
                    disabled={photosLocked}
                    onClick={() => removeEntrancePhoto(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {index === 0 && (
                <Badge className="absolute left-1.5 top-1.5" size="sm" variant="info">
                  Main
                </Badge>
              )}
            </div>
          ))}

          {urls.entrance_photo_urls.length < MAX_ENTRANCE_PHOTOS && !photosLocked && (
            <button
              className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-background text-center transition hover:border-primary/40 disabled:opacity-60"
              disabled={entranceStatus === "uploading"}
              onClick={() => {
                entranceSlotTarget.current = null;
                entranceInputRef.current?.click();
              }}
              type="button"
            >
              {entranceStatus === "uploading" ? (
                <Spinner className="size-5" />
              ) : (
                <>
                  <span className="text-xl text-muted-foreground">+</span>
                  <span className="text-xs font-medium text-foreground">Add photo</span>
                </>
              )}
            </button>
          )}
        </div>

        {entranceError && <p className="mt-2 text-xs text-red-500">{entranceError}</p>}
        <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, or WEBP · Max 5MB each</p>

        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onEntranceFileSelected(e.target.files?.[0], entranceSlotTarget.current)}
          ref={entranceInputRef}
          type="file"
        />
      </div>

      {/* Logo */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">Facility logo</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Your logo appears on your directory card and detail page. Use a square image for best
          results.
        </p>

        {urls.logo_url ? (
          <div className="flex flex-col items-center gap-2">
            <img
              alt="Facility logo"
              className="size-20 rounded-full object-cover"
              src={urls.logo_url}
            />
            <button
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              disabled={logoStatus === "uploading" || photosLocked}
              onClick={() => logoInputRef.current?.click()}
              type="button"
            >
              {logoStatus === "uploading" ? "Uploading…" : "Change photo"}
            </button>
          </div>
        ) : (
          <button
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition hover:border-primary/40 disabled:opacity-60"
            disabled={logoStatus === "uploading" || photosLocked}
            onClick={() => logoInputRef.current?.click()}
            type="button"
          >
            {logoStatus === "uploading" ? (
              <>
                <Spinner className="size-6" />
                <span className="text-sm text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <svg
                  className="size-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP, or SVG · Max 2MB
                </span>
              </>
            )}
          </button>
        )}

        {logoError && <p className="mt-2 text-xs text-red-500">{logoError}</p>}

        <input
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => onLogoFileSelected(e.target.files?.[0])}
          ref={logoInputRef}
          type="file"
        />
      </div>

      {entranceCrop && (
        <ImageCropModal
          aspect={ENTRANCE_PHOTO_ASPECT}
          imageSrc={entranceCrop.objectUrl}
          onCancel={cancelEntranceCrop}
          onComplete={handleEntranceCropComplete}
          title="Crop facility photo"
        />
      )}

      {logoCrop && (
        <ImageCropModal
          aspect={LOGO_ASPECT}
          imageSrc={logoCrop.objectUrl}
          onCancel={cancelLogoCrop}
          onComplete={handleLogoCropComplete}
          title="Crop logo"
        />
      )}

      {!photosLocked && (
        <label className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm">
          <input
            checked={permissionChecked}
            className="mt-0.5"
            onChange={(e) => setPermissionChecked(e.target.checked)}
            type="checkbox"
          />
          <span className="text-foreground">
            I confirm I have the right to publish the photos uploaded above, and that they
            accurately represent this facility.
          </span>
        </label>
      )}

      <div className="flex items-center justify-between">
        <a
          className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
          href={backHref}
        >
          ← Back
        </a>
        {photosLocked ? (
          <a
            className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            href="/provider/onboarding/milestone"
          >
            View submission status →
          </a>
        ) : (
          <button
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!permissionChecked || isPending}
            onClick={handleSaveAndContinue}
            type="button"
          >
            {isPending ? (
              <>
                <Spinner tone="on-primary" />
                Saving…
              </>
            ) : (
              "Save & continue →"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
