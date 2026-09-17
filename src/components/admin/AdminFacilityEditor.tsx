"use client";

import {
  updateFacilityDoctors,
  updateFacilityMedia,
} from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import { AdminFacilityServicesEditor } from "@/components/admin/AdminFacilityServicesEditor";
import { AdminFacilityContactEditor } from "@/components/admin/AdminFacilityContactEditor";
import { AdminFacilityIdentityEditor } from "@/components/admin/AdminFacilityIdentityEditor";
import { AdminFacilityLocationEditor } from "@/components/admin/AdminFacilityLocationEditor";
import { AdminFacilityAboutEditor } from "@/components/admin/AdminFacilityAboutEditor";
import { AdminFacilityCheckupsEditor } from "@/components/admin/AdminFacilityCheckupsEditor";
import { FacilityEditorTabs, type FacilityEditorSection } from "@/components/admin/FacilityEditorTabs";
import { Step4DoctorsForm } from "@/components/provider/steps/Step4DoctorsForm";
import { Step5MediaForm } from "@/components/provider/steps/Step5MediaForm";
import { mediaFromFacility, showsDoctorsSection } from "@/components/admin/facility-editor-shared";

// The admin's view of the live facility editor: every section, including
// Identity (name and category), which only an admin changes directly.
// A verified provider gets the same sections minus Identity — see
// ProviderListingEditor.
export function AdminFacilityEditor({ facility }: { facility: Record<string, unknown> }) {
  const facilityId = facility.id as string;

  const sections: FacilityEditorSection[] = [
    { key: "identity", label: "Identity", render: () => <AdminFacilityIdentityEditor facility={facility} /> },
    { key: "about", label: "About", render: () => <AdminFacilityAboutEditor facility={facility} /> },
    {
      key: "services",
      label: "Services & Specialties",
      render: () => <AdminFacilityServicesEditor facility={facility} />,
    },
    { key: "checkups", label: "Check-ups", render: () => <AdminFacilityCheckupsEditor facility={facility} /> },
    { key: "contact", label: "Contact & Social", render: () => <AdminFacilityContactEditor facility={facility} /> },
    { key: "location", label: "Location", render: () => <AdminFacilityLocationEditor facility={facility} /> },
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
            // An admin has no claim to file photos under; the facility id
            // keeps them grouped per listing.
            uploadFolder: facilityId,
            save: updateFacilityDoctors,
          }}
        />
      ),
    });
  }

  sections.push({
    key: "photos",
    label: "Photos",
    render: () => (
      <Step5MediaForm
        claimId={facilityId}
        initialData={mediaFromFacility(facility)}
        live={{ facilityId, save: updateFacilityMedia }}
      />
    ),
  });

  return <FacilityEditorTabs sections={sections} />;
}
