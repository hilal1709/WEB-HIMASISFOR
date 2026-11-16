"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOTCAMPS, COURSES } from "@/lib/bootcamp-content";
import { SCHOLARSHIPS } from "@/lib/beasiswa-content";
import { RegistrationFormBuilder, defaultRegistrationFields } from "@/components/admin/registration-form-builder";

const parse = (value) => {
  try { return value ? JSON.parse(value) : {}; } catch { return {}; }
};

export default function RegistrationFormsPage() {
  const [section, setSection] = useState("bootcamp");
  const [target, setTarget] = useState("");
  const [contents, setContents] = useState({});
  const [fields, setFields] = useState([]);
  const [mode, setMode] = useState("");
  const [href, setHref] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" }).then((response) => response.json()).then((rows) => setContents(Object.fromEntries(rows.map((row) => [row.section, row])))).catch(() => setMessage("Konten belum bisa dimuat."));
  }, []);

  const targets = useMemo(() => section === "beasiswa" ? SCHOLARSHIPS.map((item) => ({ slug: item.slug, label: item.name, kind: "beasiswa" })) : [...BOOTCAMPS.map((item) => ({ slug: item.slug, label: `Kohort · ${item.title}`, kind: "bootcamp" })), ...COURSES.map((item) => ({ slug: item.slug, label: `Course · ${item.title}`, kind: "course" }))], [section]);
  const selected = targets.find((item) => item.slug === target) || targets[0];
  const kind = selected?.kind || "course";

  useEffect(() => {
    if (!selected) return;
    setTarget(selected.slug);
    const raw = parse(contents[section]?.data);
    const listKey = section === "beasiswa" ? "items" : selected.kind === "course" ? "courses" : "bootcamps";
    const item = (raw[listKey] || []).find((entry) => entry?.slug === selected.slug) || {};
    const registration = item.registration || {};
    setMode(registration.mode || "");
    setHref(registration.href || item.href || "");
    setFields(Array.isArray(registration.fields) ? registration.fields : defaultRegistrationFields(kind));
  }, [contents, section, selected?.slug, kind]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    const current = contents[section];
    const raw = parse(current?.data);
    const listKey = section === "beasiswa" ? "items" : selected.kind === "course" ? "courses" : "bootcamps";
    const list = Array.isArray(raw[listKey]) ? raw[listKey] : [];
    const base = list.find((entry) => entry?.slug === selected.slug) || { slug: selected.slug };
    const nextItem = { ...base, registration: { mode, ...(href.trim() ? { href: href.trim() } : {}), fields } };
    const nextList = list.some((entry) => entry?.slug === selected.slug) ? list.map((entry) => (entry?.slug === selected.slug ? nextItem : entry)) : [...list, nextItem];
    const response = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, title: current?.title || (section === "beasiswa" ? "Beasiswa" : "Bootcamp & Course"), data: { ...raw, [listKey]: nextList }, isActive: true }) });
    if (!response.ok) setMessage("Gagal menyimpan konfigurasi.");
    else { setContents((currentContents) => ({ ...currentContents, [section]: { ...current, data: JSON.stringify({ ...raw, [listKey]: nextList }) } })); setMessage("Konfigurasi form tersimpan."); }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-maroon">CMS Pendaftaran</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Builder Form Pendaftaran</h1><p className="mt-1 max-w-2xl text-sm text-gray-500">Atur form kohort, course, dan beasiswa tanpa mengubah kode. Pilih link eksternal atau susun pertanyaan form website.</p></div>
      <form onSubmit={save} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">CMS halaman<select value={section} onChange={(e) => setSection(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="bootcamp">Bootcamp & Course</option><option value="beasiswa">Beasiswa</option></select></label>
          <label className="text-sm font-medium text-gray-700">Yang dikonfigurasi<select value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{targets.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Cara daftar<select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Belum dibuka</option><option value="link">Link eksternal</option><option value="form">Form website</option></select></label>
          <label className="text-sm font-medium text-gray-700">URL eksternal {mode !== "link" && <span className="font-normal text-gray-400">(opsional)</span>}<input value={href} onChange={(e) => setHref(e.target.value)} disabled={mode !== "link"} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100" placeholder="https://..." /></label>
        </div>
        {mode === "form" && <RegistrationFormBuilder kind={kind} fields={fields} onChange={setFields} />}
        {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        <button type="submit" disabled={saving || !selected} className="rounded-lg bg-maroon px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan konfigurasi form"}</button>
      </form>
    </div>
  );
}
