// Every facility in this directory is in Addis Ababa, so every time this
// product shows or reasons about is Addis time. Nothing else in the codebase
// said so, and that silence was a bug in two directions:
//
//   - Server-rendered dates formatted in the SERVER's zone. On Vercel that
//     is UTC, so /admin/audit-log showed a save as 12:21 while the provider
//     console's browser-rendered "Draft saved" showed the same save as
//     3:22 PM.
//   - "Open now" / "Available now" read the clock of whatever machine
//     happened to run the calculation — UTC on the server, the viewer's own
//     zone in the browser. A doctor working 8:00 AM–5:00 PM Addis was shown
//     as unavailable at 9 AM Addis and available at 7 PM, and a visitor
//     abroad got their own local hours applied to an Addis clinic.
//
// So the zone is named once, here, and every formatter and every wall-clock
// read goes through it. The answer is then the same wherever the code runs.
export const ADDIS_TIME_ZONE = "Africa/Addis_Ababa";

// JS Date.getDay(): 0 = Sunday, 1 = Monday … 6 = Saturday
const WEEKDAY_TO_JS_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// hourCycle h23 rather than hour12:false — the latter is specified to return
// "24" for midnight in some implementations, which would put midnight at
// 1440 minutes and silently break every "is it open now" comparison for that
// hour.
const WALL_CLOCK_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: ADDIS_TIME_ZONE,
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type AddisWallClock = {
  // Same numbering as Date.getDay(), so callers already keyed on that can
  // swap to this without re-mapping.
  dayIndex: number;
  // Minutes since midnight, which is the unit the schedule comparisons use.
  minutes: number;
};

// The Addis wall-clock reading of an instant: what a clock on a wall in
// Addis Ababa says at that moment, regardless of where this code runs.
export function addisWallClock(instant: Date = new Date()): AddisWallClock {
  const parts = WALL_CLOCK_FORMAT.formatToParts(instant);
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const dayIndex = WEEKDAY_TO_JS_INDEX[lookup("weekday")] ?? instant.getDay();
  const hour = Number.parseInt(lookup("hour"), 10);
  const minute = Number.parseInt(lookup("minute"), 10);

  return {
    dayIndex,
    minutes:
      Number.isFinite(hour) && Number.isFinite(minute)
        ? hour * 60 + minute
        : instant.getHours() * 60 + instant.getMinutes(),
  };
}

// The Addis calendar date of an instant, as "YYYY-MM-DD" — for grouping
// events into days. toISOString().slice(0, 10) gives the UTC date instead,
// which puts anything logged between midnight and 3 AM Addis into the
// previous day's bucket.
//
// en-CA is the locale whose numeric date format IS "YYYY-MM-DD", which is
// why it is used here rather than assembling the parts by hand.
const DAY_KEY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: ADDIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function addisDayKey(instant: Date = new Date()): string {
  return DAY_KEY_FORMAT.format(instant);
}

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Date only — "15 Sept 2026". For anything where the time of day matters,
// use formatAddisDateTime so the reader can tell two same-day events apart.
export function formatAddisDate(
  value: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
  locale = "en-GB",
): string {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString(locale, { ...options, timeZone: ADDIS_TIME_ZONE });
}

// Date and time — for logs and audit trails, where "when exactly" is the
// whole point. 24-hour, because an audit trail read at a glance should not
// hinge on spotting an am/pm.
export function formatAddisDateTime(
  value: Date | string | number | null | undefined,
  locale = "en-GB",
): string {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ADDIS_TIME_ZONE,
  });
}

// Time of day only — the "Draft saved 15:22:29" indicators.
export function formatAddisTime(
  value: Date | string | number | null | undefined,
  locale = "en-GB",
): string {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: ADDIS_TIME_ZONE,
  });
}
