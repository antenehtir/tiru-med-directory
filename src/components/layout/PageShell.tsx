import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileBottomNavigation } from "@/components/navigation/MobileBottomNavigation";

type PageShellProps = {
  children: ReactNode;
  homepage?: boolean;
};

export function PageShell({ children, homepage = false }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-card focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <Header homepage={homepage} />
      <main id="main-content" className="relative isolate flex-1 pb-20 xl:pb-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[image:var(--home-hero)] [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]"
        />
        {children}
      </main>
      <Footer />
      <MobileBottomNavigation />
    </div>
  );
}
