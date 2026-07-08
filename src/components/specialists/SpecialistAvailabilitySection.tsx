"use client";

import { useMemo } from "react";
import type { DoctorScheduleRow } from "@/lib/provider/doctor-types";

// Adapted from FacilityHoursSection's day-by-day grid, applied to a single
// doctor's available_schedule instead of a facility's schedule.
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

function buildDayMap(rows: DoctorScheduleRow[]): Map<DayName, DoctorScheduleRow | null> {
  const map = new Map<DayName, DoctorScheduleRow | null>(DAYS_ORDER.map((d) => [d, null]));
  for (const row of rows) {
    for (const rawDay of row.days) {
      const day = normalizeDay(rawDay);
      if (day) map.set(day, row);
    }
  }
  return map;
}

function parseTimeTo24(timeStr: string): number | null {
  const m = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return h * 60 + min;
}

function isCurrentlyOpen(row: DoctorScheduleRow, nowMin: number): boolean {
  if (row.closed) return false;
  if (row.open === "Open 24 hours") return true;
  const openMin = parseTimeTo24(row.open);
  const closeMin = parseTimeTo24(row.close);
  if (openMin === null || closeMin === null) return false;
  return nowMin >= openMin && nowMin < closeMin;
}

export function SpecialistAvailabilitySection({
  schedule,
}: {
  schedule: DoctorScheduleRow[];
}) {
  const now = new Date();
  const todayName = JS_DAY_TO_NAME[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const { dayMap, availableNow } = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return { dayMap: null, availableNow: false };
    }
    const map = buildDayMap(schedule);
    const todayRow = map.get(todayName) ?? null;
    return { dayMap: map, availableNow: todayRow ? isCurrentlyOpen(todayRow, nowMin) : false };
  }, [schedule, todayName, nowMin]);

  if (!dayMap) return null;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">Availability</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            availableNow
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${availableNow ? "bg-emerald-500" : "bg-muted-foreground"}`}
          />
          {availableNow ? "Available now" : "Not currently in"}
        </span>
      </div>

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
                {isToday && <span className="ml-1.5 text-xs font-normal text-primary">today</span>}
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
                {isClosed ? "Not scheduled" : hours}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
