import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { ScrollRestoration } from "@/components/layout/ScrollRestoration";
import { TalkToUsButton } from "@/components/layout/TalkToUsButton";
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
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Tiru — Healthcare in Addis Ababa",
  // Reflects what the directory actually holds: 25 hospitals, 68 specialty
  // centres, 7 diagnostic centres. "Clinics" led the old copy but zero
  // facilities are categorised as such, and pharmacies (2) and specialists
  // (2 records) are too thin to headline.
  description:
    "Find hospitals, specialty centres and diagnostic labs across Addis Ababa, with contact details, opening hours and services for every listing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${archivo.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ScrollRestoration />
        {children}
        <TalkToUsButton />
      </body>
    </html>
  );
}
