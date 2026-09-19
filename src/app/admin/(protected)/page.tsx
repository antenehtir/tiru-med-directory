import Link from "next/link";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import { addisDayKey } from "@/lib/addis-time";
import {
  ActivityOverview,
  BadgeDistributionChart,
  type ActivityBucketDatum,
  type ActivityOverviewData,
  type ActivitySeriesKey,
  type ActivityTotals,
} from "@/components/admin/AdminDashboardCharts";
import {
  bucketsFor,
  bucketTitle,
  resolveActivityPeriod,
  toDayKey,
  type ActivityRangeParams,
} from "@/lib/admin/activity-range";
import { BADGE_STATUS_COLORS, BADGE_STATUS_LABELS } from "@/lib/admin/dashboard-colors";

async function getDashboardStats() {
  const supabase = await createAdminSupabaseClient();

  const [
    { count: totalFacilities },
    { count: correctionRequests },
    { count: listingRequests },
    { count: claimsPending },
    { count: csCount },
    { count: officialCount },
    { count: verifiedCount },
    { count: draftCount },
  ] = await Promise.all([
    // Live facilities only — the card says "live records". Deactivated
    // facilities and unpublished drafts (migration 063) are not in the
    // directory, and counting them overstated it by the number deactivated.
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_draft", false),
    // Pending only. This counted every correction ever submitted while the
    // card beneath it read "Pending review" and its link went to the pending
    // tab — so the dashboard advertised 2 items waiting when both had been
    // dealt with weeks earlier and the pending tab was empty. A count that is
    // wrong in the alarming direction is worse than no count: it teaches you
    // to ignore the number, and the one real correction gets ignored with it.
    // Matches getPendingCorrectionsCount in the layout, which drives the
    // sidebar badge and was already filtering correctly.
    supabase
      .from("correction_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    // Matches the New Listings tab on /admin/claims exactly: submitted
    // (pending_review) claims for a facility that doesn't exist yet.
    // Previously counted the unrelated `listing_requests` table (populated
    // only by the separate public /register form), which is why this stat
    // never matched what Provider Submissions actually showed.
    supabase
      .from("facility_claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review")
      .is("facility_id", null),
    // Matches the Claims tab: submitted claims on an existing facility.
    supabase
      .from("facility_claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review")
      .not("facility_id", "is", null),
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "community-submitted")
      .eq("is_active", true),
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "facility-owned")
      .eq("is_active", true),
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "verified")
      .eq("is_active", true),
    // Facilities an admin started and has not published yet (migration 063).
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("is_draft", true),
  ]);

  return {
    totalFacilities: totalFacilities ?? 0,
    correctionRequests: correctionRequests ?? 0,
    listingRequests: listingRequests ?? 0,
    claimsPending: claimsPending ?? 0,
    csCount: csCount ?? 0,
    officialCount: officialCount ?? 0,
    verifiedCount: verifiedCount ?? 0,
    draftCount: draftCount ?? 0,
  };
}

// The database hands back at most 1,000 rows per request, so a busy year
// would be cut short without paging. Returns null if any page fails, so a
// partial count is never shown as a complete one.
async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[] | null> {
  const size = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1);
    if (error || !data) return null;
    rows.push(...data);
    if (data.length < size) return rows;
  }
}

