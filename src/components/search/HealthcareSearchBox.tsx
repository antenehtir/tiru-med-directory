import { SearchAutocompleteInput } from "./SearchAutocompleteInput";

// The homepage's primary action. Sized to be the dominant element in the
// hero: a 56px field on mobile (well above the 44px touch minimum) rising to
// 64px from sm, on its own raised surface, with a ring-based focus state
// strong enough to read against the warm paper background.
//
// The placeholder is measured against the field, not estimated. The previous
// copy ("Search for a facility, doctor, service or area") rendered 325.6px
// wide into a 237px content box at a 390px viewport and truncated mid-word at
// "servic...". The current copy measures 202.2px, clearing 390px by 34.8px and
// still fitting a 360px screen. The hint line under the field is what
// demonstrates the wider reach — an area, a specialty, a service — so the
// placeholder only has to name the field.
export function HealthcareSearchBox() {
  return (
    <div className="w-full max-w-full rounded-card bg-card p-3 shadow-lift sm:p-4">
      <SearchAutocompleteInput
        buttonClassName="flex size-14 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-16"
        formClassName="grid min-w-0 grid-cols-[minmax(0,1fr)_3.5rem] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_4rem] sm:gap-3"
        id="home-healthcare-search"
        inputClassName="min-h-14 w-full min-w-0 rounded-control border border-border bg-input px-4 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 sm:min-h-16"
        isIconButton
        label="Search healthcare"
        labelClassName="sr-only"
        placeholder="Service, facility, specialist"
      />
    </div>
  );
}
