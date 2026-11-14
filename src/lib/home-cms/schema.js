/**
 * Skema Studio Beranda — satu sumber untuk form CMS, validasi API, dan urutan section.
 * Aman diimpor di klien (tanpa prisma).
 *
 * Tipe field: text · textarea · lines (judul per baris) · tags · image · video · lottie · link ·
 * pose (maskot) · toggle · list (berulang, punya `of`).
 * `group` mengelompokkan field di Inspector: teks · media · aksi · maskot.
 */

export const POSES = ["wave", "thumbs-up", "confident", "proud", "run", "think", "laugh"];
export const POSE_LABEL = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Percaya diri", proud: "Bangga", run: "Berlari", think: "Berpikir", laugh: "Tertawa" };
export const SOCIAL_NAMES = ["Instagram", "TikTok", "YouTube"];
export const ILLUSTRATION_KEYS = ["erp", "lecturer", "industry", "career"];

export const GROUPS = [
  { key: "teks", label: "Teks" },
  { key: "media", label: "Media" },
  { key: "aksi", label: "Tautan & tombol" },
  { key: "maskot", label: "Si Elvo" },
];

const t = (key, label, extra) => ({ key, label, type: "text", group: "teks", ...extra });
const ta = (key, label, extra) => ({ key, label, type: "textarea", group: "teks", ...extra });
const lines = (key, label = "Judul", extra) => ({ key, label, type: "lines", group: "teks", hint: "Satu baris per baris judul. Baris kedua tampil miring sebagai sorotan.", ...extra });
const img = (key, label, extra) => ({ key, label, type: "image", group: "media", ...extra });
const vid = (key, label, extra) => ({ key, label, type: "video", group: "media", ...extra });
const lot = (key, label = "Animasi Lottie", extra) => ({ key, label, type: "lottie", group: "media", ...extra });
const lnk = (key, label, extra) => ({ key, label, type: "link", group: "aksi", ...extra });
const links = (key, label, extra) => ({ key, label, type: "list", group: "aksi", item: "Tautan", of: [t("label", "Label"), t("href", "Alamat")], ...extra });
const mascot = { key: "mascot", label: "Kalimat & pose", type: "pose", group: "maskot" };

