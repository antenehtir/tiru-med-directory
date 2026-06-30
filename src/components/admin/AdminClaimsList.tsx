"use client";

import { useState, useTransition } from "react";
import { approveClaim, rejectClaim } from "@/app/admin/(protected)/claims/actions";

export type Facility = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  sub_city: string | null;
  area: string | null;
  verification_status: string;
};

export type Claim = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  claimant_role: string | null;
  claimant_role_other: string | null;
  claimant_phone: string | null;
  facility_official_phone_claimed: string | null;
  work_email: string | null;
  referral_source: string | null;
  verification_status_internal: string;
  verification_call_notes: string | null;
  facility_id: string | null;
  facility_name: string | null;
  facilities: Facility | null;
};

type Tab = "claims" | "new-listings";

export function AdminClaimsList({ claims }: { claims: Claim[] }) {
  const claimsItems = claims.filter((c) => c.facility_id !== null);
  const newListingsItems = claims.filter((c) => c.facility_id === null);

  const [activeTab, setActiveTab] = useState<Tab>(
    newListingsItems.length > claimsItems.length ? "new-listings" : "claims",
  );
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = activeTab === "claims" ? claimsItems : newListingsItems;

  function handleApprove(claimId: string, facilityId: string | null, facilityName: string) {
    const msg =
      facilityId === null
        ? `Create a new facility listing for "${facilityName}" and approve this submission?`
        : "Approve this claim? The facility will become Official.";
    if (!confirm(msg)) return;
    startTransition(async () => {
      const result = await approveClaim(claimId, facilityId, notes[claimId] ?? "");
      if (result?.warning) alert(result.warning);
      if (result?.error) alert(`Approval error: ${result.error}`);
    });
  }

  function handleReject(claimId: string) {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    startTransition(() => rejectClaim(claimId, reason));
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 border-b border-border">
        <div className="flex">
          {(
            [
              { key: "claims" as Tab, label: "Claims", count: claimsItems.length },
              { key: "new-listings" as Tab, label: "New Listings", count: newListingsItems.length },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              className={`mr-1 border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveTab(key);
                setExpandedId(null);
              }}
              type="button"
            >
              {label}{" "}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  activeTab === key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">
            {activeTab === "claims" ? "No pending claims" : "No pending new listings"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "claims"
              ? "Provider claims on existing facilities awaiting verification will appear here."
              : "New facility listing requests awaiting review will appear here."}
          </p>
        </div>
      )}

      {/* Card list */}
      {visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((claim) => {
            const facility = claim.facilities;
            const isNewListing = !claim.facility_id;
            const displayName = isNewListing
              ? (claim.facility_name ?? "New listing")
              : (facility?.name ?? "—");
            const claimantRole =
              claim.claimant_role === "Other" ? claim.claimant_role_other : claim.claimant_role;
            const phoneMatch =
              facility?.phone &&
              claim.facility_official_phone_claimed &&
              facility.phone.replace(/\s/g, "") ===
                claim.facility_official_phone_claimed.replace(/\s/g, "");
            const isExpanded = expandedId === claim.id;

            return (
              <div key={claim.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground">{displayName}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {isNewListing ? "Submitted" : "Claimed"} by {claim.display_name} ·{" "}
                      {claimantRole}
                    </p>
                  </div>
                  <button
                    className="shrink-0 text-sm text-primary hover:underline"
                    onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                    type="button"
                  >
                    {isExpanded ? "Hide" : "Review"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-border pt-4">
                    {/* Cross-check grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {isNewListing ? "SUBMITTER" : "CLAIMANT"}
                        </p>
                        <p className="mt-1 text-sm text-foreground">{claim.display_name}</p>
                        <p className="text-xs text-muted-foreground">Role: {claimantRole}</p>
                        <p className="text-xs text-muted-foreground">
                          Phone: {claim.claimant_phone}
                        </p>
                        <p className="text-xs text-muted-foreground">Email: {claim.email}</p>
                        {claim.work_email && (
                          <p className="text-xs text-muted-foreground">
                            Work email: {claim.work_email}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">FACILITY</p>
                        {isNewListing ? (
                          <>
                            <p className="mt-1 text-sm text-foreground">
                              {claim.facility_name ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              New listing — not yet in the directory
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="mt-1 text-sm text-foreground">{facility?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {facility?.category} · {facility?.area}, {facility?.sub_city}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              On-file phone:{" "}
                              <span className="font-semibold">{facility?.phone ?? "—"}</span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Phone cross-check — only for existing facility claims */}
                    {!isNewListing && (
                      <div
                        className={`rounded-xl p-3 ${
                          phoneMatch
                            ? "bg-teal-50 dark:bg-teal-950/30"
                            : "bg-amber-50 dark:bg-amber-950/30"
                        }`}
                      >
                        <p className="text-xs font-semibold text-foreground">
                          📞 Official number cross-check
                        </p>
                        <p className="mt-1 text-sm">
                          <span className="text-muted-foreground">On file: </span>
                          <span className="font-semibold text-foreground">
                            {facility?.phone ?? "—"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Claimant entered: </span>
                          <span className="font-semibold text-foreground">
                            {claim.facility_official_phone_claimed ?? "—"}
                          </span>
                        </p>
                        <p
                          className={`mt-1 text-xs font-semibold ${
                            phoneMatch ? "text-teal-600" : "text-amber-600"
                          }`}
                        >
                          {phoneMatch
                            ? "✓ Numbers match"
                            : "⚠ Numbers do not match — verify carefully"}
                        </p>
                      </div>
                    )}

                    {/* Call script */}
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        SUGGESTED CALL SCRIPT
                      </p>
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        {isNewListing ? (
                          <>
                            &quot;Hello, this is Tiru Medical Directory. We received a new listing
                            request for {claim.facility_name ?? "your facility"} from{" "}
                            {claim.display_name}, listed as {claimantRole}. Can you confirm this
                            person is authorized to list your facility in our public
                            directory?&quot;
                          </>
                        ) : (
                          <>
                            &quot;Hello, this is Tiru Medical Directory. We received a request to
                            manage {facility?.name ?? "your facility"}&apos;s online listing from{" "}
                            {claim.display_name}, listed as {claimantRole}. Can you confirm this
                            person works there and is authorized to manage your public
                            listing?&quot;
                          </>
                        )}
                      </p>
                    </div>

                    {/* Call notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        CALL NOTES
                      </label>
                      <textarea
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        defaultValue={claim.verification_call_notes ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [claim.id]: e.target.value }))}
                        placeholder="Record what the facility confirmed..."
                        rows={2}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                        disabled={isPending}
                        onClick={() =>
                          handleApprove(claim.id, claim.facility_id, displayName)
                        }
                        type="button"
                      >
                        {isNewListing ? "✓ Approve & publish listing" : "✓ Approve & make Official"}
                      </button>
                      <button
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => handleReject(claim.id)}
                        type="button"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
