"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STATUSES = [["", "Semua"], ["baru", "Baru"], ["diverifikasi", "Diverifikasi"], ["dihubungi", "Dihubungi"], ["selesai", "Selesai"], ["ditolak", "Ditolak"]];
const stamp = (value) => new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
const documentsOf = (value) => {
  try { return value ? JSON.parse(value) : []; } catch { return []; }
};

export default function ScholarshipApplicationsPage() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState({ status: "baru", note: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const active = useMemo(() => rows.find((row) => row.id === activeId) ?? null, [rows, activeId]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...(status ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) });
      const response = await fetch(`/api/scholarship-applications?${params}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal memuat pendaftar.");
      setRows(json.data); setCounts(json.counts || {}); setError("");
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [q, status]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (active) setDraft({ status: active.status, note: active.staffNote || "" }); }, [active]);
  const save = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/scholarship-applications/${active.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal menyimpan.");
      setRows((current) => current.map((row) => (row.id === active.id ? json.data : row)));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const openDocument = async (index) => {
    const response = await fetch(`/api/registration-documents/${active.id}?target=scholarship&index=${index}`);
    const json = await response.json();
    if (!response.ok || !json.success) {
      setError(json.error || "Berkas belum bisa dibuka.");
      return;
    }
    window.open(json.signedURL, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-maroon">Beasiswa</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Pendaftar Beasiswa</h1><p className="mt-1 text-sm text-gray-500">Tinjau data dan berkas pendaftar dari form website.</p></div><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, beasiswa" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-72" /></header>
      <div className="flex flex-wrap gap-2">{STATUSES.map(([key, label]) => <button key={key} type="button" onClick={() => setStatus(key)} className={`rounded-full border px-3 py-1.5 text-sm ${status === key ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"}`}>{label} <span className="ml-1 opacity-60">{key ? counts[key] || 0 : Object.values(counts).reduce((a, b) => a + b, 0)}</span></button>)}</div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]"><div className="overflow-hidden rounded-xl border border-gray-200 bg-white">{loading ? <p className="p-8 text-center text-sm text-gray-500">Memuat pendaftar…</p> : rows.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">Belum ada pendaftar.</p> : <ul className="divide-y divide-gray-100">{rows.map((row) => <li key={row.id}><button type="button" onClick={() => setActiveId(row.id)} className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${activeId === row.id ? "bg-gray-50" : ""}`}><p className="truncate text-sm font-semibold text-gray-900">{row.scholarshipName}</p><p className="truncate text-xs text-gray-500">{row.name} · {row.applicantType}</p><p className="mt-1 text-[11px] text-gray-400">{stamp(row.createdAt)} · {row.status}</p></button></li>)}</ul>}</div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">{!active ? <p className="py-10 text-center text-sm text-gray-500">Pilih pendaftar untuk melihat detail.</p> : <div className="space-y-5"><div><p className="text-xs uppercase tracking-wider text-gray-400">Beasiswa</p><h2 className="mt-1 text-xl font-semibold text-gray-900">{active.scholarshipName}</h2></div><dl className="grid gap-3 text-sm sm:grid-cols-2">{[["Nama", active.name], ["Status pendaftar", active.applicantType], ["Email", active.email], ["WhatsApp", active.phone], ["NIM", active.nim || "—"], ["Semester", active.semester || "—"], ["IPK", active.ipk || "—"], ["Asal sekolah", active.school || "—"]].map(([label, value]) => <div key={label}><dt className="text-gray-400">{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl>{documentsOf(active.documents).length > 0 && <div><p className="text-sm font-medium text-gray-700">Berkas</p><div className="mt-2 flex flex-wrap gap-2">{documentsOf(active.documents).map((document, index) => <button key={`${document.path}-${index}`} type="button" onClick={() => openDocument(index)} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-gray-50">{document.name || `Berkas ${index + 1}`}</button>)}</div></div>}<p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{active.notes || "Tidak ada catatan."}</p><label className="block text-sm font-medium text-gray-700">Status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{STATUSES.slice(1).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Catatan admin<textarea rows={3} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label><button type="button" onClick={save} disabled={saving} className="rounded-lg bg-maroon px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Menyimpan…" : "Simpan perubahan"}</button></div>}</div>
      </div>
    </div>
  );
}
