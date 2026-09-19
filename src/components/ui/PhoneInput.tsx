"use client";

import { useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes } from "react";
import { cleanPhoneTyping, PHONE_EXAMPLE, phoneError, type PhoneKind } from "@/lib/phone";

type PhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  kind?: PhoneKind;
  // Hide the example line when the field already has help text of its own
  // that includes it.
  hideExample?: boolean;
};

// A phone field that only takes what a phone number can contain, shows an
// accepted example underneath, and flags a number that cannot be dialled as
// soon as the provider leaves the field.
//
// An invalid number also blocks a plain <form> submit (setCustomValidity),
// and onBlur — which several forms use to autosave — is not passed on while
// the number is invalid, so a half-typed number is never saved.
export function PhoneInput({ kind = "facility", hideExample = false, onChange, onBlur, className = "", ...rest }: PhoneInputProps) {
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const cleaned = cleanPhoneTyping(event.target.value);
    if (cleaned !== event.target.value) event.target.value = cleaned;
    // Kept current on every keystroke so pressing Enter while still in the
    // field cannot submit a bad number; the message itself waits for blur.
    const message = phoneError(cleaned, kind);
    event.target.setCustomValidity(message ?? "");
    if (error && !message) setError(null);
    onChange?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const message = phoneError(event.target.value, kind);
    setError(message);
    event.target.setCustomValidity(message ?? "");
    if (!message) onBlur?.(event);
  }

  const describedBy = rest.id ? `${rest.id}-phone-help` : undefined;

  return (
    <>
      <input
        {...rest}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        autoComplete={rest.autoComplete ?? "tel"}
        className={`${className} ${error ? "border-[var(--error)] focus:ring-[var(--error)]" : ""}`}
        inputMode="tel"
        onBlur={handleBlur}
        onChange={handleChange}
        type="tel"
      />
      {error ? (
        <p className="text-xs font-medium text-[var(--error)]" id={describedBy} role="alert">
          {error}
        </p>
      ) : hideExample ? null : (
        <p className="text-xs text-muted-foreground" id={describedBy}>
          {PHONE_EXAMPLE[kind].replace(/^e\.g\./, "Example:")}
        </p>
      )}
    </>
  );
}
