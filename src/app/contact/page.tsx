import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Contact — Tiru Health",
  description: "Get in touch with the Tiru Health team.",
};

export default function ContactRoute() {
  return (
    <PageShell>
      <ContactPage />
    </PageShell>
  );
}
