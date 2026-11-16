"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const INITIAL = { name: "", email: "", phone: "", nim: "", audience: "", website: "" };

export function CourseRegistrationForm({ course, whatsapp, onBack }) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setState("loading");
    setErrors({});
    try {
      const response = await fetch("/api/course-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, courseSlug: course.slug, courseTitle: course.title }),
      });
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
    const message = `Halo, saya sudah mendaftar course ${course.title}. Nama: ${values.name}. Email: ${values.email}.`;
    const href = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : "/kontak";
    return (
      <div className="space-y-5 py-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <p className="font-semibold">Pendaftaran tersimpan.</p>
          <p className="mt-1 text-sm text-emerald-800/80">Admin akan menghubungi kamu melalui nomor atau email yang dicantumkan.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={href} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined} className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm font-semibold text-white hover:bg-maroon-deep">
            {whatsapp ? "Konfirmasi via WhatsApp" : "Hubungi admin"}
          </a>
          <Button type="button" variant="outline" onClick={onBack}>Kembali ke detail</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 py-2">
      <div>
        <p className="kicker text-[10px] text-maroon">Pendaftaran course</p>
        <h3 className="mt-1 font-serif text-2xl text-navy">{course.title}</h3>
        <p className="mt-1 text-sm text-text/60">Isi data berikut agar admin bisa menindaklanjuti pendaftaranmu.</p>
      </div>
      {errors.form && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Nama lengkap", "text", "contoh: Ahmad Fauzi"],
          ["email", "Email", "email", "nama@email.com"],
          ["phone", "WhatsApp / nomor HP", "tel", "08xxxxxxxxxx"],
        ].map(([key, label, type, placeholder]) => (
          <label key={key} className="space-y-1.5 text-sm font-medium text-navy">
            {label}
            <input type={type} value={values[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-normal outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10" />
            {errors[key] && <span className="block text-xs font-normal text-red-600">{errors[key]}</span>}
          </label>
        ))}
        <label className="space-y-1.5 text-sm font-medium text-navy sm:col-span-2">
          Kategori pendaftar
          <select value={values.audience} onChange={(e) => update("audience", e.target.value)} className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-normal outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10">
            <option value="">Pilih kategori</option>
            {["Mahasiswa", "Calon mahasiswa", "Alumni", "Umum"].map((item) => <option key={item}>{item}</option>)}
          </select>
          {errors.audience && <span className="block text-xs font-normal text-red-600">{errors.audience}</span>}
        </label>
        {["Mahasiswa", "Alumni"].includes(values.audience) && (
          <label className="space-y-1.5 text-sm font-medium text-navy">
            NIM {values.audience === "Alumni" && <span className="font-normal text-text/55">(opsional)</span>}
            <input type="text" value={values.nim} onChange={(e) => update("nim", e.target.value)} placeholder="8–12 angka" className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-normal outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10" />
            {errors.nim && <span className="block text-xs font-normal text-red-600">{errors.nim}</span>}
          </label>
        )}
        <input aria-hidden tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} className="absolute -left-[9999px]" />
      </div>
      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>Kembali</Button>
        <Button type="submit" variant="brand" loading={state === "loading"}>Kirim pendaftaran</Button>
      </div>
    </form>
  );
}
