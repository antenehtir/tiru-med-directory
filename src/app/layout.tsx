import type { Metadata } from "next";
import { Archivo, Inter, Newsreader } from "next/font/google";
import { ScrollRestoration } from "@/components/layout/ScrollRestoration";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

// Display voice. Inter stays the workhorse for body and dense data — it is
// genuinely better at 13px in a record — but it was previously doing both
// jobs, which is what made every heading read as a size of the body text
// rather than a different voice.
// 400 added for the homepage, header and footer, which use Archivo as their
// body face (the tiruhealth.com pairing). Everywhere else Archivo stays the
// display face at 500-700 and Inter keeps the body.
const archivo = Archivo({
  subsets: ["latin"],
  // 800 is the logo wordmark's weight.
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
});

// Headline serif of the tiruhealth.com theme. Scoped by class (font-serif) to
// the homepage, header and footer rather than swapped in globally, so every
// other page keeps its current type exactly.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Tiru Health — Healthcare in Addis Ababa",
  // Reflects what the directory actually holds: 25 hospitals, 68 specialty
  // centres, 7 diagnostic centres. "Clinics" led the old copy but zero
  // facilities are categorised as such, and pharmacies (2) and specialists
  // (2 records) are too thin to headline.
  description:
    "Find hospitals, specialty centres and diagnostic labs across Addis Ababa, with contact details, opening hours and services for every listing.",
  applicationName: "Tiru Health Medical Directory",
  // Shared-link previews. Pages that set their own title/description override
  // these per page; the brand name stays consistent everywhere.
  openGraph: {
    type: "website",
    siteName: "Tiru Health Medical Directory",
    title: "Tiru Health — Healthcare in Addis Ababa",
    description:
      "Find hospitals, specialty centres and diagnostic labs across Addis Ababa. Trace the right care.",
  },
  twitter: {
    card: "summary",
    title: "Tiru Health — Healthcare in Addis Ababa",
    description:
      "Find hospitals, specialty centres and diagnostic labs across Addis Ababa. Trace the right care.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the script below sets data-theme on <html>
    // before React hydrates, which is the point of it.
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${archivo.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved theme before first paint, on every page. The
            toggle used to be the only thing applying it, so pages without a
            header (provider and admin sign-in) always rendered light, and
            every page flashed light before switching to dark. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('tiru-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ScrollRestoration />
        {children}
        <Toaster />
        {/* TalkToUsButton (the floating WhatsApp action on every page) is
            removed for now, at direct request — the feature is being
            reconsidered, not abandoned. The component itself is left in
            place under components/layout so re-adding it is a one-line
            import again rather than a rebuild. */}
      </body>
    </html>
  );
}
