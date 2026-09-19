import { policyTakesAppointments } from "@/lib/provider/onboarding-config";
import type { FacilityAppointmentModality } from "@/types/facility";
import { AppointmentOptionsList } from "./AppointmentOptionsList";

// "How to book" under a specialist, for a doctor who takes appointments.
// The routes are the facility's own — its booking phone, messaging apps and
// online link — so a patient reading about the doctor can book on the spot
// rather than scrolling back up to the facility's contact block. A facility
// that set no booking routes still has its main phone, which is offered.
export function DoctorBookingOptions({
  policy,
  modalities,
  facilityPhone,
  className = "",
}: {
  // The doctor's effective walk-in / appointment policy.
  policy: string | null;
  modalities: FacilityAppointmentModality[] | undefined;
  facilityPhone: string | null | undefined;
  className?: string;
}) {
  if (!policyTakesAppointments(policy)) return null;

  const routes: FacilityAppointmentModality[] =
    modalities && modalities.length > 0
      ? modalities
      : facilityPhone?.trim()
        ? [{ type: "phone", value: facilityPhone.trim(), label: "Phone call" }]
        : [];
  if (routes.length === 0) return null;

  return (
    <div className={`rounded-lg border border-border bg-card px-3 py-2.5 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {policy === "Appointment required" ? "Book an appointment" : "To book ahead"}
      </p>
      <AppointmentOptionsList className="mt-2" modalities={routes} />
    </div>
  );
}
