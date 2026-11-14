/**
 * Bentuk isi CMS halaman (aman untuk klien): builder skema, pembersih input, dan gabung dalam.
 * Dipakai Meja Sambutan dan Ruang Kompas (Visi & Misi). Server selalu menjalankan `clean`.
 */

export const s = (max = 300, re) => ({ t: "s", max, re });
export const url = { t: "url" };
export const b = { t: "b" };
export const n = (min, max) => ({ t: "n", min, max });
/** Angka kelipatan 0,5 (mis. jam 07.30 = 7.5). */
export const half = (min, max) => ({ t: "h", min, max });
export const e = (opts) => ({ t: "e", opts });
export const l = (item, max = 20) => ({ t: "l", item, max });
export const o = (fields) => ({ t: "o", fields });
export const path = { t: "path" };
export const viewBox = { t: "vb" };

const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
const PATH_RE = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/;
const VB_RE = /^-?\d+(\.\d+)?(\s+-?\d+(\.\d+)?){3}$/;

export const isSafeUrl = (v) => typeof v === "string" && (v === "" || SAFE_URL.test(v.trim()));

/** Bersihkan nilai sesuai bentuk; kunci tak dikenal dibuang, nilai buruk → undefined (pakai default). */
export function clean(spec, v) {
  switch (spec.t) {
    case "s": {
      if (typeof v !== "string") return undefined;
      const out = v.replace(/\r\n/g, "\n").slice(0, spec.max);
      return spec.re && !spec.re.test(out) ? undefined : out;
    }
    case "url":
      if (typeof v !== "string") return undefined;
      return isSafeUrl(v) ? v.trim().slice(0, 500) : undefined;
    case "b":
      return typeof v === "boolean" ? v : undefined;
    case "n": {
      const x = Number(v);
      return Number.isFinite(x) ? Math.min(spec.max, Math.max(spec.min, Math.round(x))) : undefined;
    }
    case "h": {
      const x = Number(v);
      return Number.isFinite(x) ? Math.min(spec.max, Math.max(spec.min, Math.round(x * 2) / 2)) : undefined;
    }
    case "e":
      return spec.opts.includes(v) ? v : undefined;
    case "path":
      return typeof v === "string" && v.length <= 8000 && PATH_RE.test(v) ? v.trim() : undefined;
    case "vb":
      return typeof v === "string" && VB_RE.test(v.trim()) ? v.trim() : undefined;
    case "l":
      if (!Array.isArray(v)) return undefined;
      return v
        .slice(0, spec.max)
        .map((x) => clean(spec.item, x))
        .filter((x) => x !== undefined);
    case "o": {
      if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
      const out = {};
      for (const [k, f] of Object.entries(spec.fields)) {
        if (!(k in v)) continue;
        const c = clean(f, v[k]);
        if (c !== undefined) out[k] = c;
      }
      return out;
    }
    default:
      return undefined;
  }
}

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

/** Gabung dalam: objek per kunci, array & primitif menimpa utuh. */
export function deepMerge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k], v) : v;
  return out;
}

export const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
