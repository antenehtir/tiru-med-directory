type WorkingHoursIndicatorProps = {
  hours?: string | null;
};

// Pre-existing bug, unrelated to this session's three scoped items — found
// while verifying them, fixed separately since it was blocking that
// verification: this component's only call site (FacilityCard.tsx's
// AvailabilityLine) always nests it inside another <p>. This used to return
// <p> itself, producing invalid <p><p>...</p></p> markup that the browser
// silently repairs by closing the outer <p> early, which then mismatches
// what React expects to find during hydration. That mismatch was throwing an
// UNCAUGHT hydration error on every facility detail page and homepage
// section rendering a FacilityCard with no structured schedule — which,
// with no error boundary catching it, was breaking React's event
// hydration for the ENTIRE page, not just this element (confirmed live: an
// unrelated button elsewhere on the same page, FacilityActionPanel's "More
// numbers" toggle, also failed to respond to a click until this was fixed).
export function WorkingHoursIndicator({ hours }: WorkingHoursIndicatorProps) {
  const normalized = hours?.trim();

  if (!normalized) {
    return null;
  }

  // The round-the-clock case is handled upstream by FacilityCard's
  // AvailabilityLine, which renders it with the same green availability dot
  // the structured-schedule path uses. This component now has exactly one
  // job: render free-text opening hours that are not round-the-clock.
  return <span className="text-xs text-muted-foreground">{normalized}</span>;
}
