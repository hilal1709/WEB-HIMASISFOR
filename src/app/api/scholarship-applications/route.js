import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { clientIp, noStore, rateLimit } from "@/lib/layanan-server";

export const dynamic = "force-dynamic";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (value, max) => String(value ?? "").trim().slice(0, max);
const numberOrNull = (value) => (value === "" || value == null ? null : Number(value));
const SUPABASE_URL = () => String(process.env.SUPABASE_URL || "").replace(/\/$/, "");

const applicantTypes = ["Mahasiswa aktif", "Calon mahasiswa"];
const safeFileName = (name) => String(name || "dokumen").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100);

async function uploadDocuments(id, files) {
  const url = SUPABASE_URL();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_SCHOLARSHIP_BUCKET || "scholarship-applications";
  if (!files.length) return [];
  if (!url || !key) throw new Error("Supabase Storage belum dikonfigurasi.");
  const uploaded = [];
  for (const file of files) {
    if (!file || typeof file === "string" || file.size === 0) continue;
    if (file.size > 10 * 1024 * 1024) throw new Error("Setiap berkas maksimal 10 MB.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) throw new Error("Berkas harus PDF, JPG, atau PNG.");
    const path = `applications/${id}/${Date.now()}-${safeFileName(file.name)}`;
    const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": file.type, "x-upsert": "false" },
      body: Buffer.from(await file.arrayBuffer()),
    });
    if (!response.ok) throw new Error("Gagal mengunggah berkas ke penyimpanan privat.");
    uploaded.push({ path, name: file.name, type: file.type, size: file.size });
  }
  return uploaded;
}

export async function POST(request) {
  const limit = rateLimit(`scholarship-application:${clientIp(request)}`, { limit: 3, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return noStore({ success: false, error: "Terlalu banyak percobaan. Coba lagi beberapa menit." }, { status: 429 });
  let form;
  try { form = await request.formData(); } catch { return noStore({ success: false, error: "Format form tidak dikenali." }, { status: 400 }); }
  if (form.get("website")) return noStore({ success: false, error: "Pendaftaran tidak valid." }, { status: 400 });

  const applicantType = clip(form.get("applicantType"), 30);
  const name = clip(form.get("name"), 120);
  const email = clip(form.get("email"), 160).toLowerCase();
  const phone = clip(form.get("phone"), 20).replace(/[^\d+]/g, "");
  const nim = clip(form.get("nim"), 30) || null;
  const errors = {};
  if (!applicantTypes.includes(applicantType)) errors.applicantType = "Pilih status pendaftar.";
  if (name.length < 3) errors.name = "Tulis nama lengkap.";
  if (!EMAIL.test(email)) errors.email = "Alamat email belum benar.";
  if (phone.length < 9 || phone.length > 16) errors.phone = "Nomor WhatsApp belum benar.";
  if (applicantType === "Mahasiswa aktif" && !/^\d{8,12}$/.test(nim || "")) errors.nim = "NIM wajib diisi untuk mahasiswa aktif.";
  if (Object.keys(errors).length) return noStore({ success: false, errors }, { status: 422 });

  const scholarshipSlug = clip(form.get("scholarshipSlug"), 160);
  const scholarshipName = clip(form.get("scholarshipName"), 200);
  const files = [...form.keys()].filter((key) => key === "documents" || key.startsWith("documents_")).flatMap((key) => form.getAll(key)).filter((file) => file && typeof file !== "string");
  const answers = clip(form.get("answers"), 10000) || null;
  try {
    const created = await prisma.scholarshipApplication.create({
      data: {
        scholarshipSlug, scholarshipName, applicantType, name, email, phone, nim,
        semester: numberOrNull(form.get("semester")), ipk: numberOrNull(form.get("ipk")),
        income: clip(form.get("income"), 80) || null, school: clip(form.get("school"), 160) || null,
        graduationYear: numberOrNull(form.get("graduationYear")), reportScore: numberOrNull(form.get("reportScore")),
        admissionStatus: clip(form.get("admissionStatus"), 100) || null, notes: clip(form.get("notes"), 2000) || null,
        answers,
      },
    });
    const documents = await uploadDocuments(created.id, files);
    const data = await prisma.scholarshipApplication.update({ where: { id: created.id }, data: { documents: documents.length ? JSON.stringify(documents) : null } });
    return noStore({ success: true, data: { id: data.id, scholarshipName: data.scholarshipName } }, { status: 201 });
  } catch (error) {
    console.error("[scholarship-application] create", error);
    return noStore({ success: false, error: error.message || "Pendaftaran belum bisa disimpan." }, { status: 500 });
  }
}

export async function GET(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = clip(searchParams.get("status"), 30);
  const q = clip(searchParams.get("q"), 100);
  try {
    const where = {
      ...(status ? { status } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { scholarshipName: { contains: q, mode: "insensitive" } }] } : {}),
    };
    const [data, grouped] = await Promise.all([
      prisma.scholarshipApplication.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.scholarshipApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    return noStore({ success: true, data, counts: Object.fromEntries(grouped.map((r) => [r.status, r._count._all])) });
  } catch (error) {
    console.error("[scholarship-application] list", error);
    return noStore({ success: false, error: "Gagal memuat pendaftar beasiswa." }, { status: 500 });
  }
}
