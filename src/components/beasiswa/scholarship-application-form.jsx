"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const INITIAL = { applicantType: "", name: "", email: "", phone: "", nim: "", semester: "", ipk: "", income: "", school: "", graduationYear: "", reportScore: "", admissionStatus: "", notes: "", website: "" };

export function ScholarshipApplicationForm({ scholarship, onBack }) {
  const [values, setValues] = useState(INITIAL);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const candidate = values.applicantType === "Calon mahasiswa";
  const submit = async (event) => {
    event.preventDefault();
    setState("loading");
    setErrors({});
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => body.append(key, value));
    body.append("scholarshipSlug", scholarship.slug);
    body.append("scholarshipName", scholarship.name);
    files.forEach((file) => body.append("documents", file));
    try {
      const response = await fetch("/api/scholarship-applications", { method: "POST", body });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setErrors(json.errors ?? { form: json.error ?? "Pendaftaran belum bisa disimpan." });
        setState("idle");
        return;
      }
      setState("success");
    } catch {
      setErrors({ form: "Koneksi bermasalah. Coba lagi." });
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <div className="space-y-4 py-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <p className="font-semibold">Pendaftaran beasiswa tersimpan.</p>
          <p className="mt-1 text-sm text-emerald-800/80">Admin akan memeriksa data dan menghubungi kamu melalui kontak yang dicantumkan.</p>
        </div>
        <Button type="button" variant="outline" onClick={onBack}>Kembali ke detail</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 py-2">
      <div>
        <p className="kicker text-[10px] text-maroon">Form pendaftaran beasiswa</p>
        <h3 className="mt-1 font-serif text-2xl text-navy">{scholarship.name}</h3>
        <p className="mt-1 text-sm text-text/60">Data dan berkas dikirim ke admin untuk diverifikasi.</p>
      </div>
      {errors.form && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
      <label className="block space-y-1.5 text-sm font-medium text-navy">Status pendaftar
        <select value={values.applicantType} onChange={(e) => update("applicantType", e.target.value)} className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-normal">
          <option value="">Pilih status</option><option>Mahasiswa aktif</option><option>Calon mahasiswa</option>
        </select>
        {errors.applicantType && <span className="block text-xs font-normal text-red-600">{errors.applicantType}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Nama lengkap", "text"], ["email", "Email", "email"], ["phone", "WhatsApp / nomor HP", "tel"],
        ].map(([key, label, type]) => <label key={key} className="space-y-1.5 text-sm font-medium text-navy">{label}<input type={type} value={values[key]} onChange={(e) => update(key, e.target.value)} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" />{errors[key] && <span className="block text-xs font-normal text-red-600">{errors[key]}</span>}</label>)}
        {!candidate && <label className="space-y-1.5 text-sm font-medium text-navy">NIM<input value={values.nim} onChange={(e) => update("nim", e.target.value)} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" />{errors.nim && <span className="block text-xs font-normal text-red-600">{errors.nim}</span>}</label>}
        {candidate ? <>
          {[
            ["school", "Asal sekolah"], ["graduationYear", "Tahun lulus / kelas terakhir"], ["reportScore", "Nilai rata-rata rapor"], ["income", "Penghasilan orang tua"], ["admissionStatus", "Status diterima di UISI"],
          ].map(([key, label]) => <label key={key} className="space-y-1.5 text-sm font-medium text-navy">{label}<input value={values[key]} onChange={(e) => update(key, e.target.value)} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" /></label>)}
        </> : <>
          {[
            ["semester", "Semester"], ["ipk", "IPK"], ["income", "Penghasilan orang tua"],
          ].map(([key, label]) => <label key={key} className="space-y-1.5 text-sm font-medium text-navy">{label}<input value={values[key]} onChange={(e) => update(key, e.target.value)} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" /></label>)}
        </>}
        <label className="space-y-1.5 text-sm font-medium text-navy sm:col-span-2">Alasan mendaftar / catatan<textarea rows={3} value={values.notes} onChange={(e) => update("notes", e.target.value)} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" /></label>
        <label className="space-y-1.5 text-sm font-medium text-navy sm:col-span-2">Berkas persyaratan <span className="font-normal text-text/55">(PDF, JPG, PNG; maksimal 10 MB per berkas)</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="block w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal" /></label>
        <input aria-hidden tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} className="absolute -left-[9999px]" />
      </div>
      <div className="flex flex-wrap justify-between gap-3 pt-2"><Button type="button" variant="outline" onClick={onBack}>Kembali</Button><Button type="submit" variant="brand" loading={state === "loading"}>Kirim pendaftaran</Button></div>
    </form>
  );
}
