import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-background">
      <PageContainer className="py-8 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-flex max-w-full rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground sm:px-4">
            Private healthcare discovery for Addis Ababa
          </p>
          <h1 className="mx-auto max-w-3xl text-[2rem] font-semibold leading-[1.08] text-foreground sm:text-5xl sm:leading-[1.04]">
            Find healthcare facilities, services, doctors, and pharmacies on the go.
          </h1>

          <div className="mx-auto max-w-3xl text-left">
            <HealthcareSearchBox />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
