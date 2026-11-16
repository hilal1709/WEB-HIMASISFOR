"use client";

import { useMemo } from "react";

export const FIELD_TYPES = [
  ["text", "Teks singkat"],
  ["textarea", "Paragraf"],
  ["email", "Email"],
  ["tel", "Nomor telepon"],
  ["number", "Angka"],
  ["select", "Pilihan"],
  ["checkbox", "Persetujuan"],
  ["file", "Upload berkas"],
];

export const defaultRegistrationFields = (kind) =>
  kind === "beasiswa"
    ? [
        { key: "applicantType", label: "Status pendaftar", type: "select", required: true, options: ["Mahasiswa aktif", "Calon mahasiswa"] },
        { key: "name", label: "Nama lengkap", type: "text", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "WhatsApp / nomor HP", type: "tel", required: true },
        { key: "nim", label: "NIM", type: "text", required: false },
        { key: "notes", label: "Alasan mendaftar", type: "textarea", required: true },
      ]
    : [
        { key: "name", label: "Nama lengkap", type: "text", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "WhatsApp / nomor HP", type: "tel", required: true },
        { key: "audience", label: "Kategori pendaftar", type: "select", required: true, options: ["Mahasiswa", "Calon mahasiswa", "Alumni", "Umum"] },
      ];

const makeKey = (label) =>
  String(label || "pertanyaan")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40) || `field_${Date.now()}`;

export function RegistrationFormBuilder({ kind, fields, onChange }) {
  const rows = useMemo(() => (Array.isArray(fields) ? fields : []), [fields]);
  const update = (index, patch) => onChange(rows.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  const add = () => onChange([...rows, { key: `field_${rows.length + 1}`, label: "Pertanyaan baru", type: "text", required: false }]);
  const remove = (index) => onChange(rows.filter((_, i) => i !== index));
  const reset = () => onChange(defaultRegistrationFields(kind));

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="font-semibold text-gray-800">Pertanyaan form</h4>
          <p className="text-xs text-gray-500">Susun field seperti Google Form. Field ini tampil di form publik.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700">Pakai templat</button>
          <button type="button" onClick={add} className="rounded-md bg-maroon px-3 py-2 text-xs font-semibold text-white hover:bg-maroon-deep">+ Tambah pertanyaan</button>
        </div>
      </div>
      {rows.length === 0 && <p className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">Belum ada pertanyaan. Tambahkan field atau gunakan templat.</p>}
      {rows.map((field, index) => (
        <div key={`${field.key}-${index}`} className="grid gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-[1.2fr_1fr_1.2fr_auto] sm:items-end">
          <label className="text-xs font-medium text-gray-600">Pertanyaan
            <input value={field.label || ""} onChange={(e) => update(index, { label: e.target.value, key: field.key || makeKey(e.target.value) })} className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-gray-600">Tipe
            <select value={field.type || "text"} onChange={(e) => update(index, { type: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm">
              {FIELD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">Pilihan / petunjuk
            <input value={Array.isArray(field.options) ? field.options.join(", ") : field.placeholder || ""} onChange={(e) => update(index, field.type === "select" ? { options: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) } : { placeholder: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm" placeholder={field.type === "select" ? "Mahasiswa, Alumni, Umum" : "Petunjuk pengisian"} />
          </label>
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-600"><input type="checkbox" checked={Boolean(field.required)} onChange={(e) => update(index, { required: e.target.checked })} /> Wajib</label>
            <button type="button" onClick={() => remove(index)} aria-label={`Hapus ${field.label || "pertanyaan"}`} className="rounded-md px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Hapus</button>
          </div>
        </div>
      ))}
    </div>
  );
}
