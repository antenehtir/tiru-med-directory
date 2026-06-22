"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/cards/contact-icons";

type ShareButtonProps = {
  name: string;
  slug: string;
};

const SITE_URL = "https://tiru-med-directory.vercel.app";

export function ShareButton({ name, slug }: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false);
  const url = `${SITE_URL}/facilities/${slug}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Find ${name} on Tiru — Healthcare in Addis Ababa`,
          url,
        });
      } catch {
        // Share sheet dismissed by the user; nothing further to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Clipboard unavailable; nothing further to do.
    }
  }

  return (
    <div className="relative flex-1">
      <button
        aria-label="Share this facility"
        className="flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card text-center text-xs font-medium text-foreground transition hover:border-strong-border"
        onClick={handleShare}
        type="button"
      >
        <ShareIcon className="size-4 shrink-0" />
      </button>
      {showCopied ? (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background shadow-md">
          Link copied!
        </span>
      ) : null}
    </div>
  );
}
