"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_STATUSES, SERVICES, fmtStamp, statusOf } from "@/lib/layanan-content";
import { useToast } from "@/components/ui/toast";
import { Skeleton, Spinner } from "@/components/ui/loader";

const TONE = {
  diterima: "bg-gray-100 text-gray-700",
  diverifikasi: "bg-sky-100 text-sky-800",
  diproses: "bg-amber-100 text-amber-800",
  siap: "bg-emerald-100 text-emerald-800",
  selesai: "bg-emerald-50 text-emerald-700",
  "perlu-perbaikan": "bg-orange-100 text-orange-800",
  ditolak: "bg-red-100 text-red-700",
};
const serviceTitle = (key) => SERVICES.find((s) => s.key === key)?.title ?? key;
const fieldLabel = (serviceKey, name) => SERVICES.find((s) => s.key === serviceKey)?.fields.find((f) => f.name === name)?.label ?? name;
const parse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
};

/** Kotak masuk pengajuan layanan akademik dari /layanan-akademik. */
export default function LayananInbox() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState({ status: "", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (query) params.set("q", query);
      const res = await fetch(`/api/layanan/admin?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat");
      setRows(json.data);
      setCounts(json.counts || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    load();
  }, [load]);

  const active = useMemo(() => rows.find((r) => r.id === activeId) ?? null, [rows, activeId]);
  useEffect(() => {
    if (active) setDraft({ status: active.status, note: "" });
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const save = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/layanan/admin/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal menyimpan");
      setRows((rs) => rs.map((r) => (r.id === active.id ? json.data : r)));
      setDraft({ status: json.data.status, note: "" });
      toast.success("Status diperbarui", { description: `${json.data.code} → ${statusOf(json.data.status).label}` });
      load();
    } catch (e) {
      toast.error("Gagal menyimpan", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const needsNote = ["perlu-perbaikan", "ditolak"].includes(draft.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kotak Masuk Layanan</h1>
          <p className="text-sm text-gray-500">Pengajuan dari halaman /layanan-akademik. Setiap perubahan status tampil di pelacak mahasiswa.</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, NIM, atau kode" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-72" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ key: "", label: "Semua" }, ...ALL_STATUSES].map((s) => (
          <button
            key={s.key || "all"}
            type="button"
            onClick={() => setStatus(s.key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${status === s.key ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}
          >
            {s.label}
            <span className="ml-1.5 tabular-nums opacity-60">{s.key ? counts[s.key] ?? 0 : total}</span>
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">Belum ada pengajuan{status ? " dengan status ini" : ""}.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => setActiveId(r.id)} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${activeId === r.id ? "bg-gray-50" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{serviceTitle(r.serviceKey)}</p>
                      <p className="truncate text-xs text-gray-500">
                        {r.name} · {r.nim} · <span className="font-mono">{r.code}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${TONE[r.status] ?? TONE.diterima}`}>{statusOf(r.status).label}</span>
                      <span className="text-[11px] text-gray-400">{fmtStamp(r.createdAt)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          {!active ? (
            <p className="py-10 text-center text-sm text-gray-500">Pilih pengajuan untuk melihat detail.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="font-mono text-xs text-gray-500">{active.code}</p>
                <h2 className="text-lg font-semibold text-gray-900">{serviceTitle(active.serviceKey)}</h2>
                <p className="text-sm text-gray-600">
                  {active.name} · NIM {active.nim}
                </p>
                <p className="text-sm text-gray-600">
                  <a href={`mailto:${active.email}`} className="text-red-600 underline">{active.email}</a>
                  {active.phone && <> · {active.phone}</>}
                </p>
              </div>

              <dl className="divide-y divide-gray-100 rounded-lg border border-gray-100 text-sm">
                {Object.entries(parse(active.fields)).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2">
                    <dt className="text-gray-500">{fieldLabel(active.serviceKey, k)}</dt>
                    <dd className="whitespace-pre-line break-words text-gray-900">{v}</dd>
                  </div>
                ))}
                {active.attachment && (
                  <div className="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2">
                    <dt className="text-gray-500">Berkas</dt>
                    <dd className="break-all">
                      <a href={active.attachment} target="_blank" rel="noreferrer noopener" className="text-red-600 underline">
                        {active.attachment}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <label className="block text-sm font-medium text-gray-700">
                  Ubah status
                  <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    {ALL_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Catatan untuk mahasiswa {needsNote ? <span className="text-red-600">(wajib)</span> : "(opsional)"}
                  <textarea rows={3} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" placeholder={needsNote ? "Mis. Lampirkan KRS yang sudah disetujui dosen wali." : "Mis. Surat sudah dikirim ke email."} />
                </label>
                <button type="button" onClick={save} disabled={saving || (needsNote && !draft.note.trim())} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                  {saving && <Spinner className="size-4" />}
                  Simpan status
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">Riwayat</h3>
                <ol className="mt-2 space-y-2 border-l border-gray-200 pl-4">
                  {active.events.map((e) => (
                    <li key={e.id} className="text-sm">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${TONE[e.status] ?? TONE.diterima}`}>{statusOf(e.status).label}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {fmtStamp(e.createdAt)}
                        {e.by && ` · ${e.by}`}
                      </span>
                      {e.note && <p className="mt-1 text-gray-600">{e.note}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
