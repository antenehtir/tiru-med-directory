import Link from "next/link";

// The one ambulance provider in the directory, reachable from the sticky
// header on every page.
//
// Hardcoded because this is a shortcut to a known single record, not a browse
// flow: there is exactly one facility with category "Ambulance Service"
// (Tebita Ambulance), and routing through /facilities?category=ambulance would
// put a list in front of someone who needs a phone number. If a second
// ambulance provider is ever listed, this should become a link to that
// filtered list instead — the count is the trigger, not the slug.
const AMBULANCE_SLUG = "tebita-ambulance";

// Placement: the sticky header, so it is reachable without scrolling from any
// page. The bottom navigation was the alternative and is the wrong home — its
// five slots are full and each one is a section of the directory, not a single
// record. A second floating button would have competed with the WhatsApp one
// already anchored bottom-right.
//
// Two taps to a phone number: this link, then Call on the facility page.
// Deliberately not a tel: link firing straight from the header — an
// accidental brush against a permanently visible control should not dial an
// ambulance.
export function EmergencyLink() {
  return (
    <Link
      aria-label="Emergency ambulance"
      className="inline-flex size-10 shrink-0 items-center justify-center gap-1.5 rounded-control border border-error/30 bg-error/5 text-xs font-semibold text-error transition-colors hover:border-error/50 hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40 focus-visible:ring-offset-2 sm:w-auto sm:px-2.5"
      href={`/facilities/${AMBULANCE_SLUG}`}
      title="Ambulance — emergency contact"
    >
      <svg
        aria-hidden="true"
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 8v8M8 12h8" />
        <circle cx="12" cy="12" r="9" />
      </svg>
      {/* The word is the clearest signal, but at 390px the header cannot
          spare 109px for it without pushing the page into horizontal scroll.
          Below sm the circled cross carries it, with the name on the link. */}
      <span className="hidden sm:inline">Emergency</span>
    </Link>
  );
}
