"use client";

import {
  updateOwnFacilityAbout,
  updateOwnFacilityCheckups,
  updateOwnFacilityContact,
  updateOwnFacilityDoctors,
  updateOwnFacilityLocation,
  updateOwnFacilityMedia,
  updateOwnFacilityServices,
} from "@/app/provider/(console)/listing/actions";
import { AdminFacilityServicesEditor } from "@/components/admin/AdminFacilityServicesEditor";
import { AdminFacilityContactEditor } from "@/components/admin/AdminFacilityContactEditor";
import { AdminFacilityLocationEditor } from "@/components/admin/AdminFacilityLocationEditor";
import { AdminFacilityAboutEditor } from "@/components/admin/AdminFacilityAboutEditor";
import { AdminFacilityCheckupsEditor } from "@/components/admin/AdminFacilityCheckupsEditor";
import { FacilityEditorTabs, type FacilityEditorSection } from "@/components/admin/FacilityEditorTabs";
import { mediaFromFacility, showsDoctorsSection } from "@/components/admin/facility-editor-shared";
import { Step4DoctorsForm } from "@/components/provider/steps/Step4DoctorsForm";
import { Step5MediaForm } from "@/components/provider/steps/Step5MediaForm";
import { FacilityChangeRequestCard } from "@/components/provider/FacilityChangeRequestCard";

// A verified provider's live editor for their own facility. The sections
// are the admin editor's own components, handed provider save actions that
// only accept this provider's facility — not a second implementation.
//
// The one difference in shape: Identity is replaced by a review request,
// because a name or type change goes past an admin first.
export function ProviderListingEditor({
  facility,
  uploadFolder,
}: {
  facility: Record<string, unknown>;
  // The provider's claim id, which onboarding already files their uploads
  // under — keeps a facility's photos in one storage folder.
  uploadFolder: string;
}) {
  const facilityId = facility.id as string;

  const sections: FacilityEditorSection[] = [
    {
      key: "about",
      label: "About",
      render: () => <AdminFacilityAboutEditor facility={facility} saveAction={updateOwnFacilityAbout} />,
    },
    {
      key: "services",
      label: "Services & Specialties",
      render: () => (
        <AdminFacilityServicesEditor facility={facility} saveAction={updateOwnFacilityServices} />
      ),
    },
    {
      key: "checkups",
      label: "Check-ups",
      render: () => (
        <AdminFacilityCheckupsEditor facility={facility} saveAction={updateOwnFacilityCheckups} />
      ),
    },
    {
      key: "contact",
      label: "Contact & Social",
      render: () => (
        <AdminFacilityContactEditor facility={facility} saveAction={updateOwnFacilityContact} />
      ),
    },
    {
      key: "location",
      label: "Location",
      render: () => (
        <AdminFacilityLocationEditor facility={facility} saveAction={updateOwnFacilityLocation} />
      ),
    },
  ];

  if (showsDoctorsSection(facility)) {
    sections.push({
      key: "doctors",
      label: "Doctors",
      render: () => (
        <Step4DoctorsForm
          live={{
            facilityId,
            doctors: facility.doctors,
            walkinAppointment: (facility.walkin_appointment as string | null) ?? null,
            uploadFolder,
            save: updateOwnFacilityDoctors,
          }}
        />
      ),
    });
  }

  sections.push(
    {
      key: "photos",
      label: "Photos",
      render: () => (
        <Step5MediaForm
          claimId={uploadFolder}
          initialData={mediaFromFacility(facility)}
          live={{ facilityId, save: updateOwnFacilityMedia }}
        />
      ),
    },
    {
      key: "name",
      label: "Name & type",
      render: () => <FacilityChangeRequestCard facility={facility} />,
    },
  );

  return <FacilityEditorTabs sections={sections} />;
}
