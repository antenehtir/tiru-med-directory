import Link from "next/link";
import { BuildingIcon } from "./home-icons";

export function ProviderBand() {
  return (
    <section aria-labelledby="provider-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
      <div className="flex flex-col gap-5 rounded-3xl bg-home-mint-strong p-5 ring-1 ring-home-line/70 sm:p-6 lg:flex-row lg:items-center lg:gap-8 lg:px-8">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-home-surface text-home-accent-text ring-1 ring-home-line lg:size-14">
            <BuildingIcon className="size-7" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-home-ink lg:text-xl" id="provider-heading">
              Are you a healthcare provider?
            </h2>
            <p className="mt-1 max-w-xl text-[13px] leading-5 text-home-text lg:text-sm lg:leading-6">
              Claim your facility, keep your information up to date and help people find the care you provide.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:flex lg:shrink-0">
          <Link
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-home-deep px-4 text-sm sm:px-6 font-semibold text-white transition-colors hover:bg-home-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal focus-visible:ring-offset-2 dark:bg-home-teal-bright dark:text-home-deep dark:hover:bg-home-teal lg:min-w-44"
            href="/provider/claim"
          >
            Claim your facility
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-home-deep/30 bg-home-surface px-6 text-sm font-semibold text-home-ink transition-colors hover:border-home-teal hover:text-home-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal dark:border-home-line lg:min-w-44"
            href="/provider/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
