import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "./SectionHeading";

const nearbyItems = [
  { name: "Bole Family Clinic", type: "Clinic", area: "Bole", status: "Open" },
  { name: "Kazanchis Pharmacy", type: "Pharmacy", area: "Kazanchis", status: "Open" },
  { name: "Arat Kilo Lab", type: "Laboratory", area: "Arat Kilo", status: "Closes soon" },
];

export function NearbyHealthcareSection() {
  return (
    <section className="bg-background">
      <PageContainer className="py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Nearby"
            title="Preview nearby healthcare without maps."
            description="This section prepares the future nearby discovery experience with simple sample cards only."
          />
          <div className="grid gap-3">
            {nearbyItems.map((item) => (
              <article
                key={item.name}
                className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-card-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.type} in {item.area}
                  </p>
                </div>
                <span className="inline-flex h-8 items-center rounded-full bg-muted px-3 text-xs font-semibold text-primary">
                  {item.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
