import type { SVGProps } from "react";

// The Tiru icon from public/brand/tiru-icon.svg, inlined so it can follow the
// theme: the file hard-codes #1A2E2A for the route stroke, which vanishes on a
// dark header. Geometry is unchanged; only the colours are theme-aware.
// `inverse` is for the deep-green footer, which stays dark in both themes.
export function TiruMark({
  className = "",
  inverse = false,
  ...props
}: SVGProps<SVGSVGElement> & { inverse?: boolean }) {
  const route = inverse ? "stroke-[#E6F2EF]" : "stroke-home-deep dark:stroke-[#E6F2EF]";
  const node = inverse ? "fill-home-deep" : "fill-home-surface";
  return (
    <svg aria-hidden="true" className={className} fill="none" focusable="false" viewBox="90 80 300 330" {...props}>
      <path d="M139 132 H338" stroke="#5DCAA5" strokeLinecap="round" strokeWidth="28" />
      <path
        className={route}
        d="M139 132 C139 187 139 208 181 208 H207 C237 208 254 225 254 255 V368"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="28"
      />
      <circle className={node} cx="139" cy="132" r="34" stroke="#5DCAA5" strokeWidth="18" />
      <circle className={node} cx="338" cy="132" r="34" stroke="#5DCAA5" strokeWidth="18" />
      <circle className={node} cx="254" cy="368" r="34" stroke="#1D9E75" strokeWidth="18" />
    </svg>
  );
}
