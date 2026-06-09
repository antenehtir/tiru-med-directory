import nextEnv from "@next/env";

import { getSupabasePublicDiagnosticsCards } from "../src/lib/supabase/diagnostics-public-read";

type SafeDiagnosticsProbeStatus = "success" | "unavailable" | "error";

type SafeDiagnosticsProbeCard = {
  slug?: unknown;
};

type SafeDiagnosticsProbeResult = {
  status: SafeDiagnosticsProbeStatus;
  source: string;
  cards: SafeDiagnosticsProbeCard[];
  fallbackRecommended: boolean;
  reason?: string;
  errorCode?: string;
};

const expectedPublicSlugs = [
  "test-diagnostic-alpha-lab",
  "test-diagnostic-eta-imaging",
  "test-diagnostic-zeta-radiology",
  "test-diagnostic-omega-pathology",
  "test-diagnostic-kappa-mixed",
  "test-diagnostic-lambda-home-sample",
] as const;

const expectedBlockedSlugs = [
  "test-diagnostic-beta-pending",
  "test-diagnostic-delta-hidden",
] as const;

const validStatuses: SafeDiagnosticsProbeStatus[] = [
  "success",
  "unavailable",
  "error",
];

async function main() {
  try {
    nextEnv.loadEnvConfig(process.cwd());

    const result = await getSupabasePublicDiagnosticsCards();

    if (!isSafeDiagnosticsProbeResult(result)) {
      console.error(
        "Diagnostics public read probe failed: malformed safe result.",
      );
      process.exitCode = 1;
      return;
    }

    const probeResult: SafeDiagnosticsProbeResult = result;
    const returnedSlugs = probeResult.cards
      .map((card) => card.slug)
      .filter((slug): slug is string => typeof slug === "string");
    const missingPublicSlugs = expectedPublicSlugs.filter(
      (slug) => !returnedSlugs.includes(slug),
    );
    const returnedBlockedSlugs = expectedBlockedSlugs.filter((slug) =>
      returnedSlugs.includes(slug),
    );
    const passed =
      probeResult.status === "success" &&
      probeResult.source === "supabase" &&
      probeResult.cards.length === expectedPublicSlugs.length &&
      missingPublicSlugs.length === 0 &&
      returnedBlockedSlugs.length === 0;

    console.log(
      JSON.stringify(
        {
          probe: "diagnostics-public-read",
          status: probeResult.status,
          source: probeResult.source,
          cardCount: probeResult.cards.length,
          returnedSlugs,
          expectedPublicRowsFound: missingPublicSlugs.length === 0,
          blockedRowsExcluded: returnedBlockedSlugs.length === 0,
          fallbackRecommended: probeResult.fallbackRecommended,
          reason: probeResult.reason,
          errorCode: probeResult.errorCode,
          passed,
        },
        null,
        2,
      ),
    );

    process.exitCode = passed ? 0 : 1;
  } catch {
    console.error(
      "Diagnostics public read probe failed: unexpected runtime crash.",
    );
    process.exitCode = 1;
  }
}

function isSafeDiagnosticsProbeResult(
  value: unknown,
): value is SafeDiagnosticsProbeResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<SafeDiagnosticsProbeResult>;

  return (
    typeof result.status === "string" &&
    validStatuses.includes(result.status as SafeDiagnosticsProbeStatus) &&
    typeof result.source === "string" &&
    Array.isArray(result.cards) &&
    typeof result.fallbackRecommended === "boolean" &&
    isOptionalString(result.reason) &&
    isOptionalString(result.errorCode)
  );
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

void main();
