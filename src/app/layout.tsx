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
  description:
    "Find hospitals, clinics, specialists, diagnostics and pharmacies across Addis Ababa.",
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
