"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Full-screen photo viewer for a facility's banner photos. Opens on the photo
// that was tapped; swipe (touch), the arrow buttons, or the arrow keys move
// between photos, and Esc or the close button closes it.
//
// Built on the native <dialog> element: showModal() already gives the top
// layer, a focus trap, Esc to close and an inert page behind it, which a
// hand-rolled overlay would each have to reimplement. Swiping is the same
// scroll-snap track the inline gallery uses, so it feels the same in both.
export function FacilityPhotoViewer({
  images,
  alt,
  openAt,
  onClose,
}: {
  images: string[];
  alt: string;
  // Index to open on, or null when closed.
  openAt: number | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(openAt ?? 0);

  // Start the counter on the tapped photo. Set during render when openAt
  // changes, rather than in the effect below, so the first frame is right.
  const [seenOpenAt, setSeenOpenAt] = useState(openAt);
  if (openAt !== seenOpenAt) {
    setSeenOpenAt(openAt);
    if (openAt !== null) setActiveIndex(openAt);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openAt === null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    // Jump, not smooth-scroll: the viewer should open already on the photo
    // that was tapped, not slide there from the first one.
    itemRefs.current[openAt]?.scrollIntoView({ behavior: "instant", inline: "start", block: "nearest" });

    // The page behind must not scroll while the viewer is up (a vertical
    // swipe on a phone would otherwise move it).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openAt]);

  useEffect(() => {
    const root = trackRef.current;
    if (!root || images.length <= 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] },
    );
    itemRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, [images.length]);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    itemRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  const hasMany = images.length > 1;

  return (
    <dialog
      aria-label={`${alt} photos`}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
      onClose={onClose}
      onKeyDown={(event) => {
        // Handled here as well as by the browser: not every browser closes a
        // modal dialog on Esc when focus sits on the dialog itself.
        if (event.key === "Escape") {
          event.preventDefault();
          dialogRef.current?.close();
        }
        if (event.key === "ArrowRight") goTo(activeIndex + 1);
        if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      }}
      ref={dialogRef}
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
          <p aria-live="polite" className="text-sm font-medium tabular-nums">
            {hasMany ? `${activeIndex + 1} / ${images.length}` : ""}
          </p>
          <button
            aria-label="Close photos"
            autoFocus
            className="flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            ×
          </button>
        </div>

        <div
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={trackRef}
        >
          {images.map((url, index) => (
            <div
              className="relative h-full w-full shrink-0 snap-center"
              data-index={index}
              key={url}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
            >
              <Image
                alt={`${alt} — photo ${index + 1} of ${images.length}`}
                className="object-contain"
                fill
                sizes="100vw"
                src={url}
              />
            </div>
          ))}
        </div>

        {hasMany && activeIndex > 0 && (
          <button
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white sm:flex"
            onClick={() => goTo(activeIndex - 1)}
            type="button"
          >
            ‹
          </button>
        )}
        {hasMany && activeIndex < images.length - 1 && (
          <button
            aria-label="Next photo"
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white sm:flex"
            onClick={() => goTo(activeIndex + 1)}
            type="button"
          >
            ›
          </button>
        )}

        {hasMany && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6">
            {images.map((url, index) => (
              // The dot is small; the button around it is a full finger's width.
              <button
                aria-current={index === activeIndex}
                aria-label={`Show photo ${index + 1}`}
                className="flex size-8 items-center justify-center"
                key={url}
                onClick={() => goTo(index)}
                type="button"
              >
                <span className={`size-2 rounded-full transition-colors ${index === activeIndex ? "bg-white" : "bg-white/40"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
