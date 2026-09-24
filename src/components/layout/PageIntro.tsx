import Link from "next/link";
import type { ReactNode } from "react";

// The opening of every inner page, in the homepage hero's voice: a teal
// eyebrow with its leading rule, a Newsreader headline, and one supporting
// line. No card around it — like the homepage, it sits directly on the mint
// wash PageShell paints behind the top of every page, so moving between tabs
// never changes the look of how a page begins.
export function PageIntro({
  eyebrow,
  title,
  description,
  back,
  aside,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`max-w-3xl ${className}`}>
      {back ? (
        <Link
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          href={back.href}
        >
          <span aria-hidden="true">&larr;</span> {back.label}
        </Link>
      ) : null}
      <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-home-accent-text">
        <span aria-hidden="true" className="h-px w-5 bg-current" />
        {eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-[2rem] font-semibold leading-[1.08] tracking-[-0.02em] text-balance text-home-ink sm:text-[2.6rem] lg:text-[2.9rem]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-home-text sm:text-base">{description}</p>
      ) : null}
      {aside}
    </header>
  );
}
