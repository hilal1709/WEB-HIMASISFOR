/**
 * Utilitas halaman Bidang Keahlian (`/bidang-keahlian`). Seluruh isi (teks, bidang, dimensi minat,
 * studi kasus, label) dikelola di Konsol Bidang — lihat `@/lib/bidang-cms/defaults`.
 */
export const CURTAIN_KEY = "sisfor:curtain:bidang-keahlian";
export const BANNER_KEY = "sisfor:banner:bidang-keahlian";
export const SHORTLIST_KEY = "sisfor:shortlist:bidang-keahlian";

/** Skor kecocokan 0–100 dari jarak euclidean; batas jarak ±6 per dimensi agar skor tidak menumpuk di 70-an. */
export function matchScore(user, profile) {
  const max = Math.sqrt(profile.length * 40);
  const d = Math.sqrt(profile.reduce((s, v, i) => s + (v - (user[i] ?? 0)) ** 2, 0));
  return Math.round(Math.max(0, 1 - d / max) * 100);
}
