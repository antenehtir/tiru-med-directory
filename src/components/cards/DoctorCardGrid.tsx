import { DoctorCard } from "./DoctorCard";
import type { Doctor } from "@/types/doctor";

type DoctorCardGridProps = {
  doctors: Doctor[];
};

export function DoctorCardGrid({ doctors }: DoctorCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}
