import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { noStore } from "@/lib/layanan-server";
import { createPrivateSignedUrl } from "@/lib/private-storage";

const targets = {
  course: { model: "courseRegistration", field: "documents" },
  scholarship: { model: "scholarshipApplication", field: "documents" },
};

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const id = Number((await params).id);
  const target = targets[new URL(request.url).searchParams.get("target")];
  if (!Number.isInteger(id) || !target) return noStore({ success: false, error: "Permintaan berkas tidak valid." }, { status: 400 });
  const index = Number(new URL(request.url).searchParams.get("index"));
  if (!Number.isInteger(index) || index < 0) return noStore({ success: false, error: "Berkas tidak valid." }, { status: 400 });
  try {
    const row = await prisma[target.model].findUnique({ where: { id }, select: { [target.field]: true } });
    const documents = row?.[target.field] ? JSON.parse(row[target.field]) : [];
    const document = Array.isArray(documents) ? documents[index] : null;
    if (!document?.path) return noStore({ success: false, error: "Berkas tidak ditemukan." }, { status: 404 });
    const signedURL = await createPrivateSignedUrl(document.path);
    return noStore({ success: true, signedURL, name: document.name || "dokumen" });
  } catch (error) {
    console.error("[registration-document] signed-url", error);
    return noStore({ success: false, error: "Berkas belum bisa dibuka." }, { status: 500 });
  }
}
