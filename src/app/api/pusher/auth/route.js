import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { authorizeChannel } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

const ALLOWED = ["private-admin", "presence-studio"];

/** Otorisasi kanal privat/presence Pusher — hanya admin yang login. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak berwenang" }, { status: 403 });
  const form = await request.formData();
  const socketId = form.get("socket_id");
  const channel = form.get("channel_name");
  if (!socketId || !ALLOWED.includes(channel)) return NextResponse.json({ error: "Kanal tidak dikenal" }, { status: 403 });
  const res = authorizeChannel(String(socketId), String(channel), session.user);
  if (!res) return NextResponse.json({ error: "Realtime belum dikonfigurasi" }, { status: 503 });
  return NextResponse.json(res);
}
