"use client";

import { useEffect, useState } from "react";
import { submitForReview } from "@/app/provider/(console)/onboarding/review/actions";
import { Spinner } from "@/components/provider/Spinner";
import { Badge } from "@/components/ui/Badge";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import {
  createEmptyDoctor,
  formatDoctorDisplayName,
  type DoctorEntry,
} from "@/lib/provider/doctor-types";

type Claim = Record<string, unknown>;
type ScheduleRow = { days: string[]; open: string; close: string; closed: boolean };

// Duplicated inline — the real implementation lives in the "use client"
// ScheduleBuilder.tsx, and this file must not import from a client component.
function scheduleToText(rows: ScheduleRow[] | null | undefined): string {
  if (!Array.isArray(rows)) return "";
  return rows
    .filter((r) => r.days.length > 0)
    .map((r) => {
      const days = r.days.map((d) => d.slice(0, 3)).join(", ");
      const hours = r.closed
        ? "Closed"
        : r.open === "Open 24 hours"
          ? "Open 24 hours"
          : `${r.open} – ${r.close}`;
      return `${days}: ${hours}`;
    })
    .join("; ");
}

// Duplicated inline — the real implementation lives in the "use client"
// Step4DoctorsForm.tsx, and this file must not import from a client component.
function normalizeDoctor(raw: Partial<DoctorEntry> & Record<string, unknown>): DoctorEntry {
  const empty = createEmptyDoctor();
  return {
    ...empty,
    ...raw,
    specialty: typeof raw.specialty === "string" ? raw.specialty : empty.specialty,
    subspecialty: typeof raw.subspecialty === "string" ? raw.subspecialty : empty.subspecialty,
    languages: Array.isArray(raw.languages) ? (raw.languages as string[]) : empty.languages,
    available_schedule:
      Array.isArray(raw.available_schedule) && (raw.available_schedule as unknown[]).length > 0
        ? (raw.available_schedule as DoctorEntry["available_schedule"])
        : empty.available_schedule,
  } as DoctorEntry;
}

type ExpiryFlag = { label: string; color: "red" | "orange" | "amber" };

function getExpiryFlag(dateStr: string | null | undefined): ExpiryFlag | null {
  if (!dateStr) return null;
  const today = new Date();
  const expiry = new Date(dateStr);
  if (Number.isNaN(expiry.getTime())) return null;
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { label: "Expired", color: "red" };
  if (days <= 30) return { label: `Expiring in ${days} days — urgent`, color: "orange" };
  if (days <= 60) return { label: `Expiring in ${days} days — renew soon`, color: "amber" };
  return null;
}

// Same 3-tier expiry gradient as Step5MediaForm's getExpiryFlag — kept as a
// bespoke color set rather than Badge for the same reason (a genuine 3-step
// urgency scale that a 2-variant warning/danger system would collapse).
const expiryColorClasses: Record<ExpiryFlag["color"], string> = {
  red: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
  orange:
    "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
  amber:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
};

function SectionCard({
  id,
  stepNum,
  title,
  editHref,
  children,
}: {
  id: string;
  stepNum: number;
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 scroll-mt-24 rounded-2xl bg-card p-6 shadow-sm" id={id}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          <span className="mr-2 text-muted-foreground">{stepNum}.</span>
          {title}
        </h2>
        <a
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
          href={editHref}
        >
          Edit
        </a>
      </div>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="shrink-0 text-xs font-medium text-muted-foreground sm:w-32">{label}</span>
      <span className="text-foreground">{isEmpty ? "—" : value}</span>
    </div>
  );
}

function PillList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="default">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function RequiredNotice() {
  return (
    <Badge size="sm" variant="danger">
      Required for submission
    </Badge>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "green" | "gray" }) {
  return (
    <Badge className="font-bold" variant={tone === "green" ? "success" : "muted"}>
      {children}
    </Badge>
  );
}

