import { getSupabasePublicDoctorCards } from "@/lib/supabase/doctors-public-read";

export const dynamic = "force-dynamic";

type ProbeResult = {
  status: "success" | "unavailable" | "error";
  safeCategory: "success" | "unavailable" | "helper-error" | "probe-timeout";
  count: number;
  displayNames: string[];
};

const PROBE_TIMEOUT_MS = 12_000;

export default async function DoctorsPublicReadProbeRoute() {
  const probe = await readDoctorsProbe();

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <header className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Internal runtime probe
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Doctors public read status
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            This temporary page checks the public doctors read helper inside the
            Next runtime. It shows only safe result status, category, count, and
            public display names.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 font-semibold">{probe.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Safe category
              </dt>
              <dd className="mt-1 font-semibold">{probe.safeCategory}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Public doctor count
              </dt>
              <dd className="mt-1 font-semibold">{probe.count}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Public display names</h2>
          {probe.displayNames.length > 0 ? (
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              {probe.displayNames.map((displayName) => (
                <li key={displayName}>{displayName}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No public doctor rows shown by the probe.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

async function readDoctorsProbe(): Promise<ProbeResult> {
  return withProbeTimeout(
    getSupabasePublicDoctorCards().then((result) => ({
      status: result.status,
      safeCategory:
        result.status === "error" ? "helper-error" : result.status,
      count: result.cards.length,
      displayNames: result.cards.map((card) => card.name),
    })),
    {
      status: "error",
      safeCategory: "probe-timeout",
      count: 0,
      displayNames: [],
    },
  );
}

async function withProbeTimeout<T>(
  read: Promise<T>,
  fallback: T,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      read.finally(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }),
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(fallback);
        }, PROBE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
