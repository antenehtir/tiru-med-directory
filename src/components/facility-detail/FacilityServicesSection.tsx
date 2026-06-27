import type { Facility } from "@/types/facility";

type FacilityServicesSectionProps = {
  facility: Facility;
};

export function FacilityServicesSection({
  facility,
}: FacilityServicesSectionProps) {
  const seen = new Set<string>();
  const uniqueServices = facility.services.filter((service) => {
    const key = service.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueServices.length === 0) return null;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-sm font-semibold text-primary">
        Services
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Available care information
      </h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {uniqueServices.map((service) => (
          <span
            className="rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
            key={service}
          >
            {service}
          </span>
        ))}
      </div>
    </section>
  );
}
