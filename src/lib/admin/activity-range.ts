// Time ranges for the admin dashboard's "New facilities and claims" view:
// quick ranges (7 days … 12 months) and a free "from – to" range.
//
// resolveActivityPeriod turns the page's URL parameters into everything the
// view needs — the period, the equal-length period before it, how to group
// the bars, and the words for all of it. Invalid input never throws: it
// falls back to the default range and says why.
//
// Everything is in Addis calendar days (see addis-time.ts). Dates here are
// UTC midnights standing for an Addis day, so arithmetic never crosses a
// timezone; Ethiopia has no DST, so a day is always 24 hours.

export type ActivityQuickRangeKey = "7d" | "30d" | "3m" | "6m" | "12m";
export type ActivityRangeKey = ActivityQuickRangeKey | "custom";
export type ActivityBucketSize = "day" | "week" | "month" | "quarter";

type QuickRange = {
  key: ActivityQuickRangeKey;
  // Button text, and "Last …" in the subtitle.
  label: string;
  length: { days: number } | { months: number };
  // 7 days by day, up to 3 months by week, longer by month — so a chart
  // never has more than about 13 bars to read.
  bucket: ActivityBucketSize;
};

export const ACTIVITY_QUICK_RANGES: QuickRange[] = [
  { key: "7d", label: "7 days", length: { days: 7 }, bucket: "day" },
  { key: "30d", label: "30 days", length: { days: 30 }, bucket: "week" },
  { key: "3m", label: "3 months", length: { months: 3 }, bucket: "week" },
  { key: "6m", label: "6 months", length: { months: 6 }, bucket: "month" },
  { key: "12m", label: "12 months", length: { months: 12 }, bucket: "month" },
];

export const DEFAULT_ACTIVITY_RANGE: ActivityQuickRangeKey = "30d";

// The longest free range accepted. Five years in quarters is 20 bars; past
// that the chart stops being readable and the query stops being cheap.
export const MAX_CUSTOM_RANGE_DAYS = 5 * 366;

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

