"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { approveClaim, rejectClaim, saveCallNotes } from "@/app/admin/(protected)/claims/actions";
import { Pill } from "@/components/ui/Pill";
import { AdminAccountChangeList, type AccountChange } from "@/components/admin/AdminAccountChangeList";
import { formatAddisDate, formatAddisDateTime } from "@/lib/addis-time";

export type Facility = {
  id: string;
  slug: string | null;
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
  facility_phone: string | null;
  work_email: string | null;
  referral_source: string | null;
  verification_status_internal: string;
  verification_call_notes: string | null;
  facility_id: string | null;
  facility_name: string | null;
  submitted_at: string | null;
  proposed_phone: string | null;
  proposed_sub_city: string | null;
  proposed_area: string | null;
  // Set when this provider was rejected before and has submitted again.
  resubmission: { count: number; lastReason: string; lastRejectedAt: string } | null;
  facilities: Facility | null;
};

type Tab = "claims" | "new-listings" | "resubmitted" | "account-changes";

export function AdminClaimsList({
  claims,
  accountChanges = [],
}: {
  claims: Claim[];
  accountChanges?: AccountChange[];
}) {
  const searchParams = useSearchParams();
  // A resubmission is reviewed on its own tab: the admin checks first
  // whether the reason it was sent back has been fixed.
  const resubmittedItems = claims.filter((c) => c.resubmission);
  const claimsItems = claims.filter((c) => !c.resubmission && c.facility_id !== null);
  const newListingsItems = claims.filter((c) => !c.resubmission && c.facility_id === null);

  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "claims" ||
    tabParam === "new-listings" ||
    tabParam === "resubmitted" ||
    tabParam === "account-changes"
      ? tabParam
      : resubmittedItems.length > 0 && claimsItems.length === 0 && newListingsItems.length === 0
        ? "resubmitted"
        : newListingsItems.length > claimsItems.length
          ? "new-listings"
          : "claims";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isPending, startTransition] = useTransition();
  // Seeded from what is already on file, so notes written earlier are sent
  // with the decision rather than replaced by an empty box.
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(claims.map((c) => [c.id, c.verification_call_notes ?? ""])),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible =
    activeTab === "claims" ? claimsItems : activeTab === "new-listings" ? newListingsItems : resubmittedItems;

  function handleApprove(claimId: string, facilityId: string | null, facilityName: string) {
    const msg =
      facilityId === null
        ? `Create a new facility listing for "${facilityName}" and approve this submission?`
        : "Approve this claim? The listing becomes Facility Managed — the provider will control it.";
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
    startTransition(() => rejectClaim(claimId, reason, notes[claimId] ?? ""));
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 overflow-x-auto border-b border-border [scrollbar-width:none]">
        <div className="flex w-max">
          {(
            [
              { key: "claims" as Tab, label: "Claims", count: claimsItems.length },
              { key: "new-listings" as Tab, label: "New Listings", count: newListingsItems.length },
              { key: "resubmitted" as Tab, label: "Resubmitted", count: resubmittedItems.length },
              { key: "account-changes" as Tab, label: "Account changes", count: accountChanges.length },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              className={`mr-1 whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
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
              <Pill size="sm" variant={activeTab === key ? "selected" : "muted"}>
                {count}
              </Pill>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "account-changes" && <AdminAccountChangeList changes={accountChanges} />}

      {/* Empty state */}
      {activeTab !== "account-changes" && visible.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">
            {activeTab === "claims"
              ? "No pending claims"
              : activeTab === "new-listings"
                ? "No pending new listings"
                : "No resubmissions waiting"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "claims"
              ? "Provider claims on existing facilities awaiting verification will appear here."
              : activeTab === "new-listings"
                ? "New facility listing requests awaiting review will appear here."
                : "Submissions sent back once and submitted again will appear here."}
          </p>
        </div>
      )}

      {/* Card list */}
      {activeTab !== "account-changes" && visible.length > 0 && (
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
            // New-listing signups keep the person's number in phone and the
            // facility's in facility_phone; claims fill claimant_phone. Both
            // are read so the card never shows a blank where a number is on file.
            const submitterPhone = claim.claimant_phone || claim.phone;
            const newListingPhone = claim.proposed_phone || claim.facility_phone;
            const noteText = notes[claim.id] ?? "";

            return (
              <div key={claim.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground">
                      {displayName}
                      {claim.resubmission && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          Resubmitted{claim.resubmission.count > 1 ? ` ×${claim.resubmission.count}` : ""}
                        </span>
                      )}
                    </h3>
                    {activeTab === "resubmitted" && (
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {isNewListing ? "New listing" : "Claim on an existing listing"}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {isNewListing ? "Submitted" : "Claimed"} by {claim.display_name} ·{" "}
                      {claimantRole}
                      {claim.submitted_at ? ` · ${formatAddisDateTime(claim.submitted_at)}` : ""}
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
                    {claim.resubmission && (
                      <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
                        <p className="text-xs font-semibold text-foreground">
                          ↩ Sent back on {formatAddisDate(claim.resubmission.lastRejectedAt)} — check this is fixed
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {claim.resubmission.lastReason || "No reason was recorded."}
                        </p>
                      </div>
                    )}

                    {/* Cross-check grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {isNewListing ? "SUBMITTER" : "CLAIMANT"}
                        </p>
                        <p className="mt-1 text-sm text-foreground">{claim.display_name}</p>
                        <p className="text-xs text-muted-foreground">Role: {claimantRole}</p>
                        <p className="text-xs text-muted-foreground">
                          Phone:{" "}
                          {submitterPhone ? (
                            <a className="font-semibold text-foreground hover:underline" href={`tel:${submitterPhone.replace(/\s/g, "")}`}>
                              {submitterPhone}
                            </a>
                          ) : (
                            "not given"
                          )}
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
                            {(claim.proposed_area || claim.proposed_sub_city) && (
                              <p className="text-xs text-muted-foreground">
                                {[claim.proposed_area, claim.proposed_sub_city].filter(Boolean).join(", ")}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Facility phone:{" "}
                              {newListingPhone ? (
                                <a className="font-semibold text-foreground hover:underline" href={`tel:${newListingPhone.replace(/\s/g, "")}`}>
                                  {newListingPhone}
                                </a>
                              ) : (
                                "not given"
                              )}
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
                            {facility?.slug && (
                              <a
                                className="text-xs font-medium text-primary hover:underline"
                                href={`/facilities/${facility.slug}`}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                View public listing ↗
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Claims filed through the one-step claim form carry no
                        claimant-entered official number — Tiru already has
                        it — so there is nothing to cross-check, only a number
                        to call. Older claims still get the comparison. */}
                    {!isNewListing && !claim.facility_official_phone_claimed && (
                      <div className="rounded-xl bg-info-bg p-3">
                        <p className="text-xs font-semibold text-foreground">📞 Verify by calling the facility</p>
                        <p className="mt-1 text-sm">
                          <span className="text-muted-foreground">Number on the listing: </span>
                          <span className="font-semibold text-foreground">{facility?.phone ?? "—"}</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Call this number — not one the claimant supplied — and ask whether{" "}
                          {claim.display_name} works there as {claimantRole}.
                        </p>
                      </div>
                    )}

                    {/* Phone cross-check — only for existing facility claims */}
                    {!isNewListing && claim.facility_official_phone_claimed && (
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
                      <label className="text-xs font-semibold text-muted-foreground" htmlFor={`call-notes-${claim.id}`}>
                        CALL NOTES
                      </label>
                      <textarea
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        id={`call-notes-${claim.id}`}
                        onBlur={(e) => {
                          if (e.target.value !== (claim.verification_call_notes ?? "")) {
                            void saveCallNotes(claim.id, e.target.value);
                          }
                        }}
                        onChange={(e) => setNotes((n) => ({ ...n, [claim.id]: e.target.value }))}
                        value={noteText}
                        placeholder="Record what the facility confirmed..."
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required to approve. Saved with the decision in the audit log.
                      </p>
                    </div>


                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                        disabled={isPending || !noteText.trim()}
                        onClick={() =>
                          handleApprove(claim.id, claim.facility_id, displayName)
                        }
                        title={noteText.trim() ? undefined : "Add call notes first"}
                        type="button"
                      >
                        {isNewListing ? "✓ Approve & publish listing" : "✓ Approve & hand over to facility"}
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
