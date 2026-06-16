"use client";

import { useState, type FormEvent } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const feedbackTypeOptions = [
  "Listing accuracy",
  "Platform experience",
  "Feature request",
  "Trust concern",
  "Other",
];

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FeedbackPage() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") ?? "").trim();

    if (!message) {
      setSubmitState("error");
      setErrorMessage("Please share your feedback message.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitState("error");
      setErrorMessage("Sending feedback is unavailable right now. Please try again later.");
      return;
    }

    setSubmitState("submitting");

    const { error } = await supabase.from("correction_requests").insert({
      correction_type: "feedback",
      description: `${String(formData.get("type") ?? "").trim()}: ${message}`,
      submitter_contact: String(formData.get("email") ?? "").trim() || null,
    });

    if (error) {
      setSubmitState("error");
      setErrorMessage("Something went wrong sending your feedback. Please try again.");
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
            Feedback received
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#0F766E]">
            Thanks for helping us improve Tiru.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          Send feedback
        </h1>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className={labelClassName} htmlFor="type">
              Type
            </label>
            <select
              className={inputClassName}
              defaultValue={feedbackTypeOptions[0]}
              id="type"
              name="type"
            >
              {feedbackTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName} htmlFor="message">
              Message <span className="text-error">*</span>
            </label>
            <textarea
              className={`${inputClassName} min-h-28 py-2`}
              id="message"
              name="message"
              required
              rows={4}
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="email">
              Email
            </label>
            <input className={inputClassName} id="email" name="email" type="email" />
          </div>

          {submitState === "error" ? (
            <p className="text-sm font-medium text-error">{errorMessage}</p>
          ) : null}

          <button
            className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
            disabled={submitState === "submitting"}
            type="submit"
          >
            {submitState === "submitting" ? "Sending..." : "Send feedback"}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
