"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const correctionTypeOptions = [
  "Wrong phone number",
  "Wrong address or location",
  "Wrong hours",
  "Closed permanently",
  "Duplicate listing",
  "Other",
];

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function CorrectionsPage() {
  const searchParams = useSearchParams();
  const initialProviderName = searchParams.get("listing") ?? "";
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const description = String(formData.get("description") ?? "").trim();

    if (!description) {
      setSubmitState("error");
      setErrorMessage("Please describe the correct information.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitState("error");
      setErrorMessage("Submitting corrections is unavailable right now. Please try again later.");
      return;
    }

    setSubmitState("submitting");

    const { error } = await supabase.from("correction_requests").insert({
      provider_name: String(formData.get("provider_name") ?? "").trim() || null,
      correction_type: String(formData.get("correction_type") ?? "").trim() || null,
      description,
      submitter_name: String(formData.get("submitter_name") ?? "").trim() || null,
      submitter_contact: String(formData.get("submitter_contact") ?? "").trim() || null,
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
            Correction received
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#0F766E]">
            Thanks for helping keep listings accurate. Our team will review
            this shortly.
          </p>
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

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className={labelClassName} htmlFor="provider_name">
              Provider name
            </label>
            <input
              className={inputClassName}
              defaultValue={initialProviderName}
              id="provider_name"
              name="provider_name"
              type="text"
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="correction_type">
              What&rsquo;s wrong
            </label>
            <select
              className={inputClassName}
              defaultValue={correctionTypeOptions[0]}
              id="correction_type"
              name="correction_type"
            >
              {correctionTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName} htmlFor="description">
              Correct information <span className="text-error">*</span>
            </label>
            <textarea
              className={`${inputClassName} min-h-28 py-2`}
              id="description"
              name="description"
              required
              rows={4}
            />
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
              Your contact
            </label>
            <input
              className={inputClassName}
              id="submitter_contact"
              name="submitter_contact"
              placeholder="Phone or email"
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
      </div>
    </PageContainer>
  );
}
