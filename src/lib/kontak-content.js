import { PMB_URL, FOOTER } from "@/lib/home-content";
import { mergeLayanan } from "@/lib/layanan-content";

/**
 * Konten halaman Kontak (`/kontak`) — konsep "kantor pos & papan sambung".
 * Tidak ada backend: surat disusun di browser lalu dibuka lewat email (mailto) atau WhatsApp (wa.me).
 * Bila kanal resmi belum diisi, surat hanya bisa disalin.
 *
 * CMS `PageContent` section `kontak` (Admin › Konten › Kontak):
 *   data.intro          → paragraf hero
 *   data.email          → email resmi prodi        (kosong → pakai `layanan-akademik` data.contact.email)
 *   data.whatsapp       → nomor WhatsApp resmi      (kosong → pakai `layanan-akademik` data.contact.whatsapp)
 *   data.desks[]        → ditimpa per `key` { name, handles }; mengisi `handles` menghapus tanda contoh
 * Ruang & gedung sekretariat diambil dari CMS Layanan Akademik agar satu sumber.
 */

export const CURTAIN_KEY = "sisfor:curtain:kontak";
export const BANNER_KEY = "sisfor:banner:kontak";
export const DRAFT_KEY = "sisfor:kontak:draf";

export const INTRO = {
  body: "Pilih urusanmu, tulis suratnya di sini, lalu kirim lewat email atau WhatsApp. Tidak perlu menebak harus menghubungi siapa.",
};

export const MAP_QUERY = "Universitas Internasional Semen Indonesia";
export const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;
export const MAP_ROUTE = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`;
export const ADDRESS = FOOTER.address;

/** Meja tujuan di papan sambung. */
export const DESKS = [
  { key: "pmb", name: "Panitia PMB UISI", handles: "Jalur masuk, biaya, dan jadwal seleksi", sample: true },
  { key: "sekretariat", name: "Sekretariat Prodi", handles: "Administrasi, jadwal, dan data mahasiswa maupun alumni", sample: true },
  { key: "kaprodi", name: "Kaprodi & Koordinator Kerja Sama", handles: "Kemitraan riset, magang, dan rekrutmen lulusan", sample: true },
  { key: "humas", name: "Tim Publikasi Prodi", handles: "Liputan, undangan narasumber, dan konten media sosial", sample: true },
];

/** Colokan topik → meja. `link` = jalan pintas resmi bila urusannya sudah punya halaman sendiri. */
export const TOPICS = [
  { key: "pmb", label: "Pendaftaran mahasiswa baru", desk: "pmb", link: { href: PMB_URL, label: "Buka portal PMB", external: true } },
  { key: "akademik", label: "Akademik & administrasi", desk: "sekretariat", link: { href: "/layanan-akademik", label: "Ajukan surat lewat Layanan Akademik" } },
  { key: "industri", label: "Kerja sama & magang industri", desk: "kaprodi", link: { href: "/magang", label: "Lihat program magang" } },
  { key: "media", label: "Media & publikasi", desk: "humas" },
  { key: "alumni", label: "Alumni & tracer study", desk: "sekretariat" },
];

export const ROLES = ["Calon mahasiswa", "Orang tua / wali", "Mahasiswa", "Alumni", "Mitra industri", "Media", "Lainnya"];

export const LIMITS = { name: 80, message: 1200, minMessage: 20 };

const str = (v) => (typeof v === "string" ? v.trim() : "");
const parse = (v) => {
  if (!v) return {};
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return {};
  }
};

/** Nomor WA → format internasional tanpa "+" (08xx → 628xx). */
export const waNumber = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  if (!d) return "";
  return d.startsWith("0") ? `62${d.slice(1)}` : d;
};

export function mergeKontak(row, layananRow) {
  const data = parse(row?.data);
  const fallback = mergeLayanan(layananRow).contact;
  const overrides = Array.isArray(data.desks) ? data.desks : [];
  const desks = DESKS.map((d) => {
    const o = overrides.find((x) => x?.key === d.key);
    if (!o) return d;
    return { ...d, name: str(o.name) || d.name, handles: str(o.handles) || d.handles, sample: !str(o.handles) && d.sample };
  });
  return {
    intro: { body: str(data.intro) || str(row?.content) || INTRO.body },
    channels: {
      email: str(data.email) || fallback.email || "",
      whatsapp: waNumber(str(data.whatsapp) || fallback.whatsapp),
    },
    office: { room: fallback.room, building: fallback.building, sample: fallback.sample },
    desks,
    topics: TOPICS,
  };
}

export const deskOf = (key, desks = DESKS) => desks.find((d) => d.key === key) ?? desks[0];

/** Menyusun isi surat (teks polos) — dipakai untuk mailto, WhatsApp, dan salin. */
export function composeLetter({ desk, topic, name, role, email, message, date }) {
  const tgl = (date ?? new Date()).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return [
    `Gresik, ${tgl}`,
    "",
    `Kepada Yth. ${desk.name}`,
    "Program Studi Sistem Informasi UISI",
    "",
    `Perihal: ${topic.label}`,
    "",
    message.trim(),
    "",
    "Hormat saya,",
    name.trim(),
    [role, email.trim()].filter(Boolean).join(" · "),
  ].join("\n");
}

export const letterSubject = (topic) => `[Kontak Sisfor] ${topic.label}`;
