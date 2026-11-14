"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PROGRAMS as KONVERSI_PROGRAMS, DOCS as KONVERSI_DOCS, RATE as KONVERSI_RATE, CAP as KONVERSI_CAP, LIMITS as KONVERSI_LIMITS } from "@/lib/konversi-content";
import { SERVICES as LAYANAN_SERVICES, HOURS as LAYANAN_HOURS, DAYS as LAYANAN_DAYS } from "@/lib/layanan-content";
import { DESKS as KONTAK_DESKS } from "@/lib/kontak-content";
import { CARDS as FAQ_CARDS, DRAWERS as FAQ_DRAWERS, PERSONAS as FAQ_PERSONAS } from "@/lib/faq-content";
import { SCHOLARSHIPS as BEASISWA_ITEMS } from "@/lib/beasiswa-content";
import { BOOTCAMPS, TIERS as BOOTCAMP_TIERS, AUDIENCES as BOOTCAMP_AUDIENCES, TRACKS as BOOTCAMP_TRACKS } from "@/lib/bootcamp-content";

export default function ContentManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("career");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [contents, setContents] = useState({});

  // Fetch all content sections
  useEffect(() => {
    async function fetchContents() {
      try {
        const response = await fetch("/api/content");
        if (response.ok) {
          const data = await response.json();
          const contentBySection = data.reduce((acc, item) => {
            acc[item.section] = item;
            return acc;
          }, {});
          setContents(contentBySection);
        } else {
          setMessage({ type: "error", text: "Gagal memuat konten" });
        }
      } catch (error) {
        console.error("Error fetching contents:", error);
        setMessage({ type: "error", text: "Error memuat konten" });
      } finally {
        setLoading(false);
      }
    }
    fetchContents();
  }, []);

  const handleSave = async (section, updatedData) => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          ...updatedData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContents((prev) => ({
          ...prev,
          [section]: data,
        }));
        setMessage({ type: "success", text: "Konten berhasil disimpan!" });
        
        // Refresh halaman setelah 1 detik
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan konten" });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage({ type: "error", text: "Error menyimpan konten" });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "career", label: "Prospek Karir" },
    { id: "jumbotron-promo", label: "Jumbotron Promo" },
    { id: "magang", label: "Magang" },
    { id: "konversi-sks", label: "Konversi SKS" },
    { id: "bootcamp", label: "Bootcamp & Course" },
    { id: "layanan-akademik", label: "Layanan Akademik" },
    { id: "beasiswa", label: "Beasiswa" },
    { id: "kontak", label: "Kontak" },
    { id: "faq", label: "FAQ" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Content Management System
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            Kelola konten halaman utama website
          </p>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-lg text-sm lg:text-base ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 lg:space-x-4 px-3 lg:px-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 lg:py-4 px-3 lg:px-6 text-xs lg:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            {activeTab === "career" && (
              <CareerEditor
                data={contents.career}
                onSave={(data) => handleSave("career", data)}
                saving={saving}
              />
            )}
            {activeTab === "jumbotron-promo" && (
              <JumbotronPromoEditor
                data={contents["jumbotron-promo"]}
                onSave={(data) => handleSave("jumbotron-promo", data)}
                saving={saving}
              />
            )}
            {activeTab === "beasiswa" && (
              <BeasiswaEditor
                data={contents.beasiswa}
                onSave={(data) => handleSave("beasiswa", data)}
                saving={saving}
              />
            )}
            {activeTab === "magang" && (
              <MagangEditor
                data={contents.magang}
                onSave={(data) => handleSave("magang", data)}
                saving={saving}
              />
            )}
            {activeTab === "konversi-sks" && (
              <KonversiEditor
                data={contents["konversi-sks"]}
                onSave={(data) => handleSave("konversi-sks", data)}
                saving={saving}
              />
            )}
            {activeTab === "bootcamp" && (
              <BootcampEditor data={contents.bootcamp} onSave={(data) => handleSave("bootcamp", data)} saving={saving} />
            )}
            {activeTab === "layanan-akademik" && (
              <LayananEditor data={contents["layanan-akademik"]} onSave={(data) => handleSave("layanan-akademik", data)} saving={saving} />
            )}
            {activeTab === "kontak" && (
              <KontakEditor data={contents.kontak} onSave={(data) => handleSave("kontak", data)} saving={saving} />
            )}
            {activeTab === "faq" && (
              <FaqEditor data={contents.faq} onSave={(data) => handleSave("faq", data)} saving={saving} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Career Section Editor
function CareerEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    data: data?.data?.careers ? { careers: data.data.careers } : { careers: [] },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        data: data?.data?.careers ? { careers: data.data.careers } : { careers: [] },
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateCareerItem = (index, field, value) => {
    const newCareers = [...formData.data.careers];
    newCareers[index] = { ...newCareers[index], [field]: value };
    setFormData({
      ...formData,
      data: { ...formData.data, careers: newCareers },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul (gunakan HTML untuk styling)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Prospek Karir Lulusan Sistem Informasi UISI"
        />
      </div>

      {/* Career Items */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Daftar Prospek Karir</h3>
        
        {formData.data.careers.map((career, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-3">Karir {index + 1}</h4>
            
            <div className="space-y-3">
              <input
                type="text"
                value={career.id}
                onChange={(e) => updateCareerItem(index, "id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ID (erp, auditor, consultant, analyst)"
                disabled
              />
              
              <input
                type="text"
                value={career.title}
                onChange={(e) => updateCareerItem(index, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nama karir"
              />
              
              <textarea
                value={career.description}
                onChange={(e) => updateCareerItem(index, "description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Deskripsi karir"
              />
              
              <input
                type="text"
                value={career.image}
                onChange={(e) => updateCareerItem(index, "image", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="img/bidangerp.png"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Testimoni Editor
function JumbotronPromoEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
    data: data?.data && typeof data.data === 'object' ? data.data : { buttonText: "", buttonUrl: "" },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
        data: data.data && typeof data.data === 'object' ? data.data : { buttonText: "", buttonUrl: "" },
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle (Badge)
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="sisfor uisi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Mari Bergabung Bersama Kami"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Bergabung bersama kami..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Gambar Background
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="img/gabung.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teks Tombol
        </label>
        <input
          type="text"
          value={formData.data.buttonText}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, buttonText: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Mari Bergabung"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Tombol
        </label>
        <input
          type="text"
          value={formData.data.buttonUrl}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, buttonUrl: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="https://pmb.uisi.ac.id/prosedur"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Social Media Editor
function MagangEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readMagang(data));
  useEffect(() => setForm(readMagang(data)), [data]);

  const setJob = (i, field, value) => setForm((f) => ({ ...f, jobs: f.jobs.map((j, k) => (k === i ? { ...j, [field]: value } : j)) }));
  const lines = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  const toLines = (v) => v.split("\n").map((x) => x.trim()).filter(Boolean);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";

  const handleSubmit = (e) => {
    e.preventDefault();
    const jobs = form.jobs.filter((j) => j.title.trim() && j.company.trim());
    onSave({ title: "Magang", data: { ...form, jobs } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Mengisi minimal satu lowongan akan mengganti seluruh lowongan contoh di halaman <code>/magang</code>. Lowongan yang lewat tenggat otomatis turun ke bawah dan tidak bisa dilamar.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro hero (opsional, minimal 40 karakter)</label>
        <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul banner (kosong = Info Session dari agenda)</label>
          <input value={form.notice.title} onChange={(e) => setForm({ ...form, notice: { ...form.notice, title: e.target.value } })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Isi banner</label>
          <input value={form.notice.body} onChange={(e) => setForm({ ...form, notice: { ...form.notice, body: e.target.value } })} className={input} />
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lowongan ({form.jobs.length})</h3>
          <button type="button" onClick={() => setForm({ ...form, jobs: [...form.jobs, { ...EMPTY_JOB }] })} className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg">
            + Tambah lowongan
          </button>
        </div>
        {form.jobs.map((j, i) => (
          <div key={i} className="mb-4 p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Lowongan {i + 1}</h4>
              <button type="button" onClick={() => setForm({ ...form, jobs: form.jobs.filter((_, k) => k !== i) })} className="text-sm text-red-600">
                Hapus
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={j.title} onChange={(e) => setJob(i, "title", e.target.value)} className={input} placeholder="Posisi, mis. Data Analyst Intern" />
              <input value={j.company} onChange={(e) => setJob(i, "company", e.target.value)} className={input} placeholder="Perusahaan" />
              <select value={j.field} onChange={(e) => setJob(i, "field", e.target.value)} className={input}>
                {MAGANG_FIELDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select value={j.program} onChange={(e) => setJob(i, "program", e.target.value)} className={input}>
                {MAGANG_PROGRAMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select value={j.mode} onChange={(e) => setJob(i, "mode", e.target.value)} className={input}>
                {MAGANG_MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input value={j.duration} onChange={(e) => setJob(i, "duration", e.target.value)} className={input} placeholder="Durasi, mis. 3 bulan" />
              <label className="text-sm text-gray-600">
                Tenggat
                <input type="date" value={j.deadline} onChange={(e) => setJob(i, "deadline", e.target.value)} className={input} />
              </label>
              <input value={j.href} onChange={(e) => setJob(i, "href", e.target.value)} className={input} placeholder="Tautan lamaran (https://…)" />
              <textarea rows={3} value={lines(j.tasks)} onChange={(e) => setJob(i, "tasks", toLines(e.target.value))} className={input} placeholder="Tugas — satu per baris" />
              <textarea rows={3} value={lines(j.needs)} onChange={(e) => setJob(i, "needs", toLines(e.target.value))} className={input} placeholder="Kebutuhan — satu per baris" />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Berkas (URL unduhan)</h3>
        {MAGANG_DOCS.map(([key, label], i) => (
          <div key={key} className="mb-3">
            <label className="block text-sm text-gray-700 mb-1">{label}</label>
            <input
              value={form.docs[i].href}
              onChange={(e) => setForm({ ...form, docs: form.docs.map((d, k) => (k === i ? { ...d, href: e.target.value } : d)) })}
              className={input}
              placeholder="/berkas/nama-file.pdf atau https://…"
            />
          </div>
        ))}
      </div>

      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

/* ---------- Beasiswa (/beasiswa) — lihat src/lib/beasiswa-content.js ---------- */
const winToText = (ws) => (Array.isArray(ws) ? ws.map((w) => `${w.open} ${w.close} ${w.label || ""}`.trim()).join("\n") : "");
const textToWin = (t) =>
  t
    .split("\n")
    .map((l) => l.trim().match(/^(\d{2}-\d{2})\s+(\d{2}-\d{2})\s*(.*)$/))
    .filter(Boolean)
    .map(([, open, close, label]) => ({ open, close, label: label || "Pendaftaran" }));

function readBeasiswa(d) {
  const raw = d?.data && typeof d.data === "object" ? d.data : {};
  const cms = Array.isArray(raw.items) ? raw.items : [];
  return {
    intro: raw.intro || "",
    notice: { title: raw.notice?.title || "", body: raw.notice?.body || "" },
    items: BEASISWA_ITEMS.map((b) => {
      const o = cms.find((x) => x?.slug === b.slug) || {};
      return {
        slug: b.slug,
        name: o.name ?? b.name,
        coverage: o.coverage ?? b.coverage,
        living: o.living ?? b.living,
        href: o.href || "",
        windows: winToText(o.windows ?? b.windows),
        ipk: o.rules?.ipk ?? b.rules.ipk,
        semMin: o.rules?.semester?.[0] ?? b.rules.semester[0],
        semMax: o.rules?.semester?.[1] ?? b.rules.semester[1],
        official: Boolean(o.rules || o.href),
        hidden: Boolean(o.hidden),
      };
    }),
  };
}

function BeasiswaEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readBeasiswa(data));
  useEffect(() => setForm(readBeasiswa(data)), [data]);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const setItem = (i, field, value) => setForm((f) => ({ ...f, items: f.items.map((it, k) => (k === i ? { ...it, [field]: value } : it)) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const items = form.items.map((it) => {
      const base = BEASISWA_ITEMS.find((b) => b.slug === it.slug);
      const out = { slug: it.slug, name: it.name, coverage: Number(it.coverage), living: it.living, windows: textToWin(it.windows), hidden: it.hidden };
      if (it.href.trim()) out.href = it.href.trim();
      if (it.official) out.rules = { ...base.rules, ipk: Number(it.ipk) || 0, semester: [Number(it.semMin) || 1, Number(it.semMax) || 8] };
      return out;
    });
    onSave({ title: "Beasiswa", data: { intro: form.intro, notice: form.notice, items } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Semua beasiswa di <code>/beasiswa</code> masih contoh. Centang &quot;Data resmi&quot; atau isi tautan resmi untuk menghapus label contoh pada beasiswa itu.
        Jendela pendaftaran ditulis satu per baris: <code>MM-DD MM-DD Label</code>, mis. <code>03-01 07-31 Bersamaan dengan PMB</code>.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro hero (opsional, minimal 40 karakter)</label>
        <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul banner (kosong = periode terdekat otomatis)</label>
          <input value={form.notice.title} onChange={(e) => setForm({ ...form, notice: { ...form.notice, title: e.target.value } })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Isi banner</label>
          <input value={form.notice.body} onChange={(e) => setForm({ ...form, notice: { ...form.notice, body: e.target.value } })} className={input} />
        </div>
      </div>

      {form.items.map((it, i) => (
        <div key={it.slug} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-medium">{it.name}</h4>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={it.official} onChange={(e) => setItem(i, "official", e.target.checked)} /> Data resmi</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={it.hidden} onChange={(e) => setItem(i, "hidden", e.target.checked)} /> Sembunyikan</label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={it.name} onChange={(e) => setItem(i, "name", e.target.value)} className={input} placeholder="Nama beasiswa" />
            <label className="text-sm text-gray-600">Cakupan UKT (%)
              <input type="number" min="0" max="100" value={it.coverage} onChange={(e) => setItem(i, "coverage", e.target.value)} className={input} />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={it.living} onChange={(e) => setItem(i, "living", e.target.checked)} /> Ada biaya hidup</label>
            <label className="text-sm text-gray-600">IPK minimum (0 = tanpa syarat)
              <input type="number" step="0.01" min="0" max="4" value={it.ipk} onChange={(e) => setItem(i, "ipk", e.target.value)} className={input} />
            </label>
            <label className="text-sm text-gray-600">Semester dari
              <input type="number" min="1" max="8" value={it.semMin} onChange={(e) => setItem(i, "semMin", e.target.value)} className={input} />
            </label>
            <label className="text-sm text-gray-600">sampai
              <input type="number" min="1" max="8" value={it.semMax} onChange={(e) => setItem(i, "semMax", e.target.value)} className={input} />
            </label>
            <input value={it.href} onChange={(e) => setItem(i, "href", e.target.value)} className={`${input} sm:col-span-3`} placeholder="Tautan pendaftaran resmi (https://…)" />
            <textarea rows={2} value={it.windows} onChange={(e) => setItem(i, "windows", e.target.value)} className={`${input} sm:col-span-3`} placeholder="03-01 07-31 Bersamaan dengan PMB" />
          </div>
        </div>
      ))}

      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

/* ---------- Konversi SKS (/konversi-sks) ---------- */
function readKonversi(d) {
  const raw = d?.data && typeof d.data === "object" ? d.data : {};
  return {
    intro: raw.intro || "",
    notice: { title: raw.notice?.title || "", body: raw.notice?.body || "" },
    rate: raw.rate ?? "",
    cap: raw.cap ?? "",
    programs: KONVERSI_PROGRAMS.map((p) => {
      const o = (raw.programs || []).find((x) => x?.key === p.key) || {};
      return { key: p.key, mode: p.mode, label: o.label || "", lead: o.lead || "", weeks: o.weeks ?? "", hours: o.hours ?? "" };
    }),
    docs: KONVERSI_DOCS.map(({ key }) => ({ key, href: (raw.docs || []).find((x) => x?.key === key)?.href || "" })),
  };
}

function KonversiEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readKonversi(data));
  useEffect(() => setForm(readKonversi(data)), [data]);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const setProgram = (i, field, value) => setForm((f) => ({ ...f, programs: f.programs.map((p, k) => (k === i ? { ...p, [field]: value } : p)) }));
  const n = (v) => (v === "" || v == null ? undefined : Number(v));

  const handleSubmit = (e) => {
    e.preventDefault();
    const programs = form.programs
      .map(({ key, label, lead, weeks, hours }) => ({ key, label: label.trim(), lead: lead.trim(), weeks: n(weeks), hours: n(hours) }))
      .filter((p) => p.label || p.lead || p.weeks || p.hours);
    onSave({ title: "Konversi SKS", data: { ...form, rate: n(form.rate), cap: n(form.cap), programs } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Mengatur halaman <code>/konversi-sks</code>. Nama &amp; SKS mata kuliah diambil dari Admin › Kurikulum. Mengisi kurs dan batas menghapus tanda &quot;contoh&quot; pada meja konversi.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro hero (opsional, minimal 40 karakter)</label>
        <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kurs: jam kegiatan per 1 SKS (contoh {KONVERSI_RATE})</label>
          <input type="number" min={10} max={120} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batas SKS konversi per semester (contoh {KONVERSI_CAP})</label>
          <input type="number" min={6} max={40} value={form.cap} onChange={(e) => setForm({ ...form, cap: e.target.value })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul banner (kosong = dari agenda beranda)</label>
          <input value={form.notice.title} onChange={(e) => setForm({ ...form, notice: { ...form.notice, title: e.target.value } })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Isi banner</label>
          <input value={form.notice.body} onChange={(e) => setForm({ ...form, notice: { ...form.notice, body: e.target.value } })} className={input} />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Bentuk kegiatan</h3>
        <p className="mb-4 text-sm text-gray-500">Kosongkan kolom untuk memakai nilai bawaan. Minggu {KONVERSI_LIMITS.weeks.join("–")}, jam/minggu {KONVERSI_LIMITS.hours.join("–")}.</p>
        {form.programs.map((p, i) => {
          const base = KONVERSI_PROGRAMS[i];
          return (
            <div key={p.key} className="mb-3 grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-[1fr_2fr_90px_90px]">
              <input value={p.label} onChange={(e) => setProgram(i, "label", e.target.value)} className={input} placeholder={base.label} />
              <input value={p.lead} onChange={(e) => setProgram(i, "lead", e.target.value)} className={input} placeholder={base.lead} />
              {p.mode === "jam" ? (
                <>
                  <input type="number" value={p.weeks} onChange={(e) => setProgram(i, "weeks", e.target.value)} className={input} placeholder={`${base.weeks} mgg`} />
                  <input type="number" value={p.hours} onChange={(e) => setProgram(i, "hours", e.target.value)} className={input} placeholder={`${base.hours} jam`} />
                </>
              ) : (
                <p className="text-xs text-gray-500 sm:col-span-2 self-center">Diakui 1 : 1 dari SKS kampus tujuan</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Templat berkas (URL unduhan)</h3>
        {KONVERSI_DOCS.map(({ key, title }, i) => (
          <div key={key} className="mb-3">
            <label className="block text-sm text-gray-700 mb-1">{title}</label>
            <input
              value={form.docs[i].href}
              onChange={(e) => setForm({ ...form, docs: form.docs.map((d, k) => (k === i ? { ...d, href: e.target.value } : d)) })}
              className={input}
              placeholder="/berkas/nama-file.pdf atau https://…"
            />
          </div>
        ))}
      </div>

      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

/* ---------- Bootcamp & Course (/bootcamp) ---------- */
const BC_FIELDS = [
  ["title", "Judul", "text"],
  ["start", "Mulai (YYYY-MM-DD)", "text"],
  ["weeks", "Minggu", "number"],
  ["hours", "Jam/minggu", "number"],
  ["seats", "Kursi", "number"],
  ["seatsLeft", "Sisa kursi", "number"],
  ["href", "URL pendaftaran", "text"],
];

function readBootcamp(d) {
  const raw = d?.data && typeof d.data === "object" ? d.data : {};
  return {
    intro: raw.intro || "",
    notice: { title: raw.notice?.title || "", body: raw.notice?.body || "" },
    bootcamps: BOOTCAMPS.map((b) => {
      const o = (raw.bootcamps || []).find((x) => x?.slug === b.slug) || {};
      return Object.fromEntries([["slug", b.slug], ...BC_FIELDS.map(([k]) => [k, o[k] ?? ""])]);
    }),
    tiers: BOOTCAMP_TIERS.map((t) => {
      const o = (raw.tiers || []).find((x) => x?.key === t.key);
      return { key: t.key, prices: Object.fromEntries(BOOTCAMP_AUDIENCES.map((a) => [a.key, o?.prices?.[a.key] === null ? "-" : o?.prices?.[a.key] ?? ""])) };
    }),
    courses: Array.isArray(raw.courses) && raw.courses.length ? JSON.stringify(raw.courses, null, 2) : "",
  };
}

function BootcampEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readBootcamp(data));
  const [error, setError] = useState("");
  useEffect(() => setForm(readBootcamp(data)), [data]);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const setCamp = (i, k, v) => setForm((f) => ({ ...f, bootcamps: f.bootcamps.map((b, j) => (j === i ? { ...b, [k]: v } : b)) }));
  const setPrice = (i, a, v) => setForm((f) => ({ ...f, tiers: f.tiers.map((t, j) => (j === i ? { ...t, prices: { ...t.prices, [a]: v } } : t)) }));
  const isNum = (k) => BC_FIELDS.find((f) => f[0] === k)?.[2] === "number";

  const handleSubmit = (e) => {
    e.preventDefault();
    let courses = [];
    if (form.courses.trim()) {
      try {
        courses = JSON.parse(form.courses);
        if (!Array.isArray(courses)) throw new Error("bukan array");
      } catch {
        setError("Daftar kursus harus berupa array JSON yang valid.");
        return;
      }
    }
    setError("");
    const bootcamps = form.bootcamps
      .map((b) => Object.fromEntries(Object.entries(b).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, isNum(k) ? Number(v) : String(v).trim()])))
      .filter((b) => Object.keys(b).length > 1);
    const tiers = form.tiers
      .map((t) => ({ key: t.key, prices: Object.fromEntries(Object.entries(t.prices).filter(([, v]) => v !== "").map(([k, v]) => [k, v === "-" ? null : Number(v)])) }))
      .filter((t) => Object.keys(t.prices).length);
    onSave({ title: "Bootcamp & Course", data: { intro: form.intro.trim(), notice: form.notice, bootcamps, tiers, courses } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Mengatur halaman <code>/bootcamp</code>. Mentor dosen diambil otomatis dari Profil Dosen. Kolom kosong memakai data contoh; mengisi kohort atau harga menghapus tanda &quot;contoh&quot; di bagian itu.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro mode Bootcamp (opsional)</label>
        <textarea rows={2} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul banner pendaftaran</label>
          <input value={form.notice.title} onChange={(e) => setForm({ ...form, notice: { ...form.notice, title: e.target.value } })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Isi banner</label>
          <input value={form.notice.body} onChange={(e) => setForm({ ...form, notice: { ...form.notice, body: e.target.value } })} className={input} />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Kohort bootcamp</h3>
        {form.bootcamps.map((b, i) => {
          const base = BOOTCAMPS[i];
          return (
            <div key={b.slug} className="mb-4 rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                {base.title} <span className="font-normal text-gray-400">({b.slug})</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-4">
                {BC_FIELDS.map(([k, label, type]) => (
                  <div key={k} className={k === "title" || k === "href" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type={type} value={b[k]} onChange={(e) => setCamp(i, k, e.target.value)} className={input} placeholder={String(base[k] ?? "")} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Biaya (Rupiah)</h3>
        <p className="mb-4 text-sm text-gray-500">0 = gratis, tanda minus (-) = &quot;Hubungi kami&quot;.</p>
        {form.tiers.map((t, i) => (
          <div key={t.key} className="mb-3 grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-[1fr_repeat(3,140px)] sm:items-end">
            <p className="text-sm font-semibold text-gray-700">{BOOTCAMP_TIERS[i].name}</p>
            {BOOTCAMP_AUDIENCES.map((a) => (
              <div key={a.key}>
                <label className="block text-xs text-gray-500 mb-1">{a.label}</label>
                <input value={t.prices[a.key]} onChange={(e) => setPrice(i, a.key, e.target.value)} className={input} placeholder={String(BOOTCAMP_TIERS[i].prices[a.key] ?? "-")} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Kursus mandiri (JSON)</h3>
        <p className="mb-3 text-sm text-gray-500">
          Kosongkan untuk memakai kursus contoh; mengisi akan mengganti semuanya. Per item:{" "}
          <code>{`{ "title", "topic": ${Object.keys(BOOTCAMP_TRACKS).join(" | ")}, "level": pemula | menengah | mahir, "hours", "perWeek", "lessons": [{ "t", "min" }], "href" }`}</code>
        </p>
        <textarea rows={8} value={form.courses} onChange={(e) => setForm({ ...form, courses: e.target.value })} className={`${input} font-mono`} placeholder="[]" />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}


/* ---------- FAQ (/faq) ---------- */
const FAQ_PERSONA_KEYS = FAQ_PERSONAS.filter((p) => p.key !== "all");
function readFaq(d) {
  const raw = d?.data && typeof d.data === "object" ? d.data : {};
  return {
    intro: d?.content || "",
    cards: FAQ_CARDS.map((c) => {
      const o = (raw.cards || []).find((x) => x?.slug === c.slug) || {};
      return { slug: c.slug, drawer: c.drawer, defQ: c.q, defA: c.a, defPersonas: c.personas, q: o.q || "", a: o.a || "", personas: Array.isArray(o.personas) ? o.personas : null };
    }),
    extra: (raw.extra || []).map((x) => ({ slug: x.slug || "", drawer: x.drawer || FAQ_DRAWERS[0].key, q: x.q || "", a: x.a || "", href: x.source?.href || "", label: x.source?.label || "" })),
  };
}

const faqSlug = (v) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

function FaqEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readFaq(data));
  useEffect(() => setForm(readFaq(data)), [data]);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const setCard = (i, k, v) => setForm((f) => ({ ...f, cards: f.cards.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }));
  const setExtra = (i, k, v) => setForm((f) => ({ ...f, extra: f.extra.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }));
  const togglePersona = (i, key) =>
    setForm((f) => ({
      ...f,
      cards: f.cards.map((c, j) => {
        if (j !== i) return c;
        const cur = c.personas ?? c.defPersonas;
        return { ...c, personas: cur.includes(key) ? cur.filter((p) => p !== key) : [...cur, key] };
      }),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cards = form.cards
      .map((c) => ({
        slug: c.slug,
        ...(c.q.trim() ? { q: c.q.trim() } : {}),
        ...(c.a.trim() ? { a: c.a.trim() } : {}),
        ...(c.personas && c.personas.length ? { personas: c.personas } : {}),
      }))
      .filter((c) => Object.keys(c).length > 1);
    const extra = form.extra
      .filter((x) => x.q.trim() && x.a.trim())
      .map((x) => ({
        slug: x.slug.trim() || faqSlug(x.q),
        drawer: x.drawer,
        q: x.q.trim(),
        a: x.a.trim(),
        ...(x.href.trim() ? { source: { href: x.href.trim(), label: x.label.trim() } } : {}),
      }));
    onSave({ title: "FAQ", content: form.intro.trim(), data: { cards, extra } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Pengaturan halaman <code>/faq</code> (lemari katalog). Jawaban sebaiknya pendek dan menunjuk halaman sumber. Mengisi jawaban sebuah kartu menghapus tanda
        &quot;Contoh konten&quot;. Pertanyaan baru dari pengunjung tidak disimpan di server.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro hero (minimal 40 karakter; kosong = teks bawaan)</label>
        <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>

      {FAQ_DRAWERS.map((d) => (
        <div key={d.key} className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Laci {d.label}</h3>
          {form.cards.map((c, i) =>
            c.drawer !== d.key ? null : (
              <div key={c.slug} className="mb-3 space-y-3 rounded-lg border border-gray-200 p-4">
                <input value={c.q} onChange={(e) => setCard(i, "q", e.target.value)} placeholder={c.defQ} className={input} aria-label={`Pertanyaan ${c.slug}`} />
                <textarea rows={2} value={c.a} onChange={(e) => setCard(i, "a", e.target.value)} placeholder={c.defA} className={input} aria-label={`Jawaban ${c.slug}`} />
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>Ditampilkan untuk:</span>
                  {FAQ_PERSONA_KEYS.map((p) => (
                    <label key={p.key} className="inline-flex items-center gap-1.5">
                      <input type="checkbox" checked={(c.personas ?? c.defPersonas).includes(p.key)} onChange={() => togglePersona(i, p.key)} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      ))}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Kartu tambahan</h3>
        <p className="mb-4 text-sm text-gray-500">Kartu baru tampil untuk semua persona. Tautan sumber opsional.</p>
        {form.extra.map((x, i) => (
          <div key={i} className="mb-3 space-y-3 rounded-lg border border-gray-200 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
              <input value={x.q} onChange={(e) => setExtra(i, "q", e.target.value)} placeholder="Pertanyaan" className={input} />
              <select value={x.drawer} onChange={(e) => setExtra(i, "drawer", e.target.value)} className={input} aria-label="Laci">
                {FAQ_DRAWERS.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
            <textarea rows={2} value={x.a} onChange={(e) => setExtra(i, "a", e.target.value)} placeholder="Jawaban singkat" className={input} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={x.href} onChange={(e) => setExtra(i, "href", e.target.value)} placeholder="Tautan sumber, mis. /magang" className={input} />
              <input value={x.label} onChange={(e) => setExtra(i, "label", e.target.value)} placeholder="Nama halaman sumber" className={input} />
            </div>
            <button type="button" onClick={() => setForm((f) => ({ ...f, extra: f.extra.filter((_, j) => j !== i) }))} className="text-sm text-red-600">
              Hapus kartu
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, extra: [...f.extra, { slug: "", drawer: FAQ_DRAWERS[0].key, q: "", a: "", href: "", label: "" }] }))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          + Tambah kartu
        </button>
      </div>

      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

/* ---------- Kontak (/kontak) ---------- */
function readKontak(d) {
  const raw = d?.data && typeof d.data === "object" ? d.data : {};
  return {
    intro: raw.intro || "",
    email: raw.email || "",
    whatsapp: raw.whatsapp || "",
    desks: KONTAK_DESKS.map((k) => {
      const o = (raw.desks || []).find((x) => x?.key === k.key) || {};
      return { key: k.key, name: o.name || "", handles: o.handles || "", defName: k.name, defHandles: k.handles };
    }),
  };
}

function KontakEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readKontak(data));
  useEffect(() => setForm(readKontak(data)), [data]);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const setDesk = (i, k, v) => setForm((f) => ({ ...f, desks: f.desks.map((d, j) => (j === i ? { ...d, [k]: v } : d)) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const desks = form.desks
      .map((d) => ({ key: d.key, ...(d.name.trim() ? { name: d.name.trim() } : {}), ...(d.handles.trim() ? { handles: d.handles.trim() } : {}) }))
      .filter((d) => Object.keys(d).length > 1);
    onSave({ title: "Kontak", data: { intro: form.intro, email: form.email.trim(), whatsapp: form.whatsapp.trim(), desks } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Pengaturan halaman <code>/kontak</code>. Surat dari pengunjung tidak disimpan di server: tombol kirim membuka aplikasi email atau WhatsApp
        pengunjung ke alamat di bawah. Bila email & WhatsApp kosong, dipakai kontak dari tab Layanan Akademik; bila keduanya kosong, pengunjung hanya bisa menyalin surat.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro hero</label>
        <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email resmi prodi</label>
          <input type="email" value={form.email} placeholder="sisfor@…" onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp resmi</label>
          <input value={form.whatsapp} placeholder="08… atau 628…" onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={input} />
        </div>
      </div>
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Meja tujuan (papan sambung)</h3>
        <p className="mb-4 text-sm text-gray-500">Kosongkan untuk memakai teks bawaan. Mengisi "menangani" menghapus tanda contoh.</p>
        {form.desks.map((d, i) => (
          <div key={d.key} className="mb-3 grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
            <input value={d.name} onChange={(e) => setDesk(i, "name", e.target.value)} placeholder={d.defName} className={input} aria-label={`Nama meja ${d.defName}`} />
            <input value={d.handles} onChange={(e) => setDesk(i, "handles", e.target.value)} placeholder={d.defHandles} className={input} aria-label={`Urusan yang ditangani ${d.defName}`} />
          </div>
        ))}
      </div>
      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

/* ---------- Layanan Akademik (/layanan-akademik) ---------- */
const LAYANAN_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
function readLayanan(d) {
  const raw = d?.data && typeof d.data === "object" ? d.data : {};
  const hours = Array.isArray(raw.hours) && raw.hours.length ? raw.hours : LAYANAN_HOURS;
  return {
    intro: raw.intro || "",
    notice: { title: raw.notice?.title || "", body: raw.notice?.body || "", service: raw.notice?.service || "" },
    contact: { email: raw.contact?.email || "", whatsapp: raw.contact?.whatsapp || "", room: raw.contact?.room || "", building: raw.contact?.building || "" },
    hours: LAYANAN_DAY_ORDER.map((day) => {
      const h = hours.find((x) => x.day === day);
      return { day, open: h?.open || "", close: h?.close || "", restFrom: h?.rest?.[0] || "", restTo: h?.rest?.[1] || "" };
    }),
    services: LAYANAN_SERVICES.map((s) => {
      const o = (raw.services || []).find((x) => x?.key === s.key) || {};
      return { key: s.key, title: s.title, sla: o.sla ?? "", needs: Array.isArray(o.needs) ? o.needs.join("\n") : "", hidden: o.hidden === true };
    }),
  };
}

function LayananEditor({ data, onSave, saving }) {
  const [form, setForm] = useState(() => readLayanan(data));
  useEffect(() => setForm(readLayanan(data)), [data]);
  const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm";
  const setHour = (i, k, v) => setForm((f) => ({ ...f, hours: f.hours.map((h, j) => (j === i ? { ...h, [k]: v } : h)) }));
  const setSvc = (i, k, v) => setForm((f) => ({ ...f, services: f.services.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const hours = form.hours
      .filter((h) => h.open && h.close)
      .map((h) => ({ day: h.day, open: h.open, close: h.close, ...(h.restFrom && h.restTo ? { rest: [h.restFrom, h.restTo] } : {}) }));
    const services = form.services
      .map((s) => ({
        key: s.key,
        ...(Number(s.sla) > 0 ? { sla: Number(s.sla) } : {}),
        ...(s.needs.trim() ? { needs: s.needs.split("\n").map((x) => x.trim()).filter(Boolean) } : {}),
        ...(s.hidden ? { hidden: true } : {}),
      }))
      .filter((s) => Object.keys(s).length > 1);
    onSave({ title: "Layanan Akademik", data: { intro: form.intro, notice: form.notice, contact: form.contact, hours, services } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        Pengaturan halaman <code>/layanan-akademik</code>. Pengajuan yang masuk dikelola di menu{" "}
        <a href="/admin/layanan" className="text-red-600 underline">Kotak Masuk Layanan</a>. Kolom kosong memakai nilai bawaan (bertanda contoh).
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intro hero</label>
        <textarea rows={3} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul banner</label>
          <input value={form.notice.title} onChange={(e) => setForm({ ...form, notice: { ...form.notice, title: e.target.value } })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Isi banner</label>
          <input value={form.notice.body} onChange={(e) => setForm({ ...form, notice: { ...form.notice, body: e.target.value } })} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tombol banner membuka layanan</label>
          <select value={form.notice.service} onChange={(e) => setForm({ ...form, notice: { ...form.notice, service: e.target.value } })} className={input}>
            <option value="">(pilih di wizard)</option>
            {LAYANAN_SERVICES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Kontak & lokasi</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["email", "Email sekretariat", "sisfor@…"],
            ["whatsapp", "WhatsApp layanan", "08…"],
            ["room", "Nama ruang", "Sekretariat Prodi Sistem Informasi"],
            ["building", "Gedung & lantai", "Gedung …, Lantai …"],
          ].map(([k, label, ph]) => (
            <div key={k}>
              <label className="block text-sm text-gray-700 mb-1">{label}</label>
              <input value={form.contact[k]} placeholder={ph} onChange={(e) => setForm({ ...form, contact: { ...form.contact, [k]: e.target.value } })} className={input} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Jam loket</h3>
        <p className="mb-4 text-sm text-gray-500">Kosongkan jam buka/tutup untuk hari libur.</p>
        <div className="space-y-2">
          {form.hours.map((h, i) => (
            <div key={h.day} className="grid grid-cols-[6rem_repeat(4,1fr)] items-center gap-2 text-sm">
              <span className="font-medium">{LAYANAN_DAYS[h.day]}</span>
              <input type="time" value={h.open} onChange={(e) => setHour(i, "open", e.target.value)} className={input} aria-label={`Buka ${LAYANAN_DAYS[h.day]}`} />
              <input type="time" value={h.close} onChange={(e) => setHour(i, "close", e.target.value)} className={input} aria-label={`Tutup ${LAYANAN_DAYS[h.day]}`} />
              <input type="time" value={h.restFrom} onChange={(e) => setHour(i, "restFrom", e.target.value)} className={input} aria-label={`Mulai istirahat ${LAYANAN_DAYS[h.day]}`} />
              <input type="time" value={h.restTo} onChange={(e) => setHour(i, "restTo", e.target.value)} className={input} aria-label={`Selesai istirahat ${LAYANAN_DAYS[h.day]}`} />
            </div>
          ))}
          <p className="text-xs text-gray-400">Kolom: buka · tutup · mulai istirahat · selesai istirahat</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Layanan</h3>
        <p className="mb-4 text-sm text-gray-500">
          Isi estimasi (hari kerja) dan syarat resmi; syarat yang diisi menghapus tanda contoh. Centang Sembunyikan untuk layanan yang belum dibuka.
        </p>
        {form.services.map((s, i) => (
          <div key={s.key} className="mb-3 grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-[1fr_7rem_2fr_auto] sm:items-start">
            <p className="text-sm font-medium">{s.title}</p>
            <input type="number" min="1" value={s.sla} onChange={(e) => setSvc(i, "sla", e.target.value)} className={input} placeholder="Hari" aria-label={`Estimasi ${s.title}`} />
            <textarea rows={2} value={s.needs} onChange={(e) => setSvc(i, "needs", e.target.value)} className={input} placeholder="Syarat, satu per baris" aria-label={`Syarat ${s.title}`} />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={s.hidden} onChange={(e) => setSvc(i, "hidden", e.target.checked)} /> Sembunyikan
            </label>
          </div>
        ))}
      </div>

      <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
