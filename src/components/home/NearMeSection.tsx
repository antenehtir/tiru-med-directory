"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { facilityCategoryBadgeLabels, facilityMonogram, facilityPlateClasses, resolveFacilityCardCategoryKey } from "@/components/cards/facility-category-style";
import { MapPinOffIcon } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { NearbyFacility, NearbySpecialist } from "@/components/nearby/NearbyPage";
import { formatDoctorDisplayName } from "@/lib/provider/doctor-types";
import { personInitials } from "@/lib/person-initials";
import { calculateDistanceKm, formatDistanceKm } from "@/lib/nearby-distance";
import { useGeolocation } from "@/lib/useGeolocation";

const MAX_RESULTS = 8;

type RankedItem =
  | { kind: "facility"; distanceKm: number; facility: NearbyFacility }
  | { kind: "specialist"; distanceKm: number; specialist: NearbySpecialist };

export function NearMeSection({ facilities, specialists }: { facilities: NearbyFacility[]; specialists: NearbySpecialist[] }) {
  const { locationState, userLocation, requestLocation } = useGeolocation(false);

  const ranked = useMemo<RankedItem[]>(() => {
    if (!userLocation) return [];
    const facilityItems: RankedItem[] = facilities.filter((f) => f.coordinates).map((facility) => ({ kind: "facility", distanceKm: calculateDistanceKm(userLocation, facility.coordinates!), facility }));
    const specialistItems: RankedItem[] = specialists.filter((s) => s.coordinates).map((specialist) => ({ kind: "specialist", distanceKm: calculateDistanceKm(userLocation, specialist.coordinates!), specialist }));
    return [...facilityItems, ...specialistItems].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, MAX_RESULTS);
  }, [facilities, specialists, userLocation]);

  if (locationState === "ready" && ranked.length === 0) return null;

  return (
    <section aria-labelledby="nearby-heading" className="bg-transparent">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">Nearby care</p>
            <h2 id="nearby-heading" className="font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-3xl">Care near you</h2>
            <p className="mt-1 text-sm text-muted-foreground">Find healthcare services close to your current location.</p>
          </div>
          <Link className="inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover" href="/nearby">See all <span aria-hidden="true" className="ml-1">→</span></Link>
        </div>

        {locationState === "idle" ? (
          <LocationPrompt locationState="idle" onRetry={requestLocation} />
        ) : locationState === "loading" ? (
          <LoadingStrip />
        ) : locationState === "ready" ? (
          <ResultStrip items={ranked} />
        ) : (
          <LocationPrompt locationState={locationState} onRetry={requestLocation} />
        )}
      </PageContainer>
    </section>
  );
}

function LoadingStrip() {
  return <div aria-hidden="true" className="flex gap-3 overflow-hidden">{Array.from({ length: 4 }).map((_, i) => <div className="h-[152px] w-52 shrink-0 animate-pulse rounded-card border border-border bg-muted sm:w-56" key={i} />)}</div>;
}

function LocationPrompt({ locationState, onRetry }: { locationState: "idle" | "timeout" | "denied" | "unsupported"; onRetry: () => void }) {
  const copy = locationState === "idle"
    ? { title: "See care closest to you", detail: "Allow location access to sort nearby facilities and specialists by distance.", action: <button className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" onClick={onRetry} type="button"><MapPinIcon className="size-4" />Use my location</button> }
    : locationState === "unsupported"
      ? { title: "Location isn't supported in this browser", detail: "You can still search the directory or browse the nearby page manually.", action: <Link className="inline-flex min-h-11 shrink-0 items-center rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground" href="/nearby">Browse nearby</Link> }
      : locationState === "denied"
        ? { title: "Location access is off", detail: "Enable location permission in your browser settings to see care near you.", action: <Link className="inline-flex min-h-11 shrink-0 items-center rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground" href="/nearby">Browse nearby</Link> }
        : { title: "Couldn't get a location fix in time", detail: "You can try again or browse the directory without location access.", action: <button className="inline-flex min-h-11 shrink-0 items-center rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground" onClick={onRetry} type="button">Try again</button> };

  return <div className="flex flex-col gap-4 rounded-card border border-dashed border-strong-border bg-sunken px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-sm font-semibold text-foreground">{locationState !== "idle" && locationState !== "timeout" ? <MapPinOffIcon className="size-4 shrink-0 text-muted-foreground" /> : <MapPinIcon className="size-4 shrink-0 text-primary" />}{copy.title}</p><p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{copy.detail}</p></div>{copy.action}</div>;
}

function ResultStrip({ items }: { items: RankedItem[] }) {
  return <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 min-[360px]:-mx-4 min-[360px]:px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{items.map((item) => item.kind === "facility" ? <FacilityTile distanceKm={item.distanceKm} facility={item.facility} key={`f-${item.facility.id}`} /> : <SpecialistTile distanceKm={item.distanceKm} key={`s-${item.specialist.id}`} specialist={item.specialist} />)}</div>;
}

function TileShell({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="w-52 shrink-0 snap-start rounded-card border border-border bg-card p-4 shadow-card transition-all duration-150 hover:-translate-y-px hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none" href={href}>{children}</Link>;
}

function DistanceLine({ distanceKm }: { distanceKm: number }) { return <p className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-primary"><MapPinIcon className="size-3.5 shrink-0" />{formatDistanceKm(distanceKm)} away</p>; }

function FacilityTile({ facility, distanceKm }: { facility: NearbyFacility; distanceKm: number }) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  return <TileShell href={facility.detailHref ?? `/facilities/${facility.slug}`}><div className="flex items-start justify-between gap-3"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${facilityPlateClasses[categoryKey]}`}>{facilityMonogram(facility.name)}</div><span className="rounded-full border border-border bg-sunken px-2 py-1 text-[10px] font-semibold text-muted-foreground">{facilityCategoryBadgeLabels[categoryKey]}</span></div><p className="mt-3 truncate font-display text-[15px] font-semibold leading-tight text-foreground">{facility.name}</p><p className="mt-1 truncate text-[13px] text-muted-foreground">Healthcare facility</p><DistanceLine distanceKm={distanceKm} /></TileShell>;
}

function SpecialistTile({ specialist, distanceKm }: { specialist: NearbySpecialist; distanceKm: number }) {
  return <TileShell href={`/specialists/${specialist.slug}`}><div className="flex items-start justify-between gap-3">{specialist.photoUrl ? <img alt="" className="size-11 shrink-0 rounded-xl border border-border object-cover" src={specialist.photoUrl} /> : <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-soft-accent font-display text-sm font-bold text-primary">{personInitials(specialist.fullName)}</div>}<span className="rounded-full border border-border bg-sunken px-2 py-1 text-[10px] font-semibold text-muted-foreground">Specialist</span></div><p className="mt-3 truncate font-display text-[15px] font-semibold leading-tight text-foreground">{formatDoctorDisplayName(specialist.title, specialist.fullName)}</p><p className="mt-1 truncate text-[13px] text-muted-foreground">{specialist.specialty || specialist.facilityName}</p><DistanceLine distanceKm={distanceKm} /></TileShell>;
}
