import Link from "next/link";
import type { Doctor } from "@/types/doctor";

type DoctorCorrectionCtaProps = {
  doctor: Doctor;
};

export function DoctorCorrectionCta({ doctor }: DoctorCorrectionCtaProps) {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal">
        Request correction
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">
        See something outdated for {doctor.name}?
      </h2>
      <p className="mt-3 text-sm leading-6 text-primary-foreground/85">
        Preview the correction flow for outdated specialty, facility,
        availability, or verification details.
      </p>
      <Link
        className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-card px-5 text-center text-sm font-semibold text-[#0F172A]"
        href="/corrections"
        style={{ color: "#0F172A" }}
      >
        Request correction preview
      </Link>
    </section>
  );
}
