import { RegulasiEditor } from "@/components/regulasi-cms/regulasi-editor";

export const metadata = { title: "CMS Regulasi Akademik", robots: { index: false, follow: false } };

export default function AdminRegulasiPage() {
  return <RegulasiEditor />;
}
