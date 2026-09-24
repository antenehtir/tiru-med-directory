import Link from "next/link";
import { TiruMark } from "@/components/home/TiruMark";

// Header and footer lockup, following the approved logo: the stethoscope-and-
// pins mark, "Tiru" in heavy navy, "Medical Directory" beneath, and the
// slogan in the brand teal. The wordmark is live text rather than part of the
// image so it stays crisp and switches colour with the theme.
export function BrandMark({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const inverse = tone === "inverse";
  const ink = inverse ? "text-white" : "text-[#222B4A] dark:text-[#E6EDF5]";
  return (
    <Link aria-label="Tiru Health Medical Directory home" className="flex min-w-0 items-center gap-2 py-1" href="/">
      <TiruMark className="h-11 w-auto shrink-0 sm:h-12" inverse={inverse} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`font-body text-[1.45rem] font-extrabold tracking-[-0.035em] sm:text-[1.6rem] ${ink}`}>Tiru Health</span>
        <span className={`mt-0.5 text-[11px] font-medium ${ink}`}>Medical Directory</span>
        <span className={`mt-1 hidden text-[10px] font-semibold tracking-[0.02em] min-[360px]:block ${inverse ? "text-home-teal-bright" : "text-[#247F82] dark:text-home-teal-bright"}`}>
          Trace the right care.
        </span>
      </span>
    </Link>
  );
}
