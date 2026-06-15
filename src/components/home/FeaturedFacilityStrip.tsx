import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
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
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">
              Community-submitted providers on Tiru
            </p>
            <h2 className="text-2xl font-semibold leading-tight text-foreground">
              Community-submitted facilities
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Listings are reviewed and updated as providers confirm details.
            </p>
          </div>
          <Link
            className="inline-flex min-h-10 w-fit items-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
            href="/facilities"
          >
            Browse all facilities
          </Link>
        </div>

        <div className="-mx-4 mt-5 snap-x snap-mandatory overflow-x-auto scroll-smooth px-4 pb-2 lg:hidden">
          <div className="flex gap-3">
            {showcasedFacilities.map((facility) => (
              <FeaturedFacilityCard
                className="w-[84vw] max-w-[22rem] snap-start"
                facility={facility}
                key={facility.id}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 hidden overflow-hidden lg:block">
          <div className="homepage-facility-strip flex w-max gap-4 pb-2">
            {showcasedFacilities.map((facility) => (
              <FeaturedFacilityCard
                className="w-[17rem]"
                facility={facility}
                key={facility.id}
              />
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

type FeaturedFacilityCardProps = {
  className: string;
  facility: (typeof realFacilities)[number];
};

function FeaturedFacilityCard({
  className,
  facility,
}: FeaturedFacilityCardProps) {
  return (
    <Link
      className={`flex min-h-48 shrink-0 flex-col rounded-3xl border border-border bg-card p-4 shadow-[0_10px_26px_rgba(31,41,55,0.04)] transition hover:border-strong-border ${className}`}
      href={facility.detailHref ?? `/facilities/${facility.slug}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <VerificationBadge status={facility.verificationStatus} />
        <span className="text-xs font-semibold text-muted-foreground">
          {facility.category}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
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
  );
}
