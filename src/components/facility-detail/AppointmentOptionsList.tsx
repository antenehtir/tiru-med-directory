import { TelegramIcon, WhatsAppIcon } from "@/components/cards/contact-icons";
import { createTelHref, splitPhoneNumbers } from "@/lib/contact-actions";
import type { FacilityAppointmentModality } from "@/types/facility";

// The ways to book an appointment, one row each, each one something to tap:
// phone numbers dial, booking links open, messaging apps carry their own
// mark. Shared by the facility header ("For appointments") and the specialist
// cards, so a doctor who needs booking shows exactly the facility's own
// booking routes rather than a second, drifting copy of them.

// A booking URL printed in full is the longest unbroken string on the page:
// it takes a line of its own, is the first thing to strain a 320px screen,
// and gives the reader something to read when they wanted something to tap.
//
// The label is the destination itself, not "Book online" — the reader can see
// where the tap leads before taking it. Host and path together while they stay
// short, which keeps "t.me/clinicname" whole; host alone once a booking URL
// starts carrying a query string, which is where the width came from.
const MAX_INLINE_LINK_LABEL = 28;

function bookingLink(value: string): { href: string; label: string } | null {
  const raw = value.trim();
  const hasScheme = /^https?:\/\//i.test(raw);
  // A bare domain with no scheme still needs to look like one: dotted, no
  // whitespace. Phone numbers and @handles must not become links.
  if (!hasScheme && !/^[\w-]+(?:\.[\w-]+)+(?:[/?#]\S*)?$/.test(raw)) return null;

  try {
    const url = new URL(hasScheme ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./i, "");
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    const full = `${host}${path}`;
    return { href: url.href, label: full.length <= MAX_INLINE_LINK_LABEL ? full : host };
  } catch {
    return null;
  }
}

// An appointment phone number is the single most actionable thing in this
// block, and it was the one row you could not act on — the booking URL was a
// link, the reception note was prose, and the number in between was text you
// had to select and re-type into the dialler. On the phone most of this
// directory is read on, that is the whole point of showing it.
//
// Gated on the modality type, not on the shape of the value: "In-person at
// reception, Mon–Fri 8AM–5PM" contains digits and must never become a call.
const DIALLABLE_MODALITY_TYPES = new Set<FacilityAppointmentModality["type"]>([
  "phone",
  "phone_2",
]);

// One field can hold two numbers. Hallelujah's is "9975 / 0965407886", and
// stripping punctuation to build a single href would have dialled
// 99750965407886 — a number that does not exist. Each is split out and linked
// on its own.
//
// A part only becomes a link when it is made of digits and phone punctuation,
// with at least three digits. Letters disqualify it, which keeps a note typed
// into the wrong field inert, and the digit floor keeps "n/a" or "-" from
// rendering as a dead link. Three rather than seven because short codes are
// real here: 9975 is Hallelujah's own hotline.
const PHONE_SHAPED = /^[\d\s+()./-]+$/;
const MIN_DIALLABLE_DIGITS = 3;

function diallableParts(
  type: FacilityAppointmentModality["type"],
  value: string,
): { text: string; href: string }[] {
  if (!DIALLABLE_MODALITY_TYPES.has(type)) return [];

  return splitPhoneNumbers(value)
    .map((part) => {
      const text = part.trim();
      if (!PHONE_SHAPED.test(text)) return null;
      if ((text.match(/\d/g) ?? []).length < MIN_DIALLABLE_DIGITS) return null;
      const href = createTelHref(text);
      return href ? { text, href } : null;
    })
    .filter((part): part is { text: string; href: string } => part !== null);
}

// Phone/online/in-person have no single brand to represent, so an emoji
// stays the simplest option there. Telegram and WhatsApp do have one — an
// emoji speech bubble doesn't carry WhatsApp's identity the way its own
// mark does, so those two render the same branded icons used everywhere
// else on the site rather than a generic emoji standing in for a brand.
// Stored order is whatever order the provider happened to tick the boxes in,
// so a second phone added after the booking link rendered below it, separated
// from the number it belongs beside. This is the order the reader wants them
// in: both phone lines together, then the messaging apps, then the link, then
// the walk-in note. It matches the option order in the onboarding and admin
// forms, so what a provider sees while editing is what a visitor sees.
const MODALITY_DISPLAY_ORDER: FacilityAppointmentModality["type"][] = [
  "phone",
  "phone_2",
  "telegram",
  "whatsapp",
  "online",
  "in_person",
];

function orderModalities(
  modalities: FacilityAppointmentModality[],
): FacilityAppointmentModality[] {
  // Anything not in the list keeps its relative position at the end rather
  // than being dropped, so a type added later still renders.
  const rank = (type: FacilityAppointmentModality["type"]) => {
    const index = MODALITY_DISPLAY_ORDER.indexOf(type);
    return index === -1 ? MODALITY_DISPLAY_ORDER.length : index;
  };
  return [...modalities].sort((a, b) => rank(a.type) - rank(b.type));
}

const GENERIC_MODALITY_EMOJI: Partial<Record<FacilityAppointmentModality["type"], string>> = {
  phone: "📞",
  phone_2: "📞",
  online: "🌐",
  in_person: "🏥",
};

function AppointmentModalityMark({ type }: { type: FacilityAppointmentModality["type"] }) {
  if (type === "whatsapp") return <WhatsAppIcon className="inline size-3.5 shrink-0 -translate-y-px text-[#1EBE5A]" />;
  if (type === "telegram") return <TelegramIcon className="inline size-3.5 shrink-0 -translate-y-px text-[#26A5E4]" />;
  return <>{GENERIC_MODALITY_EMOJI[type] ?? ""}</>;
}

export function AppointmentOptionsList({
  modalities,
  className = "",
}: {
  modalities: FacilityAppointmentModality[];
  className?: string;
}) {
  return (
    <ul className={`grid gap-3 ${className}`}>
      {orderModalities(modalities).map((modality) => {
        // A provider can tick a way in without typing a detail for it —
        // Lancet's "In-person at reception" is saved with an empty
        // value — which rendered as a bare icon sitting under the
        // booking link with nothing beside it. The label is the useful
        // half of that row anyway ("you can book at reception" is real
        // information), so it stands in when there is no value, and
        // only a row with neither is dropped.
        const detail = modality.value?.trim() || modality.label?.trim() || "";
        if (!detail) return null;

        const link = bookingLink(detail);
        const phones = diallableParts(modality.type, detail);

        // py/-my pair, shared by every anchor here: the row is a flex
        // container, so an anchor is blockified and its padding would
        // otherwise move the list. py-3 against the list's gap-3 gives
        // a 44px target without rows overlapping each other.
        const linkClassName =
          "-my-3 min-w-0 break-words py-3 font-semibold text-primary hover:underline";

        return (
          <li className="flex items-start gap-2 text-sm text-foreground" key={modality.type}>
            <span className="mt-0.5 shrink-0 text-muted-foreground">
              <AppointmentModalityMark type={modality.type} />
            </span>
            {phones.length > 0 ? (
              // No target/rel: a tel: link hands off to the dialler
              // rather than navigating, and opening a blank tab first
              // leaves an empty window behind on desktop.
              // Stacked, not run together on one line: two numbers
              // separated by a middot read as one long number at a
              // glance, and each needs its own full-width tap target.
              <span className="grid min-w-0 gap-2 break-words">
                {phones.map((phone) => (
                  <a className={linkClassName} href={phone.href} key={phone.href}>
                    {phone.text}
                  </a>
                ))}
              </span>
            ) : link ? (
              <a
                className={linkClassName}
                href={link.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ) : (
              <span className="min-w-0 break-words">{detail}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
