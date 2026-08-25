"use client";

import { useEffect, useRef, useState } from "react";
import { CompactFacilityCard } from "@/components/cards/FacilityCard";
import type { Facility } from "@/types/facility";

const MAX_DOTS = 8;
const AUTO_SCROLL_MS = 4200;

export function FeaturedFacilityStrip({ facilities }: { facilities: Facility[] }) {
  const showcasedFacilities = facilities.slice(-10).reverse();
  if (showcasedFacilities.length === 0) return null;

  const cards = showcasedFacilities.map((facility) => (
    <CompactFacilityCard className="w-[280px] min-w-[280px] shrink-0" facility={facility} key={facility.slug} />
  ));

  return (
    <>
      <MobileFacilityCarousel facilities={showcasedFacilities} />
      <DesktopFacilityMarquee cards={cards} />
    </>
  );
}

function DesktopFacilityMarquee({ cards }: { cards: React.ReactNode[] }) {
  return (
    <div className="hidden overflow-hidden md:block">
      <div className="homepage-facility-strip flex w-max flex-nowrap gap-4 pb-2">
        <div className="flex flex-nowrap gap-4">{cards}</div>
        <div aria-hidden="true" className="flex flex-nowrap gap-4" inert>{cards}</div>
      </div>
    </div>
  );
}

function MobileFacilityCarousel({ facilities }: { facilities: Facility[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
        if (best) {
          const index = Number((best.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActiveIndex(index);
        }
      },
      { root, threshold: [0.55, 0.8] },
    );
    cardRefs.current.filter(Boolean).forEach((card) => observer.observe(card!));
    return () => observer.disconnect();
  }, [facilities.length]);

  useEffect(() => {
    if (facilities.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      const next = (activeIndex + 1) % facilities.length;
      cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setActiveIndex(next);
    }, AUTO_SCROLL_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, facilities.length, paused]);

  const dotCount = Math.min(facilities.length, MAX_DOTS);
  const activeDot = facilities.length <= 1 ? 0 : Math.round((activeIndex / (facilities.length - 1)) * (dotCount - 1));

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        onPointerDown={() => setPaused(true)}
        onTouchStart={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {facilities.map((facility, index) => (
          <div className="w-[85%] shrink-0 snap-start" data-index={index} key={facility.id} ref={(el) => { cardRefs.current[index] = el; }}>
            <CompactFacilityCard className="h-full w-full" facility={facility} />
          </div>
        ))}
      </div>

      {facilities.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-label="Recently added facilities carousel position">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span className={`size-1.5 rounded-full transition-colors ${i === activeDot ? "bg-primary" : "bg-muted-foreground/30"}`} key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
