"use client";

import { useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type CheckupPackage = {
  name: string;
  url: string;
  fileType: "pdf" | "image";
};

type CheckupPackageUploaderProps = {
  value: CheckupPackage[];
  onChange: (packages: CheckupPackage[]) => void;
};

export function CheckupPackageUploader({
  value,
  onChange,
}: CheckupPackageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10MB.");
      return;
    }

    // Use pending name or filename without extension as default
    const defaultName =
      pendingName.trim() ||
      file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const ext = file.name.split(".").pop();
      const fileName = `checkup-packages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("facility-packages")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("facility-packages")
        .getPublicUrl(fileName);

      const newPackage: CheckupPackage = {
        name: defaultName,
        url: urlData.publicUrl,
        fileType: file.type === "application/pdf" ? "pdf" : "image",
      };

      onChange([...value, newPackage]);
      setPendingName("");

      // Reset file input so same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removePackage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function startRename(index: number) {
    setEditingIndex(index);
    setEditingName(value[index].name);
  }

  function confirmRename() {
    if (editingIndex === null || !editingName.trim()) return;
    const next = value.map((pkg, i) =>
      i === editingIndex ? { ...pkg, name: editingName.trim() } : pkg,
    );
    onChange(next);
    setEditingIndex(null);
    setEditingName("");
  }

  return (
    <div className="space-y-4">
      {/* Existing packages */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((pkg, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              {/* File type icon */}
              <span className="text-lg">
                {pkg.fileType === "pdf" ? "📄" : "🖼️"}
              </span>

              {/* Name — editable inline */}
              {editingIndex === i ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    className="flex-1 rounded-lg border border-primary bg-card px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onBlur={confirmRename}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    value={editingName}
                  />
                  <button
                    className="text-xs font-medium text-primary"
                    onClick={confirmRename}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <p className="flex-1 truncate text-sm font-medium text-foreground">
                    {pkg.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      className="text-xs text-primary hover:underline"
                      href={pkg.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      View
                    </a>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => startRename(i)}
                      type="button"
                    >
                      Rename
                    </button>
                    <button
                      className="text-xs text-red-500 hover:text-red-600"
                      onClick={() => removePackage(i)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload new package */}
      <div className="rounded-xl border border-dashed border-border bg-background p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">
          {value.length === 0 ? "Upload your first package" : "Add another package"}
        </p>

        {/* Optional: name before uploading */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            Package name (optional — defaults to file name)
          </label>
          <input
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setPendingName(e.target.value)}
            placeholder="e.g. Executive Check-up, Women's Health Package"
            type="text"
            value={pendingName}
          />
        </div>

        <button
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          {uploading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Uploading...
            </>
          ) : (
            <>
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Choose file to upload
            </>
          )}
        </button>

        {uploadError && (
          <p className="text-xs text-red-500">{uploadError}</p>
        )}

        <p className="text-xs text-muted-foreground">
          PDF, JPG or PNG · Max 10MB per file
        </p>

        <input
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileSelect}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} package{value.length !== 1 ? "s" : ""} uploaded.
          Patients will see these listed on your public facility page.
        </p>
      )}
    </div>
  );
}
