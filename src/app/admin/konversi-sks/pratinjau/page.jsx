import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { KonversiConflict, readPreviewKonversi } from "@/lib/konversi-cms/server";
import { KonversiShell } from "@/components/konversi/konversi-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pratinjau Konversi SKS", robots: { index: false, follow: false } };

export default async function PreviewKonversiPage({ searchParams }) {
  if (!(await auth())?.user) redirect("/admin/login");
  const { revisi } = await searchParams;
  try {
    return <KonversiShell data={await readPreviewKonversi(revisi)} preview />;
  } catch (error) {
    if (!(error instanceof KonversiConflict)) console.error("[konversi-cms] preview", error);
    return <main className="grid min-h-dvh place-content-center bg-cream p-6 text-center text-navy">
      {error instanceof KonversiConflict ? "Draf sudah berubah. Buka ulang pratinjau dari CMS." : "Pratinjau gagal dimuat. Coba lagi dari CMS."}
    </main>;
  }
}
