import { PageLoader } from "@/components/ui/loader";

// Ditampilkan otomatis Next.js saat navigasi antar halaman memuat data.
export default function Loading() {
  return <PageLoader label="Memuat halaman…" />;
}
