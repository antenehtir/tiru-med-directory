import type { SVGProps } from "react";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

function CategoryIconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const facilityCategoryIcons: Record<
  FacilityCategoryFilter,
  (props: SVGProps<SVGSVGElement>) => React.JSX.Element
> = {
  hospital: (props) => (
    <CategoryIconBase {...props}>
      <path d="M4 21V8a1 1 0 011-1h4V4a1 1 0 011-1h4a1 1 0 011 1v3h4a1 1 0 011 1v13" />
      <path d="M4 21h16" />
      <path d="M12 8v4M10 10h4" />
      <path d="M9 21v-3h6v3" />
    </CategoryIconBase>
  ),
  specialty: (props) => (
    <CategoryIconBase {...props}>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </CategoryIconBase>
  ),
  clinic: (props) => (
    <CategoryIconBase {...props}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M12 13v4M10 15h4" />
    </CategoryIconBase>
  ),
  diagnostics: (props) => (
    <CategoryIconBase {...props}>
      <path d="M9 2v6.5L4.5 19a2 2 0 001.8 3h11.4a2 2 0 001.8-3L15 8.5V2" />
      <path d="M9 2h6" />
      <path d="M7 16h10" />
    </CategoryIconBase>
  ),
  pharmacy: (props) => (
    <CategoryIconBase {...props}>
      <rect x="2" y="7" width="20" height="10" rx="5" />
      <path d="M12 7v10" />
    </CategoryIconBase>
  ),
  ambulance: (props) => (
    <CategoryIconBase {...props}>
      <path d="M3 12h1m16 0h1M5 12V7l3-3h8l3 3v5M5 12v4a1 1 0 001 1h12a1 1 0 001-1v-4M9 21v-4h6v4" />
      <path d="M9 7h6M12 7v3" />
    </CategoryIconBase>
  ),
  "home-care": (props) => (
    <CategoryIconBase {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M12 12a2 2 0 100 4 2 2 0 000-4z" />
    </CategoryIconBase>
  ),
};
