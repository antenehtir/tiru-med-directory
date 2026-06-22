import Link from "next/link";
import { FacilityLogo } from "@/components/cards/FacilityCard";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { realFacilities } from "@/data/real-facility-profiles";

const showcasedFacilities = realFacilities.slice(0, 10);
const marqueeFacilities = [...showcasedFacilities, ...showcasedFacilities];

export function FeaturedFacilityStrip() {
  if (showcasedFacilities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="-mx-4 snap-x snap-mandatory overflow-x-auto scroll-smooth px-4 pb-2 lg:hidden">
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

      <div className="hidden overflow-hidden lg:block">
        <div className="homepage-facility-strip flex w-max gap-4 pb-2">
          {marqueeFacilities.map((facility, index) => (
            <FeaturedFacilityCard
              className="w-[17rem]"
              facility={facility}
              key={`${facility.slug}-${index}`}
            />
          ))}
        </div>
      </div>
    </>
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
      className={`flex min-h-40 shrink-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_10px_26px_rgba(31,41,55,0.04)] transition hover:border-strong-border ${className}`}
      href={facility.detailHref ?? `/facilities/${facility.slug}`}
    >
      <div className="flex items-center gap-3">
        <FacilityLogo facility={facility} />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {facility.category}
          </span>
          <VerificationBadge status={facility.verificationStatus} />
        </div>
      </div>
      <h3 className="mt-3 line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
        {facility.name}
      </h3>
      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
        {facility.location}
      </p>
    </Link>
  );
}
