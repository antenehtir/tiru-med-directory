"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const sectionOptions = [
  "Phone number",
  "Address / Location",
  "Working hours",
  "Services or specialties",
  "Google Maps link",
  "Website or social media",
  "Facility name",
  "Category",
  "Emergency service info",
  "Branch information",
  "Other",
];

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type CorrectionMode = "specific" | "full-update";
type SubmitState = "idle" | "submitting" | "success" | "error";

export function CorrectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFacilityName =
    searchParams.get("facility") ?? searchParams.get("listing") ?? "";

  const [mode, setMode] = useState<CorrectionMode>("specific");
  const [fullUpdateName, setFullUpdateName] = useState(initialFacilityName);
  const [fullUpdateError, setFullUpdateError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleContinueToRegistration() {
    const trimmedName = fullUpdateName.trim();

    if (!trimmedName) {
      setFullUpdateError("Please enter the facility or specialist name.");
      return;
    }

    setFullUpdateError("");
    setIsRedirecting(true);

    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      await supabase.from("correction_requests").insert({
        provider_name: trimmedName,
        correction_type: "Full update",
        description: "[FULL UPDATE] Submitter has complete updated information and was sent to the registration form.",
      });
    }

    router.push(`/register?update=true&name=${encodeURIComponent(trimmedName)}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const providerName = String(formData.get("provider_name") ?? "").trim();
    const whichSection = String(formData.get("which_section") ?? "").trim();
    const correctInfo = String(formData.get("correct_info") ?? "").trim();
    const submitterContact = String(formData.get("submitter_contact") ?? "").trim();

    if (!providerName) {
      setSubmitState("error");
      setErrorMessage("Please enter the facility or specialist name.");
      return;
    }

    if (!whichSection) {
      setSubmitState("error");
      setErrorMessage("Please select which section needs correction.");
      return;
    }

    if (!correctInfo) {
      setSubmitState("error");
      setErrorMessage("Please tell us what it should say.");
      return;
    }

    if (!submitterContact) {
      setSubmitState("error");
      setErrorMessage("Please share a phone number or email so we can follow up.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitState("error");
      setErrorMessage("Submitting corrections is unavailable right now. Please try again later.");
      return;
    }

    setSubmitState("submitting");

    const currentInfo = String(formData.get("current_info") ?? "").trim();
    const description = currentInfo
      ? `Currently says: ${currentInfo}\n\nShould say: ${correctInfo}`
      : correctInfo;

    const { error } = await supabase.from("correction_requests").insert({
      provider_name: providerName,
      correction_type: whichSection,
      description,
      submitter_name: String(formData.get("submitter_name") ?? "").trim() || null,
      submitter_contact: submitterContact,
    });

    if (error) {
      setSubmitState("error");
      setErrorMessage("Something went wrong submitting your correction. Please try again.");
      return;
    }

    setSubmitState("success");
    form.reset();
  }

  if (submitState === "success") {
    return (
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 text-center sm:p-8">
          <h1 className="text-xl font-semibold text-[#0F766E]">
            ✓ Correction received
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#0F766E]">
            Thank you. Our team will review and update the listing within
            24–48 hours. We&rsquo;ll reach out if we need more details.
          </p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-[#0F766E] underline"
            href="/"
          >
            ← Back
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          Suggest a correction
        </h1>

        <div
          aria-label="Correction type"
          className="mt-6 inline-flex rounded-full border border-border bg-muted p-1"
          role="group"
        >
          <button
            aria-pressed={mode === "specific"}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
              mode === "specific"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setMode("specific")}
            type="button"
          >
            Correct specific info
          </button>
          <button
            aria-pressed={mode === "full-update"}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
              mode === "full-update"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setMode("full-update")}
            type="button"
          >
            Submit full update
          </button>
        </div>

        {mode === "full-update" ? (
          <div className="mt-6 grid gap-4">
            <p className="text-sm leading-6 text-muted-foreground">
              We&rsquo;ll take you through the same registration process with
              your facility name pre-filled.
            </p>

            <div>
              <label className={labelClassName} htmlFor="full_update_name">
                Facility or specialist name <span className="text-error">*</span>
              </label>
              <input
                className={inputClassName}
                id="full_update_name"
                onChange={(event) => setFullUpdateName(event.target.value)}
                type="text"
                value={fullUpdateName}
              />
            </div>

            {fullUpdateError ? (
              <p className="text-sm font-medium text-error">{fullUpdateError}</p>
            ) : null}

            <button
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
              disabled={isRedirecting}
              onClick={handleContinueToRegistration}
              type="button"
            >
              {isRedirecting ? "Redirecting..." : "Continue to registration"}
            </button>
          </div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="provider_name">
                Facility or specialist name <span className="text-error">*</span>
              </label>
              <input
                className={inputClassName}
                defaultValue={initialFacilityName}
                id="provider_name"
                name="provider_name"
                required
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="which_section">
                Which section needs correction? <span className="text-error">*</span>
              </label>
              <select
                className={inputClassName}
                defaultValue=""
                id="which_section"
                name="which_section"
                required
              >
                <option disabled value="">
                  Select a section
                </option>
                {sectionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClassName} htmlFor="current_info">
                What does it currently say? (optional)
              </label>
              <input
                className={inputClassName}
                id="current_info"
                name="current_info"
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="correct_info">
                What should it say? <span className="text-error">*</span>
              </label>
              <textarea
                className={`${inputClassName} min-h-28 py-2`}
                id="correct_info"
                name="correct_info"
                placeholder="Provide the correct details"
                required
                rows={4}
              />
            </div>

            <div className="mt-2 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Submitter details
              </p>
            </div>

            <div>
              <label className={labelClassName} htmlFor="submitter_name">
                Your name
              </label>
              <input
                className={inputClassName}
                id="submitter_name"
                name="submitter_name"
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="submitter_contact">
                Your contact <span className="text-error">*</span>
              </label>
              <input
                className={inputClassName}
                id="submitter_contact"
                name="submitter_contact"
                placeholder="So we can follow up if needed"
                required
                type="text"
              />
            </div>

            {submitState === "error" ? (
              <p className="text-sm font-medium text-error">{errorMessage}</p>
            ) : null}

            <button
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
              disabled={submitState === "submitting"}
              type="submit"
            >
              {submitState === "submitting" ? "Submitting..." : "Submit correction"}
            </button>
          </form>
        )}
      </div>
    </PageContainer>
  );
}
