"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  discardFacilityDraft,
  publishFacilityDraft,
} from "@/app/admin/(protected)/facilities/[id]/edit/draft-actions";
import {
  REQUIRED_FIELD_LABELS,
  type RequiredFieldKey,
} from "@/lib/provider/onboarding-config";

// Where in the editor each required field is filled in, so an unticked item
// is one tap away from the control that fixes it.
const FIELD_SECTION: Record<RequiredFieldKey, { key: string; label: string }> = {
  name: { key: "identity", label: "Identity" },
  category: { key: "identity", label: "Identity" },
  phone: { key: "contact", label: "Contact & Social" },
  subCity: { key: "location", label: "Location" },
  area: { key: "location", label: "Location" },
  coordinates: { key: "location", label: "Location" },
  services: { key: "services", label: "Services & Specialties" },
};

const FIELD_ORDER = Object.keys(REQUIRED_FIELD_LABELS) as RequiredFieldKey[];

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Shown at the top of the editor while an admin-created facility is still a
// draft. The checklist is worked out on the server from the saved row, and
// the page re-renders after every section save, so it ticks itself off as the
// admin goes.
export function FacilityDraftBanner({
  facilityId,
  missing,
}: {
  facilityId: string;
  missing: RequiredFieldKey[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"publish" | "discard" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ready = missing.length === 0;
  const doneCount = FIELD_ORDER.length - missing.length;

  function run(action: "publish" | "discard") {
    if (
      action === "discard" &&
      !window.confirm("Discard this draft? Everything entered for it is deleted, and it will not be listed.")
    ) {
      return;
    }
    setError(null);
    setPendingAction(action);
    startTransition(async () => {
      const result =
        action === "publish"
          ? await publishFacilityDraft(facilityId)
          : await discardFacilityDraft(facilityId);
      // A successful action redirects away; only a refusal comes back here.
      if (result?.error) setError(result.error);
      setPendingAction(null);
    });
  }

  return (
    <section
      aria-labelledby="draft-banner-title"
      className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/40 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-800 dark:text-amber-100">
          Draft
        </span>
        <h2 className="text-base font-bold text-amber-900 dark:text-amber-100" id="draft-banner-title">
          Not listed yet — patients can&apos;t see this facility
        </h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-amber-900/90 dark:text-amber-200">
        {ready
          ? "Everything required is filled in. Publish to list it, or keep editing first."
          : `Fill in the items below, then publish. ${doneCount} of ${FIELD_ORDER.length} done.`}
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {FIELD_ORDER.map((key) => {
          const done = !missing.includes(key);
          const section = FIELD_SECTION[key];
          return (
            <li className="flex items-center gap-2 text-sm" key={key}>
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : "border border-amber-400 bg-card text-transparent dark:border-amber-600"
                }`}
              >
                ✓
              </span>
              <span className={done ? "text-amber-900/70 dark:text-amber-300/80" : "font-medium text-amber-950 dark:text-amber-50"}>
                {capitalise(REQUIRED_FIELD_LABELS[key])}
                <span className="sr-only">{done ? " — done" : " — still needed"}</span>
              </span>
              {!done && (
                <Link
                  className="ml-auto shrink-0 text-xs font-semibold text-primary hover:underline"
                  href={`?section=${section.key}`}
                  replace
                  scroll={false}
                >
                  {section.label} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!ready || isPending}
          onClick={() => run("publish")}
          type="button"
        >
          {pendingAction === "publish" ? "Publishing…" : "Publish listing"}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-control border border-red-300 bg-card px-5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          disabled={isPending}
          onClick={() => run("discard")}
          type="button"
        >
          {pendingAction === "discard" ? "Discarding…" : "Discard draft"}
        </button>
        {!ready && (
          <p className="text-xs text-amber-900/80 dark:text-amber-300">
            Publish unlocks once every item is ticked.
          </p>
        )}
      </div>
    </section>
  );
}
