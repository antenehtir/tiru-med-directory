import type { Facility, FacilityDoctor } from "@/types/facility";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatScheduleSummary(doctor: FacilityDoctor): string | null {
  const active = doctor.available_schedule?.filter((r) => !r.closed && r.days.length > 0);
  if (!active || active.length === 0) return null;
  // Collapse rows that share the same hours
  const first = active[0];
  const days = active.flatMap((r) => r.days).join(", ");
  return `${days} · ${first.open}–${first.close}`;
}

function DoctorCard({ doctor }: { doctor: FacilityDoctor }) {
  const initials = getInitials(doctor.full_name);
  const schedule = formatScheduleSummary(doctor);
  const displayRole = doctor.role === "Other" && doctor.role_other ? doctor.role_other : doctor.role;

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
      {/* Photo / initials avatar */}
      <div className="shrink-0">
        {doctor.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={doctor.full_name}
            className="size-16 rounded-full object-cover ring-2 ring-border"
            src={doctor.photo_url}
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-soft-accent text-base font-bold text-primary ring-2 ring-border">
            {initials}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight text-foreground">
          {doctor.title && doctor.title !== "Other" ? `${doctor.title} ` : ""}
          {doctor.full_name}
        </p>

        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {displayRole && (
            <span className="inline-flex rounded-full bg-soft-accent px-2 py-0.5 text-xs font-medium text-primary">
              {displayRole}
            </span>
          )}
          {doctor.appointment_required && (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Appointment required
            </span>
          )}
        </div>

        {(doctor.specialty || doctor.subspecialty) && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {doctor.specialty}
            {doctor.subspecialty ? ` · ${doctor.subspecialty}` : ""}
          </p>
        )}

        {schedule && (
          <p className="mt-1 text-xs text-muted-foreground">{schedule}</p>
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
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Meet the specialists
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {doctors.map((doctor) => (
          <DoctorCard doctor={doctor} key={doctor.id} />
        ))}
      </div>
    </section>
  );
}
