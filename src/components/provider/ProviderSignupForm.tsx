"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { providerSignUp } from "@/app/provider/signup/actions";

function ProviderSignupFormInner() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatchError, setMismatchError] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const errorMessage =
    errorParam === "terms"
      ? "You must accept the terms to continue."
      : errorParam === "account_creation_failed"
        ? "Account creation failed. Please try again."
        : errorParam
          ? errorParam
          : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password !== confirm) {
      e.preventDefault();
      setMismatchError(true);
      return;
    }
    setMismatchError(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <form action={providerSignUp} className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="display_name">
            Your name / contact person
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="display_name"
            name="display_name"
            placeholder="Dr. Abebe Kebede"
            required
            type="text"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="phone">
            Contact phone
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="phone"
            name="phone"
            placeholder="+251 91 234 5678"
            type="tel"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="email"
            name="email"
            placeholder="you@facility.com"
            required
            type="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="password"
              minLength={8}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              type="button"
            >
              {showPassword ? (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" strokeLinejoin="round"/>
                  <line strokeLinecap="round" strokeLinejoin="round" x1="1" x2="23" y1="1" y2="23"/>
                </svg>
              ) : (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="confirm">
            Confirm password
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="confirm"
              name="confirm"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              type={showConfirm ? "text" : "password"}
              value={confirm}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              type="button"
            >
              {showConfirm ? (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" strokeLinejoin="round"/>
                  <line strokeLinecap="round" strokeLinejoin="round" x1="1" x2="23" y1="1" y2="23"/>
                </svg>
              ) : (
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
          {(mismatchError || (password && confirm && password !== confirm)) && (
            <p className="text-xs text-red-500">Passwords do not match.</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            className="mt-0.5"
            id="terms"
            name="terms"
            required
            type="checkbox"
          />
          <label className="text-sm text-muted-foreground" htmlFor="terms">
            I agree to Tiru&apos;s{" "}
            <a className="text-primary hover:underline" href="/terms" target="_blank">
              Terms of Service
            </a>{" "}
            and confirm I am authorized to represent this facility.
          </label>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}

        <button
          className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          type="submit"
        >
          Create account
        </button>
      </form>
    </div>
  );
}

export function ProviderSignupForm() {
  return (
    <Suspense>
      <ProviderSignupFormInner />
    </Suspense>
  );
}
