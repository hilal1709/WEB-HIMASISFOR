import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { clientIp, noStore, rateLimit } from "@/lib/layanan-server";
import { uploadPrivateFiles } from "@/lib/private-storage";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (value, max) => String(value ?? "").trim().slice(0, max);
const phone = (value) => clip(value, 20).replace(/[^\d+]/g, "");

export async function POST(request) {
  const limit = rateLimit(`course-registration:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return noStore({ success: false, error: "Terlalu banyak percobaan. Coba lagi beberapa menit." }, { status: 429 });

  let body;
  let answers = null;
  let files = [];
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      body = Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string"));
      answers = String(form.get("answers") || "") || null;
      files = [...form.keys()].filter((key) => key.startsWith("documents_")).flatMap((key) => form.getAll(key)).filter((file) => file && typeof file !== "string");
    } else body = await request.json();
  } catch {
    return noStore({ success: false, error: "Format data tidak dikenali." }, { status: 400 });
  }
  if (body?.website) return noStore({ success: false, error: "Pendaftaran tidak valid." }, { status: 400 });

  const courseSlug = clip(body?.courseSlug, 160);
  const courseTitle = clip(body?.courseTitle, 200);
  const name = clip(body?.name, 120);
  const email = clip(body?.email, 160).toLowerCase();
  const normalizedPhone = phone(body?.phone);
  const nim = clip(body?.nim, 30) || null;
  const audience = clip(body?.audience, 80);
  const errors = {};
  if (!courseSlug || !courseTitle) errors.course = "Course tidak ditemukan.";
  if (name.length < 3) errors.name = "Tulis nama lengkap.";
  if (!EMAIL.test(email)) errors.email = "Alamat email belum benar.";
  if (normalizedPhone.length < 9 || normalizedPhone.length > 16) errors.phone = "Nomor WhatsApp belum benar.";
  if (!["Mahasiswa", "Calon mahasiswa", "Alumni", "Umum"].includes(audience)) errors.audience = "Pilih kategori pendaftar.";
  if (audience === "Mahasiswa" && !/^\d{8,12}$/.test(nim ?? "")) errors.nim = "NIM wajib diisi untuk mahasiswa (8–12 angka).";
  if (Object.keys(errors).length) return noStore({ success: false, errors }, { status: 422 });

  try {
    const data = await prisma.courseRegistration.create({
      data: { courseSlug, courseTitle, name, email, phone: normalizedPhone, nim, audience, answers },
    });
    const documents = await uploadPrivateFiles(`applications/course-${data.id}`, files);
    if (documents.length) await prisma.courseRegistration.update({ where: { id: data.id }, data: { documents: JSON.stringify(documents) } });
    return noStore({ success: true, data: { id: data.id, courseTitle: data.courseTitle } }, { status: 201 });
  } catch (error) {
    console.error("[course-registration] create", error);
    return noStore({ success: false, error: "Pendaftaran belum bisa disimpan. Coba lagi." }, { status: 500 });
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
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { courseTitle: { contains: q, mode: "insensitive" } }] } : {}),
    };
    const [data, grouped] = await Promise.all([
      prisma.courseRegistration.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.courseRegistration.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    return noStore({ success: true, data, counts: Object.fromEntries(grouped.map((r) => [r.status, r._count._all])) });
  } catch (error) {
    console.error("[course-registration] list", error);
    return noStore({ success: false, error: "Gagal memuat pendaftar." }, { status: 500 });
  }
}
