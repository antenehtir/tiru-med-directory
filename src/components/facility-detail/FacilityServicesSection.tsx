import { Pill } from "@/components/ui/Pill";
import { groupFacilityServices } from "@/lib/facility/service-groups";
import { getFacilityMedicalSpecialties } from "@/lib/facility/specialty-display";
import type { Facility } from "@/types/facility";

type FacilityServicesSectionProps = {
  facility: Facility;
};

export function FacilityServicesSection({ facility }: FacilityServicesSectionProps) {
  const groups = groupFacilityServices(facility);
  const medicalSpecialties = getFacilityMedicalSpecialties(facility.services);

  if (groups.length === 0 && medicalSpecialties.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Services & specialties</p>
        <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
          Care available at this facility
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Review the services and clinical areas listed for this provider.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        {medicalSpecialties.length > 0 ? (
          <div>
            <p className="mb-2.5 text-sm font-semibold text-foreground">Clinical specialties</p>
            <div className="flex flex-wrap gap-2">
              {medicalSpecialties.map((specialty) => (
                <Pill key={specialty} variant="default">
                  {specialty}
                </Pill>
              ))}
            </div>
          </div>
        ) : null}

        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2.5 text-sm font-semibold text-foreground">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.services.map((service) => (
                <Pill key={service} variant="default">
                  {service}
                </Pill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
