import { PageContainer } from "@/components/layout/PageContainer";
import { DiagnosticsFilterChips } from "./DiagnosticsFilterChips";
import { DiagnosticsHero } from "./DiagnosticsHero";
import { DiagnosticsResultsSection } from "./DiagnosticsResultsSection";
import type { Facility } from "@/types/facility";

type DiagnosticsPageProps = {
  activeType?: string;
  diagnostics?: Facility[];
};

export function DiagnosticsPage({ activeType, diagnostics }: DiagnosticsPageProps) {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <DiagnosticsHero />
        <DiagnosticsFilterChips activeType={activeType} />
        <DiagnosticsResultsSection diagnostics={diagnostics} />
      </div>
    </PageContainer>
  );
}
