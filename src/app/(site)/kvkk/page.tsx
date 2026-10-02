import { LegalPage, legalPageMetadata } from "@/components/content/legal-page";

export const revalidate = 300;

export const generateMetadata = () => legalPageMetadata("kvkk");

export default function KvkkPage() {
  return <LegalPage slug="kvkk" />;
}
