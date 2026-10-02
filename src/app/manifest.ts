import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: `${settings.siteName} – ${settings.siteTagline}`,
    short_name: settings.siteName,
    description: settings.defaultSeoDescription,
    lang: "tr",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfaf7",
    theme_color: "#0072ce",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
