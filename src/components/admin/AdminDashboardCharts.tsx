"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ACTIVITY_SERIES } from "@/lib/admin/dashboard-colors";
import {
  ACTIVITY_QUICK_RANGES,
  DEFAULT_ACTIVITY_RANGE,
  MAX_CUSTOM_RANGE_DAYS,
  type ActivityQuickRangeKey,
  type ActivityRangeKey,
} from "@/lib/admin/activity-range";

export type BadgeDistributionDatum = {
  name: string;
  value: number;
  color: string;
};


export function BadgeDistributionChart({ data }: { data: BadgeDistributionDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No facilities yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer height={260} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          innerRadius={60}
          nameKey="name"
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell fill={entry.color} key={entry.name} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`${num} (${Math.round((num / total) * 100)}%)`, name];
          }}
        />
        <Legend
          formatter={(value, entry) => {
            const count = (entry?.payload as unknown as BadgeDistributionDatum | undefined)?.value ?? 0;
            return (
              <span className="text-xs text-foreground">
                {value} ({count})
              </span>
            );
          }}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export type ActivitySeriesKey = "adminAdded" | "newListings" | "claims";

// One bar: a day, a week or a month, depending on the range.
export type ActivityBucketDatum = {
  key: string;
  // Axis label, e.g. "8 Sept" or "Sept".
  label: string;
  // Tooltip heading: the dates the bar covers, e.g. "8 Sept – 14 Sept".
  rangeLabel: string;
  // Facilities an admin added and published themselves.
  adminAdded: number;
  // New facilities a provider listed (counted on the day they submitted).
  newListings: number;
  // Claims on a facility that already existed.
  claims: number;
  total: number;
};

export type ActivityTotals = Record<ActivitySeriesKey, { current: number; previous: number }>;

export type ActivityOverviewData = {
  range: ActivityRangeKey;
  // The period shown, as YYYY-MM-DD (Addis days), and today.
  from: string;
  to: string;
  today: string;
  // "Last 30 days" or "1 Aug 2026 – 17 Sept 2026".
  periodLabel: string;
  // "previous 3 months" — the comparison period, in words.
  previousLabel: string;
  // Why the view differs from what the URL asked for, if it does.
  notice: string | null;
  // "By week" — how the bars are grouped.
  bucketTitle: string;
  buckets: ActivityBucketDatum[];
  totals: ActivityTotals;
};

// Stack order, bottom to top. The legend reads left to right in the same
// order, so the first swatch is the bottom segment.
const SERIES_KEYS = ACTIVITY_SERIES.map((s) => s.key);

function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: color }} />;
}

function changeText(current: number, previous: number, previousLabel: string): string {
  const diff = current - previous;
  if (diff === 0) return `Same as the ${previousLabel}`;
  return `${diff > 0 ? "↑" : "↓"} ${Math.abs(diff)} vs the ${previousLabel}`;
}

// Rounds only the top of the column: the highest segment that actually has
// a value. Rounding every segment would put curved notches inside the stack.
function segmentShape(key: ActivitySeriesKey) {
  const above = SERIES_KEYS.slice(SERIES_KEYS.indexOf(key) + 1);
  return function Segment(props: unknown) {
    const { x, y, width, height, fill, payload } = props as {
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      payload: ActivityBucketDatum;
    };
    if (!height || height <= 0) return <g />;
    const isTop = above.every((k) => payload[k] === 0);
    const r = isTop ? Math.min(4, width / 2, height) : 0;
    const d = `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`;
    // The surface-coloured stroke is the 2px gap between stacked segments.
    return <path d={d} fill={fill} stroke="var(--card)" strokeWidth={2} />;
  };
}

function BucketTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ActivityBucketDatum }> }) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;
  return (
    <div className="min-w-44 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1.5 font-semibold text-foreground">{bucket.rangeLabel}</p>
      <ul className="space-y-1">
        {[...ACTIVITY_SERIES].reverse().map((series) => (
          <li className="flex items-center gap-2" key={series.key}>
            <Swatch color={series.color} />
            <span className="text-muted-foreground">{series.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">{bucket[series.key]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 flex border-t border-border pt-1.5 font-semibold text-foreground">
        Total <span className="ml-auto tabular-nums">{bucket.total}</span>
      </p>
    </div>
  );
}

const pillClass = (selected: boolean) =>
  `min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background text-muted-foreground hover:text-foreground"
  }`;

const dateInputClass =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

// The earliest date the picker offers — the directory has no records before
// its launch year.
const EARLIEST_DAY = "2026-01-01";

// A free "from – to" range. Native date inputs: they are keyboard- and
// screen-reader-friendly and open the phone's own date picker.
function CustomRangeForm({
  initialFrom,
  initialTo,
  today,
  onApply,
  onCancel,
}: {
  initialFrom: string;
  initialTo: string;
  today: string;
  onApply: (from: string, to: string) => void;
  onCancel: () => void;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState<string | null>(null);

  function apply(event: React.FormEvent) {
    event.preventDefault();
    if (!from || !to) return setError("Choose both a start and an end date.");
    if (from > to) return setError("The start date must be on or before the end date.");
    if (to > today) return setError("The end date can't be after today.");
    const days = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
    if (days > MAX_CUSTOM_RANGE_DAYS) return setError("Choose a range of 5 years or less.");
    setError(null);
    onApply(from, to);
  }

  return (
    <form
      aria-label="Custom date range"
      className="mt-3 rounded-xl border border-border bg-background p-3"
      noValidate
      onSubmit={apply}
    >
      <div className="grid grid-cols-2 gap-2 @lg:flex @lg:items-end">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground @lg:w-40">
          From
          <input
            className={dateInputClass}
            max={to || today}
            min={EARLIEST_DAY}
            onChange={(e) => setFrom(e.target.value)}
            required
            type="date"
            value={from}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground @lg:w-40">
          To
          <input
            className={dateInputClass}
            max={today}
            min={from || EARLIEST_DAY}
            onChange={(e) => setTo(e.target.value)}
            required
            type="date"
            value={to}
          />
        </label>
        <div className="col-span-2 flex gap-2">
          <button
            className="min-h-10 flex-1 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover @lg:flex-none"
            type="submit"
          >
            Apply
          </button>
          <button
            className="min-h-10 flex-1 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted @lg:flex-none"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

// "New facilities and claims": quick ranges plus a free date range, one
// summary row per series for the chosen period (compared with the equal
// period before it), then the period as stacked columns — by day, week,
// month or quarter depending on its length, so the chart stays readable
// whatever the range or the volume.
export function ActivityOverview({ data }: { data: ActivityOverviewData }) {
  const { buckets, totals, previousLabel, periodLabel } = data;
  const hasData = buckets.some((b) => b.total > 0);

  // The choice lives in the URL (?range=3m, or ?from=…&to=…), so a view can
  // be bookmarked or shared and Back returns to the previous one. Numbers
  // are counted on the server; while the next range loads, the chosen button
  // lights up at once and the current figures dim instead of jumping.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, startTransition] = useTransition();
  const [requested, setRequested] = useState<ActivityRangeKey | null>(null);
  // Closed on arrival even for a custom range: the button already names the
  // dates, and the form is only needed to change them.
  const [customOpen, setCustomOpen] = useState(false);

  function navigate(update: (params: URLSearchParams) => void, key: ActivityRangeKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("range");
    params.delete("from");
    params.delete("to");
    update(params);
    const query = params.toString();
    setRequested(key);
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function chooseQuick(key: ActivityQuickRangeKey) {
    setCustomOpen(false);
    if (key === data.range) return;
    navigate((params) => {
      if (key !== DEFAULT_ACTIVITY_RANGE) params.set("range", key);
    }, key);
  }

  function applyCustom(from: string, to: string) {
    setCustomOpen(false);
    navigate((params) => {
      params.set("from", from);
      params.set("to", to);
    }, "custom");
  }

  const selected = loading && requested ? requested : data.range;

  return (
    // A container, so the tiles lay out by the card's own width — the card
    // is part of the page on a laptop and the whole page on a phone.
    <div className="@container">
      <h2 className="text-sm font-semibold text-foreground">New facilities and claims</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {periodLabel}, compared with the {previousLabel}
      </p>

      <div
        aria-label="Time range"
        // Wraps rather than scrolling sideways: a hidden scroll area kept the
        // Custom button out of sight on a narrow card.
        className="mt-3 flex flex-wrap gap-1.5"
        role="group"
      >
        {ACTIVITY_QUICK_RANGES.map((range) => (
          <button
            aria-pressed={range.key === selected && !customOpen}
            className={pillClass(range.key === selected && !customOpen)}
            key={range.key}
            onClick={() => chooseQuick(range.key)}
            type="button"
          >
            {range.label}
          </button>
        ))}
        <button
          aria-expanded={customOpen}
          aria-pressed={selected === "custom" || customOpen}
          className={pillClass(selected === "custom" || customOpen)}
          onClick={() => setCustomOpen((open) => !open)}
          type="button"
        >
          {data.range === "custom" && !customOpen ? `Custom: ${periodLabel}` : "Custom dates…"}
        </button>
      </div>

      {customOpen && (
        <CustomRangeForm
          initialFrom={data.from}
          initialTo={data.to}
          onApply={applyCustom}
          onCancel={() => setCustomOpen(false)}
          today={data.today}
        />
      )}

      {data.notice && (
        <p className="mt-3 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground" role="status">
          {data.notice}
        </p>
      )}

      <div aria-busy={loading} className={`transition-opacity ${loading ? "opacity-50" : ""}`}>
        {/* Narrow card: one row per series, the number on the right. Wide card:
            three tiles side by side, the number between label and change. */}
        <dl className="mt-4 grid gap-2 @lg:grid-cols-3">
          {ACTIVITY_SERIES.map((series) => (
            <div
              className="grid grid-cols-[1fr_auto] items-center gap-x-3 rounded-xl border border-border bg-background px-3 py-2.5 @lg:grid-cols-1"
              key={series.key}
            >
              <dt className="col-start-1 row-start-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Swatch color={series.color} />
                {series.label}
              </dt>
              <dd className="col-start-2 row-span-2 row-start-1 text-2xl font-bold tabular-nums text-foreground @lg:col-start-1 @lg:row-span-1 @lg:row-start-2 @lg:mt-1">
                {totals[series.key].current}
              </dd>
              <dd className="col-start-1 row-start-2 text-xs text-muted-foreground @lg:row-start-3">
                {changeText(totals[series.key].current, totals[series.key].previous, previousLabel)}
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-5 text-xs font-semibold text-muted-foreground">
          {data.bucketTitle} — {periodLabel}
        </h3>

        {!hasData ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No new facilities or claims in this period ({periodLabel}).
          </div>
        ) : (
          <>
            <div aria-hidden="true">
              <ResponsiveContainer height={220} width="100%">
                <BarChart data={buckets} margin={{ top: 18, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    axisLine={{ stroke: "var(--border)" }}
                    dataKey="label"
                    fontSize={11}
                    // Drops labels evenly (every other bar) when they don't
                    // fit, rather than leaving one irregular gap.
                    interval="equidistantPreserveStart"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                  />
                  <Tooltip content={<BucketTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.6 }} />
                  {ACTIVITY_SERIES.map((series, index) => (
                    <Bar
                      dataKey={series.key}
                      fill={series.color}
                      isAnimationActive={false}
                      key={series.key}
                      maxBarSize={24}
                      name={series.label}
                      shape={segmentShape(series.key)}
                      stackId="activity"
                    >
                      {/* One number per column — its total — above the stack. */}
                      {index === ACTIVITY_SERIES.length - 1 && (
                        <LabelList
                          dataKey="total"
                          fill="var(--muted-foreground)"
                          fontSize={11}
                          formatter={(value: unknown) => (Number(value) > 0 ? String(value) : "")}
                          position="top"
                        />
                      )}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-foreground">
              {ACTIVITY_SERIES.map((series) => (
                <li className="flex items-center gap-1.5" key={series.key}>
                  <Swatch color={series.color} />
                  {series.label}
                </li>
              ))}
            </ul>

            {/* The chart's numbers for screen readers. Hidden by a wrapping
                div: a table ignores sr-only's 1px width and pushed the page
                sideways. */}
            <div className="sr-only">
              <table>
                <caption>
                  New facilities and claims, {data.bucketTitle.toLowerCase()}, {periodLabel}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Period</th>
                    {ACTIVITY_SERIES.map((series) => (
                      <th key={series.key} scope="col">{series.label}</th>
                    ))}
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((bucket) => (
                    <tr key={bucket.key}>
                      <th scope="row">{bucket.rangeLabel}</th>
                      {ACTIVITY_SERIES.map((series) => (
                        <td key={series.key}>{bucket[series.key]}</td>
                      ))}
                      <td>{bucket.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