function CompletionRing({ pct }: { pct: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const size = 100;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (mounted ? pct / 100 : 0) * circumference;
  const ringColorClass = pct >= 70 ? "text-primary" : "text-warning";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" height={size} width={size}>
        <circle
          className="text-muted"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <circle
          className={`${ringColorClass} transition-[stroke-dashoffset] duration-1000 ease-out`}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-foreground">{pct}%</span>
      </div>
    </div>
  );
}

export function Step6ReviewForm({ claim }: { claim: Claim }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const pct = calculateCompletion(claim);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitForReview();
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  // Section 1 — Facility Identity
  const altName = claim.proposed_alt_name as string | null;
  const description = (claim.proposed_description as string) ?? "";
  const languages = (claim.proposed_languages as string[]) ?? [];
  const patientGroups = (claim.proposed_patient_groups as string[]) ?? [];

  // Section 2 — Location & Contact
  const lat = claim.proposed_latitude as number | null;
  const lng = claim.proposed_longitude as number | null;
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const branchCount = (claim.proposed_branch_count as number) ?? 0;
  const branches = (claim.proposed_branches as Array<{ name?: string; area?: string }> | null) ?? [];
  const locationLine = [claim.proposed_sub_city, claim.proposed_area, claim.proposed_landmark]
    .filter(Boolean)
    .join(", ");

  // Section 3 — Services & Schedule
  const services = (claim.proposed_services as string[]) ?? [];
  const scheduleLines = scheduleToText(claim.proposed_schedule as ScheduleRow[])
    .split("; ")
    .filter(Boolean);
  const appointmentModalities =
    (claim.proposed_appointment_modalities as Array<{ label?: string }> | null) ?? [];
  const paymentMethods = (claim.proposed_payment_methods as string[]) ?? [];
  const checkupPackages = (claim.proposed_checkup_packages as Array<{ name?: string }> | null) ?? [];

  // Section 4 — Doctors & Staff. Pharmacies don't have this step at all
  // (see ProviderConsoleShell.tsx's FACILITY_TYPES_WITHOUT_DOCTORS_STEP).
  // Blank-name entries (e.g. "+ Add another doctor" clicked but never
  // filled in) are dropped here rather than rendered as "Unnamed" — matches
  // the same non-blank filter calculateCompletion already uses.
  const showDoctorsSection = (claim.facility_type as string | undefined) !== "Pharmacy";
  const rawDoctors = (claim.proposed_doctors as Array<Partial<DoctorEntry> & Record<string, unknown>> | null) ?? [];
  const doctors = rawDoctors.map(normalizeDoctor).filter((d) => d.full_name.trim().length > 0);

  // Section 5 — Photos & Documents
  const entrancePhotos = Array.isArray(claim.proposed_entrance_photo_urls)
    ? (claim.proposed_entrance_photo_urls as string[]).filter(Boolean)
    : claim.proposed_entrance_photo_url
      ? [claim.proposed_entrance_photo_url as string]
      : [];
  const logo = claim.proposed_logo_url as string;
  const licenseUrl = claim.proposed_license_url as string;
  const licenseIssue = claim.proposed_license_issue_date as string;
  const licenseExpiry = claim.proposed_license_expiry_date as string;
  const licenseFlag = getExpiryFlag(licenseExpiry);
  const bizLicenseUrl = claim.proposed_business_license_url as string;
  const bizLicenseIssue = claim.proposed_business_license_issue_date as string;
  const bizLicenseExpiry = claim.proposed_business_license_expiry_date as string;
  const bizLicenseFlag = getExpiryFlag(bizLicenseExpiry);

  const hasOperatingLicense = Boolean(licenseUrl && licenseIssue && licenseExpiry);
  const hasBusinessLicense = Boolean(bizLicenseUrl && bizLicenseIssue && bizLicenseExpiry);

  function describeMissingLicense(
    url: string,
    issue: string,
    expiry: string,
    label: string,
  ): string | null {
    if (url && issue && expiry) return null;
    const parts: string[] = [];
    if (!url) parts.push("document");
    if (!issue) parts.push("issue date");
    if (!expiry) parts.push("expiry date");
    return `${label} (missing ${parts.join(", ")})`;
  }

  const missingLicenseItems = [
    describeMissingLicense(licenseUrl, licenseIssue, licenseExpiry, "Operating license"),
    describeMissingLicense(bizLicenseUrl, bizLicenseIssue, bizLicenseExpiry, "Business license"),
  ].filter((item): item is string => item !== null);

  const JUMP_LINKS = [
    { href: "#section-identity", label: "Identity" },
    { href: "#section-location", label: "Location" },
    { href: "#section-services", label: "Services" },
    { href: "#section-doctors", label: "Doctors" },
    { href: "#section-photos", label: "Photos" },
  ];

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-border bg-background/95 px-4 py-3 text-sm backdrop-blur sm:-mx-6 sm:px-6">
        <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Jump to:
        </span>
        {JUMP_LINKS.map((link, i) => (
          <span className="flex items-center" key={link.href}>
            <a
              className="inline-flex min-h-11 items-center px-1 font-medium text-primary hover:underline"
              href={link.href}
            >
              {link.label}
            </a>
            {i < JUMP_LINKS.length - 1 && (
              <span className="text-muted-foreground">·</span>
            )}
          </span>
        ))}
      </div>

      <SectionCard editHref="/provider/onboarding/identity" id="section-identity" stepNum={1} title="Facility Identity">
        <FieldRow label="Facility name" value={claim.proposed_name as string} />
        {altName && <FieldRow label="Alt name" value={altName} />}
        <FieldRow label="Ownership type" value={claim.proposed_ownership_type as string} />
        <FieldRow label="Branch count" value={claim.proposed_branch_count as number} />
        <div>
          <span className="text-xs font-medium text-muted-foreground">Description</span>
          {description ? (
            <>
              <p className={`mt-1 text-foreground ${showFullDescription ? "" : "line-clamp-3"}`}>
                {description}
              </p>
              <button
                className="mt-1 text-xs font-medium text-primary hover:underline"
                onClick={() => setShowFullDescription((v) => !v)}
                type="button"
              >
                {showFullDescription ? "Show less" : "Show more"}
              </button>
            </>
          ) : (
            <p className="mt-1 text-foreground">—</p>
          )}
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Languages</span>
          <div className="mt-1">
            <PillList items={languages} />
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Patient groups</span>
          <div className="mt-1">
            <PillList items={patientGroups} />
          </div>
        </div>
      </SectionCard>

      <SectionCard editHref="/provider/onboarding/location" id="section-location" stepNum={2} title="Location & Contact">
        <FieldRow label="Location" value={locationLine} />
        {claim.proposed_building_desc ? (
          <FieldRow label="Building" value={claim.proposed_building_desc as string} />
        ) : null}
        {claim.proposed_access_notes ? (
          <FieldRow label="Access notes" value={claim.proposed_access_notes as string} />
        ) : null}

        {lat && lng ? (
          mapsApiKey ? (
            <img
              alt="Facility location map"
              className="mt-2 w-full rounded-xl"
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=600x200&markers=color:teal|${lat},${lng}&key=${mapsApiKey}`}
            />
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Map preview unavailable</p>
          )
        ) : null}

        <FieldRow label="Phone" value={claim.proposed_phone as string} />
        {claim.proposed_phone_2 ? (
          <FieldRow label="Phone 2" value={claim.proposed_phone_2 as string} />
        ) : null}
        {claim.proposed_whatsapp ? (
          <FieldRow label="WhatsApp" value={claim.proposed_whatsapp as string} />
        ) : null}
        {claim.proposed_telegram ? (
          <FieldRow label="Telegram" value={claim.proposed_telegram as string} />
        ) : null}
        {claim.proposed_email ? <FieldRow label="Email" value={claim.proposed_email as string} /> : null}
        {claim.proposed_website ? (
          <FieldRow label="Website" value={claim.proposed_website as string} />
        ) : null}
        {claim.proposed_instagram ? (
          <FieldRow label="Instagram" value={claim.proposed_instagram as string} />
        ) : null}
        {claim.proposed_facebook ? (
          <FieldRow label="Facebook" value={claim.proposed_facebook as string} />
        ) : null}
        {claim.proposed_tiktok ? <FieldRow label="TikTok" value={claim.proposed_tiktok as string} /> : null}
        {claim.proposed_linkedin ? (
          <FieldRow label="LinkedIn" value={claim.proposed_linkedin as string} />
        ) : null}

        {branchCount > 1 && branches.length > 0 ? (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Branches</span>
            <ul className="mt-1 space-y-1">
              {branches.map((b, i) => (
                <li className="text-foreground" key={i}>
                  {b.name || "Unnamed branch"} — {b.area || "—"}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard editHref="/provider/onboarding/services" id="section-services" stepNum={3} title="Services & Schedule">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Services</span>
          <div className="mt-1">
            <PillList items={services} />
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground">Schedule</span>
          {scheduleLines.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {scheduleLines.map((line, i) => (
                <li className="text-foreground" key={i}>
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-foreground">—</p>
          )}
        </div>

        <FieldRow label="Emergency" value={claim.proposed_emergency_type as string} />
        <FieldRow label="Walk-in policy" value={claim.proposed_walkin_appointment as string} />

        {appointmentModalities.length > 0 ? (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Appointment modalities</span>
            <p className="mt-1 text-foreground">
              {appointmentModalities.map((m) => m.label).filter(Boolean).join(", ")}
            </p>
          </div>
        ) : null}

        <div>
          <span className="text-xs font-medium text-muted-foreground">Payment methods</span>
          <div className="mt-1">
            <PillList items={paymentMethods} />
          </div>
        </div>

        {checkupPackages.length > 0 ? (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Check-up packages</span>
            <ul className="mt-1 space-y-0.5">
              {checkupPackages.map((pkg, i) => (
                <li className="text-foreground" key={i}>
                  {pkg.name || "Untitled package"}{" "}
                  <span className="text-xs text-muted-foreground">— PDF attached</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </SectionCard>

      {showDoctorsSection && (
      <SectionCard editHref="/provider/onboarding/doctors" id="section-doctors" stepNum={4} title="Doctors & Staff">
        {doctors.length === 0 ? (
          <p className="italic text-muted-foreground">
            No doctors added — this step is optional.
          </p>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => {
              const initials = doctor.full_name
                ? doctor.full_name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "—";
              const scheduleLine = scheduleToText(doctor.available_schedule);

              return (
                <div
                  className="flex gap-3 border-t border-border pt-3 first:border-0 first:pt-0"
                  key={doctor.id}
                >
                  <div className="shrink-0">
                    {doctor.photo_url ? (
                      <img
                        alt={doctor.full_name || "Doctor"}
                        className="size-[60px] rounded-full object-cover"
                        src={doctor.photo_url}
                      />
                    ) : (
                      <div className="flex size-[60px] items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="font-bold text-foreground">
                      {formatDoctorDisplayName(doctor.title, doctor.full_name) || "Unnamed"}
                    </p>
                    {doctor.role && (
                      <Badge size="sm" variant="default">
                        {doctor.role === "Other" ? doctor.role_other || "Other" : doctor.role}
                      </Badge>
                    )}
                    {doctor.specialty && (
                      <p className="text-xs text-muted-foreground">
                        {doctor.specialty}
                        {doctor.subspecialty ? ` → ${doctor.subspecialty}` : ""}
                      </p>
                    )}
                    {scheduleLine && <p className="text-xs text-muted-foreground">{scheduleLine}</p>}
                    {doctor.languages.length > 0 && <PillList items={doctor.languages} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
      )}

      <SectionCard editHref="/provider/onboarding/media" id="section-photos" stepNum={5} title="Photos & Documents">
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Entrance photos ({entrancePhotos.length}/4)
          </span>
          <div className="mt-1">
            {entrancePhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {entrancePhotos.map((url) => (
                  <img
                    alt="Facility entrance"
                    className="h-24 w-full rounded-xl object-cover"
                    key={url}
                    src={url}
                  />
                ))}
              </div>
            ) : (
              <Chip tone="gray">Not uploaded</Chip>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground">Logo</span>
          <div className="mt-1">
            {logo ? (
              <img alt="Logo" className="size-16 rounded-full object-cover" src={logo} />
            ) : (
              <Chip tone="gray">Not uploaded</Chip>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Operating license</span>
          <div className="flex flex-wrap items-center gap-2">
            {licenseUrl ? <Chip tone="green">✓ On file</Chip> : <Chip tone="gray">Not uploaded</Chip>}
            {!licenseUrl && <RequiredNotice />}
            {licenseFlag && (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${expiryColorClasses[licenseFlag.color]}`}
              >
                {licenseFlag.label}
              </span>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            <span>Issued {licenseIssue || "—"}</span>
            {!licenseIssue && <RequiredNotice />}
            <span>· Expires {licenseExpiry || "—"}</span>
            {!licenseExpiry && <RequiredNotice />}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Business license</span>
          <div className="flex flex-wrap items-center gap-2">
            {bizLicenseUrl ? <Chip tone="green">✓ On file</Chip> : <Chip tone="gray">Not uploaded</Chip>}
            {!bizLicenseUrl && <RequiredNotice />}
            {bizLicenseFlag && (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${expiryColorClasses[bizLicenseFlag.color]}`}
              >
                {bizLicenseFlag.label}
              </span>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            <span>Issued {bizLicenseIssue || "—"}</span>
            {!bizLicenseIssue && <RequiredNotice />}
            <span>· Expires {bizLicenseExpiry || "—"}</span>
            {!bizLicenseExpiry && <RequiredNotice />}
          </p>
        </div>
      </SectionCard>

      <div className="mb-4 flex flex-col items-center gap-2 rounded-2xl bg-card p-6 text-center shadow-sm">
        <CompletionRing pct={pct} />
        {pct >= 70 ? (
          <>
            <p className="text-sm font-semibold text-success-text">Ready to submit ✓</p>
            <p className="text-xs text-muted-foreground">Submitting will bring your profile to 100%</p>
          </>
        ) : (
          <p className="text-sm font-semibold text-warning">Not yet eligible</p>
        )}
      </div>

      <div className="mb-4 space-y-3 rounded-2xl bg-card p-6 shadow-sm">
        <label className="flex items-start gap-2 text-sm">
          <input
            checked={checked1}
            className="mt-0.5"
            onChange={(e) => setChecked1(e.target.checked)}
            type="checkbox"
          />
          <span className="text-foreground">
            I confirm that all information provided is accurate and up to date.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            checked={checked2}
            className="mt-0.5"
            onChange={(e) => setChecked2(e.target.checked)}
            type="checkbox"
          />
          <span className="text-foreground">
            I consent to Tiru Medical Directory publishing this information once approved by an
            admin.
          </span>
        </label>
      </div>

      {missingLicenseItems.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <p className="font-semibold">
            ⚠ Both licenses (with issue and expiry dates) are required before you can submit.
          </p>
          <p className="mt-1">{missingLicenseItems.join("; ")}</p>
          <a className="mt-1 inline-block font-semibold underline" href="/provider/onboarding/media">
            Edit Photos & Documents →
          </a>
        </div>
      )}

      {pct < 70 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          Your profile is {pct}% complete. Complete Steps 1, 2, and 3 to reach 70% and submit.
        </div>
      )}

      <button
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        disabled={
          !checked1 ||
          !checked2 ||
          pct < 70 ||
          !hasOperatingLicense ||
          !hasBusinessLicense ||
          submitting
        }
        onClick={handleSubmit}
        type="button"
      >
        {submitting ? (
          <>
            <Spinner tone="on-primary" />
            Submitting…
          </>
        ) : (
          "Submit for review →"
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-4">
        <a
          className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
          href="/provider/onboarding/media"
        >
          ← Back
        </a>
      </div>
    </div>
  );
}
