"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

const HERO_SRC = "/images/home-hero.webp";
const HERO_ALT = "A doctor smiling as she talks with a patient across her desk";

// No frame, no border, no hard edge: the photo dissolves into the hero's own
// background. Two gradient masks are intersected — one horizontal, one
// vertical — so every side fades, not just one.
//
// wide:   right half of the hero on desktop. The long fade on the left is what
//         lets the headline sit beside the photo without a seam.
// inline: the phone layout, under the buttons; fades on all four sides.
const MASKS: Record<"wide" | "inline", string> = {
  wide: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 22%, #000 46%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 16%, #000 80%, transparent 100%)",
  inline: "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 14%, #000 80%, transparent 100%)",
};

function maskStyle(variant: "wide" | "inline"): CSSProperties {
  return {
    maskImage: MASKS[variant],
    WebkitMaskImage: MASKS[variant],
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}

export function HeroPhoto({ variant }: { variant: "wide" | "inline" }) {
  // If the file is ever missing, show nothing rather than a broken image —
  // the hero reads fine as text on its gradient. A failure can land before
  // hydration, when onError is not attached yet, hence the check on attach.
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div
      className={variant === "wide" ? "absolute inset-0" : "relative aspect-[16/10] w-full"}
      style={maskStyle(variant)}
    >
      <Image
        alt={HERO_ALT}
        className="object-cover object-[62%_35%]"
        fill
        onError={() => setFailed(true)}
        priority
        ref={(img) => {
          if (img && img.complete && img.naturalWidth === 0) setFailed(true);
        }}
        sizes={variant === "wide" ? "(min-width: 1024px) 58vw, 100vw" : "100vw"}
        src={HERO_SRC}
      />
    </div>
  );
}
