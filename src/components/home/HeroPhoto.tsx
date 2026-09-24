"use client";

import Image from "next/image";
import { useState } from "react";

// public/images/home-hero.jpg is supplied separately. Until it exists (or if it
// ever fails to load) the frame shows a drawn placeholder instead of a broken
// image, so the hero keeps its shape either way. The check is a load error
// rather than a filesystem test: on a serverless host the public folder is
// served by the CDN, not visible to the function rendering this page.
const HERO_SRC = "/images/home-hero.jpg";

export function HeroPhoto() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-home-mint-strong shadow-home ring-1 ring-home-line lg:aspect-[5/4]">
      {failed ? (
        <HeroPlaceholder />
      ) : (
        <Image
          alt="A doctor talking with a patient in a consultation room"
          className="object-cover"
          fill
          onError={() => setFailed(true)}
          // A missing file fails fast, often before hydration, and onError
          // attached afterwards never fires. An image that is already
          // complete with no pixels has failed, so check once on attach.
          ref={(img) => {
            if (img && img.complete && img.naturalWidth === 0) setFailed(true);
          }}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          src={HERO_SRC}
        />
      )}
    </div>
  );
}

function HeroPlaceholder() {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_10%,var(--home-mint)_0%,var(--home-mint-strong)_55%,var(--home-mint)_100%)]">
      <svg className="absolute inset-0 h-full w-full text-home-teal/25 dark:text-home-teal-bright/20" fill="none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300">
        <circle cx="300" cy="70" r="90" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="300" cy="70" r="55" stroke="currentColor" strokeWidth="1.2" />
        <path d="M40 250h320" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-home-surface/80 text-home-teal shadow-home dark:text-home-teal-bright">
          <svg className="size-12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="M6 3v6a5 5 0 0 0 10 0V3" />
            <path d="M6 3H4.5M16 3h1.5" />
            <path d="M11 14v1.5a4.5 4.5 0 0 0 9 0V13" />
            <circle cx="20" cy="11" r="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
