"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FacilityPhotoViewer } from "./FacilityPhotoViewer";

// Mirrors the scroll-snap + IntersectionObserver swipe pattern used by the
// homepage's MobileFacilityCarousel (src/components/home/FeaturedFacilityStrip.tsx),
// adapted for a single full-bleed banner image gallery instead of a card strip.
export function FacilityImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // Which photo the full-screen viewer is showing, or null when it's closed.
  const [viewerAt, setViewerAt] = useState<number | null>(null);
  const viewer = (
    <FacilityPhotoViewer alt={alt} images={images} onClose={() => setViewerAt(null)} openAt={viewerAt} />
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || images.length <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
        if (best) {
          const idx = Number((best.target as HTMLElement).dataset.index);
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      { root, threshold: [0.5, 0.75] },
    );

    const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [images.length]);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    itemRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  if (images.length <= 1) {
    return (
      <>
        <button
          aria-label={`View ${alt} photo full screen`}
          className="absolute inset-0 cursor-zoom-in"
          onClick={() => setViewerAt(0)}
          type="button"
        >
          <Image
            alt={alt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            src={images[0]}
          />
        </button>
        {viewer}
      </>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div
        className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={scrollRef}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {images.map((url, index) => (
          <div
            className="relative h-full w-full shrink-0 snap-start"
            data-index={index}
            key={url}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {/* A tap opens the photo full screen; a swipe still scrolls the
                strip, because a button only fires click on a tap. */}
            <button
              aria-label={`View photo ${index + 1} of ${images.length} full screen`}
              className="absolute inset-0 cursor-zoom-in"
              onClick={() => setViewerAt(index)}
              type="button"
            >
              <Image
                alt={`${alt} ${index + 1}`}
                className="object-cover"
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 800px"
                src={url}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Click-to-navigate arrows — the scroll-snap track alone only supports
          touch swipe / click-drag, which desktop mouse users won't discover,
          so additional photos beyond the first can otherwise go unseen. */}
      {activeIndex > 0 && (
        <button
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          onClick={() => goTo(activeIndex - 1)}
          type="button"
        >
          ‹
        </button>
      )}
      {activeIndex < images.length - 1 && (
        <button
          aria-label="Next photo"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          onClick={() => goTo(activeIndex + 1)}
          type="button"
        >
          ›
        </button>
      )}

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((url, index) => (
          <button
            aria-label={`Go to photo ${index + 1}`}
            className={`size-1.5 rounded-full transition-colors ${
              index === activeIndex ? "bg-white" : "bg-white/50"
            }`}
            key={url}
            onClick={() => goTo(index)}
            type="button"
          />
        ))}
      </div>
      {viewer}
    </div>
  );
}