/** Section beranda, dalam urutan default. `scene: false` = tidak ikut diurutkan (selalu di posisinya). */
export const SECTIONS = [
  {
    key: "header",
    label: "Kepala situs",
    scene: false,
    global: true,
    anchor: "top",
    fields: [
      img("logo", "Logo"),
      t("logoAlt", "Teks alternatif logo"),
      lnk("pmb", "Tombol PMB"),
      t("mobileCta", "Tombol PMB di menu ponsel"),
      links("audience", "Tautan audiens (bar atas)"),
      links("utility", "Tautan utilitas (bar atas kanan)"),
      t("lang", "Penanda bahasa"),
      t("langNote", "Keterangan penanda bahasa"),
      t("searchPlaceholder", "Placeholder pencarian"),
      t("searchEmpty", "Pesan pencarian kosong"),
      {
        key: "nav",
        label: "Menu utama",
        type: "list",
        group: "aksi",
        item: "Menu",
        of: [
          t("label", "Label"),
          t("href", "Alamat"),
          { key: "items", label: "Sub-menu", type: "list", item: "Sub-menu", of: [t("label", "Label"), t("href", "Alamat"), t("desc", "Keterangan")] },
          {
            key: "feature",
            label: "Kartu sorotan mega-menu",
            type: "object",
            of: [img("image", "Foto"), t("title", "Judul"), t("body", "Ringkasan"), t("href", "Alamat")],
          },
        ],
      },
    ],
  },
  {
    key: "intro",
    label: "Layar pembuka",
    scene: false,
    anchor: "top",
    fields: [
      { key: "enabled", label: "Tampilkan sekali per sesi", type: "toggle", group: "teks" },
      t("title", "Judul"),
      t("subtitle", "Subjudul"),
      t("caption", "Keterangan pojok"),
    ],
  },
  {
    key: "hero",
    label: "Hero",
    anchor: "beranda",
    fields: [
      t("titleLead", "Judul — awal"),
      t("titleAccent", "Judul — sorotan miring"),
      t("titleTail", "Judul — akhir"),
      ta("body", "Paragraf"),
      vid("background", "Video latar", { compact: true }),
      vid("story", "Video kisah"),
      lnk("primary", "Tombol utama"),
      lnk("secondary", "Tombol kedua"),
      t("storyLabel", "Label tombol video", { group: "aksi" }),
      mascot,
    ],
  },
  {
    key: "quicklinks",
    label: "Tautan cepat",
    anchor: "tautan-cepat",
    fields: [
      {
        key: "items",
        label: "Kartu",
        type: "list",
        group: "teks",
        item: "Kartu",
        max: 4,
        of: [t("title", "Judul"), t("body", "Ringkasan"), t("href", "Alamat"), lot("lottie")],
      },
    ],
  },
  {
    key: "about",
    label: "Tentang prodi",
    anchor: "tentang",
    fields: [
      lines("title"),
      ta("quote", "Kutipan"),
      t("quoteBy", "Pemilik kutipan"),
      ta("body", "Ringkasan"),
      img("photo", "Foto"),
      t("photoAlt", "Teks alternatif foto", { group: "media" }),
      vid("video", "Video"),
      t("videoLabel", "Label video", { group: "media" }),
      lnk("more", "Tautan lanjutan"),
      { key: "stats", label: "Angka", type: "list", group: "teks", item: "Angka", max: 4, of: [t("value", "Nilai", { hint: "Angka akan dihitung naik." }), t("label", "Label")] },
      { key: "showTotal", label: "Tambahkan jumlah prestasi dari database", type: "toggle", group: "teks" },
      t("totalLabel", "Label jumlah prestasi"),
      {
        key: "features",
        label: "Keunggulan",
        type: "list",
        group: "teks",
        item: "Keunggulan",
        of: [t("title", "Judul"), ta("body", "Ringkasan"), lot("lottie"), { key: "illustration", label: "Ilustrasi cadangan", type: "select", options: ILLUSTRATION_KEYS }],
      },
      mascot,
    ],
  },
  {
    key: "accreditation",
    label: "Akreditasi",
    anchor: "akreditasi",
    fields: [
      t("lead", "Kata pembuka"),
      t("grade", "Peringkat"),
      t("issuer", "Lembaga (singkat)"),
      t("issuerFull", "Lembaga (lengkap)"),
      { key: "rows", label: "Rincian", type: "list", group: "teks", item: "Rincian", max: 2, of: [t("label", "Label"), t("value", "Isi")] },
      img("certificate", "Sertifikat"),
      lot("lottie"),
    ],
  },
  {
    key: "expertise",
    label: "Bidang keahlian",
    anchor: "bidang",
    note: "Kartu bidang (judul, ringkasan, foto, Lottie, prospek karier, urutan) diatur di Konsol Bidang Keahlian (/admin/bidang-keahlian). Di sini hanya teks section.",
    fields: [
      lines("title"),
      ta("body", "Paragraf"),
      t("careersLabel", "Label prospek karier"),
      lnk("more", "Tautan lanjutan"),
      mascot,
    ],
  },
  {
    key: "achievements",
    label: "Prestasi",
    anchor: "prestasi",
    note: "Daftar prestasi diambil dari menu Kelola Prestasi. Isi di bawah dipakai bila database kosong.",
    fields: [
      lines("title"),
      ta("body", "Paragraf"),
      t("tabStudent", "Tab mahasiswa"),
      t("tabLecturer", "Tab dosen"),
      ta("caption", "Keterangan video"),
      vid("video", "Video"),
      t("videoLabel", "Label video", { group: "media" }),
      lot("lottie"),
      lnk("more", "Tautan lanjutan"),
      { key: "fallbackStudent", label: "Cadangan — mahasiswa", type: "list", group: "teks", item: "Prestasi", of: [t("level", "Tingkat"), t("title", "Judul"), t("body", "Keterangan"), img("image", "Foto")] },
      { key: "fallbackLecturer", label: "Cadangan — dosen", type: "list", group: "teks", item: "Prestasi", of: [t("level", "Tingkat"), t("title", "Judul"), t("body", "Keterangan"), img("image", "Foto")] },
      mascot,
    ],
  },
  {
    key: "news",
    label: "Berita & agenda",
    anchor: "berita",
    note: "Berita dan agenda diambil dari menu Warta.",
    fields: [
      lines("title"),
      ta("body", "Paragraf"),
      t("agendaTitle", "Judul agenda"),
      t("emptyText", "Pesan agenda kosong"),
      lnk("more", "Tautan berita"),
      lnk("calendar", "Tautan kalender"),
      lot("agendaLottie", "Animasi agenda"),
      lot("emptyLottie", "Animasi agenda kosong"),
      mascot,
    ],
  },
  {
    key: "alumni",
    label: "Cerita alumni",
    anchor: "alumni",
    fields: [
      lines("title"),
      ta("body", "Paragraf"),
      { key: "items", label: "Testimoni", type: "list", group: "teks", item: "Testimoni", of: [ta("quote", "Kutipan"), t("name", "Nama"), t("role", "Peran"), img("photo", "Foto", { hint: "Kosongkan untuk inisial." })] },
      vid("video", "Video"),
      t("videoLabel", "Label video", { group: "media" }),
      lot("lottie"),
      mascot,
    ],
  },
  {
    key: "partners",
    label: "Mitra industri",
    anchor: "mitra",
    fields: [
      t("heading", "Judul"),
      { key: "items", label: "Mitra", type: "list", group: "teks", item: "Mitra", of: [t("name", "Nama"), img("logo", "Logo", { hint: "Kosongkan untuk menampilkan nama." })] },
    ],
  },
  {
    key: "join",
    label: "Ajakan bergabung",
    anchor: "gabung",
    fields: [
      t("eyebrow", "Label kecil"),
      lines("title"),
      ta("body", "Paragraf"),
      img("image", "Foto"),
      t("imageAlt", "Teks alternatif foto", { group: "media" }),
      lot("lottie"),
      lnk("primary", "Tombol utama"),
      lnk("secondary", "Tombol kedua"),
      mascot,
    ],
  },
  {
    key: "footer",
    label: "Kaki situs",
    scene: false,
    global: true,
    anchor: "kontak",
    fields: [
      ta("address", "Alamat"),
      t("copyright", "Hak cipta", { hint: "{tahun} diganti tahun berjalan." }),
      t("toTop", "Tombol ke atas"),
      img("logo", "Logo"),
      lnk("map", "Tautan peta"),
      { key: "socials", label: "Media sosial", type: "list", group: "aksi", item: "Akun", of: [{ key: "name", label: "Platform", type: "select", options: SOCIAL_NAMES }, t("href", "Alamat")] },
      { key: "columns", label: "Kolom tautan", type: "list", group: "aksi", item: "Kolom", max: 3, of: [t("title", "Judul"), links("links", "Tautan")] },
      links("bottomLinks", "Tautan baris bawah"),
      mascot,
    ],
  },
];

