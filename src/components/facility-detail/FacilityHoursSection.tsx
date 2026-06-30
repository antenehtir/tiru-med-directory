"use client";

import { useMemo } from "react";
import type { Facility, FacilityScheduleRow } from "@/types/facility";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DayName = (typeof DAYS_ORDER)[number];

// JS Date.getDay(): 0 = Sunday, 1 = Monday … 6 = Saturday
const JS_DAY_TO_NAME: Record<number, DayName> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  0: "Sunday",
};

function normalizeDay(raw: string): DayName | null {
  const lower = raw.toLowerCase().slice(0, 3);
  return (
    (DAYS_ORDER.find((d) => d.toLowerCase().startsWith(lower)) as DayName | undefined) ?? null
  );
}

function buildDayMap(rows: FacilityScheduleRow[]): Map<DayName, FacilityScheduleRow | null> {
  const map = new Map<DayName, FacilityScheduleRow | null>(DAYS_ORDER.map((d) => [d, null]));
  for (const row of rows) {
    for (const rawDay of row.days) {
      const day = normalizeDay(rawDay);
      if (day) map.set(day, row);
    }
  }
  return map;
}

function parseTimeTo24(timeStr: string): number | null {
  // "8:00 AM" → minutes since midnight
  const m = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return h * 60 + min;
}

function isCurrentlyOpen(row: FacilityScheduleRow, nowMin: number): boolean {
  if (row.closed) return false;
  if (row.open === "Open 24 hours") return true;
  const openMin = parseTimeTo24(row.open);
  const closeMin = parseTimeTo24(row.close);
  if (openMin === null || closeMin === null) return false;
  return nowMin >= openMin && nowMin < closeMin;
}

function nextOpenTime(rows: FacilityScheduleRow[], todayName: DayName, nowMin: number): string | null {
  const todayRow = rows.find((r) => r.days.some((d) => normalizeDay(d) === todayName));
  if (!todayRow || todayRow.closed) return null;
  const openMin = parseTimeTo24(todayRow.open);
  if (openMin !== null && nowMin < openMin) return todayRow.open;
  return null;
}

type FacilityHoursSectionProps = {
  facility: Facility;
};

export function FacilityHoursSection({ facility }: FacilityHoursSectionProps) {
  const now = new Date();
  const todayName = JS_DAY_TO_NAME[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const { dayMap, is24_7, openNow, opensAt } = useMemo(() => {
    const schedule = facility.schedule;
    if (!schedule || schedule.length === 0) {
      return { dayMap: null, is24_7: false, openNow: false, opensAt: null };
    }

    const is24_7 =
      facility.workingHours?.trim().toLowerCase() === "24/7" ||
      schedule.some((r) => r.open === "Open 24 hours" && !r.closed);

    const map = buildDayMap(schedule);
    const todayRow = map.get(todayName) ?? null;
    const openNow = is24_7 || (todayRow ? isCurrentlyOpen(todayRow, nowMin) : false);
    const opensAt = !openNow ? nextOpenTime(schedule, todayName, nowMin) : null;

    return { dayMap: map, is24_7, openNow, opensAt };
  }, [facility.schedule, facility.workingHours, todayName, nowMin]);

  if (!facility.workingHours && !facility.schedule?.length) return null;

  const hasStructuredSchedule = dayMap !== null;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">Hours</p>
        {hasStructuredSchedule && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              openNow
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${openNow ? "bg-emerald-500" : "bg-muted-foreground"}`}
            />
            {openNow
              ? is24_7
                ? "Open 24/7"
                : "Open now"
              : opensAt
                ? `Opens at ${opensAt}`
                : "Closed now"}
          </span>
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
    </section>
  );
}
