"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const EMPTY = {};

export function FlexibleRegistrationForm({ title, targetSlug, targetType, fields = [], endpoint, onBack }) {
  const [values, setValues] = useState(EMPTY);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    for (const field of fields) {
      if (field.required && !values[field.key] && field.type !== "file") nextErrors[field.key] = field.type === "checkbox" ? "Persetujuan wajib dicentang." : "Wajib diisi.";
      if (field.required && field.type === "file" && !files[field.key]?.length) nextErrors[field.key] = "Wajib diunggah.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setState("loading");
    setErrors({});
    const body = new FormData();
    body.append("targetType", targetType);
    body.append("targetSlug", targetSlug);
    body.append("targetTitle", title);
    body.append("answers", JSON.stringify(values));
    for (const key of ["name", "email", "phone", "nim", "audience"]) {
      if (values[key] != null) body.append(key, values[key]);
    }
    if (targetType === "course" || targetType === "cohort") {
      body.append("courseSlug", targetSlug);
      body.append("courseTitle", title);
    } else {
      body.append("scholarshipSlug", targetSlug);
      body.append("scholarshipName", title);
    }
    Object.entries(files).forEach(([key, list]) => list.forEach((file) => body.append(`documents_${key}`, file)));
    try {
      const response = await fetch(endpoint, { method: "POST", body });
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
          <p className="font-semibold">Pendaftaran tersimpan.</p>
          <p className="mt-1 text-sm text-emerald-800/80">Admin akan memeriksa data dan menghubungi kamu melalui kontak yang dicantumkan.</p>
        </div>
        <Button type="button" variant="outline" onClick={onBack}>Kembali</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 py-2">
      <div>
        <p className="kicker text-[10px] text-maroon">Form pendaftaran</p>
        <h3 className="mt-1 font-serif text-2xl text-navy">{title}</h3>
        <p className="mt-1 text-sm text-text/60">Isi pertanyaan berikut sesuai kebutuhan pendaftaran.</p>
      </div>
      {errors.form && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const common = { value: values[field.key] || "", onChange: (event) => set(field.key, event.target.value), placeholder: field.placeholder || "" };
          const isCheckbox = field.type === "checkbox";
          return (
            <label key={field.key} className={`space-y-1.5 text-sm font-medium text-navy ${field.type === "textarea" || field.type === "file" ? "sm:col-span-2" : ""}`}>
              {field.label}{field.required && <span className="text-maroon"> *</span>}
              {isCheckbox ? <input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => set(field.key, event.target.checked)} className="mr-2 align-middle accent-maroon" /> : field.type === "textarea" ? <textarea {...common} rows={4} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" /> : field.type === "select" ? <select {...common} className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-normal"><option value="">Pilih jawaban</option>{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select> : field.type === "file" ? <input type="file" multiple accept={field.accept || ".pdf,.jpg,.jpeg,.png"} onChange={(event) => setFiles((current) => ({ ...current, [field.key]: Array.from(event.target.files || []) }))} className="block w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal" /> : <input {...common} type={field.type || "text"} className="w-full rounded-md border border-line px-3 py-2.5 font-normal" />}
              {errors[field.key] && <span className="block text-xs font-normal text-red-600">{errors[field.key]}</span>}
            </label>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-between gap-3"><Button type="button" variant="outline" onClick={onBack}>Kembali</Button><Button type="submit" variant="brand" loading={state === "loading"}>Kirim pendaftaran</Button></div>
    </form>
  );
}
