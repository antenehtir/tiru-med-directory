import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="pb-6 pt-8 sm:pb-8 sm:pt-14 lg:pb-10 lg:pt-16">
        <div className="min-w-0">
          <p className="mb-4 inline-flex max-w-full rounded-full border border-border bg-[#ECFEFF] px-3 py-2 text-sm font-medium text-[#0F766E] sm:px-4">
            Private healthcare discovery for Addis Ababa
          </p>
          <h1 className="max-w-3xl text-[2.15rem] font-semibold leading-[1.04] text-foreground sm:text-5xl sm:leading-[1.02]">
            Find the right care, faster.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Search private hospitals, clinics, diagnostics, doctors, and
            pharmacies across Addis Ababa.
          </p>

          <div className="max-w-4xl">
            <HealthcareSearchBox />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
