// Ethiopian phone numbers — the one rule every phone field follows.
//
// Accepted, spaces and dashes ignored:
//   Mobile    09XXXXXXXX / 07XXXXXXXX        or +2519XXXXXXXX / +2517XXXXXXXX
//   Landline  011XXXXXXX (any 01–05 area)    or +25111XXXXXXX
//   Hotline   3–4 digits, e.g. 8335 or 939   (facility numbers only — a
//             person's own number is never a short code)
//
// A number that fits none of these cannot be dialled, so it is refused at
// entry rather than published for a patient to discover.

export type PhoneKind = "personal" | "facility";

export const PHONE_EXAMPLE: Record<PhoneKind, string> = {
  personal: "e.g. 0912 345 678 or +251 912 345 678",
  facility: "e.g. 0912 345 678, 011 123 4567, +251 912 345 678, or a hotline like 8335",
};

// What typing is allowed to leave in the box: digits, spaces, dashes and a
// single leading "+". Letters and other symbols never appear.
export function cleanPhoneTyping(raw: string): string {
  const kept = raw.replace(/[^\d+\s-]/g, "");
  const plus = kept.trimStart().startsWith("+") ? "+" : "";
  return (plus + kept.replace(/\+/g, "")).slice(0, 18);
}

function compact(value: string): string {
  return value.replace(/[\s\-()]/g, "");
}

export function isValidEthiopianPhone(value: string, kind: PhoneKind = "facility"): boolean {
  const v = compact(value);
  if (/^(?:\+251|251|0)[79]\d{8}$/.test(v)) return true;
  if (/^(?:\+251|251|0)[1-5]\d{8}$/.test(v)) return true;
  if (kind === "facility" && /^\d{3,4}$/.test(v)) return true;
  return false;
}

// null when the value is empty (whether it is required is the form's call)
// or valid; otherwise the message to show under the field.
export function phoneError(value: string | null | undefined, kind: PhoneKind = "facility"): string | null {
  const v = (value ?? "").trim();
  if (!v || isValidEthiopianPhone(v, kind)) return null;
  return kind === "personal"
    ? `Enter an Ethiopian mobile number — ${PHONE_EXAMPLE.personal}.`
    : `Enter a working Ethiopian number — ${PHONE_EXAMPLE.facility}.`;
}

// The first problem in a list of numbers, labelled so the message says which
// field it came from. Server actions use this to refuse a save.
export function firstPhoneError(
  entries: Array<{ label: string; value: string | null | undefined; kind?: PhoneKind }>,
): string | null {
  for (const entry of entries) {
    const error = phoneError(entry.value, entry.kind ?? "facility");
    if (error) return `${entry.label}: ${error}`;
  }
  return null;
}
