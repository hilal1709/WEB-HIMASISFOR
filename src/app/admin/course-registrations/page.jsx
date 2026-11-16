"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STATUSES = [
  ["", "Semua"],
  ["baru", "Baru"],
  ["dihubungi", "Dihubungi"],
  ["selesai", "Selesai"],
  ["dibatalkan", "Dibatalkan"],
];
const tone = { baru: "bg-sky-100 text-sky-800", dihubungi: "bg-amber-100 text-amber-800", selesai: "bg-emerald-100 text-emerald-800", dibatalkan: "bg-gray-100 text-gray-600" };
const stamp = (value) => new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
const documentsOf = (value) => {
  try { return value ? JSON.parse(value) : []; } catch { return []; }
};

export default function CourseRegistrationsPage() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState({ status: "baru", note: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const active = useMemo(() => rows.find((row) => row.id === activeId) ?? null, [rows, activeId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const response = await fetch(`/api/course-registrations?${params}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal memuat pendaftar.");
      setRows(json.data);
      setCounts(json.counts || {});
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (active) setDraft({ status: active.status, note: active.staffNote || "" }); }, [active]);

  const save = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/course-registrations/${active.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal menyimpan.");
      setRows((current) => current.map((row) => (row.id === active.id ? json.data : row)));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const openDocument = async (index) => {
    const response = await fetch(`/api/registration-documents/${active.id}?target=course&index=${index}`);
    const json = await response.json();
    if (!response.ok || !json.success) {
      setError(json.error || "Berkas belum bisa dibuka.");
      return;
    }
    window.open(json.signedURL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-maroon">Bootcamp & Course</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Pendaftar Course</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola pendaftar dari form internal course.</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, course" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-72" />
      </header>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(([key, label]) => <button key={key} type="button" onClick={() => setStatus(key)} className={`rounded-full border px-3 py-1.5 text-sm ${status === key ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"}`}>{label} <span className="ml-1 opacity-60">{key ? counts[key] || 0 : Object.values(counts).reduce((a, b) => a + b, 0)}</span></button>)}
      </div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? <p className="p-8 text-center text-sm text-gray-500">Memuat pendaftar…</p> : rows.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">Belum ada pendaftar.</p> : <ul className="divide-y divide-gray-100">{rows.map((row) => <li key={row.id}><button type="button" onClick={() => setActiveId(row.id)} className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${activeId === row.id ? "bg-gray-50" : ""}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-900">{row.courseTitle}</p><p className="truncate text-xs text-gray-500">{row.name} · {row.email}</p></div><span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${tone[row.status] || tone.baru}`}>{row.status}</span></div><p className="mt-1 text-[11px] text-gray-400">{stamp(row.createdAt)}</p></button></li>)}</ul>}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          {!active ? <p className="py-10 text-center text-sm text-gray-500">Pilih pendaftar untuk melihat detail.</p> : <div className="space-y-5"><div><p className="text-xs uppercase tracking-wider text-gray-400">Course</p><h2 className="mt-1 text-xl font-semibold text-gray-900">{active.courseTitle}</h2></div><dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-gray-400">Nama</dt><dd className="font-medium">{active.name}</dd></div><div><dt className="text-gray-400">Email</dt><dd className="font-medium">{active.email}</dd></div><div><dt className="text-gray-400">WhatsApp</dt><dd className="font-medium">{active.phone}</dd></div><div><dt className="text-gray-400">NIM</dt><dd className="font-medium">{active.nim || "—"}</dd></div><div><dt className="text-gray-400">Kategori</dt><dd className="font-medium">{active.audience}</dd></div><div><dt className="text-gray-400">Masuk</dt><dd className="font-medium">{stamp(active.createdAt)}</dd></div></dl>{documentsOf(active.documents).length > 0 && <div><p className="text-sm font-medium text-gray-700">Berkas</p><div className="mt-2 flex flex-wrap gap-2">{documentsOf(active.documents).map((document, index) => <button key={`${document.path}-${index}`} type="button" onClick={() => openDocument(index)} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-gray-50">{document.name || `Berkas ${index + 1}`}</button>)}</div></div>}<label className="block text-sm font-medium text-gray-700">Status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{STATUSES.slice(1).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Catatan admin<textarea rows={4} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label><button type="button" onClick={save} disabled={saving} className="rounded-lg bg-maroon px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Menyimpan…" : "Simpan perubahan"}</button></div>}
        </div>
      </div>
    </div>
  );
}
