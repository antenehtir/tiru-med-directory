import Link from "next/link";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import {
  BadgeDistributionChart,
  SubmissionsTrendChart,
  type SubmissionTrendDatum,
} from "@/components/admin/AdminDashboardCharts";
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
  ] = await Promise.all([
    supabase.from("facilities").select("*", { count: "exact", head: true }),
    supabase.from("correction_requests").select("*", { count: "exact", head: true }),
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
      .eq("verification_status", "community-submitted"),
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "facility-owned"),
    supabase
      .from("facilities")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "verified"),
  ]);

  return {
    totalFacilities: totalFacilities ?? 0,
    correctionRequests: correctionRequests ?? 0,
    listingRequests: listingRequests ?? 0,
    claimsPending: claimsPending ?? 0,
    csCount: csCount ?? 0,
    officialCount: officialCount ?? 0,
    verifiedCount: verifiedCount ?? 0,
  };
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getSubmissionsTrend(): Promise<SubmissionTrendDatum[]> {
  const supabase = await createAdminSupabaseClient();

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("facility_claims")
    .select("submitted_at, facility_id")
    .not("submitted_at", "is", null)
    .gte("submitted_at", since.toISOString());

  const days: SubmissionTrendDatum[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    days.push({
      date: dayKey(d),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      newListings: 0,
      claims: 0,
    });
  }

  if (error || !data) return days;

  const byDay = new Map(days.map((d) => [d.date, d]));
  for (const row of data) {
    if (!row.submitted_at) continue;
    const key = dayKey(new Date(row.submitted_at));
    const bucket = byDay.get(key);
    if (!bucket) continue;
    if (row.facility_id === null) bucket.newListings += 1;
    else bucket.claims += 1;
  }

  return days;
}

export default async function AdminDashboardPage() {
  const [adminUser, stats, submissionsTrend] = await Promise.all([
    getAdminUser(),
    getDashboardStats(),
    getSubmissionsTrend(),
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
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950",
      href: "/admin/claims?tab=claims",
    },
    {
      label: "Official Facilities",
      value: stats.officialCount,
      description: "Facility-owned listings",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
      href: "/admin/facilities?badge=facility-owned",
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">Facility badge distribution</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">CS / Official / Verified split</p>
          <BadgeDistributionChart data={badgeDistribution} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">New submissions (last 30 days)</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Listing requests + claims, by day</p>
          <SubmissionsTrendChart data={submissionsTrend} />
        </div>
      </div>
    </div>
  );
}
