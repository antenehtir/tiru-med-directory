import Link from "next/link";
import { TiruMark } from "@/components/home/TiruMark";

// Header lockup: the Tiru mark, the wordmark, the product name and the
// strapline, as on tiruhealth.com. The strapline drops out on the narrowest
// phones, where the three stacked lines would crowd the search and menu
// buttons beside them.
export function BrandMark({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const inverse = tone === "inverse";
  return (
    <Link aria-label="Tiru Medical Directory home" className="flex min-w-0 items-center gap-2.5 py-1" href="/">
      <TiruMark className="size-9 shrink-0 sm:size-10" inverse={inverse} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`font-body text-[1.35rem] font-bold tracking-[-0.03em] sm:text-2xl ${inverse ? "text-white" : "text-home-ink"}`}>
          Tiru
        </span>
        <span className={`mt-0.5 text-[11px] font-semibold ${inverse ? "text-white/85" : "text-home-ink"}`}>Medical Directory</span>
        <span className={`mt-0.5 hidden text-[10px] font-medium min-[360px]:block ${inverse ? "text-home-teal-bright" : "text-home-accent-text"}`}>
          Trace the right care.
        </span>
      </span>
    </Link>
  );
}
