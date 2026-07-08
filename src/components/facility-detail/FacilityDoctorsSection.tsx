"use client";

import Link from "next/link";
import { useState } from "react";
import { toSlug } from "@/lib/slugify";
import { formatDoctorDisplayName } from "@/lib/provider/doctor-types";
import type { Facility, FacilityDoctor } from "@/types/facility";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatScheduleLine(doctor: FacilityDoctor): string | null {
  const active = (doctor.available_schedule ?? []).filter((r) => !r.closed && r.days.length > 0);
  if (active.length === 0) return null;
  return active
    .map((r) => {
      const days = r.days.map((d) => d.slice(0, 3)).join(", ");
      const hours = r.open === "Open 24 hours" ? "24 hrs" : `${r.open}–${r.close}`;
      return `${days}: ${hours}`;
    })
    .join(" · ");
}

function BioBlock({ bio }: { bio: string }) {
  const LIMIT = 150;
  const [expanded, setExpanded] = useState(false);

  if (bio.length <= LIMIT) {
    return <p className="mt-2 text-sm text-muted-foreground">{bio}</p>;
  }

  return (
    <p className="mt-2 text-sm text-muted-foreground">
      {expanded ? bio : `${bio.slice(0, LIMIT)}…`}
      {" "}
      <button
        className="font-medium text-primary hover:underline"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </p>
  );
}

function DoctorCard({ doctor, facilitySlug }: { doctor: FacilityDoctor; facilitySlug: string }) {
  const initials = getInitials(doctor.full_name);
  const schedule = formatScheduleLine(doctor);
  const displayRole = doctor.role === "Other" && doctor.role_other ? doctor.role_other : doctor.role;
  const hasBio = doctor.bio && doctor.bio.trim().length > 0;
  const profileSlug = `${toSlug(doctor.full_name)}-${facilitySlug}-${(doctor.id ?? "").slice(0, 6)}`;

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:shadow-md sm:flex-row">
      {/* Photo / initials avatar */}
      <div className="shrink-0">
        {doctor.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={doctor.full_name}
            className="size-20 rounded-full object-cover ring-2 ring-primary/20"
            src={doctor.photo_url}
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-soft-accent text-lg font-bold text-primary ring-2 ring-primary/20">
            {initials}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-tight text-foreground">
          {formatDoctorDisplayName(doctor.title, doctor.full_name)}
        </p>

        {(displayRole || doctor.appointment_required) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {displayRole && (
              <span className="text-sm text-muted-foreground">{displayRole}</span>
            )}
            {doctor.appointment_required && (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                By appointment
              </span>
            )}
          </div>
        )}

        {(doctor.specialty || doctor.subspecialty) && (
          <p className="mt-1.5 text-sm font-medium text-primary">
            {doctor.specialty}
            {doctor.subspecialty ? (
              <span className="font-normal text-muted-foreground"> · {doctor.subspecialty}</span>
            ) : null}
          </p>
        )}

        {hasBio && <BioBlock bio={doctor.bio!} />}

        {schedule && (
          <div className="mt-2 flex items-center gap-1.5">
            <svg className="size-3.5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <rect height="18" rx="2" width="18" x="3" y="4" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="16" x2="16" y1="2" y2="6" />
            </svg>
            <p className="text-xs text-muted-foreground">{schedule}</p>
          </div>
        )}

        {doctor.languages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {doctor.languages.map((lang) => (
              <span
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                key={lang}
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        <Link
          className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          href={`/specialists/${profileSlug}`}
        >
          View full profile →
        </Link>
      </div>
    </div>
  );
}

export function FacilityDoctorsSection({ facility }: { facility: Facility }) {
  const doctors = facility.doctors;
  if (!doctors || doctors.length === 0) return null;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-sm font-semibold text-primary">Our team</p>
      <h2 className="mt-1 text-2xl font-semibold leading-tight text-foreground">
        Meet the specialists
      </h2>
      {doctors.length > 1 && (
        <p className="mt-0.5 text-sm text-muted-foreground">
          {doctors.length} specialists at this facility
        </p>
      )}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {doctors.map((doctor) => (
          <DoctorCard doctor={doctor} facilitySlug={facility.slug} key={doctor.id} />
        ))}
      </div>
    </section>
  );
}
