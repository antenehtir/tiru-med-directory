"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Mirrors the scroll-snap + IntersectionObserver swipe pattern used by the
// homepage's MobileFacilityCarousel (src/components/home/FeaturedFacilityStrip.tsx),
// adapted for a single full-bleed banner image gallery instead of a card strip.
export function FacilityImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  if (images.length <= 1) {
    return (
      <Image
        alt={alt}
        className="object-cover"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 800px"
        src={images[0]}
      />
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
            <Image
              alt={`${alt} ${index + 1}`}
              className="object-cover"
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 800px"
              src={url}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((url, index) => (
          <span
            className={`size-1.5 rounded-full transition-colors ${
              index === activeIndex ? "bg-white" : "bg-white/50"
            }`}
            key={url}
          />
        ))}
      </div>
    </div>
  );
}
