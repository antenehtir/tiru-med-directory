import type { InputHTMLAttributes } from "react";
import { getPillClassName } from "@/components/ui/Pill";
import type { PillSize } from "@/lib/design-tokens";

type PillOptionProps = {
  checked: boolean;
  children: React.ReactNode;
  className?: string;
  size?: PillSize;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "type" | "className" | "size">;

// Pill-styled wrapper around a REAL native <input type="checkbox">/"radio">
// (via the `type` passthrough prop, defaulting to checkbox). Used across the
// onboarding steps' multi-select and single-select pill groups that submit
// through native FormData (name=/value= on the input) — visually identical
// to <Pill> but preserves exact native form semantics, so no auto-save or
// submission logic changes. The input is visually hidden (sr-only) but stays
// keyboard- and screen-reader-accessible; the label carries the Pill look.
export function PillOption({
  checked,
  children,
  className = "",
  size = "md",
  type = "checkbox",
  ...inputProps
}: PillOptionProps & { type?: "checkbox" | "radio" }) {
  return (
    <label
      className={`cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 ${getPillClassName(checked ? "selected" : "default", size, className)}`}
    >
      <input checked={checked} className="sr-only" type={type} {...inputProps} />
      {children}
    </label>
  );
}