export const SECTION_KEYS = SECTIONS.map((s) => s.key);
export const SCENE_KEYS = SECTIONS.filter((s) => s.scene !== false).map((s) => s.key);
export const sectionOf = (key) => SECTIONS.find((s) => s.key === key);
export const rowKey = (key) => `home:${key}`;
export const draftKey = (key) => `home-draft:${key}`;

const MAX = { text: 300, textarea: 2000 };
const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : v == null ? "" : String(v).slice(0, max));

/** Saring nilai mengikuti skema: buang kunci asing, paksa tipe, batasi panjang. */
export function clean(fields, value) {
  const src = value && typeof value === "object" ? value : {};
  const out = {};
  for (const f of fields) {
    const v = src[f.key];
    if (v === undefined) continue;
    switch (f.type) {
      case "text":
      case "image":
      case "lottie":
        out[f.key] = str(v, MAX.text);
        break;
      case "select":
        out[f.key] = f.options.includes(v) ? v : f.options[0];
        break;
      case "textarea":
        out[f.key] = str(v, MAX.textarea);
        break;
      case "toggle":
        out[f.key] = Boolean(v);
        break;
      case "lines":
      case "tags":
        out[f.key] = (Array.isArray(v) ? v : []).slice(0, 12).map((x) => str(x, MAX.text));
        break;
      case "link":
        out[f.key] = { label: str(v?.label, MAX.text), href: str(v?.href, MAX.text) };
        break;
      case "video":
        out[f.key] = { src: str(v?.src, MAX.text), poster: str(v?.poster, MAX.text), title: str(v?.title, MAX.text), duration: str(v?.duration, 12) };
        break;
      case "pose":
        out[f.key] = { pose: POSES.includes(v?.pose) ? v.pose : "wave", say: str(v?.say, MAX.text) };
        break;
      case "object":
        out[f.key] = clean(f.of, v);
        break;
      case "list":
        out[f.key] = (Array.isArray(v) ? v : []).slice(0, f.max ?? 40).map((x) => clean(f.of, x));
        break;
      default:
        break;
    }
  }
  return out;
}

/** Validasi + saring isi satu section. `layout` punya bentuk sendiri. */
export function cleanSection(key, value) {
  if (key === "layout") {
    const list = Array.isArray(value?.sections) ? value.sections : [];
    const seen = new Set();
    const sections = list
      .filter((s) => SCENE_KEYS.includes(s?.key) && !seen.has(s.key) && seen.add(s.key))
      .map((s) => ({ key: s.key, visible: s.visible !== false }));
    // section baru yang belum tercatat → tambahkan di akhir
    for (const k of SCENE_KEYS) if (!seen.has(k)) sections.push({ key: k, visible: true });
    return sections.length ? { sections } : null;
  }
  const s = sectionOf(key);
  return s ? clean(s.fields, value) : null;
}
