import { Suspense } from "react";
import { CorrectionsPage } from "@/components/corrections/CorrectionsPage";
import { PageShell } from "@/components/layout/PageShell";

export default function CorrectionsRoute() {
  return (
    <PageShell>
      <Suspense>
        <CorrectionsPage />
      </Suspense>
    </PageShell>
  );
}
