import { providerTypes } from "@/components/registration/registration-options";

export function ProviderTypeOptions() {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">
          Provider type
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
          Who is the request for?
        </h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {providerTypes.map((provider) => (
          <div
            className="min-h-28 rounded-md border border-border bg-background p-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-muted"
            key={provider.title}
          >
            <span className="block text-base font-semibold text-foreground">
              {provider.title}
            </span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              {provider.description}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
