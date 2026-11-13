"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, MODES, fmtDate, fmtTime, readMinutes, slugify } from "@/lib/berita-content";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/modal";
import { Skeleton, Spinner } from "@/components/ui/loader";
import { Prose } from "@/components/berita/prose";

const TABS = [
  { key: "berita", label: "Berita", kind: "post" },
  { key: "artikel", label: "Artikel", kind: "post" },
  { key: "agenda", label: "Agenda", kind: "event" },
];

/** Date → nilai <input type="datetime-local"> (waktu lokal peramban admin). */
const toLocal = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const EMPTY = {
  post: (type) => ({ type, title: "", slug: "", excerpt: "", content: "", cover: "", category: CATEGORIES[type][0], author: "", authorRole: "", featured: false, status: "draf", publishedAt: "" }),
  event: () => ({ title: "", slug: "", summary: "", content: "", category: CATEGORIES.agenda[0], startAt: "", endAt: "", place: "", mode: "luring", link: "", registerUrl: "", cover: "", status: "terbit" }),
};

const field = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20";

function Field({ label, error, hint, children }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-gray-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

/** Admin › Warta: berita, artikel (Markdown), dan agenda untuk /berita. */
export default function WartaAdmin() {
  const toast = useToast();
  const [tab, setTab] = useState("berita");
  const kind = TABS.find((t) => t.key === tab).kind;
  const [rows, setRows] = useState({ post: [], event: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, e] = await Promise.all(["post", "event"].map((k) => fetch(`/api/warta/${k}`, { cache: "no-store" }).then((r) => r.json())));
      if (!p.success) throw new Error(p.error);
      if (!e.success) throw new Error(e.error);
      setRows({ post: p.data, event: e.data });
    } catch (err) {
      setError(err.message || "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = useMemo(() => {
    const base = kind === "post" ? rows.post.filter((r) => r.type === tab) : rows.event;
    const s = q.trim().toLowerCase();
    return s ? base.filter((r) => `${r.title} ${r.category} ${r.author ?? ""} ${r.place ?? ""}`.toLowerCase().includes(s)) : base;
  }, [rows, tab, kind, q]);

  const counts = {
    berita: rows.post.filter((r) => r.type === "berita").length,
    artikel: rows.post.filter((r) => r.type === "artikel").length,
    agenda: rows.event.length,
  };

  const open = (row) => {
    setErrors({});
    setPreview(false);
    if (!row) return setDraft({ ...EMPTY[kind](tab), id: null });
    setDraft({
      ...EMPTY[kind](tab),
      ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? ""])),
      publishedAt: toLocal(row.publishedAt),
      startAt: toLocal(row.startAt),
      endAt: toLocal(row.endAt),
    });
  };

  const set = (k) => (e) => {
    const v = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setDraft((d) => ({ ...d, [k]: v, ...(k === "title" && !d.id && !d.slugTouched ? { slug: slugify(v) } : {}), ...(k === "slug" ? { slugTouched: true } : {}) }));
  };

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Berkas harus gambar");
    if (file.size > 4 * 1024 * 1024) return toast.error("Gambar maksimal 4 MB");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "warta");
      const json = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
      if (!json.success) throw new Error(json.error);
      setDraft((d) => ({ ...d, cover: json.url }));
      toast.success("Sampul diunggah");
    } catch (e) {
      toast.error("Gagal mengunggah", { description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setErrors({});
    const { id, slugTouched, createdAt, updatedAt, ...body } = draft;
    for (const k of ["publishedAt", "startAt", "endAt"]) if (body[k]) body[k] = new Date(body[k]).toISOString();
    try {
      const res = await fetch(id ? `/api/warta/${kind}/${id}` : `/api/warta/${kind}`, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setErrors(json.errors ?? {});
        throw new Error(json.error);
      }
      toast.success(id ? "Perubahan disimpan" : "Tersimpan", {
        description: body.status === "terbit" ? "Tampil di /berita dalam beberapa saat." : "Masih draf, belum tampil di situs.",
      });
      await load();
      open(json.data);
    } catch (e) {
      toast.error("Gagal menyimpan", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const json = await fetch(`/api/warta/${confirm.kind}/${confirm.id}`, { method: "DELETE" }).then((r) => r.json());
      if (!json.success) throw new Error(json.error);
      toast.success("Dihapus");
      setConfirm(null);
      if (draft?.id === confirm.id) setDraft(null);
      load();
    } catch (e) {
      toast.error("Gagal menghapus", { description: e.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warta SISFOR</h1>
          <p className="text-sm text-gray-500">
            Berita, artikel, dan agenda untuk halaman <a href="/berita" target="_blank" rel="noreferrer" className="text-red-600 underline">/berita</a>. Selama kosong, situs menampilkan contoh.
          </p>
        </div>
        <button type="button" onClick={() => open(null)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          + {tab === "agenda" ? "Agenda" : tab === "artikel" ? "Artikel" : "Berita"} baru
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setDraft(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.key ? "bg-gray-900 text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"}`}
          >
            {t.label} <span className="ml-1 text-xs opacity-60">{counts[t.key]}</span>
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul, kategori, penulis…" className="ml-auto w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm sm:w-64" />
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <div className="rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !list.length ? (
            <p className="p-10 text-center text-sm text-gray-500">Belum ada {tab}. Klik tombol di kanan atas untuk menambah.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {list.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => open(r)} className={`flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 ${draft?.id === r.id ? "bg-red-50/60" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{r.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {r.category} · {kind === "post" ? (r.publishedAt ? fmtDate(r.publishedAt) : "belum dijadwalkan") : `${fmtDate(r.startAt)} ${fmtTime(r.startAt)} WIB`}
                        {r.featured && " · Pilihan"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${r.status === "terbit" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{r.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          {!draft ? (
            <p className="py-16 text-center text-sm text-gray-500">Pilih item atau buat yang baru.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{draft.id ? "Ubah" : "Baru"}</h2>
                {draft.id && (
                  <button type="button" onClick={() => setConfirm({ kind, id: draft.id, title: draft.title })} className="text-sm font-medium text-red-600 hover:underline">
                    Hapus
                  </button>
                )}
              </div>

              <Field label="Judul" error={errors.title}>
                <input value={draft.title} onChange={set("title")} className={field} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug (alamat)" error={errors.slug} hint={`/berita/${draft.slug || "…"}`}>
                  <input value={draft.slug} onChange={set("slug")} className={field} />
                </Field>
                <Field label="Kategori">
                  <input list={`cat-${tab}`} value={draft.category} onChange={set("category")} className={field} />
                  <datalist id={`cat-${tab}`}>
                    {CATEGORIES[tab].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
              </div>

              {kind === "event" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Mulai" error={errors.startAt}>
                      <input type="datetime-local" value={draft.startAt} onChange={set("startAt")} className={field} />
                    </Field>
                    <Field label="Selesai (opsional)" error={errors.endAt}>
                      <input type="datetime-local" value={draft.endAt} onChange={set("endAt")} className={field} />
                    </Field>
                    <Field label="Tempat" error={errors.place}>
                      <input value={draft.place} onChange={set("place")} placeholder="Auditorium UISI / Zoom" className={field} />
                    </Field>
                    <Field label="Mode">
                      <select value={draft.mode} onChange={set("mode")} className={field}>
                        {Object.entries(MODES).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tautan daring (opsional)" hint="URL Zoom/YouTube">
                      <input value={draft.link} onChange={set("link")} className={field} />
                    </Field>
                    <Field label="Tautan pendaftaran (opsional)">
                      <input value={draft.registerUrl} onChange={set("registerUrl")} className={field} />
                    </Field>
                  </div>
                  <Field label="Ringkasan" hint="Satu kalimat untuk kalender & brosur">
                    <textarea rows={2} value={draft.summary} onChange={set("summary")} className={field} />
                  </Field>
                  <Field label="Keterangan lengkap (opsional)">
                    <textarea rows={4} value={draft.content} onChange={set("content")} className={field} />
                  </Field>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Penulis" hint="Nama dosen akan otomatis memakai fotonya">
                      <input value={draft.author} onChange={set("author")} placeholder="Redaksi Warta SISFOR" className={field} />
                    </Field>
                    <Field label="Jabatan penulis (opsional)">
                      <input value={draft.authorRole} onChange={set("authorRole")} className={field} />
                    </Field>
                    <Field label="Tanggal terbit" hint="Kosong = saat diterbitkan">
                      <input type="datetime-local" value={draft.publishedAt} onChange={set("publishedAt")} className={field} />
                    </Field>
                    <label className="mt-6 flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={!!draft.featured} onChange={set("featured")} className="size-4 accent-red-600" />
                      {tab === "berita" ? "Jadikan berita utama halaman depan" : "Masukkan ke Pilihan Redaksi"}
                    </label>
                  </div>
                  <Field label="Ringkasan (opsional)" hint="Kosong = paragraf pertama">
                    <textarea rows={2} value={draft.excerpt} onChange={set("excerpt")} className={field} />
                  </Field>
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>
                        Isi (Markdown) <span className="font-normal text-gray-400">· ± {readMinutes(draft.content)} menit baca</span>
                      </span>
                      <button type="button" onClick={() => setPreview((v) => !v)} className="text-xs font-semibold text-red-600">
                        {preview ? "Tulis" : "Pratinjau"}
                      </button>
                    </div>
                    {preview ? (
                      <div className="kampus mt-1 max-h-[480px] overflow-y-auto rounded-lg border border-gray-200 p-5">
                        <Prose content={draft.content} />
                      </div>
                    ) : (
                      <textarea rows={14} value={draft.content} onChange={set("content")} className={`${field} font-mono`} placeholder={"Paragraf pembuka…\n\n## Subjudul\n\n> Kutipan penting\n\n- butir daftar\n\n![Keterangan foto](/warta/foto.jpg)"} />
                    )}
                    {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
                  </div>
                </>
              )}

              <Field label="Sampul (opsional)">
                <div className="mt-1 flex items-center gap-3">
                  {draft.cover && <img src={draft.cover} alt="" className="h-14 w-20 rounded object-cover" />}
                  <input value={draft.cover} onChange={set("cover")} placeholder="/warta/foto.jpg" className={`${field} mt-0`} />
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                    {uploading && <Spinner className="size-4" />}
                    Unggah
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
                  </label>
                </div>
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <select value={draft.status} onChange={set("status")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="draf">Draf</option>
                  <option value="terbit">Terbit</option>
                </select>
                <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                  {saving && <Spinner className="size-4" />}
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title="Hapus permanen?"
        description={confirm ? `"${confirm.title}" akan dihapus dari situs dan tidak bisa dikembalikan.` : ""}
        confirmLabel="Hapus"
        destructive
        loading={deleting}
        onConfirm={remove}
      />
    </div>
  );
}
