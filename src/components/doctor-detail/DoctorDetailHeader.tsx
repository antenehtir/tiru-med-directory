import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Doctor } from "@/types/doctor";

type DoctorDetailHeaderProps = {
  doctor: Doctor;
};

export function DoctorDetailHeader({ doctor }: DoctorDetailHeaderProps) {
  return (
    <header className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-bold text-primary sm:size-16">
            {doctor.profileInitials}
          </div>
          <div className="min-w-0">
            <p className="mb-3 inline-flex rounded-full border border-border bg-muted px-3 py-2 text-sm font-medium text-primary">
              Doctor detail preview
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {doctor.name}
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {doctor.specialty} at {doctor.facility}
            </p>
          </div>
        </div>
        <VerificationBadge status={doctor.verificationStatus} entityType="doctor" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            {doctor.specialty}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Specialty</p>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            {doctor.location}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Location</p>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-semibold text-success">
            {doctor.availability}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Availability</p>
        </div>
      </div>
    </header>
  );
}
