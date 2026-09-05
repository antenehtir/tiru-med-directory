"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminFacilityServicesEditor } from "@/components/admin/AdminFacilityServicesEditor";
import { AdminFacilityContactEditor } from "@/components/admin/AdminFacilityContactEditor";
import { AdminFacilityLocationEditor } from "@/components/admin/AdminFacilityLocationEditor";

type Section = "services" | "contact" | "location";

// Sectioned, not a sequential wizard: an admin lands on whichever section the
// URL names (deep-linkable via ?section=) and can jump to the other one
// directly. Neither section knows the other exists — no shared
// completion-percentage state, no "continue" gate.
export function AdminFacilityEditor({ facility }: { facility: Record<string, unknown> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const param = searchParams.get("section");
  const initial: Section =
    param === "contact" ? "contact" : param === "location" ? "location" : "services";
  const [section, setSection] = useState<Section>(initial);

  function selectSection(next: Section) {
    setSection(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-border">
        <button
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            section === "services"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => selectSection("services")}
          type="button"
        >
          Services & Specialties
        </button>
        <button
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            section === "contact"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => selectSection("contact")}
          type="button"
        >
          Contact & Social
        </button>
        <button
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            section === "location"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => selectSection("location")}
          type="button"
        >
          Location
        </button>
      </div>

      {section === "services" ? (
        <AdminFacilityServicesEditor facility={facility} />
      ) : section === "contact" ? (
        <AdminFacilityContactEditor facility={facility} />
      ) : (
        <AdminFacilityLocationEditor facility={facility} />
      )}
    </div>
  );
}
