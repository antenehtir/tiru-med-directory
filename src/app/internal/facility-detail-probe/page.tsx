import { getSupabasePublicFacilityDetailBySlug } from "@/lib/supabase/facilities-public-read";

export const dynamic = "force-dynamic";

type ProbeCase = {
  group: "positive" | "blocked" | "unknown";
  slug: string;
};

type ProbeResult = ProbeCase & {
  status: "success" | "not-found" | "unavailable" | "error";
  displayName: string | null;
};

const PROBE_TIMEOUT_MS = 4_000;

const probeCases: ProbeCase[] = [
  { group: "positive", slug: "test-facility-alpha" },
  { group: "positive", slug: "test-facility-eta-minimal" },
  { group: "positive", slug: "test-facility-zeta-disputed" },
  { group: "blocked", slug: "test-facility-beta-pending" },
  { group: "blocked", slug: "test-facility-gamma-archived" },
  { group: "blocked", slug: "test-facility-delta-hidden" },
  { group: "blocked", slug: "test-facility-epsilon-internal" },
  { group: "unknown", slug: "non-existent-facility-slug" },
];

export default async function FacilityDetailProbeRoute() {
  const results: ProbeResult[] = [];

  for (const probeCase of probeCases) {
    results.push(await readProbeCase(probeCase));
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Internal runtime probe
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Facility detail helper status
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            This temporary page checks the public facility detail helper inside
            the Next runtime. It shows only safe result statuses and successful
            public display names.
          </p>
        </header>

        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr] gap-3 border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">
            <span>Slug</span>
            <span>Group</span>
            <span>Status</span>
            <span>Safe display name</span>
          </div>

          <div className="divide-y divide-border">
            {results.map((result) => (
              <div
                className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr] gap-3 px-4 py-3 text-sm"
                key={result.slug}
              >
                <span className="break-words font-medium">{result.slug}</span>
                <span className="capitalize text-muted-foreground">
                  {result.group}
                </span>
                <span className="font-semibold">{result.status}</span>
                <span className="text-muted-foreground">
                  {result.displayName ?? "Not shown"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

async function readProbeCase(probeCase: ProbeCase): Promise<ProbeResult> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      getSupabasePublicFacilityDetailBySlug(probeCase.slug).then((result) => ({
        ...probeCase,
        status: result.status,
        displayName: result.detail?.name ?? null,
      })),
      new Promise<ProbeResult>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve({
            ...probeCase,
            status: "error",
            displayName: null,
          });
        }, PROBE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
