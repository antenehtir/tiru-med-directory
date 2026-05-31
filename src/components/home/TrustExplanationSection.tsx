import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "./SectionHeading";

const trustItems = [
  {
    title: "Verification is visible",
    text: "Verified providers use distinct badges and consistent card patterns.",
  },
  {
    title: "Information is easy to scan",
    text: "Names, categories, locations, and actions stay clear on mobile screens.",
  },
  {
    title: "Future review flow is respected",
    text: "The frontend structure leaves room for later admin and verification work.",
  },
];

export function TrustExplanationSection() {
  return (
    <section className="bg-background">
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <SectionHeading
          eyebrow="Why trust matters"
          title="The homepage should make verified healthcare feel different."
          description="Trust signals, calm spacing, and consistent cards help patients choose with less confusion."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-4 size-2 rounded-full bg-success" />
              <h3 className="font-semibold text-card-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
