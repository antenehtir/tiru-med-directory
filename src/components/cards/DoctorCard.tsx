import Link from "next/link";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";

type DoctorCardProps = {
  doctor: Doctor;
};

const telemedicineLabels: Record<DoctorTelemedicineStatus, string> = {
  available: "Telemedicine preview",
  planned: "Telemedicine planned",
  "not-available": "In-person preview",
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
            {doctor.profileInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {doctor.specialty}
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-snug text-card-foreground">
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
        <div className="grid gap-2 rounded-md bg-muted p-3">
          <p className="font-semibold text-success">{doctor.availability}</p>
          <p className="text-muted-foreground">
            {telemedicineLabels[doctor.telemedicineStatus]}
          </p>
        </div>
      </div>

      <div className="mt-auto grid gap-2 pt-5 min-[420px]:grid-cols-2">
        <button
          className="min-h-12 rounded-md border border-border bg-card px-3 text-sm font-semibold text-primary"
          type="button"
        >
          {doctor.bookingActionLabel}
        </button>
        <Link
          className="flex min-h-12 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
          href="/doctors"
        >
          {doctor.profileActionLabel}
        </Link>
      </div>
    </article>
  );
}
