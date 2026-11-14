import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getKurikulumData } from "@/lib/kurikulum-cms/server";

/**
 * API lama kurikulum. Baca saja: mengembalikan data kurikulum versi terbit (bentuk turunan).
 * Penulisan dipindah ke Kartografer Kurikulum (/api/kurikulum-cms, draf → terbit → riwayat).
 */
export async function GET() {
  try {
    const { copy, preview, ...data } = await getKurikulumData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[curriculum] GET", error);
    return NextResponse.json({ success: false, error: "Gagal memuat kurikulum" }, { status: 500 });
  }
}

async function retired() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Tidak berwenang" }, { status: 401 });
  return NextResponse.json({ success: false, error: "Kurikulum kini diubah lewat Kartografer Kurikulum (/admin/kurikulum)." }, { status: 410 });
}

export const PUT = retired;
export const POST = retired;
export const DELETE = retired;
