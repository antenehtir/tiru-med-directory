// Access notes: how a patient gets in the door. The editors offer a fixed
// list to tick plus optional free-text directions; the listing stores (and
// the public page shows) one line of text, e.g.
//   "Parking available · Wheelchair accessible — Enter via the rear gate"
// These two functions convert between that line and the editor's parts.

// Most-needed first, like every option list on the platform.
export const ACCESS_FEATURES = [
  "Parking available",
  "Wheelchair accessible",
  "Elevator",
  "Ground-floor entrance",
  "Ramp at entrance",
  "Accessible toilet",
] as const;

const FEATURE_SEPARATOR = " · ";
const DIRECTIONS_SEPARATOR = " — ";

export type AccessNotesParts = { features: string[]; directions: string };

function isFeature(value: string): boolean {
  return (ACCESS_FEATURES as readonly string[]).includes(value);
}

export function parseAccessNotes(text: string | null | undefined): AccessNotesParts {
  const value = (text ?? "").trim();
  if (!value) return { features: [], directions: "" };

  const cut = value.indexOf(DIRECTIONS_SEPARATOR);
  const head = cut === -1 ? value : value.slice(0, cut);
  const pieces = head.split(FEATURE_SEPARATOR).map((p) => p.trim());

  // Only a line this editor wrote splits into ticks. Anything typed freely
  // before these options existed stays whole, as directions, so nothing a
  // facility wrote is lost or mangled.
  if (pieces.every(isFeature)) {
    return {
      features: pieces,
      directions: cut === -1 ? "" : value.slice(cut + DIRECTIONS_SEPARATOR.length).trim(),
    };
  }
  return { features: [], directions: value };
}

export function formatAccessNotes({ features, directions }: AccessNotesParts): string {
  const ordered = ACCESS_FEATURES.filter((f) => features.includes(f));
  const head = ordered.join(FEATURE_SEPARATOR);
  const tail = directions.trim().replace(/\s+/g, " ");
  if (head && tail) return `${head}${DIRECTIONS_SEPARATOR}${tail}`;
  return head || tail;
}
