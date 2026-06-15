import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { realFacilities } from "@/data/real-facility-profiles";

const showcasedFacilities = realFacilities.slice(0, 10);

export function FeaturedFacilityStrip() {
  if (showcasedFacilities.length === 0) {
    return null;
  }

  return (
    <section className="bg-transparent">
      <PageContainer className="py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F766E]">
              Real providers on Tiru
            </p>
            <h2 className="text-2xl font-semibold leading-tight text-foreground">
              Featured care options
            </h2>
          </div>
          <Link
            className="inline-flex min-h-10 w-fit items-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
            href="/facilities"
          >
            Browse all facilities
          </Link>
        </div>

        <div className="mt-5 overflow-hidden">
          <div className="homepage-facility-strip flex gap-3 overflow-x-auto pb-2 sm:gap-4 lg:w-max lg:overflow-visible">
            {showcasedFacilities.map((facility) => (
              <Link
                className="flex min-h-44 w-[17rem] shrink-0 snap-start flex-col rounded-3xl border border-border bg-card p-4 shadow-[0_10px_26px_rgba(31,41,55,0.04)] transition hover:border-strong-border"
                href={facility.detailHref ?? `/facilities/${facility.slug}`}
                key={facility.id}
              >
                <p className="text-xs font-semibold text-[#0F766E]">
                  {facility.category}
                </p>
                <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-foreground">
                  {facility.name}
                </h3>
                <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                  {facility.location}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {facility.services[0] ?? facility.subcategory}
                </p>
                <span className="mt-auto pt-4 text-sm font-semibold text-primary">
                  View details
                </span>
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
