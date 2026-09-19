// Shared day/time parsing + "is this open right now" logic for any weekly
// schedule shaped like { days, open, close, closed } — used by both facility
// hours (FacilityHoursSection) and doctor availability (SpecialistCard,
// FacilityDoctorsSection, SpecialistAvailabilitySection) so this calculation
// only exists in one place.
//
// "Now" is always the Addis wall clock. These schedules describe Addis
// facilities, and the components below render in both a server tree (UTC on
// the host) and a client tree (the viewer's own zone) — so reading the
// ambient clock meant the same doctor was "available now" at different real
// times depending on which page you arrived from.

import { addisWallClock } from "@/lib/addis-time";

export const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAYS_ORDER)[number];

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

export type ScheduleRow = {
  days: string[];
  open: string;
  close: string;
  closed: boolean;
};

// Reads the Addis wall clock, not the clock of whatever machine is running
// this. The same component renders on the server for a facility page and in
// the browser for the /specialists list, so "today" used to mean UTC in one
// place and the viewer's own zone in the other. See lib/addis-time.ts.
export function getTodayName(now: Date = new Date()): DayName {
  return JS_DAY_TO_NAME[addisWallClock(now).dayIndex];
}

export function normalizeDay(raw: string): DayName | null {
  const lower = raw.toLowerCase().slice(0, 3);
  return (
    (DAYS_ORDER.find((d) => d.toLowerCase().startsWith(lower)) as DayName | undefined) ?? null
  );
}

export function buildDayMap<T extends ScheduleRow>(rows: T[]): Map<DayName, T | null> {
  const map = new Map<DayName, T | null>(DAYS_ORDER.map((d) => [d, null]));
  for (const row of rows) {
    for (const rawDay of row.days) {
      const day = normalizeDay(rawDay);
      if (day) map.set(day, row);
    }
  }
  return map;
}

export function parseTimeTo24(timeStr: string): number | null {
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

export function isCurrentlyOpen(row: ScheduleRow, nowMin: number): boolean {
  if (row.closed) return false;
  if (row.open === "Open 24 hours") return true;
  const openMin = parseTimeTo24(row.open);
  const closeMin = parseTimeTo24(row.close);
  if (openMin === null || closeMin === null) return false;
  return nowMin >= openMin && nowMin < closeMin;
}

function rotateDaysStartingFrom(day: DayName): DayName[] {
  const idx = DAYS_ORDER.indexOf(day);
  return [...DAYS_ORDER.slice(idx), ...DAYS_ORDER.slice(0, idx)];
}

export type AvailabilityStatus =
  // No schedule data, or nothing open at all this week.
  | { state: "unavailable" }
  | { state: "open-now"; is24Hours: boolean; todayHours: string }
  | { state: "opens-later-today"; opensAt: string }
  | { state: "next-available-day"; day: DayName };

// The single source of truth for "is this schedule available right now, and
// if not, what's the next useful thing to tell the patient" — callers just
// format the resulting state into whatever label/badge text fits their UI.
export function getAvailabilityStatus<T extends ScheduleRow>(
  schedule: T[] | undefined | null,
  now: Date = new Date(),
): AvailabilityStatus {
  if (!schedule || schedule.length === 0) return { state: "unavailable" };

  const { dayIndex, minutes: nowMin } = addisWallClock(now);
  const todayName = JS_DAY_TO_NAME[dayIndex];
  const dayMap = buildDayMap(schedule);
  const todayRow = dayMap.get(todayName) ?? null;

  if (todayRow && isCurrentlyOpen(todayRow, nowMin)) {
    const is24Hours = todayRow.open === "Open 24 hours";
    return {
      state: "open-now",
      is24Hours,
      todayHours: is24Hours ? "Open 24 hours" : `${todayRow.open} – ${todayRow.close}`,
    };
  }

  if (todayRow && !todayRow.closed) {
    const openMin = parseTimeTo24(todayRow.open);
    if (openMin !== null && nowMin < openMin) {
      return { state: "opens-later-today", opensAt: todayRow.open };
    }
  }

  for (const day of rotateDaysStartingFrom(todayName).slice(1)) {
    const row = dayMap.get(day);
    if (row && !row.closed) {
      return { state: "next-available-day", day };
    }
  }

  return { state: "unavailable" };
}

// Round-the-clock detection for facilities that publish free-text hours
// instead of a structured schedule[] — which is almost all of them: 1 of 106
// active facilities has a structured schedule, 102 have only this text.
//
// Deliberately stricter than a bare `includes("24")`: that would also match
// a closing time like "8:00-24:00". On today's data both tests return the
// same 74 facilities, so this is guarding against future rows rather than
// fixing a present miscount.
export function isRoundTheClockHours(hours: string | null | undefined): boolean {
  if (!hours) return false;
  return /\b24\s*[\/x-]\s*7\b|\b24\s*hours?\b|\bround[- ]the[- ]clock\b/i.test(hours);
}

// The single "is this open right now" test, shared by the specialty pages
// and /nearby. It lived inside SpecialtyResults; /nearby needed the same
// question answered and a second copy is how the two would drift.
//
// Structured schedule first, free-text hours as the fallback — which is the
// path almost every listing takes, since only 1 of 106 carries a schedule.
export function isFacilityOpenNow(facility: {
  schedule?: ScheduleRow[] | null;
  workingHours?: string | null;
}): boolean {
  if (facility.schedule?.length) {
    return getAvailabilityStatus(facility.schedule).state === "open-now";
  }
  return isRoundTheClockHours(facility.workingHours);
}

export type WeeklyScheduleLine = { days: string; hours: string };

// The week at a glance: days with the same hours folded into one line —
// "Mon–Fri · 8:00 AM – 5:00 PM", "Sat · 8:00 AM – 12:00 PM", or
// "Mon, Wed, Fri · 9:00 AM – 1:00 PM". Closed days and days without hours
// are left out.
export function weeklyScheduleLines<T extends ScheduleRow>(
  schedule: T[] | undefined | null,
): WeeklyScheduleLine[] {
  if (!schedule || schedule.length === 0) return [];
  const dayMap = buildDayMap(schedule);

  const hoursFor = (day: DayName): string | null => {
    const row = dayMap.get(day);
    if (!row || row.closed) return null;
    if (row.open === "Open 24 hours") return "Open 24 hours";
    if (!row.open || !row.close) return null;
    return `${row.open} – ${row.close}`;
  };

  const lines: WeeklyScheduleLine[] = [];
  let runStart = -1;
  for (let i = 0; i <= DAYS_ORDER.length; i += 1) {
    const hours = i < DAYS_ORDER.length ? hoursFor(DAYS_ORDER[i]) : null;
    const prev = runStart >= 0 ? hoursFor(DAYS_ORDER[runStart]) : null;
    if (runStart >= 0 && hours !== prev) {
      const first = DAYS_ORDER[runStart].slice(0, 3);
      const last = DAYS_ORDER[i - 1].slice(0, 3);
      lines.push({ days: runStart === i - 1 ? first : `${first}–${last}`, hours: prev! });
      runStart = -1;
    }
    if (hours && runStart < 0) runStart = i;
  }

  // Runs that share their hours become one line ("Mon, Wed, Fri").
  const merged: WeeklyScheduleLine[] = [];
  for (const line of lines) {
    const same = merged.find((m) => m.hours === line.hours);
    if (same) same.days = `${same.days}, ${line.days}`;
    else merged.push({ ...line });
  }
  return merged;
}
