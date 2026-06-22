import Link from "next/link";
import { ClockIcon } from "@/components/cards/contact-icons";
import { ShareButton } from "@/components/cards/ShareButton";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Doctor } from "@/types/doctor";

type DoctorCardProps = {
  doctor: Doctor;
};

function getConsultationModePills(availability: string): string[] {
  const lower = availability.toLowerCase();
  const pills: string[] = [];

  if (lower.includes("in-person")) {
    pills.push("In-person");
  }

  if (lower.includes("telemedicine") || lower.includes("online")) {
    pills.push("Telemedicine");
  }

  return pills;
}

function DoctorPhoto({ doctor }: { doctor: Doctor }) {
  if (doctor.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="size-16 shrink-0 rounded-full border border-border bg-primary/10 object-cover"
        src={doctor.photoUrl}
      />
    );
  }

  return (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-xl font-bold text-primary">
      {doctor.profileInitials}
    </div>
  );
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const detailHref = doctor.detailHref ?? `/doctors/${doctor.slug}`;
  const consultationModePills = getConsultationModePills(doctor.availability);

  return (
    <article className="group relative rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-transparent p-[1px] transition hover:from-primary/40 active:scale-[0.98]">
      <div className="flex h-full min-w-0 flex-col rounded-3xl bg-card p-4 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-5">
        <div className="flex flex-col items-start gap-3 min-[720px]:flex-row min-[720px]:justify-between">
          <div className="flex min-w-0 items-center gap-3 self-stretch">
            <DoctorPhoto doctor={doctor} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-muted-foreground">
                {doctor.specialty}
              </p>
              <h3 className="mt-1 whitespace-normal text-lg font-semibold leading-snug text-card-foreground">
                {doctor.name}
              </h3>
              {doctor.facility ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {doctor.facility}
                </p>
              ) : null}
              {consultationModePills.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {consultationModePills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              ) : null}
              {doctor.availability ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <ClockIcon className="size-3 shrink-0" />
                  {doctor.availability}
                </p>
              ) : null}
            </div>
          </div>
          <VerificationBadge status={doctor.verificationStatus} entityType="doctor" />
        </div>

        <div className="mt-4 text-sm leading-6 sm:mt-5">
          <p className="text-muted-foreground">{doctor.location}</p>
        </div>

        <div className="mt-auto flex gap-2 pt-5">
          <ShareButton
            ariaLabel="Share this specialist"
            name={doctor.name}
            path="/doctors"
            slug={doctor.slug}
          />
          <Link
            className="flex min-h-12 flex-[2] items-center justify-center rounded-2xl bg-primary px-3 text-center text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-95"
            href={detailHref}
          >
            {doctor.profileActionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
