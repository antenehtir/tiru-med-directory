"use client";

import { useRef, useState, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  autoSaveStep5,
  saveStep5AndContinue,
  type Step5Data,
} from "@/app/provider/(console)/onboarding/media/actions";

type UploadStatus = "idle" | "uploading";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ExpiryFlag = { label: string; className: string };

function getExpiryFlag(dateStr: string): ExpiryFlag | null {
  if (!dateStr) return null;

  const expiry = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 60) return null;
  if (diffDays >= 31) {
    return {
      label: `⚠ Expiring in ${diffDays} days — renew soon`,
      className: "border-amber-300 bg-amber-50 text-amber-800",
    };
  }
  if (diffDays >= 1) {
    return {
      label: `⚠ Expiring in ${diffDays} days — urgent`,
      className: "border-orange-300 bg-orange-50 text-orange-800",
    };
  }
  return {
    label: "✗ Expired — please upload renewed document",
    className: "border-red-300 bg-red-50 text-red-700",
  };
}

function ExpiryFlagChip({ flag }: { flag: ExpiryFlag | null }) {
  if (!flag) return null;
  return (
    <span
      className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${flag.className}`}
    >
      {flag.label}
    </span>
  );
}

async function uploadToBucket(bucket: string, path: string, file: File): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function Step5MediaForm({
  claimId,
  initialData,
}: {
  claimId: string;
  initialData: Step5Data;
}) {
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [urls, setUrls] = useState<Step5Data>(initialData);

  const [entranceStatus, setEntranceStatus] = useState<UploadStatus>("idle");
  const [entranceError, setEntranceError] = useState<string | null>(null);
  const entranceInputRef = useRef<HTMLInputElement>(null);

  const [logoStatus, setLogoStatus] = useState<UploadStatus>("idle");
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [licenseStatus, setLicenseStatus] = useState<UploadStatus>("idle");
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseFileMeta, setLicenseFileMeta] = useState<{ name: string; size: number } | null>(
    null,
  );
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [businessLicenseStatus, setBusinessLicenseStatus] = useState<UploadStatus>("idle");
  const [businessLicenseError, setBusinessLicenseError] = useState<string | null>(null);
  const [businessLicenseFileMeta, setBusinessLicenseFileMeta] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const businessLicenseInputRef = useRef<HTMLInputElement>(null);

  const [permissionChecked, setPermissionChecked] = useState(
    Boolean(initialData.entrance_photo_url && initialData.logo_url && initialData.license_url),
  );

  const licenseExpiryFlag = getExpiryFlag(urls.license_expiry_date);
  const businessLicenseExpiryFlag = getExpiryFlag(urls.business_license_expiry_date);

  function autoSave(partial: Partial<Step5Data>) {
    startTransition(async () => {
      await autoSaveStep5(partial);
      setLastSaved(new Date());
    });
  }

  async function handleEntranceFile(file: File | undefined) {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setEntranceError("Invalid file type");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEntranceError("File too large — max 5MB");
      return;
    }

    setEntranceError(null);
    setEntranceStatus("uploading");
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadToBucket("facility-photos", `${claimId}/entrance.${ext}`, file);
      setUrls((prev) => ({ ...prev, entrance_photo_url: url }));
      autoSave({ entrance_photo_url: url });
    } catch (err) {
      console.error("Entrance photo upload failed:", err);
      setEntranceError("Upload failed — please try again");
    } finally {
      setEntranceStatus("idle");
      if (entranceInputRef.current) entranceInputRef.current.value = "";
    }
  }

  async function handleLogoFile(file: File | undefined) {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setLogoError("Invalid file type");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("File too large — max 2MB");
      return;
    }

    setLogoError(null);
    setLogoStatus("uploading");
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadToBucket("facility-photos", `${claimId}/logo.${ext}`, file);
      setUrls((prev) => ({ ...prev, logo_url: url }));
      autoSave({ logo_url: url });
    } catch (err) {
      console.error("Logo upload failed:", err);
      setLogoError("Upload failed — please try again");
    } finally {
      setLogoStatus("idle");
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleLicenseFile(file: File | undefined) {
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setLicenseError("Invalid file type");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLicenseError("File too large — max 10MB");
      return;
    }

    setLicenseError(null);
    setLicenseStatus("uploading");
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadToBucket("provider-documents", `${claimId}/license.${ext}`, file);
      setUrls((prev) => ({ ...prev, license_url: url }));
      setLicenseFileMeta({ name: file.name, size: file.size });
      autoSave({ license_url: url });
    } catch (err) {
      console.error("License upload failed:", err);
      setLicenseError("Upload failed — please try again");
    } finally {
      setLicenseStatus("idle");
      if (licenseInputRef.current) licenseInputRef.current.value = "";
    }
  }

  async function handleBusinessLicenseFile(file: File | undefined) {
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setBusinessLicenseError("Invalid file type");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBusinessLicenseError("File too large — max 10MB");
      return;
    }

    setBusinessLicenseError(null);
    setBusinessLicenseStatus("uploading");
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadToBucket(
        "provider-documents",
        `${claimId}/business-license.${ext}`,
        file,
      );
      setUrls((prev) => ({ ...prev, business_license_url: url }));
      setBusinessLicenseFileMeta({ name: file.name, size: file.size });
      autoSave({ business_license_url: url });
    } catch (err) {
      console.error("Business license upload failed:", err);
      setBusinessLicenseError("Upload failed — please try again");
    } finally {
      setBusinessLicenseStatus("idle");
      if (businessLicenseInputRef.current) businessLicenseInputRef.current.value = "";
    }
  }

  function handleSaveAndContinue() {
    startTransition(async () => {
      await saveStep5AndContinue(urls);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Photos significantly improve patient trust and your listing&apos;s completeness score.
        The license document is used only for admin verification.
      </div>

      {/* Entrance photo */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Facility entrance photo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A clear photo of your facility&apos;s entrance helps patients find you. Taken from
              the street or main gate.
            </p>
          </div>
          {lastSaved && (
            <p className="shrink-0 text-xs text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {urls.entrance_photo_url ? (
          <div className="space-y-2">
            <img
              alt="Facility entrance"
              className="max-h-48 w-full rounded-xl object-cover"
              src={urls.entrance_photo_url}
            />
            <button
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              disabled={entranceStatus === "uploading"}
              onClick={() => entranceInputRef.current?.click()}
              type="button"
            >
              {entranceStatus === "uploading" ? "Uploading…" : "Change photo"}
            </button>
          </div>
        ) : (
          <button
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition hover:border-primary/40 disabled:opacity-60"
            disabled={entranceStatus === "uploading"}
            onClick={() => entranceInputRef.current?.click()}
            type="button"
          >
            {entranceStatus === "uploading" ? (
              <>
                <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <span className="text-sm text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <svg
                  className="size-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, or WEBP · Max 5MB
                </span>
              </>
            )}
          </button>
        )}

        {entranceError && <p className="mt-2 text-xs text-red-500">{entranceError}</p>}

        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleEntranceFile(e.target.files?.[0])}
          ref={entranceInputRef}
          type="file"
        />
      </div>

      {/* Logo */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">Facility logo</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Your logo appears on your directory card and detail page. Use a square image for best
          results.
        </p>

        {urls.logo_url ? (
          <div className="flex flex-col items-center gap-2">
            <img
              alt="Facility logo"
              className="size-20 rounded-full object-cover"
              src={urls.logo_url}
            />
            <button
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              disabled={logoStatus === "uploading"}
              onClick={() => logoInputRef.current?.click()}
              type="button"
            >
              {logoStatus === "uploading" ? "Uploading…" : "Change photo"}
            </button>
          </div>
        ) : (
          <button
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition hover:border-primary/40 disabled:opacity-60"
            disabled={logoStatus === "uploading"}
            onClick={() => logoInputRef.current?.click()}
            type="button"
          >
            {logoStatus === "uploading" ? (
              <>
                <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <span className="text-sm text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <svg
                  className="size-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP, or SVG · Max 2MB
                </span>
              </>
            )}
          </button>
        )}

        {logoError && <p className="mt-2 text-xs text-red-500">{logoError}</p>}

        <input
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => handleLogoFile(e.target.files?.[0])}
          ref={logoInputRef}
          type="file"
        />
      </div>

      {/* License */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">
          Operating license or registration certificate
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Upload a scan or clear photo of your facility&apos;s operating license. This is kept
          private and used only for verification — it will never be shown publicly.
        </p>

        {urls.license_url ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">📄</span>
                {licenseFileMeta ? (
                  <div>
                    <p className="font-medium text-foreground">{licenseFileMeta.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(licenseFileMeta.size)}
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-foreground">Document on file</p>
                )}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#0F766E]">
                ✓ {licenseFileMeta ? "Document received" : "Document on file"}
              </span>
            </div>
            <button
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              disabled={licenseStatus === "uploading"}
              onClick={() => licenseInputRef.current?.click()}
              type="button"
            >
              {licenseStatus === "uploading" ? "Uploading…" : "Replace document"}
            </button>
          </div>
        ) : (
          <button
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition hover:border-primary/40 disabled:opacity-60"
            disabled={licenseStatus === "uploading"}
            onClick={() => licenseInputRef.current?.click()}
            type="button"
          >
            {licenseStatus === "uploading" ? (
              <>
                <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <span className="text-sm text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <svg
                  className="size-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">PDF, JPG, or PNG · Max 10MB</span>
              </>
            )}
          </button>
        )}

        {licenseError && <p className="mt-2 text-xs text-red-500">{licenseError}</p>}

        <input
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleLicenseFile(e.target.files?.[0])}
          ref={licenseInputRef}
          type="file"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">License issue date</label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onBlur={(e) => autoSave({ license_issue_date: e.target.value })}
              onChange={(e) =>
                setUrls((prev) => ({ ...prev, license_issue_date: e.target.value }))
              }
              type="date"
              value={urls.license_issue_date}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">License expiry date</label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onBlur={(e) => autoSave({ license_expiry_date: e.target.value })}
              onChange={(e) =>
                setUrls((prev) => ({ ...prev, license_expiry_date: e.target.value }))
              }
              type="date"
              value={urls.license_expiry_date}
            />
          </div>
        </div>
        <ExpiryFlagChip flag={licenseExpiryFlag} />
      </div>

      {/* Business / trade license */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">Business / trade license</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Upload your facility&apos;s business registration or trade license. Kept private, used
          only for verification.
        </p>

        {urls.business_license_url ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">📄</span>
                {businessLicenseFileMeta ? (
                  <div>
                    <p className="font-medium text-foreground">{businessLicenseFileMeta.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(businessLicenseFileMeta.size)}
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-foreground">Document on file</p>
                )}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#0F766E]">
                ✓ {businessLicenseFileMeta ? "Document received" : "Document on file"}
              </span>
            </div>
            <button
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              disabled={businessLicenseStatus === "uploading"}
              onClick={() => businessLicenseInputRef.current?.click()}
              type="button"
            >
              {businessLicenseStatus === "uploading" ? "Uploading…" : "Replace document"}
            </button>
          </div>
        ) : (
          <button
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition hover:border-primary/40 disabled:opacity-60"
            disabled={businessLicenseStatus === "uploading"}
            onClick={() => businessLicenseInputRef.current?.click()}
            type="button"
          >
            {businessLicenseStatus === "uploading" ? (
              <>
                <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <span className="text-sm text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <svg
                  className="size-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">PDF, JPG, or PNG · Max 10MB</span>
              </>
            )}
          </button>
        )}

        {businessLicenseError && (
          <p className="mt-2 text-xs text-red-500">{businessLicenseError}</p>
        )}

        <input
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleBusinessLicenseFile(e.target.files?.[0])}
          ref={businessLicenseInputRef}
          type="file"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Business license issue date
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onBlur={(e) => autoSave({ business_license_issue_date: e.target.value })}
              onChange={(e) =>
                setUrls((prev) => ({ ...prev, business_license_issue_date: e.target.value }))
              }
              type="date"
              value={urls.business_license_issue_date}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Business license expiry date
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onBlur={(e) => autoSave({ business_license_expiry_date: e.target.value })}
              onChange={(e) =>
                setUrls((prev) => ({ ...prev, business_license_expiry_date: e.target.value }))
              }
              type="date"
              value={urls.business_license_expiry_date}
            />
          </div>
        </div>
        <ExpiryFlagChip flag={businessLicenseExpiryFlag} />
      </div>

      <label className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm">
        <input
          checked={permissionChecked}
          className="mt-0.5"
          onChange={(e) => setPermissionChecked(e.target.checked)}
          type="checkbox"
        />
        <span className="text-foreground">
          I confirm I have the right to publish the photos uploaded above, and that they
          accurately represent this facility.
        </span>
      </label>

      <div className="flex items-center justify-between">
        <a
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/provider/onboarding/doctors"
        >
          ← Back
        </a>
        <div className="flex items-center gap-3">
          {isPending && <span className="text-xs text-muted-foreground">Saving…</span>}
          <button
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!permissionChecked}
            onClick={handleSaveAndContinue}
            type="button"
          >
            Save & continue →
          </button>
        </div>
      </div>
    </div>
  );
}
