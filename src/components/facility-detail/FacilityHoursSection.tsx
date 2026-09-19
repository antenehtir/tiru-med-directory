"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import type { Facility } from "@/types/facility";
import {
  buildDayMap,
  DAYS_ORDER,
  getAvailabilityStatus,
  getTodayName,
} from "@/lib/schedule-availability";
import { addisWallClock } from "@/lib/addis-time";

type FacilityHoursSectionProps = {
  facility: Facility;
};

export function FacilityHoursSection({ facility }: FacilityHoursSectionProps) {
  const now = new Date();
  const todayName = getTodayName(now);
  // Addis wall clock, not the viewer's: these are Addis opening hours, and a
  // visitor reading this from another timezone should see whether the doors
  // are open there, not here.
  const nowMin = addisWallClock(now).minutes;

  const { dayMap, is24_7, openNow, opensAt } = useMemo(() => {
    const schedule = facility.schedule;
    if (!schedule || schedule.length === 0) {
      return { dayMap: null, is24_7: false, openNow: false, opensAt: null };
    }

    const status = getAvailabilityStatus(schedule, now);
    const map = buildDayMap(schedule);

    const is24_7 =
      facility.workingHours?.trim().toLowerCase() === "24/7" ||
      (status.state === "open-now" && status.is24Hours);
    const openNow = status.state === "open-now";
    const opensAt = status.state === "opens-later-today" ? status.opensAt : null;

    return { dayMap: map, is24_7, openNow, opensAt };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facility.schedule, facility.workingHours, todayName, nowMin]);

  if (!facility.workingHours && !facility.schedule?.length) return null;

  const hasStructuredSchedule = dayMap !== null;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hours
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground">
            Opening hours
          </h2>
        </div>
        {hasStructuredSchedule && (
          <Badge dot variant={openNow ? "success" : "muted"}>
            {openNow
              ? is24_7
                ? "Open 24/7"
                : "Open now"
              : opensAt
                ? `Opens at ${opensAt}`
                : "Closed now"}
          </Badge>
        )}
      </div>

      {hasStructuredSchedule && dayMap ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {DAYS_ORDER.map((day, idx) => {
            const row = dayMap.get(day) ?? null;
            const isToday = day === todayName;
            const isClosed = !row || row.closed;
            const hours = isClosed
              ? null
              : row.open === "Open 24 hours"
                ? "Open 24 hours"
                : `${row.open} – ${row.close}`;

            return (
              <div
                key={day}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  idx < DAYS_ORDER.length - 1 ? "border-b border-border" : ""
                } ${isToday ? "bg-primary/5" : ""}`}
              >
                <span
                  className={`w-20 shrink-0 text-sm ${
                    isToday ? "font-bold text-foreground" : "font-medium text-foreground"
                  }`}
                >
                  {day.slice(0, 3)}
                  {isToday && (
                    <span className="ml-1.5 text-xs font-normal text-primary">today</span>
                  )}
                </span>
                <span
                  className={`text-sm ${
                    isClosed
                      ? "text-muted-foreground/60"
                      : isToday
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {isClosed ? "Closed" : hours}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{facility.workingHours}</p>
      )}

      {/* Set by the admin editor and, since the onboarding wizard's free-text
          "Holiday availability" box was replaced, by providers too — both use
          the Open / Closed tick boxes in ScheduleBuilder. Three states:
          unanswered gets a prompt to confirm rather than silence, since the
          listing genuinely does not know. */}
      {facility.closedOnPublicHolidays === true ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-muted-foreground">
          <span aria-hidden="true">🎌</span>
          Closed on public holidays.
        </p>
      ) : facility.closedOnPublicHolidays === false ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-success-text">
          <span aria-hidden="true">🎌</span>
          Open on public holidays too.
        </p>
      ) : (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span aria-hidden="true">⚠️</span>
          Hours on public holidays are not confirmed yet — check with the facility before visiting on one.
        </p>
      )}
    </section>
  );
}
