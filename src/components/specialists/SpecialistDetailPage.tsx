import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import type { SpecialistDetail, SpecialistListItem } from "@/lib/supabase/get-specialists";
import { SpecialistAvailabilitySection } from "./SpecialistAvailabilitySection";
import { SpecialistCard } from "./SpecialistCard";

function getInitials(name: string): string {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const OFFICIAL_BADGE_STATUSES = new Set(["facility-owned", "verified"]);

function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function SpecialistDetailPage({
  specialist,
  similarSpecialists = [],
}: {
  specialist: SpecialistDetail;
  similarSpecialists?: SpecialistListItem[];
}) {
  const initials = getInitials(specialist.fullName);
  const isOfficial = OFFICIAL_BADGE_STATUSES.has(specialist.facilityBadge);
  const facilityHref = `/facilities/${specialist.facilitySlug}`;
  const hasBio = specialist.bio.trim().length > 0;
  const directionsHref =
    specialist.facilityMapsLink ||
    (specialist.facilityLatitude != null && specialist.facilityLongitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${specialist.facilityLatitude},${specialist.facilityLongitude}`
      : null);

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        {/* Header + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <header className="rounded-3xl border border-border bg-card p-5 shadow-[0_14px_34px_rgba(31,41,55,0.045)] sm:p-6 lg:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              {specialist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={specialist.fullName}
                  className="size-[120px] shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                  src={specialist.photoUrl}
                />
              ) : (
                <div className="flex size-[120px] shrink-0 items-center justify-center rounded-full bg-soft-accent text-3xl font-bold text-primary ring-2 ring-primary/20">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
                  {specialist.title && specialist.title !== "Other" ? `${specialist.title} ` : ""}
                  {specialist.fullName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {specialist.role && (
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {specialist.role}
                    </span>
                  )}
                  {specialist.appointmentRequired && (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                      By appointment
                    </span>
                  )}
                </div>

                {(specialist.specialty || specialist.subspecialty) && (
                  <p className="mt-3 text-base font-medium text-primary">
                    {specialist.specialty}
                    {specialist.subspecialty ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {specialist.subspecialty}
                      </span>
                    ) : null}
                  </p>
                )}

                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  Practices at{" "}
                  <Link className="font-semibold text-primary hover:underline" href={facilityHref}>
                    {specialist.facilityName}
                  </Link>
                  {isOfficial && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Official
                    </span>
                  )}
                </p>
              </div>
            </div>
          </header>

          {/* Sidebar */}
          <aside className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6 lg:sticky lg:top-24">
            <div className="grid gap-3">
              {specialist.facilityPhone ? (
                <a
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-center font-semibold text-primary-foreground transition hover:bg-primary-hover"
                  href={telHref(specialist.facilityPhone)}
                >
                  📞 Call {specialist.facilityName}
                </a>
              ) : null}
              <Link
                className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-primary text-center font-semibold text-primary transition hover:bg-primary/5"
                href={facilityHref}
              >
                View facility →
              </Link>
              {directionsHref ? (
                <a
                  className="flex min-h-12 w-full items-center justify-center rounded-xl border border-border text-center font-semibold text-foreground transition hover:bg-muted"
                  href={directionsHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  📍 Get directions
                </a>
              ) : null}
            </div>
          </aside>
        </div>

        {/* Main content */}
        <div className="grid gap-6">
          {hasBio && (
            <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
              <p className="text-sm font-semibold text-primary">About</p>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{specialist.bio}</p>
            </section>
          )}

          <SpecialistAvailabilitySection schedule={specialist.availableSchedule} />

          {specialist.languages.length > 0 && (
            <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
              <p className="text-sm font-semibold text-primary">Languages spoken</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {specialist.languages.map((lang) => (
                  <span
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground"
                    key={lang}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
            <p className="text-sm font-semibold text-primary">About {specialist.facilityName}</p>
            <div className="mt-3 rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">{specialist.facilityCategory}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[specialist.facilityArea, specialist.facilitySubCity].filter(Boolean).join(", ")}
              </p>
              <Link
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                href={facilityHref}
              >
                View full facility profile →
              </Link>
            </div>
          </section>
        </div>

        {similarSpecialists.length > 0 && (
          <section>
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                Similar specialists
              </p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
                Other {specialist.specialty} specialists
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarSpecialists.map((other) => (
                <SpecialistCard key={other.id} specialist={other} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
