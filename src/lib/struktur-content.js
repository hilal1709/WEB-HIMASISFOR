/**
 * Konstanta halaman Struktur Organisasi. Isi halaman dikelola di Studio Bagan (CMS):
 * lihat `src/lib/struktur-cms/` (bawaan di `defaults.js`).
 */
import { STRUKTUR_DEFAULTS } from "@/lib/struktur-cms/defaults";

/** Kunci sessionStorage tirai masuk halaman. */
export const CURTAIN_KEY = "sisfor:curtain:struktur";

/** Orang bawaan (dipakai sebagai cadangan oleh halaman lain, mis. /dosen). */
export const PEOPLE = STRUKTUR_DEFAULTS.people;

/** Inisial nama (lewati gelar "Dr"). */
export const initials = (name = "") =>
  name
    .split(/[ ,.]+/)
    .filter((w) => w && w !== "Dr" && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || "?";
