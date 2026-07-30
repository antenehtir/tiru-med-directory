"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "./Spinner";

type SubmitButtonProps = {
  children: React.ReactNode;
  loadingText: string;
  className?: string;
  variant?: "primary" | "secondary";
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
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${className}`}
      disabled={pending}
      type="submit"
    >
      {pending ? (
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