// Same day-of-month N months earlier, clamped to the month's last day
// (31 May minus 3 months is 28 or 29 Feb, not 3 March).
function addMonths(date: Date, months: number): Date {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// A strict YYYY-MM-DD that names a real day ("2026-02-30" is rejected).
function parseDayKey(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || toDayKey(date) !== value ? null : date;
}

export type Period = { start: Date; end: Date };

// Free ranges are grouped by their length, so any span reads well.
function bucketForSpan(days: number): ActivityBucketSize {
  if (days <= 14) return "day";
  if (days <= 124) return "week";
  if (days <= 2 * 366) return "month";
  return "quarter";
}

function dayLabel(date: Date, withYear = false): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

export function formatPeriod(period: Period): string {
  return period.start.getTime() === period.end.getTime()
    ? dayLabel(period.start, true)
    : `${dayLabel(period.start, true)} – ${dayLabel(period.end, true)}`;
}

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export type ResolvedActivityPeriod = {
  key: ActivityRangeKey;
  current: Period;
  previous: Period;
  bucket: ActivityBucketSize;
  // Subtitle, e.g. "Last 30 days" or "1 Aug 2026 – 17 Sept 2026".
  periodLabel: string;
  // "previous 30 days" / "previous 48 days".
  previousLabel: string;
  // Set when the URL asked for something that could not be shown as asked.
  notice: string | null;
};

// The dashboard's URL parameters: ?range=3m, or ?from=2026-08-01&to=2026-09-17.
export type ActivityRangeParams = {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
};

export function resolveActivityPeriod(
  params: ActivityRangeParams,
  today: Date,
): ResolvedActivityPeriod {
  const fromParam = one(params.from);
  const toParam = one(params.to);

  if (fromParam || toParam) {
    let from = parseDayKey(fromParam);
    let to = parseDayKey(toParam);
    let notice: string | null = null;

    if (!from || !to) {
      return {
        ...resolveQuick(DEFAULT_ACTIVITY_RANGE, today),
        notice: "That date range could not be read, so the last 30 days are shown.",
      };
    }
    if (from > to) [from, to] = [to, from];
    if (from > today) {
      return {
        ...resolveQuick(DEFAULT_ACTIVITY_RANGE, today),
        notice: "That date range is in the future, so the last 30 days are shown.",
      };
    }
    if (to > today) {
      to = today;
      notice = "The range was cut off at today.";
    }
    const days = daysBetween(from, to) + 1;
    if (days > MAX_CUSTOM_RANGE_DAYS) {
      return {
        ...resolveQuick(DEFAULT_ACTIVITY_RANGE, today),
        notice: "Ranges can be at most 5 years long, so the last 30 days are shown.",
      };
    }

    const current = { start: from, end: to };
    return {
      key: "custom",
      current,
      previous: { start: addDays(from, -days), end: addDays(from, -1) },
      bucket: bucketForSpan(days),
      periodLabel: formatPeriod(current),
      previousLabel: `previous ${days} ${days === 1 ? "day" : "days"}`,
      notice,
    };
  }

  const key = one(params.range);
  const quick = ACTIVITY_QUICK_RANGES.find((r) => r.key === key);
  return resolveQuick(quick?.key ?? DEFAULT_ACTIVITY_RANGE, today);
}

function resolveQuick(key: ActivityQuickRangeKey, today: Date): ResolvedActivityPeriod {
  const range = ACTIVITY_QUICK_RANGES.find((r) => r.key === key)!;
  let current: Period;
  let previous: Period;
  if ("days" in range.length) {
    const n = range.length.days;
    const start = addDays(today, -(n - 1));
    current = { start, end: today };
    previous = { start: addDays(start, -n), end: addDays(start, -1) };
  } else {
    const n = range.length.months;
    const start = addDays(addMonths(today, -n), 1);
    current = { start, end: today };
    previous = { start: addMonths(start, -n), end: addDays(start, -1) };
  }
  return {
    key,
    current,
    previous,
    bucket: range.bucket,
    periodLabel: `Last ${range.label}`,
    previousLabel: `previous ${range.label}`,
    notice: null,
  };
}

export type ActivityBucketFrame = {
  start: Date;
  end: Date;
  // Axis text: "17 Sept", "Sept", "Q3 2026".
  label: string;
  // Tooltip heading: the dates this bar actually covers.
  rangeLabel: string;
};

function monthLabel(date: Date, withYear: boolean): string {
  return date.toLocaleDateString("en-GB", {
    month: withYear ? "long" : "short",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

function startOfBucket(date: Date, size: Exclude<ActivityBucketSize, "day">): Date {
  if (size === "week") return addDays(date, -((date.getUTCDay() + 6) % 7));
  const month = size === "quarter" ? date.getUTCMonth() - (date.getUTCMonth() % 3) : date.getUTCMonth();
  return new Date(Date.UTC(date.getUTCFullYear(), month, 1));
}

function nextBucket(start: Date, size: Exclude<ActivityBucketSize, "day">): Date {
  if (size === "week") return addDays(start, 7);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + (size === "quarter" ? 3 : 1), 1));
}

// Bars for a period. Weeks start on Monday, months on the 1st, quarters in
// January, April, July and October; the first and last bar are trimmed to
// the period, and their tooltip says which dates they cover. When a period
// crosses a new year, day labels in tooltips carry the year.
export function bucketsFor(period: Period, size: ActivityBucketSize): ActivityBucketFrame[] {
  const frames: ActivityBucketFrame[] = [];
  const spansYears = period.start.getUTCFullYear() !== period.end.getUTCFullYear();

  if (size === "day") {
    for (let d = period.start; d <= period.end; d = addDays(d, 1)) {
      frames.push({ start: d, end: d, label: dayLabel(d), rangeLabel: dayLabel(d, spansYears) });
    }
    return frames;
  }

  for (let cursor = startOfBucket(period.start, size); cursor <= period.end; cursor = nextBucket(cursor, size)) {
    const lastOfBucket = addDays(nextBucket(cursor, size), -1);
    const start = cursor < period.start ? period.start : cursor;
    const end = lastOfBucket > period.end ? period.end : lastOfBucket;
    const whole = start.getTime() === cursor.getTime() && end.getTime() === lastOfBucket.getTime();
    const trimmedLabel =
      start.getTime() === end.getTime()
        ? dayLabel(start, spansYears)
        : `${dayLabel(start, spansYears)} – ${dayLabel(end, spansYears)}`;

    let label: string;
    let rangeLabel: string;
    if (size === "week") {
      label = dayLabel(start);
      rangeLabel = trimmedLabel;
    } else if (size === "month") {
      // The year is shown on January (and on the first bar) when the
      // period crosses a new year, so the axis reads "Nov, Dec, Jan 2027".
      const showYear = spansYears && (cursor.getUTCMonth() === 0 || frames.length === 0);
      label = monthLabel(cursor, false) + (showYear ? ` ${cursor.getUTCFullYear()}` : "");
      rangeLabel = whole ? monthLabel(cursor, true) : trimmedLabel;
    } else {
      const quarter = Math.floor(cursor.getUTCMonth() / 3) + 1;
      label = `Q${quarter} ${cursor.getUTCFullYear()}`;
      rangeLabel = whole ? `Q${quarter} ${cursor.getUTCFullYear()}` : trimmedLabel;
    }

    frames.push({ start, end, label, rangeLabel });
  }
  return frames;
}

export function bucketTitle(size: ActivityBucketSize): string {
  return { day: "By day", week: "By week", month: "By month", quarter: "By quarter" }[size];
}
