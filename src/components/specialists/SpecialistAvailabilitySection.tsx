"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
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
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Availability
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground">
            Weekly schedule
          </h2>
        </div>
        <Badge dot variant={availableNow ? "success" : "muted"}>
          {availableNow ? "Available now" : "Not currently in"}
        </Badge>
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
