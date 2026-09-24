import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileBottomNavigation } from "@/components/navigation/MobileBottomNavigation";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-card focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <Header />
      {/* xl, not md — matched to MobileBottomNavigation's own breakpoint.
          Clears the fixed bottom bar for as long as it's on screen; see that
          component for why its own cutoff moved. */}
      <main id="main-content" className="relative isolate flex-1 pb-20 xl:pb-0">
        {/* The homepage hero's mint wash, behind the top of every page, fading
            into the page colour — so each tab opens the way the landing page
            does. The homepage paints its own hero over it. */}
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
