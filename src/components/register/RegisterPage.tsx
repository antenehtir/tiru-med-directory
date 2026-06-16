"use client";

import { useState, type FormEvent } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const providerTypeOptions = ["Doctor", "Facility", "Pharmacy", "Diagnostics"];

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function RegisterPage() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const providerName = String(formData.get("provider_name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!providerName || !phone) {
      setSubmitState("error");
      setErrorMessage("Name and phone are required.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitState("error");
      setErrorMessage("Registration is unavailable right now. Please try again later.");
      return;
    }

    setSubmitState("submitting");

    const { error } = await supabase.from("listing_requests").insert({
      provider_type: String(formData.get("provider_type") ?? "").trim(),
      provider_name: providerName,
      category: String(formData.get("category") ?? "").trim() || null,
      phone,
      email: String(formData.get("email") ?? "").trim() || null,
      area: String(formData.get("area") ?? "").trim() || null,
      google_maps_url: String(formData.get("google_maps_url") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    });

    if (error) {
      setSubmitState("error");
      setErrorMessage("Something went wrong submitting your request. Please try again.");
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
            Request received
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#0F766E]">
            Thanks for registering your practice. Our team will review your
            submission and follow up.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          List a provider
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tell us about the practice or facility you want to add to Tiru.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className={labelClassName} htmlFor="provider_type">
              Provider type
            </label>
            <select
              className={inputClassName}
              defaultValue={providerTypeOptions[0]}
              id="provider_type"
              name="provider_type"
            >
              {providerTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName} htmlFor="provider_name">
              Name <span className="text-error">*</span>
            </label>
            <input
              className={inputClassName}
              id="provider_name"
              name="provider_name"
              required
              type="text"
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="category">
              Category
            </label>
            <input
              className={inputClassName}
              id="category"
              name="category"
              placeholder="e.g. General hospital, Pediatrics, Pharmacy"
              type="text"
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="phone">
              Phone <span className="text-error">*</span>
            </label>
            <input
              className={inputClassName}
              id="phone"
              name="phone"
              required
              type="tel"
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="email">
              Email
            </label>
            <input className={inputClassName} id="email" name="email" type="email" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="area">
              Area / sub-city
            </label>
            <input className={inputClassName} id="area" name="area" type="text" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="google_maps_url">
              Google Maps link
            </label>
            <input
              className={inputClassName}
              id="google_maps_url"
              name="google_maps_url"
              type="url"
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="website">
              Website or Telegram
            </label>
            <input className={inputClassName} id="website" name="website" type="text" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="notes">
              Notes
            </label>
            <textarea
              className={`${inputClassName} min-h-28 py-2`}
              id="notes"
              name="notes"
              rows={4}
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
            {submitState === "submitting" ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
