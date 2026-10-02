import { LegalPage, legalPageMetadata } from "@/components/content/legal-page";

export const revalidate = 300;

export const generateMetadata = () => legalPageMetadata("gizlilik-politikasi");

export default function PrivacyPage() {
  return <LegalPage slug="gizlilik-politikasi" />;
}
