/**
 * Utilitas server untuk pengajuan layanan akademik (dipakai hanya di route API).
 * Validasi manual tanpa dependensi, kode tiket acak, dan pembatas laju sederhana di memori.
 */
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ALL_STATUSES, estimateReady, mergeLayanan } from "@/lib/layanan-content";

// tanpa huruf/angka yang mudah tertukar (0/O, 1/I/L)
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function makeCode(now = new Date()) {
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const tail = Array.from(randomBytes(4), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `LA-${yymm}-${tail}`;
}

export const normalizeCode = (v) =>
  String(v ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^LA(\d{4})([A-Z0-9]{4})$/, "LA-$1-$2");
export const normalizeNim = (v) => String(v ?? "").replace(/\D/g, "");

export const noStore = (body, init = {}) =>
  NextResponse.json(body, { ...init, headers: { "Cache-Control": "no-store", ...(init.headers ?? {}) } });

/** Pembatas laju per kunci (IP + rute). Cukup untuk satu instans; di serverless tiap instans punya hitungan sendiri. */
const buckets = new Map();
export function rateLimit(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return { ok: true };
}

export const clientIp = (request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";

export async function loadServices() {
  try {
    const row = await prisma.pageContent.findUnique({ where: { section: "layanan-akademik" } });
    return mergeLayanan(row?.isActive ? row : null);
  } catch {
    return mergeLayanan(null);
  }
}

const clip = (v, max) => String(v ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validasi isi pengajuan. Mengembalikan { errors } atau { value, service }. */
export function validateSubmission(body, services) {
  const errors = {};
  const service = services.find((s) => s.key === body?.serviceKey);
  if (!service) errors.serviceKey = "Pilih layanan yang tersedia.";

  const name = clip(body?.name, 120);
  const nim = normalizeNim(body?.nim);
  const email = clip(body?.email, 160).toLowerCase();
  const phone = clip(body?.phone, 20).replace(/[^\d+]/g, "");
  const attachment = clip(body?.attachment, 500);

  if (name.length < 3) errors.name = "Tulis nama lengkap sesuai KTM.";
  if (nim.length < 8 || nim.length > 12) errors.nim = "NIM terdiri dari 8–12 angka.";
  if (!EMAIL.test(email)) errors.email = "Alamat email belum benar.";
  if (phone && (phone.length < 9 || phone.length > 16)) errors.phone = "Nomor WhatsApp belum benar.";
  if (attachment && !/^https?:\/\//i.test(attachment)) errors.attachment = "Tautan berkas harus diawali http:// atau https://.";

  const fields = {};
  for (const f of service?.fields ?? []) {
    const v = clip(body?.fields?.[f.name], f.type === "textarea" ? 1500 : 200);
    if (f.required && !v) errors[`fields.${f.name}`] = `${f.label} wajib diisi.`;
    else if (f.options && v && !f.options.includes(v)) errors[`fields.${f.name}`] = `Pilih salah satu opsi ${f.label.toLowerCase()}.`;
    else if (v) fields[f.name] = v;
  }

  if (Object.keys(errors).length) return { errors };
  return { value: { serviceKey: service.key, name, nim, email, phone: phone || null, attachment: attachment || null, fields }, service };
}

export const isStatus = (s) => ALL_STATUSES.some((x) => x.key === s);

export function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

const NEEDS_ACTION = ["perlu-perbaikan", "ditolak"];

/** Bentuk respons pelacak: tanpa email/telepon, nama belakang disingkat. */
export function publicView(req, data) {
  const service = data.services.find((s) => s.key === req.serviceKey);
  const mask = (n) =>
    n
      .split(/\s+/)
      .map((w, i) => (i === 0 ? w : `${w[0]}.`))
      .join(" ");
  const flagged = NEEDS_ACTION.includes(req.status);
  return {
    code: req.code,
    service: service
      ? { key: service.key, title: service.title, channel: service.channel, output: service.output }
      : { key: req.serviceKey, title: req.serviceKey },
    name: mask(req.name),
    status: req.status,
    staffNote: flagged ? req.staffNote : null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    estimate: service ? estimateReady(service.sla, new Date(req.createdAt), data.hours) : null,
    events: req.events.map((e) => ({ status: e.status, note: e.note, at: e.createdAt })),
    // untuk "Ajukan ulang": isian khusus lama (tanpa data pribadi)
    fields: flagged ? safeJson(req.fields) : null,
    attachment: flagged ? req.attachment : null,
  };
}
