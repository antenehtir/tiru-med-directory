import Link from "next/link";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

async function getDashboardStats() {
  const supabase = await createAdminSupabaseClient();

  const [
    { count: totalFacilities },
    { count: correctionRequests },
    { count: listingRequests },
    { count: claimsPending },
    { count: csCount },
    { count: officialCount },
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
  ]);

  return {
    totalFacilities: totalFacilities ?? 0,
    correctionRequests: correctionRequests ?? 0,
    listingRequests: listingRequests ?? 0,
    claimsPending: claimsPending ?? 0,
    csCount: csCount ?? 0,
    officialCount: officialCount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const [adminUser, stats] = await Promise.all([
    getAdminUser(),
    getDashboardStats(),
  ]);

  const statCards = [
    {
      label: "Total Facilities",
      value: stats.totalFacilities,
      description: "Live records in directory",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950",
    },
    {
      label: "Community Submitted",
      value: stats.csCount,
      description: "Unclaimed CS listings",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: "Correction Requests",
      value: stats.correctionRequests,
      description: "Pending review",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Listing Requests",
      value: stats.listingRequests,
      description: "New provider submissions",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
    {
      label: "Claims Pending",
      value: stats.claimsPending,
      description: "Submitted claims on existing facilities",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950",
    },
    {
      label: "Official Facilities",
      value: stats.officialCount,
      description: "Facility-owned listings",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/corrections",
      title: "Correction Requests",
      description: "Review and apply public corrections",
    },
    {
      href: "/admin/listings",
      title: "Listing Requests",
      description: "Review new provider submissions",
    },
    {
      href: "/admin/facilities",
      title: "Facility Directory",
      description: "Browse and manage all facilities",
    },
    {
      href: "/admin/audit-log",
      title: "Audit Log",
      description: "Full history of admin actions",
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-border p-5 ${card.bg}`}
          >
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{card.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
            href={link.href}
          >
            <div>
              <p className="font-semibold text-foreground">{link.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{link.description}</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
