import Link from "next/link";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";

type DoctorCardProps = {
  doctor: Doctor;
};

const telemedicineLabels: Record<DoctorTelemedicineStatus, string> = {
  available: "Telemedicine information",
  planned: "Telemedicine information is being verified.",
  "not-available": "In-person care",
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  const detailHref =
    doctor.detailHref ??
    (doctor.id === "doctor-hana-bekele"
      ? "/doctors/dr-hana-bekele"
      : "/doctors");

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.035)] sm:p-5">
      <div className="flex flex-col items-start gap-3 min-[720px]:flex-row min-[720px]:justify-between">
        <div className="flex min-w-0 items-center gap-3 self-stretch">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-sm font-bold text-foreground">
            {doctor.profileInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-muted-foreground">
              {doctor.specialty}
            </p>
            <h3 className="mt-1 whitespace-normal text-lg font-semibold leading-snug text-card-foreground">
              {doctor.name}
            </h3>
          </div>
        </div>
        <VerificationBadge status={doctor.verificationStatus} entityType="doctor" />
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 sm:mt-5">
        <div>
          <p className="font-medium text-card-foreground">{doctor.facility}</p>
          <p className="mt-1 text-muted-foreground">{doctor.location}</p>
        </div>
        <div className="grid gap-2 rounded-xl bg-muted p-3">
          <p className="font-semibold text-foreground">{doctor.availability}</p>
          <p className="text-muted-foreground">
            {telemedicineLabels[doctor.telemedicineStatus]}
          </p>
        </div>
      </div>

      <div className="mt-auto grid gap-2 pt-5 min-[420px]:grid-cols-2">
        <button
          className="min-h-12 rounded-lg border border-border bg-card px-3 text-center text-sm font-semibold text-foreground transition hover:border-strong-border"
          type="button"
        >
          {doctor.bookingActionLabel}
        </button>
        <Link
          className="flex min-h-12 items-center justify-center rounded-lg bg-primary px-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          href={detailHref}
        >
          {doctor.profileActionLabel}
        </Link>
      </div>
    </article>
  );
}
