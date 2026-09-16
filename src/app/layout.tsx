import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { PortalProvider } from "@/components/portal-provider";

/**
 * Inter Tight rather than the scaffold's Geist: the same restrained-grotesque register,
 * with tighter tracking that suits the dense status and meta text, and without reading
 * as a Vercel template. JetBrains Mono appears only on technical disclosures.
 */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Raresquared Labs — Client Portal",
  description:
    "See what your Raresquared workforce is doing and anything that needs your attention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        <PortalProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          <AppSidebar />
          {/* Offset by the fixed rail on desktop; full width below it. */}
          <div className="lg:pl-[248px]">
            <main
              id="main"
              className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10"
            >
              {children}
            </main>
          </div>
        </PortalProvider>
      </body>
    </html>
  );
}
