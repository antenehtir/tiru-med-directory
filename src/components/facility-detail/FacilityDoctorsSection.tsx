"use client";

import Link from "next/link";
import { useState } from "react";
import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { Badge } from "@/components/ui/Badge";
import { toSlug } from "@/lib/slugify";
import { formatDoctorDisplayName, specialistTitle } from "@/lib/provider/doctor-types";
import { appointmentPolicyDescription, effectiveAppointmentPolicy } from "@/lib/provider/onboarding-config";
import type { Facility, FacilityAppointmentModality, FacilityDoctor } from "@/types/facility";
import { DoctorBookingOptions } from "./DoctorBookingOptions";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
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
        className="pointer-events-auto relative z-20 font-medium text-primary hover:underline"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </p>
  );
}

function DoctorCard({
  doctor,
  facilitySlug,
  walkinAppointment,
  appointmentModalities,
  facilityPhone,
}: {
  doctor: FacilityDoctor;
  facilitySlug: string;
  walkinAppointment: string | null;
  appointmentModalities: FacilityAppointmentModality[] | undefined;
  facilityPhone: string;
}) {
  const initials = getInitials(doctor.full_name);
  const displayRole = doctor.role === "Other" && doctor.role_other ? doctor.role_other : doctor.role;
  // One clean title ("General Pediatrician") instead of the role text and a
  // separate specialty · subspecialty line saying overlapping things — falls
  // back to the raw role for the non-clinical roles (Nurse, Pharmacist, ...)
  // that were never asked for a specialty.
  const title = specialistTitle(doctor.specialty, doctor.subspecialty) || displayRole;
  // The doctor's own policy when they set one, otherwise the facility's.
  const policy = effectiveAppointmentPolicy(doctor.appointment_policy, walkinAppointment);
  const appointment = appointmentPolicyDescription(policy);
  const hasBio = doctor.bio && doctor.bio.trim().length > 0;
  const profileSlug = `${toSlug(doctor.full_name)}-${facilitySlug}-${(doctor.id ?? "").slice(0, 6)}`;

  return (
    <div className="group relative isolate flex gap-4 rounded-card border border-border bg-background p-5 shadow-card transition hover:shadow-lift sm:flex-row">
      {/* Tapping anywhere on the card used to do nothing — only the small
          "View full profile" text at the bottom was a link, which on a
          touch screen is an easy miss on a card this size. Same overlay-link
          technique FacilityCard already uses: this sits at the back
          (z-0), everything else renders in front of it (z-10 below), so a
          tap on the bio's own "Show more" button or the profile link still
          reaches that element first and only a tap on the empty card
          background falls through to this. */}
      <Link
        aria-label={`View ${formatDoctorDisplayName(doctor.title, doctor.full_name)}'s profile`}
        className="absolute inset-0 z-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        href={`/specialists/${profileSlug}`}
      />
      {/* Photo / initials avatar */}
      <div className="pointer-events-none relative z-10 shrink-0">
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

      {/* Details. pointer-events-none here is load-bearing, not decoration:
          without it this div — even the plain text and whitespace inside it,
          which has no click handler of its own — sits visually above the
          overlay Link at z-0 and swallows every tap before it ever reaches
          the link, so the "whole card is clickable" affordance below silently
          did nothing except on the couple of small elements re-enabling
          pointer-events explicitly. */}
      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <p className="text-base font-semibold leading-tight text-foreground">
          {formatDoctorDisplayName(doctor.title, doctor.full_name)}
        </p>
        {title && <p className="mt-1 text-sm font-medium text-primary">{title}</p>}

        {/* Most specialist visits need booking ahead — leaving this out when
            the facility never answered the question would silently read as
            "walk in any time", which is wrong far more often than it's
            right. */}
        <div className="mt-1.5">
          <Badge size="sm" variant={appointment.isStated ? "info" : "warning"}>
            {appointment.text}
          </Badge>
        </div>

        {hasBio && <BioBlock bio={doctor.bio!} />}

        <div className="mt-3">
          <AvailabilityIndicator schedule={doctor.available_schedule} />
        </div>

        {/* Links inside are tappable on their own: this block opts back
            into pointer events over the card's whole-card link. */}
        <DoctorBookingOptions
          className="pointer-events-auto relative z-20 mt-3"
          facilityPhone={facilityPhone}
          modalities={appointmentModalities}
          policy={policy}
        />

        {/* The one visible call to action, styled to actually read as one —
            it used to duplicate a matching link at the bottom of the card,
            which said the same thing twice for no reason once the whole
            card became tappable. */}
        <p className="pointer-events-auto relative z-20 mt-3 text-sm font-semibold text-primary">
          <Link className="hover:underline" href={`/specialists/${profileSlug}`}>
            Tap to view full profile &amp; schedule →
          </Link>
        </p>
      </div>
    </div>
  );
}

export function FacilityDoctorsSection({ facility }: { facility: Facility }) {
  const doctors = facility.doctors;
  if (!doctors || doctors.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Our team
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground">
        Meet the specialists
      </h2>
      {doctors.length > 1 && (
        <p className="mt-0.5 text-sm text-muted-foreground">
          {doctors.length} specialists at this facility
        </p>
      )}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {doctors.map((doctor) => (
          <DoctorCard
            doctor={doctor}
            facilitySlug={facility.slug}
            key={doctor.id}
            appointmentModalities={facility.appointmentModalities}
            facilityPhone={facility.contactChannels?.find((channel) => channel.channelType === "phone")?.value ?? ""}
            walkinAppointment={facility.walkinAppointment ?? null}
          />
        ))}
      </div>
    </section>
  );
}
