"use client";

import { useEffect, useRef, useState } from "react";
import { CompactFacilityCard } from "@/components/cards/FacilityCard";
import type { Facility } from "@/types/facility";

// Cap the scroll-position dots so very long lists don't sprout a dense dot row.
const MAX_DOTS = 8;

export function FeaturedFacilityStrip({ facilities }: { facilities: Facility[] }) {
  // getFacilitiesFromDB() orders ascending by record_number (oldest first) —
  // take the tail and reverse it so "Recently added" shows the newest first.
  const showcasedFacilities = facilities.slice(-10).reverse();
  const marqueeFacilities = [...showcasedFacilities, ...showcasedFacilities];

  if (showcasedFacilities.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile (below md): touch-swipeable carousel with peek affordance + dots */}
      <MobileFacilityCarousel facilities={showcasedFacilities} />

      {/* Desktop (md+): auto-scrolling marquee — pauses on hover, honors reduced motion */}
      <div className="hidden overflow-hidden md:block">
        <div className="homepage-facility-strip flex w-max flex-nowrap gap-4 pb-2">
          {marqueeFacilities.map((facility, index) => (
            <CompactFacilityCard
              className="w-[280px] min-w-[280px] shrink-0"
              facility={facility}
              key={`${facility.slug}-${index}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function MobileFacilityCarousel({ facilities }: { facilities: Facility[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    // Highlight whichever card is most in view as the user swipes.
    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
        if (best) {
          const idx = Number((best.target as HTMLElement).dataset.index);
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      { root, threshold: [0.5, 0.75] },
    );

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [facilities.length]);

  const dotCount = Math.min(facilities.length, MAX_DOTS);
  // Map the active card onto the (possibly capped) dot row proportionally.
  const activeDot =
    facilities.length <= 1
      ? 0
      : Math.round((activeIndex / (facilities.length - 1)) * (dotCount - 1));

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {facilities.map((facility, index) => (
          <div
            className="w-[85%] shrink-0 snap-start"
            data-index={index}
            key={facility.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
          >
            <CompactFacilityCard className="h-full w-full" facility={facility} />
          </div>
        ))}
      </div>

      {facilities.length > 1 && (
        <div aria-hidden="true" className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              className={`size-1.5 rounded-full transition-colors ${
                i === activeDot ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              key={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
