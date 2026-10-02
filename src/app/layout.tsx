import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { getSettings, getSiteUrl } from "@/lib/settings";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.defaultSeoTitle, template: `%s | ${settings.siteName}` },
    description: settings.defaultSeoDescription,
    applicationName: settings.siteName,
    formatDetection: { telephone: false },
    ...(settings.googleSiteVerification ? { verification: { google: settings.googleSiteVerification } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#fcfaf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
