import Link from "next/link";
import { FacilityBanner } from "@/components/cards/FacilityCard";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { realFacilities } from "@/data/real-facility-profiles";

const showcasedFacilities = realFacilities.slice(0, 10);
const marqueeFacilities = [...showcasedFacilities, ...showcasedFacilities];

export function FeaturedFacilityStrip() {
  if (showcasedFacilities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="overflow-hidden lg:hidden">
        <div
          className="-mx-4 snap-x snap-mandatory overflow-x-auto scroll-smooth px-4 pb-2 [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex w-max flex-nowrap gap-4">
            {showcasedFacilities.map((facility) => (
              <FeaturedFacilityCard
                className="w-64 shrink-0 snap-start"
                facility={facility}
                key={facility.id}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden lg:block">
        <div className="homepage-facility-strip flex w-max flex-nowrap gap-4 pb-2">
          {marqueeFacilities.map((facility, index) => (
            <FeaturedFacilityCard
              className="w-64 shrink-0"
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
      className={`group block rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent p-[1px] transition hover:from-primary/40 active:scale-[0.98] ${className}`}
      href={facility.detailHref ?? `/facilities/${facility.slug}`}
    >
      <div className="flex h-full min-w-0 flex-col rounded-2xl bg-card shadow-[0_10px_26px_rgba(31,41,55,0.04)] group-hover:shadow-md">
        <FacilityBanner facility={facility} />
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
          <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
            {facility.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {facility.location}
          </p>
          {facility.workingHours?.trim() ? (
            <div className="mt-2">
              <WorkingHoursIndicator hours={facility.workingHours} />
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
