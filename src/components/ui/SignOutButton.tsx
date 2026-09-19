"use client";

import { useId, useRef, useState } from "react";

// "Sign out" that asks first. Signing out mid-edit loses anything unsaved and
// means signing in again, so a stray tap — easy on a phone menu — should not
// do it on its own. Used by every signed-in area (admin and provider).
export function SignOutButton({
  href,
  className,
  children = "Sign out",
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [leaving, setLeaving] = useState(false);

  return (
    <>
      <button className={className} onClick={() => dialogRef.current?.showModal()} type="button">
        {children}
      </button>
      <dialog
        aria-labelledby={titleId}
        className="m-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/40"
        ref={dialogRef}
      >
        <h2 className="text-base font-bold" id={titleId}>
          Sign out?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anything you haven&apos;t saved will be lost. You&apos;ll need to sign in again to continue.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            autoFocus
            className="min-h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            No, stay
          </button>
          <a
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            href={href}
            onClick={() => setLeaving(true)}
          >
            {leaving ? "Signing out…" : "Yes, sign out"}
          </a>
        </div>
      </dialog>
    </>
  );
}
