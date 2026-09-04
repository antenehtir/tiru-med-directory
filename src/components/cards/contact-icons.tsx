import type { SVGProps } from "react";

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  );
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9.5 12l1.75 1.75L14.5 10" />
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

// Brand marks below are shape-only, like every icon above — fill="currentColor",
// no baked-in color. Brand color is the caller's job (a colored badge behind
// a white icon, matching TalkToUsButton's existing WhatsApp treatment)
// because a "which platform is this" glyph and "what color represents this
// platform" are two different decisions, and a consumer that wants a
// monochrome treatment shouldn't have to fight a hardcoded fill to get it.

// Exact same path WhatsAppButton/TalkToUsButton already draws — reused
// rather than redrawn so the mark can't quietly drift between the two.
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.51 3.62 1.4 5.12L2 22l5.13-1.49a9.84 9.84 0 004.91 1.31h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.04h-.01a8.17 8.17 0 01-4.16-1.14l-.3-.18-3.05.89.91-2.97-.2-.31a8.13 8.13 0 01-1.25-4.33c0-4.49 3.65-8.14 8.14-8.14 2.17 0 4.21.85 5.75 2.39a8.08 8.08 0 012.38 5.75c0 4.49-3.65 8.04-8.21 8.04zm4.47-6.08c-.24-.12-1.43-.71-1.65-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.04-.47-.08-.12-.51-1.23-.7-1.68-.18-.44-.37-.38-.51-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.3-.21.24-.81.79-.81 1.92 0 1.13.83 2.23.94 2.38.12.16 1.61 2.46 3.9 3.36 2.29.9 2.29.6 2.71.56.42-.04 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

// The lowercase "f" ribbon — the one mark that reads as Facebook from its
// silhouette alone, which is why a solid fill matters here more than for
// most of these: as an outline it stops being legible as the letter it is.
export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M15 8.5h2.5V5H15a4 4 0 00-4 4v2H8.5v3.5H11V21h3.5v-6.5h2.5l1-3.5h-3.5V9a.5.5 0 01.5-.5z" />
    </svg>
  );
}

// Rounded frame, ring lens, corner dot — Instagram's mark drawn in outline
// the way the real logo is (not a filled camera silhouette), sized down from
// a full 24x24 frame so the ring reads at 16px instead of filling the box.
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// TikTok's actual note glyph, not a generic music note. The previous mark
// here was a two-wheel quaver (a stem plus two circles) that reads as "music"
// rather than as this platform. Path is the canonical single-color TikTok
// mark, taken verbatim from simple-icons; the full-color logo is three
// offset tints (black, cyan, magenta) that only resolve well above the 16px
// this renders at, so the solid white-on-black treatment is the standard
// reduction — and it already sits on a black badge here.
//
// simple-icons draws it edge to edge (content height 24 in the 24x24 box)
// while the siblings here measure 16-20 tall, so it is scaled about its own
// centre to 18 rather than looming over the rest of the badge row. Slightly
// under WhatsApp's 20 on purpose: a tall narrow glyph reads larger than a
// round one at equal height.
export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <g transform="translate(12 12) scale(0.75) translate(-12 -12)">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </g>
    </svg>
  );
}

// The "in" wordmark — a dotted i-stem plus an n, the two letterforms that
// make this LinkedIn rather than a generic square. The previous version drew
// unlabeled ruled lines inside a rounded square, which didn't resolve to any
// letter at a glance.
export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="5.5" cy="5.3" r="1.85" />
      <path d="M4 9.5h3v10H4z" />
      <path d="M10.3 9.5h2.9v1.53h.04c.4-.76 1.39-1.56 2.86-1.56 3.06 0 3.63 2.02 3.63 4.63v5.4h-3v-4.79c0-1.14-.02-2.61-1.59-2.61-1.59 0-1.83 1.24-1.83 2.52v4.88h-3V9.5z" />
    </svg>
  );
}

// Telegram's paper plane, not a generic send arrow — the previous icon here
// was literally a different, unrelated glyph (a plain send-style dart) doing
// duty for this platform.
export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.6 4.4L2.9 11.3c-1.1.4-1.1 1.4-.2 1.7l4.5 1.4 1.7 5.4c.2.6.4.8.8.8.3 0 .5-.1.7-.4l2.5-2.4 4.6 3.4c.7.5 1.4.2 1.6-.6l3-14c.3-1-.4-1.5-1.5-1.2zM8.6 13.6l9-5.7c.4-.3.8-.1.5.2l-7.5 6.8-.3 3.1-1.5-4.1z" />
    </svg>
  );
}
