import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MagangConflict, readPreviewMagang } from "@/lib/magang-cms/server";
import { MagangShell } from "@/components/magang/magang-shell";
import { PreviewSignal } from "@/components/magang-cms/preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pratinjau Magang", robots: { index: false, follow: false } };

export default async function PreviewMagangPage({ searchParams }) {
  if (!(await auth())?.user) redirect("/admin/login");
  const { revisi } = await searchParams;
  try {
    const data = await readPreviewMagang(revisi);
    return <><MagangShell data={data} preview /><PreviewSignal /></>;
  } catch (error) {
    const conflict = error instanceof MagangConflict;
    if (!conflict) console.error("[magang-cms] preview", error);
    return <main className="grid min-h-dvh place-content-center bg-cream p-6 text-center text-navy">
      <p>{conflict ? "Draf sudah berubah. Tutup pratinjau lalu muat versi terbaru dari CMS." : "Pratinjau gagal dimuat. Coba lagi dari CMS."}</p>
      <PreviewSignal />
    </main>;
  }
}
