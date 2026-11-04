import { PageLoader } from "@/components/ds/Loader";

export default function AdminLoading() {
  return <PageLoader fullscreen={false} label="Memuat halaman CMS…" />;
}
