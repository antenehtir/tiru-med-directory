import type { ReactNode } from "react";

// Two columns from sm up, one below.
//
// Every form in the admin editor and the provider onboarding laid its fields
// out as one full-width control per row — a phone number, a WhatsApp handle,
// an email, four social links — each taking the whole editor width for a
// single line of text. On a laptop that turned a six-field section into a
// screen and a half of scrolling, and the fields a provider actually has to
// think about ended up below the fold behind ones they can fill in a second.
//
// The rule this encodes: a control holding one short value shares a row; a
// control holding a list, a paragraph, a repeater or a picker takes the whole
// one. Wide children opt out with `sm:col-span-2` rather than the grid trying
// to guess, because only the field knows how much room its content needs.
export function FieldGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>{children}</div>;
}

// The className a child adds to take the full width inside a FieldGrid.
// A constant rather than a wrapper component: wrapping would add a div between
// the grid and its item, which breaks the grid placement it is trying to set.
export const FIELD_GRID_FULL = "sm:col-span-2";
