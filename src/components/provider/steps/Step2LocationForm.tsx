"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useTransition } from "react";
import { saveStep2, autoSaveStep2 } from "@/app/provider/(console)/onboarding/location/actions";
import { AutoSaveIndicator } from "@/components/provider/AutoSaveIndicator";
import { SubmitButton } from "@/components/provider/SubmitButton";
import { SAVE_INTENT_CONTINUE, SAVE_INTENT_FIELD, SAVE_INTENT_STAY } from "@/lib/provider/save-intent";
import { ADDIS_SUB_CITIES } from "@/lib/provider/onboarding-config";
import { BranchRepeater, hasBranchContent } from "@/components/provider/branch-repeater";
import { normalizeUrl } from "@/lib/normalize-url";
import type { FacilityBranch } from "@/types/facility";
import { FieldGrid } from "@/components/ui/FieldGrid";
import { AccessNotesField } from "@/components/provider/AccessNotesField";
import { ClearStepButton } from "@/components/provider/ClearStepButton";
import { useRefreshCompletion } from "@/components/provider/CompletionProgress";

const MapPinPicker = dynamic(
  () => import("@/components/provider/MapPinPicker").then((m) => m.MapPinPicker),
  { ssr: false },
);

type Claim = Record<string, unknown>;

export function Step2LocationForm({ claim }: { claim: Claim }) {
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [subCity, setSubCity] = useState((claim.proposed_sub_city as string) ?? "");
  const [area, setArea] = useState((claim.proposed_area as string) ?? "");
  const [landmark, setLandmark] = useState((claim.proposed_landmark as string) ?? "");
  const [accessNotes, setAccessNotes] = useState((claim.proposed_access_notes as string) ?? "");
  const [mapsLink, setMapsLink] = useState((claim.proposed_maps_link as string) ?? "");
  const [lat, setLat] = useState<number | null>((claim.proposed_latitude as number) ?? null);
  const [lng, setLng] = useState<number | null>((claim.proposed_longitude as number) ?? null);

  const [phone, setPhone] = useState((claim.proposed_phone as string) ?? "");
  const [phone2, setPhone2] = useState((claim.proposed_phone_2 as string) ?? "");
  const [whatsapp, setWhatsapp] = useState((claim.proposed_whatsapp as string) ?? "");
  const [telegram, setTelegram] = useState((claim.proposed_telegram as string) ?? "");
  const [email, setEmail] = useState((claim.proposed_email as string) ?? "");
  const [website, setWebsite] = useState((claim.proposed_website as string) ?? "");
  const [instagram, setInstagram] = useState((claim.proposed_instagram as string) ?? "");
  const [facebook, setFacebook] = useState((claim.proposed_facebook as string) ?? "");
  const [tiktok, setTiktok] = useState((claim.proposed_tiktok as string) ?? "");
  const [linkedin, setLinkedin] = useState((claim.proposed_linkedin as string) ?? "");
  const [youtube, setYoutube] = useState((claim.proposed_youtube as string) ?? "");

  const branchCount = (claim.proposed_branch_count as number) ?? 1;
  const [branches, setBranches] = useState<FacilityBranch[]>(
    (claim.proposed_branches as FacilityBranch[]) ?? [],
  );

  // Pre-populate empty branch blocks for fixed counts (2-6) so they appear
  // immediately, without waiting for the user to click "Add branch".
  // Unbounded counts (99) start empty since there's no fixed number to fill.
  //
  // Local state only — deliberately NOT auto-saved. This used to call
  // autoSave({ branches: initial }) here too, which wrote N blank branch
  // objects to facility_claims the instant a provider picked a branch
  // count, before they had typed anything. That is exactly the shape found
  // in the one real claim that ever had branch data: every field blank.
  // persistBranches (below) is what actually decides what reaches the
  // database from here on.
  useEffect(() => {
    if (branchCount > 1 && branchCount !== 99 && branches.length === 0) {
      const initial = Array.from({ length: branchCount - 1 }, () => ({
        name: "",
        area: "",
        landmark: "",
        latitude: null,
        longitude: null,
        maps_link: "",
        phone: "",
      }));
      setBranches(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCompletion = useRefreshCompletion();
  function autoSave(partial: Parameters<typeof autoSaveStep2>[0]) {
    startTransition(async () => {
      await autoSaveStep2(partial);
      setLastSaved(new Date());
      refreshCompletion();
    });
  }

  // Updates local state (every rendered block, including blank ones the
  // provider hasn't reached yet, so nothing disappears while they're
  // mid-form) and separately autosaves only the entries worth keeping.
  function persistBranches(next: FacilityBranch[]) {
    setBranches(next);
    autoSave({ branches: next.filter(hasBranchContent) });
  }

  const handleMapChange = useCallback(
    (newLat: number, newLng: number, mapsLinkFromPicker?: string) => {
      setLat(newLat);
      setLng(newLng);
      const generatedLink =
        mapsLinkFromPicker ?? `https://www.google.com/maps?q=${newLat},${newLng}`;
      setMapsLink(generatedLink);
      autoSave({ lat: newLat, lng: newLng, maps_link: generatedLink });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function field(
    value: string,
    setValue: (v: string) => void,
    dbKey: Parameters<typeof autoSaveStep2>[0],
  ) {
    return {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
      onBlur: () => autoSave(dbKey),
    };
  }

  return (
    <form action={saveStep2} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">Location & Contact</h2>
            <p className="text-sm text-muted-foreground">
              Help patients find you. Fields marked * are required.
            </p>
          </div>
          <AutoSaveIndicator isPending={isPending} lastSaved={lastSaved} />
        </div>

        <FieldGrid>
          {/* Sub-city */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="sub_city">
              Sub-city *
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="sub_city"
              name="sub_city"
              onChange={(e) => {
                setSubCity(e.target.value);
                autoSave({ sub_city: e.target.value });
              }}
              required
              value={subCity}
            >
              <option value="">Select…</option>
              {ADDIS_SUB_CITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Area and landmark used to be two separate required fields here,
              unlike anywhere else this fact is asked — both answer the same
              underlying question ("where, roughly, is this") and splitting
              it in two doubled the typing for no real gain. Merged into one
              field, stored in `area`; `landmark` is cleared on the first
              edit so old separately-typed data (shown joined, once) does not
              linger as a stale duplicate underneath. Same treatment
              branch-repeater.tsx already gives every branch. */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="area">
              Area / neighborhood &amp; landmark *
            </label>
            {/* A few lines tall and not full width: a single-line box scrolled
                the start of a long description out of sight while typing.
                Still one line of data — Enter and pasted line breaks become
                spaces. */}
            <textarea
              className="max-w-xl resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="area"
              name="area"
              onBlur={() => autoSave({ area, landmark: "" })}
              onChange={(e) => {
                setArea(e.target.value.replace(/\s*\n\s*/g, " "));
                setLandmark("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder="e.g. Bole Medhanialem, next to Edna Mall"
              required
              rows={3}
              value={[area, landmark].filter(Boolean).join(", ")}
            />
            <input name="landmark" type="hidden" value="" />
            <p className="text-xs text-muted-foreground">
              The neighborhood patients would recognize, plus a well-known nearby place — e.g. &quot;Bole Medhanialem, next to Edna Mall&quot;
            </p>
          </div>

          {/* Access notes */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <p className="text-sm font-medium text-foreground">Access notes</p>
            <p className="-mt-1 text-xs text-muted-foreground">
              Tick everything that applies — parking, wheelchair access, elevator — and add directions if the entrance is hard to find.
            </p>
            <div className="max-w-xl">
              <AccessNotesField
                name="access_notes"
                onChange={setAccessNotes}
                onCommit={(text) => autoSave({ access_notes: text })}
                value={accessNotes}
              />
            </div>
          </div>

          {/* Map pin */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <MapPinPicker
              initialLat={lat}
              initialLng={lng}
              initialMapsLink={mapsLink}
              onChange={handleMapChange}
            />
            <input name="lat" type="hidden" value={lat ?? ""} />
            <input name="lng" type="hidden" value={lng ?? ""} />
            <input name="maps_link" type="hidden" value={mapsLink} />
          </div>
        </FieldGrid>
      </div>

      {branchCount > 1 && (
        <BranchRepeater
          allowGeolocation
          mainServices={(claim.proposed_services as string[] | null) ?? []}
          maxBranches={branchCount}
          onChange={setBranches}
          onCommit={persistBranches}
          value={branches}
        />
      )}

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Contact details</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          How should patients reach you?
        </p>

        <FieldGrid>
          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Primary phone *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="phone"
              name="phone"
              placeholder="+251 ..."
              required
              type="tel"
              {...field(phone, setPhone, { phone })}
            />
          </div>

          {/* Phone 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="phone_2">
              Secondary phone
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="phone_2"
              name="phone_2"
              placeholder="+251 ..."
              type="tel"
              {...field(phone2, setPhone2, { phone_2: phone2 })}
            />
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="whatsapp">
              WhatsApp
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="whatsapp"
              name="whatsapp"
              placeholder="+251 ..."
              type="tel"
              {...field(whatsapp, setWhatsapp, { whatsapp })}
            />
          </div>

          {/* Telegram */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="telegram">
              Telegram
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="telegram"
              name="telegram"
              placeholder="@username"
              type="text"
              {...field(telegram, setTelegram, { telegram })}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Public email
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="email"
              name="email"
              placeholder="info@facility.com"
              type="email"
              {...field(email, setEmail, { email })}
            />
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="website">
              Website
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="website"
              name="website"
              onBlur={() => {
                const normalized = normalizeUrl(website);
                setWebsite(normalized);
                autoSave({ website: normalized });
              }}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="tiruhealth.com"
              type="text"
              value={website}
            />
          </div>

          {/* Social media */}
          <div className="flex flex-col gap-3 sm:col-span-2">
            <p className="text-sm font-semibold text-foreground">
              Social media (optional)
            </p>
            <p className="text-xs text-muted-foreground">
              Paste the full link including https:// so patients can tap
              directly to your page.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="instagram">
                  Instagram
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  id="instagram"
                  name="instagram"
                  onBlur={() => {
                    const normalized = normalizeUrl(instagram);
                    setInstagram(normalized);
                    autoSave({ instagram: normalized });
                  }}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="instagram.com/yourpage"
                  type="text"
                  value={instagram}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="facebook">
                  Facebook
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  id="facebook"
                  name="facebook"
                  onBlur={() => {
                    const normalized = normalizeUrl(facebook);
                    setFacebook(normalized);
                    autoSave({ facebook: normalized });
                  }}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/yourpage"
                  type="text"
                  value={facebook}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="tiktok">
                  TikTok
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  id="tiktok"
                  name="tiktok"
                  onBlur={() => {
                    const normalized = normalizeUrl(tiktok);
                    setTiktok(normalized);
                    autoSave({ tiktok: normalized });
                  }}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="tiktok.com/@yourpage"
                  type="text"
                  value={tiktok}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="linkedin">
                  LinkedIn
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  id="linkedin"
                  name="linkedin"
                  onBlur={() => {
                    const normalized = normalizeUrl(linkedin);
                    setLinkedin(normalized);
                    autoSave({ linkedin: normalized });
                  }}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/company/yourpage"
                  type="text"
                  value={linkedin}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="youtube">
                  YouTube
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  id="youtube"
                  name="youtube"
                  onBlur={() => {
                    const normalized = normalizeUrl(youtube);
                    setYoutube(normalized);
                    autoSave({ youtube: normalized });
                  }}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="youtube.com/@yourchannel"
                  type="text"
                  value={youtube}
                />
              </div>
            </div>
          </div>
        </FieldGrid>
      </div>

      <div className="-mb-3 flex justify-end">
        <ClearStepButton step="location" />
      </div>

      <div className="flex items-center justify-between">
        <a
          className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
          href="/provider/onboarding/identity"
        >
          ← Back
        </a>
        {/* The Save button carries the intent field so saveStep2 commits and
            stops instead of advancing the phase. See lib/provider/save-intent.ts. */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <SubmitButton
            className="px-5"
            loadingText="Saving…"
            name={SAVE_INTENT_FIELD}
            value={SAVE_INTENT_STAY}
            variant="secondary"
          >
            Save
          </SubmitButton>
          <SubmitButton
            className="px-6"
            loadingText="Saving…"
            name={SAVE_INTENT_FIELD}
            value={SAVE_INTENT_CONTINUE}
          >
            Save &amp; continue →
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
