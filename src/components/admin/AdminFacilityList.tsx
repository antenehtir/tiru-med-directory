"use client";

import { useState, useTransition } from "react";
import { updateFacilityBadge } from "@/app/admin/(protected)/facilities/actions";

type Facility = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sub_city: string | null;
  area: string | null;
  verification_status: string;
  record_number: number | null;
  phone: string | null;
  working_hours: string | null;
  emergency_service: boolean;
};

const BADGE_LABELS: Record<string, string> = {
  "community-submitted": "CS",
  "facility-owned": "Owned",
  "verified": "✓",
};

const BADGE_COLORS: Record<string, string> = {
  "community-submitted": "bg-amber-50 text-amber-700 border-amber-200",
  "facility-owned": "bg-blue-50 text-blue-700 border-blue-200",
  "verified": "bg-teal-50 text-teal-700 border-teal-200",
};

export function AdminFacilityList({ facilities }: { facilities: Facility[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const categories = Array.from(new Set(facilities.map((f) => f.category))).sort();

  const filtered = facilities.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.area ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.sub_city ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesBadge = badgeFilter === "all" || f.verification_status === badgeFilter;
    return matchesSearch && matchesCategory && matchesBadge;
  });

  async function handleBadgeChange(facilityId: string, newStatus: string) {
    setUpdatingId(facilityId);
    startTransition(async () => {
      await updateFacilityBadge(facilityId, newStatus);
      setUpdatingId(null);
    });
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, area..."
          style={{ minWidth: 220 }}
          value={search}
        />
        <select
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setCategoryFilter(e.target.value)}
          value={categoryFilter}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setBadgeFilter(e.target.value)}
          value={badgeFilter}
        >
          <option value="all">All badges</option>
          <option value="community-submitted">CS only</option>
          <option value="facility-owned">Owned only</option>
          <option value="verified">Verified only</option>
        </select>
        <span className="flex items-center text-sm text-muted-foreground">
          {filtered.length} results
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold text-foreground">#</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Location</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Badge</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((facility) => (
              <tr
                key={facility.id}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3 text-muted-foreground">
                  {facility.record_number ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{facility.name}</div>
                  {facility.phone && (
                    <div className="text-xs text-muted-foreground">{facility.phone}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{facility.category}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[facility.area, facility.sub_city].filter(Boolean).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${BADGE_COLORS[facility.verification_status] ?? ""}`}
                  >
                    {BADGE_LABELS[facility.verification_status] ?? facility.verification_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      defaultValue={facility.verification_status}
                      disabled={updatingId === facility.id || isPending}
                      onChange={(e) => handleBadgeChange(facility.id, e.target.value)}
                    >
                      <option value="community-submitted">CS</option>
                      <option value="facility-owned">Owned</option>
                      <option value="verified">Verified</option>
                    </select>
                    {updatingId === facility.id && (
                      <span className="text-xs text-muted-foreground">Saving...</span>
                    )}
                    <a
                      className="text-xs text-primary hover:underline"
                      href={`/facilities/${facility.slug}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      View ↗
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No facilities match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
