import { LegalPage, legalPageMetadata } from "@/components/content/legal-page";

export const revalidate = 300;

export const generateMetadata = () => legalPageMetadata("cerez-politikasi");

export default function CookiePolicyPage() {
  return <LegalPage slug="cerez-politikasi" />;
}
