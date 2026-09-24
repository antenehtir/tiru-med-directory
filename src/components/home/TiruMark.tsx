import type { SVGProps } from "react";

// The Tiru Medical Directory mark: a stethoscope whose tube drops and curves
// up into the chest piece, with three connected location pins clustered
// against it — care, traced to a place. Redrawn as vector from the approved
// logo artwork (design-ref/logo-reference.jpg) so it stays sharp at any size
// and follows the theme: the navy (#222B4A) turns light on dark surfaces, the
// teal pins keep their colour everywhere.
//
// `inverse` is for the deep-green footer, which stays dark in both themes.

// Map pins with the head centred on (0,0) and the point at (0, 2.1r).
const PIN_SMALL = "M0 21C-4.5 14.5 -10 8 -10 0A10 10 0 1 1 10 0C10 8 4.5 14.5 0 21Z"; // r = 10
const PIN_LARGE = "M0 26.25C-5.63 18.13 -12.5 10 -12.5 0A12.5 12.5 0 1 1 12.5 0C12.5 10 5.63 18.13 0 26.25Z"; // r = 12.5

export function TiruMark({
  className = "",
  inverse = false,
  ...props
}: SVGProps<SVGSVGElement> & { inverse?: boolean }) {
  const ink = inverse ? "text-[#EEF3F8]" : "text-[#222B4A] dark:text-[#E6EDF5]";
  return (
    <svg aria-hidden="true" className={`${ink} ${className}`} fill="none" focusable="false" viewBox="0 0 160 184" {...props}>
      {/* Stethoscope */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
        <path d="M13 16C6 50 9 86 38 102C67 86 70 50 63 16" />
        <path d="M38 102V150C38 170 55 180 76 178C104 175 124 157 124 134" />
      </g>
      <g fill="currentColor">
        <rect height="8" rx="4" transform="rotate(20 13 10)" width="14" x="6" y="6" />
        <rect height="8" rx="4" transform="rotate(-20 63 10)" width="14" x="56" y="6" />
      </g>
      <circle cx="124" cy="116" r="16" stroke="currentColor" strokeWidth="7" />
      <circle cx="124" cy="116" r="6" stroke="currentColor" strokeWidth="3.5" />

      {/* Three overlapping pins on a shared base, the centre one tallest. */}
      <g stroke="#247F82" strokeLinecap="round" strokeWidth="2">
        <path d="M98 84L122 77L146 84M104 80L122 87L140 80" />
      </g>
      <ellipse cx="122" cy="85" fill="#2F9499" rx="24" ry="4" />
      <g fill="#2F9499">
        <path d={PIN_SMALL} transform="translate(104 56) rotate(-12)" />
        <path d={PIN_SMALL} transform="translate(140 56) rotate(12)" />
        <path d={PIN_LARGE} className="stroke-white dark:stroke-transparent" strokeWidth="1.5" transform="translate(122 44)" />
      </g>
      <g fill="#FFFFFF">
        <circle cx="104" cy="56" r="3.8" />
        <circle cx="140" cy="56" r="3.8" />
        <circle cx="122" cy="44" r="5" />
      </g>
    </svg>
  );
}