// New facilities and claims for the chosen range — a quick range or a free
// from–to — plus the same-length period before it for the comparison. See
// lib/admin/activity-range.ts for how URL parameters become periods and bars.
//
// Counting happens here rather than in the database: at today's volumes a
// year of rows is a few hundred, and the classification below (listing vs
// claim) needs the claim and its facility together. When volumes reach the tens of thousands, move
// the counting into a SQL function that returns the same shape — the chart
// does not need to change.
async function getActivityOverview(params: ActivityRangeParams): Promise<ActivityOverviewData> {
  const supabase = await createAdminSupabaseClient();
  const today = new Date(`${addisDayKey()}T00:00:00Z`);
  const period = resolveActivityPeriod(params, today);
  const { current, previous } = period;

  const frames = bucketsFor(current, period.bucket);
  const bucketStarts = frames.map((frame) => frame.start.getTime());
  const buckets: ActivityBucketDatum[] = frames.map((frame) => ({
    key: frame.start.toISOString().slice(0, 10),
    label: frame.label,
    rangeLabel: frame.rangeLabel,
    adminAdded: 0,
    newListings: 0,
    claims: 0,
    total: 0,
  }));

  const totals: ActivityTotals = {
    adminAdded: { current: 0, previous: 0 },
    newListings: { current: 0, previous: 0 },
    claims: { current: 0, previous: 0 },
  };

  const result: ActivityOverviewData = {
    range: period.key,
    from: toDayKey(current.start),
    to: toDayKey(current.end),
    today: toDayKey(today),
    periodLabel: period.periodLabel,
    previousLabel: period.previousLabel,
    notice: period.notice,
    bucketTitle: bucketTitle(period.bucket),
    buckets,
    totals,
  };

  // Addis midnight on the first day of the previous period.
  const windowStart = `${toDayKey(previous.start)}T00:00:00+03:00`;
  const [claims, published] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from("facility_claims")
        .select("created_at, submitted_at, facility_id, facilities ( created_at )")
        .not("submitted_at", "is", null)
        .gte("submitted_at", windowStart)
        .order("submitted_at")
        .range(from, to),
    ),
    // "Added by Tiru team" is counted from the audit log's publish entries,
    // not from facilities.created_at: the directory's original bulk import
    // (105 rows on 23 June 2026) also has a created_at, and counting it as
    // team work buried everything else in any range that reached back that
    // far. Every facility an admin has added through the app logs
    // facility_created when it goes live — since the feature shipped.
    fetchAllRows((from, to) =>
      supabase
        .from("audit_log")
        .select("created_at")
        .eq("action", "facility_created")
        .gte("created_at", windowStart)
        .order("created_at")
        .range(from, to),
    ),
  ]);

  if (!claims || !published) return result;

  const record = (key: ActivitySeriesKey, iso: string) => {
    const day = new Date(`${addisDayKey(new Date(iso))}T00:00:00Z`);
    if (day >= current.start && day <= current.end) {
      totals[key].current += 1;
      // Buckets are in date order; the last one starting on or before the day holds it.
      let index = bucketStarts.length - 1;
      while (index > 0 && bucketStarts[index] > day.getTime()) index -= 1;
      buckets[index][key] += 1;
      buckets[index].total += 1;
    } else if (day >= previous.start && day <= previous.end) {
      totals[key].previous += 1;
    }
  };

  // A claim is a NEW LISTING when its facility did not exist yet when the
  // provider started — not when facility_id is empty. Approving a new
  // listing creates the facility and fills facility_id in, so testing
  // facility_id alone counted every approved new listing as a claim.
  for (const row of claims) {
    if (!row.submitted_at) continue;
    const linked = row.facilities as unknown as { created_at: string } | null;
    const isNewListing =
      row.facility_id === null ||
      (linked?.created_at != null &&
        new Date(linked.created_at).getTime() >= new Date(row.created_at).getTime());
    record(isNewListing ? "newListings" : "claims", row.submitted_at);
  }

  for (const row of published) record("adminAdded", row.created_at);

  return result;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<ActivityRangeParams>;
}) {
  const rangeParams = await searchParams;
  const [adminUser, stats, activity] = await Promise.all([
    getAdminUser(),
    getDashboardStats(),
    getActivityOverview(rangeParams),
  ]);

  const statCards = [
    {
      label: "Total Facilities",
      value: stats.totalFacilities,
      description: "Live records in directory",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950",
      href: "/admin/facilities",
    },
    {
      label: "Community Submitted",
      value: stats.csCount,
      description: "Unclaimed CS listings",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
      href: "/admin/facilities?badge=community-submitted",
    },
    {
      label: "Correction Requests",
      value: stats.correctionRequests,
      description: "Pending review",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
      href: "/admin/corrections?tab=pending",
    },
    {
      label: "Listing Requests",
      value: stats.listingRequests,
      description: "New provider submissions",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950",
      href: "/admin/claims?tab=new-listings",
    },
    {
      label: "Claims Pending",
      value: stats.claimsPending,
      description: "Submitted claims on existing facilities",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950",
      href: "/admin/claims?tab=claims",
    },
    {
      label: "Facility Managed",
      value: stats.officialCount,
      description: "Claimed and kept current by the facility",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
      href: "/admin/facilities?badge=facility-owned",
    },
    {
      label: "Unfinished Drafts",
      value: stats.draftCount,
      description: "Started, not listed yet",
      color: "text-stone-600 dark:text-stone-300",
      bg: "bg-stone-100 dark:bg-stone-900",
      href: "/admin/facilities#drafts",
    },
  ];

  const badgeDistribution = [
    {
      name: BADGE_STATUS_LABELS["community-submitted"],
      value: stats.csCount,
      color: BADGE_STATUS_COLORS["community-submitted"],
    },
    {
      name: BADGE_STATUS_LABELS["facility-owned"],
      value: stats.officialCount,
      color: BADGE_STATUS_COLORS["facility-owned"],
    },
    {
      name: BADGE_STATUS_LABELS.verified,
      value: stats.verifiedCount,
      color: BADGE_STATUS_COLORS.verified,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {adminUser?.display_name ?? adminUser?.email}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {statCards.map((card) => (
          <Link
            className={`rounded-2xl border border-border p-5 transition hover:border-primary/40 hover:shadow-sm ${card.bg}`}
            href={card.href}
            key={card.label}
          >
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{card.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Facility badge distribution</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Community sourced / Facility Managed / Verified split</p>
          <BadgeDistributionChart data={badgeDistribution} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-3">
          <ActivityOverview data={activity} />
        </div>
      </div>
    </div>
  );
}
