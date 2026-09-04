"use client";

import { useRef, useState, useTransition } from "react";
import { updateFacilityContact } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import { normalizeUrl } from "@/lib/normalize-url";

type Facility = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function AdminFacilityContactEditor({ facility }: { facility: Facility }) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState(str(facility.phone));
  const [phone2, setPhone2] = useState(str(facility.phone_2));
  const [whatsapp, setWhatsapp] = useState(str(facility.whatsapp));
  const [telegram, setTelegram] = useState(str(facility.telegram));
  const [email, setEmail] = useState(str(facility.email));
  const [website, setWebsite] = useState(str(facility.website));
  const [instagram, setInstagram] = useState(str(facility.instagram));
  const [facebook, setFacebook] = useState(str(facility.facebook));
  const [tiktok, setTiktok] = useState(str(facility.tiktok));
  const [linkedin, setLinkedin] = useState(str(facility.linkedin));

  // Same rule as the services section: only what the admin actually changed
  // is written, so an untouched column keeps whatever is already live rather
  // than being rewritten with this component's own loaded default.
  const initial = useRef<Record<string, string | null>>({
    phone: str(facility.phone),
    phone_2: str(facility.phone_2) || null,
    whatsapp: str(facility.whatsapp) || null,
    telegram: str(facility.telegram) || null,
    email: str(facility.email) || null,
    website: str(facility.website) || null,
    instagram: str(facility.instagram) || null,
    facebook: str(facility.facebook) || null,
    tiktok: str(facility.tiktok) || null,
    linkedin: str(facility.linkedin) || null,
  });

  function handleSave() {
    setError(null);
    const fields = {
      phone: phone.trim(),
      phone_2: phone2.trim() || null,
      whatsapp: whatsapp.trim() || null,
      telegram: telegram.trim() || null,
      email: email.trim() || null,
      website: normalizeUrl(website) || null,
      instagram: normalizeUrl(instagram) || null,
      facebook: normalizeUrl(facebook) || null,
      tiktok: normalizeUrl(tiktok) || null,
      linkedin: normalizeUrl(linkedin) || null,
    };
    setWebsite(fields.website ?? "");
    setInstagram(fields.instagram ?? "");
    setFacebook(fields.facebook ?? "");
    setTiktok(fields.tiktok ?? "");
    setLinkedin(fields.linkedin ?? "");

    const changed: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (initial.current[key] !== value) changed[key] = value;
    }
    if (Object.keys(changed).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      return;
    }

    startTransition(async () => {
      try {
        await updateFacilityContact(facility.id as string, changed);
        initial.current = { ...initial.current, ...changed };
        setSavedAt(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg font-bold text-foreground">Contact details</h2>
          <p className="text-sm text-muted-foreground">How should patients reach you?</p>
        </div>
        {savedAt && !isPending && (
          <span className="text-xs text-muted-foreground">Saved {savedAt.toLocaleTimeString()}</span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_phone">
            Primary phone *
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_phone"
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 ..."
            type="tel"
            value={phone}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_phone_2">
            Secondary phone
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_phone_2"
            onChange={(e) => setPhone2(e.target.value)}
            placeholder="+251 ..."
            type="tel"
            value={phone2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_whatsapp">
            WhatsApp
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_whatsapp"
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+251 ..."
            type="tel"
            value={whatsapp}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_telegram">
            Telegram
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_telegram"
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="@username"
            type="text"
            value={telegram}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_email">
            Public email
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@facility.com"
            type="email"
            value={email}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_website">
            Website
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_website"
            onBlur={() => setWebsite((v) => normalizeUrl(v))}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="tiruhealth.com"
            type="text"
            value={website}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Social media (optional)</p>
          <p className="text-xs text-muted-foreground">
            Paste the full link including https:// so patients can tap directly to your page.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_instagram">
                Instagram
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_instagram"
                onBlur={() => setInstagram((v) => normalizeUrl(v))}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="instagram.com/yourpage"
                type="text"
                value={instagram}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_facebook">
                Facebook
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_facebook"
                onBlur={() => setFacebook((v) => normalizeUrl(v))}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="facebook.com/yourpage"
                type="text"
                value={facebook}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_tiktok">
                TikTok
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_tiktok"
                onBlur={() => setTiktok((v) => normalizeUrl(v))}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="tiktok.com/@yourpage"
                type="text"
                value={tiktok}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_linkedin">
                LinkedIn
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_linkedin"
                onBlur={() => setLinkedin((v) => normalizeUrl(v))}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/company/yourpage"
                type="text"
                value={linkedin}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving…" : "Save Contact & Social"}
        </button>
      </div>
    </div>
  );
}
