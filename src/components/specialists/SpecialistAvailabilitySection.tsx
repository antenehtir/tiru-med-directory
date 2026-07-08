"use client";

import { useMemo } from "react";
import type { DoctorScheduleRow } from "@/lib/provider/doctor-types";
import {
  buildDayMap,
  DAYS_ORDER,
  getAvailabilityStatus,
  getTodayName,
} from "@/lib/schedule-availability";

export function SpecialistAvailabilitySection({
  schedule,
}: {
  schedule: DoctorScheduleRow[];
}) {
  const now = new Date();
  const todayName = getTodayName(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const { dayMap, availableNow } = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return { dayMap: null, availableNow: false };
    }
    const map = buildDayMap(schedule);
    const status = getAvailabilityStatus(schedule, now);
    return { dayMap: map, availableNow: status.state === "open-now" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
