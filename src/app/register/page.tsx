import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { RegisterPage } from "@/components/register/RegisterPage";

export const metadata: Metadata = {
  title: "List a Provider — Tiru",
  description: "Add your facility, clinic or practice to the Tiru directory.",
};

export default function RegisterRoute() {
  return (
    <PageShell>
      <Suspense>
        <RegisterPage />
      </Suspense>
    </PageShell>
  );
}
