"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { providerSignUp } from "@/app/provider/signup/actions";

const ROLE_OPTIONS = [
  "Owner",
  "Medical Director",
  "Manager",
  "Administrator",
  "Marketing Officer",
  "Reception",
  "Other",
];

const FACILITY_TYPE_OPTIONS = [
  "Hospital",
  "Specialty Center",
  "Clinic",
  "Pharmacy",
  "Laboratory / Diagnostics",
  "Home Care",
  "Ambulance Service",
  "Other",
];

const DIAGNOSTIC_SUBTYPE_OPTIONS = [
  { value: "lab", label: "Laboratory only" },
  { value: "imaging", label: "Imaging only" },
  { value: "both", label: "Both — laboratory and imaging" },
];

function ProviderSignupFormInner() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatchError, setMismatchError] = useState(false);
  const [claimantRole, setClaimantRole] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [diagnosticSubtype, setDiagnosticSubtype] = useState("");
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
          <label className="text-sm font-medium text-foreground" htmlFor="facility_name">
            Facility name *
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="facility_name"
            name="facility_name"
            placeholder="e.g. Addis Cardiac Hospital"
            required
            type="text"
          />
          <p className="text-xs text-muted-foreground">
            Enter the name exactly as it appears on your license or signage.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="facility_type">
            Facility type *
          </label>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="facility_type"
            name="facility_type"
            onChange={(e) => {
              setFacilityType(e.target.value);
              if (e.target.value !== "Laboratory / Diagnostics") setDiagnosticSubtype("");
            }}
            required
            value={facilityType}
          >
            <option disabled value="">
              Select facility type
            </option>
            {FACILITY_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {facilityType === "Other" && (
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="facility_type_other"
              name="facility_type_other"
              placeholder="Please describe your facility type"
              required
              type="text"
            />
          )}

          {facilityType === "Laboratory / Diagnostics" && (
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-medium text-foreground">
                What services does your facility offer? *
              </p>
              <div className="flex flex-col gap-2">
                {DIAGNOSTIC_SUBTYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      checked={diagnosticSubtype === opt.value}
                      name="diagnostic_subtype"
                      onChange={() => setDiagnosticSubtype(opt.value)}
                      required
                      type="radio"
                      value={opt.value}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="display_name">
            Your name *
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="display_name"
            name="display_name"
            placeholder="Dr. Abebe Kebede"
            required
            type="text"
          />
          <p className="text-xs text-muted-foreground">The person setting up this account.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="claimant_role">
            Your role at this facility *
          </label>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="claimant_role"
            name="claimant_role"
            onChange={(e) => setClaimantRole(e.target.value)}
            required
            value={claimantRole}
          >
            <option disabled value="">
              Select your role
            </option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {claimantRole === "Other" && (
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="claimant_role_other"
              name="claimant_role_other"
              placeholder="Please specify your role"
              required
              type="text"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="phone">
            Your mobile number *
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="phone"
            name="phone"
            placeholder="+251 91 234 5678"
            required
            type="tel"
          />
          <p className="text-xs text-muted-foreground">
            Your direct number — for urgent notifications about your listing.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="facility_phone">
            Facility phone *
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="facility_phone"
            name="facility_phone"
            placeholder="+251 11 234 5678"
            required
            type="tel"
          />
          <p className="text-xs text-muted-foreground">
            The official number patients call. Admin will use this to verify your claim.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Work email *
          </label>
          <input
            autoComplete="email"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="email"
            name="email"
            placeholder="you@facilityname.com"
            required
            type="email"
          />
          <p className="text-xs text-muted-foreground">
            Use your work email — password resets and notifications go here.
          </p>
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
