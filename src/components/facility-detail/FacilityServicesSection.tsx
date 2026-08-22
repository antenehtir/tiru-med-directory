import { Pill } from "@/components/ui/Pill";
import { groupFacilityServices } from "@/lib/facility/service-groups";
import type { Facility } from "@/types/facility";

type FacilityServicesSectionProps = {
  facility: Facility;
};

export function FacilityServicesSection({
  facility,
}: FacilityServicesSectionProps) {
  const groups = groupFacilityServices(facility);

  if (groups.length === 0) return null;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Services
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground">
        Available care information
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-sm font-semibold text-foreground">{group.label}</p>
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
