"use client";

import { useState, useTransition } from "react";
import { getLicenseSignedUrl } from "@/lib/admin/license-actions";

// Opens a private license document via a freshly-generated, short-lived
// signed URL (see src/lib/admin/license-actions.ts) rather than linking
// directly to the stored getPublicUrl() value, which doesn't work against
// the private provider-documents bucket.
export function LicenseDocumentLink({ url, label = "View document" }: { url: string | null; label?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!url) {
    return <span className="text-sm text-muted-foreground">Not uploaded</span>;
  }

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getLicenseSignedUrl(url);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        {isPending ? "Opening…" : label}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
