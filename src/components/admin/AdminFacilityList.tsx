"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  updateFacilityBadge,
  deactivateFacility,
  reactivateFacility,
} from "@/app/admin/(protected)/facilities/actions";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/lib/design-tokens";

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
  is_active: boolean | null;
  deactivation_category: string | null;
  deactivated_at: string | null;
};

const BADGE_LABELS: Record<string, string> = {
  "community-submitted": "CS",
  "facility-owned": "Official",
  verified: "✓ Verified",
};

const BADGE_VARIANTS: Record<string, BadgeVariant> = {
  "community-submitted": "warning",
  "facility-owned": "info",   // transitional — target is "primary" in a later phase
  verified: "success",
};

const DEACTIVATION_CATEGORIES = [
  "Closed permanently",
  "License expired or not renewed",
  "Relocated (new listing pending)",
  "Under investigation",
  "Temporarily closed",
  "Other",
];

function getAvailableBadgeOptions(currentStatus: string) {
  if (currentStatus === "community-submitted") {
    return [
      { value: "community-submitted", label: "CS" },
      { value: "facility-owned", label: "Owned" },
    ];
  }
  // Once Owned or Verified: CS is locked out permanently.
  return [
    { value: "facility-owned", label: "Owned" },
    { value: "verified", label: "Verified" },
  ];
}

export function AdminFacilityList({ facilities }: { facilities: Facility[] }) {
  const searchParams = useSearchParams();
  // Lets dashboard stat cards deep-link straight into a filtered view, e.g.
  // /admin/facilities?badge=community-submitted.
  const badgeParam = searchParams.get("badge");
  const initialBadgeFilter =
    badgeParam && badgeParam in BADGE_VARIANTS ? badgeParam : "all";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState(initialBadgeFilter);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<{
    facilityId: string;
    facilityName: string;
  } | null>(null);
  const [deactivateForm, setDeactivateForm] = useState({ category: "", reason: "" });

  const categories = Array.from(new Set(facilities.map((f) => f.category))).sort();

  const filtered = facilities.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.area ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.sub_city ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesBadge = badgeFilter === "all" || f.verification_status === badgeFilter;
    const isInactive = f.is_active === false;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" ? !isInactive : isInactive);
    return matchesSearch && matchesCategory && matchesBadge && matchesActive;
  });

  function handleBadgeChange(facilityId: string, currentStatus: string, newStatus: string) {
    if (currentStatus === "verified" && newStatus === "facility-owned") {
      if (!confirm("Are you sure you want to downgrade this facility from Verified to Owned?"))
        return;
    }
    setUpdatingId(facilityId);
    startTransition(async () => {
      await updateFacilityBadge(facilityId, newStatus);
      setUpdatingId(null);
    });
  }

  function handleReactivate(facilityId: string, facilityName: string) {
    if (
      !confirm(
        `Reactivate "${facilityName}"? This will make it visible on the public directory again.`,
      )
    )
      return;
    startTransition(async () => {
      await reactivateFacility(facilityId);
    });
  }

  function handleDeactivateSubmit() {
    if (!deactivateModal || !deactivateForm.category || !deactivateForm.reason.trim()) return;
    const { facilityId } = deactivateModal;
    setDeactivateModal(null);
    startTransition(async () => {
      await deactivateFacility(facilityId, deactivateForm.category, deactivateForm.reason.trim());
      setDeactivateForm({ category: "", reason: "" });
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
            <option key={c} value={c}>
              {c}
            </option>
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
        <select
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
          value={activeFilter}
        >
          <option value="all">All</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
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
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((facility) => {
              const isInactive = facility.is_active === false;
              const availableOptions = getAvailableBadgeOptions(facility.verification_status);

              return (
                <tr
                  key={facility.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 ${isInactive ? "opacity-60" : ""}`}
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
                    <Badge variant={BADGE_VARIANTS[facility.verification_status] ?? "default"}>
                      {BADGE_LABELS[facility.verification_status] ?? facility.verification_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge dot variant={isInactive ? "danger" : "success"}>
                      {isInactive ? "Inactive" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        value={facility.verification_status}
                        disabled={updatingId === facility.id || isPending}
                        onChange={(e) =>
                          handleBadgeChange(
                            facility.id,
                            facility.verification_status,
                            e.target.value,
                          )
                        }
                      >
                        {availableOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {updatingId === facility.id && (
                        <span className="text-xs text-muted-foreground">Saving...</span>
                      )}
                      {isInactive ? (
                        <button
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          disabled={isPending}
                          onClick={() => handleReactivate(facility.id, facility.name)}
                          type="button"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          disabled={isPending}
                          onClick={() =>
                            setDeactivateModal({
                              facilityId: facility.id,
                              facilityName: facility.name,
                            })
                          }
                          type="button"
                        >
                          Deactivate
                        </button>
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
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No facilities match your filters.
          </div>
        )}
      </div>

      {/* Deactivation modal */}
      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Deactivate listing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deactivating will hide &quot;{deactivateModal.facilityName}&quot; from the public
              directory. This action can be reversed.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  REASON CATEGORY *
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={deactivateForm.category}
                  onChange={(e) =>
                    setDeactivateForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <option value="">Select a reason...</option>
                  {DEACTIVATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  ADDITIONAL DETAILS *
                </label>
                <textarea
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Provide details about this deactivation..."
                  rows={3}
                  value={deactivateForm.reason}
                  onChange={(e) =>
                    setDeactivateForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                onClick={() => {
                  setDeactivateModal(null);
                  setDeactivateForm({ category: "", reason: "" });
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={
                  !deactivateForm.category || !deactivateForm.reason.trim() || isPending
                }
                onClick={handleDeactivateSubmit}
                type="button"
              >
                Confirm deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
