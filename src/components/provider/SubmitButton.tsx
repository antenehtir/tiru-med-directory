"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "./Spinner";

type SubmitButtonProps = {
  children: React.ReactNode;
  loadingText: string;
  className?: string;
  variant?: "primary" | "secondary";
  // A submitting button contributes its own name/value to the FormData, and
  // only the button actually pressed does. That is how a form with both
  // "Save" and "Save & continue" tells the server action which one the
  // provider meant, without a second action or a duplicated form.
  name?: string;
  value?: string;
};

const variantClasses: Record<NonNullable<SubmitButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "border border-border bg-card text-foreground hover:bg-muted",
};

// Submit button for <form action={serverAction}> flows — uses useFormStatus
// so it must be a descendant of the <form>, not the component declaring it.
// Disables itself and shows a spinner while the action is in flight,
// preventing double-submit. Used across provider auth + onboarding forms.
export function SubmitButton({
  children,
  loadingText,
  className = "",
  variant = "primary",
  name,
  value,
}: SubmitButtonProps) {
  const { pending, data } = useFormStatus();

  // Every submit button in a form sees the same `pending`, so a form with
  // both "Save" and "Save & continue" would spin both at once. `data` is the
  // FormData actually submitted, and it includes the pressed button's own
  // name/value pair — so a button that declares one can tell whether it was
  // the button pressed. One that declares none keeps the old behaviour.
  const isPressedButton = !name || data?.get(name) === value;
  const showLoading = pending && isPressedButton;

  return (
    <button
      // Still disabled whenever the form is in flight, pressed or not: that
      // is what prevents a double submit.
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${className}`}
      disabled={pending}
      name={name}
      type="submit"
      value={value}
    >
      {showLoading ? (
        <>
          <Spinner tone={variant === "primary" ? "on-primary" : "primary"} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
