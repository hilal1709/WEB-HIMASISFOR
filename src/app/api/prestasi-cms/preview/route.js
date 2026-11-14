import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

/** Draft mode untuk pratinjau Ruang Kurator (Prestasi). `?off=1` mematikan. */
export async function GET(request) {
  const url = new URL(request.url);
  const dm = await draftMode();
  const target = new URL("/achievement", url);
  if (url.searchParams.get("off")) {
    dm.disable();
    return NextResponse.redirect(target);
  }
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/admin/login", url));
  dm.enable();
  return NextResponse.redirect(target);
}
