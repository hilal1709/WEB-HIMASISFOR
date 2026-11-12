"use client";
import { useEffect, useState } from "react";
import { RUMPUN } from "@/lib/kurikulum-content";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const lines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

/** Format penilaian "Label: 30" per baris ↔ [{ label, bobot }]. */
const toGrading = (s) =>
  lines(s)
    .map((l) => {
      const m = l.match(/^(.*?)[:=]\s*(\d+(?:[.,]\d+)?)\s*%?$/);
      return m ? { label: m[1].trim(), bobot: Number(m[2].replace(",", ".")) } : null;
    })
    .filter(Boolean);

/**
 * Editor RPS satu mata kuliah (Admin › Kurikulum). Menyimpan ke field `kode`, `rumpun`, dan `rps`
 * pada objek mata kuliah. Mengisi RPS menghapus tanda "contoh" di halaman publik.
 */
export function AdminRpsEditor({ course, open, onOpenChange, onSave }) {
  const toast = useToast();
  const [f, setF] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !course) return;
    const r = course.rps ?? {};
    setF({
      kode: course.kode ?? "",
      rumpun: course.rumpun ?? "",
      dosen: r.dosen ?? "",
      pdf: r.pdf ?? "",
      revisi: r.revisi ?? "",
      cpmk: (r.cpmk ?? []).join("\n"),
      minggu: (r.minggu ?? []).join("\n"),
      penilaian: (r.penilaian ?? []).map((p) => `${p.label}: ${p.bobot}`).join("\n"),
    });
  }, [open, course]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return toast.error("Hanya file PDF", { description: file.name });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "rps");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setF((s) => ({ ...s, pdf: json.url }));
      toast.success("PDF terunggah", { description: "Klik Simpan RPS, lalu Simpan Kurikulum." });
    } catch {
      toast.error("Gagal mengunggah PDF");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = () => {
    const grading = toGrading(f.penilaian);
    const total = grading.reduce((t, p) => t + p.bobot, 0);
    if (grading.length && total !== 100) toast.warning(`Total bobot penilaian ${total}%`, { description: "Biasanya berjumlah 100%." });
    const minggu = lines(f.minggu).slice(0, 16);
    const rps = { dosen: f.dosen.trim(), pdf: f.pdf.trim(), revisi: f.revisi.trim(), cpmk: lines(f.cpmk), minggu, penilaian: grading };
    const empty = !rps.pdf && !rps.cpmk.length && !rps.minggu.length && !rps.penilaian.length && !rps.dosen;
    const next = { ...course, kode: f.kode.trim() || undefined, rumpun: f.rumpun || undefined, rps: empty ? undefined : rps };
    onSave(next);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <ModalHeader>
          <ModalTitle>RPS · {course?.nama}</ModalTitle>
          <ModalDescription>Kosongkan semua isian untuk menampilkan &ldquo;RPS menyusul&rdquo;. Ingat klik Simpan Kurikulum setelahnya.</ModalDescription>
        </ModalHeader>
        {f && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Kode mata kuliah</span>
              <input className={field} value={f.kode} onChange={set("kode")} placeholder="mis. SI3201" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Rumpun</span>
              <select className={field} value={f.rumpun} onChange={set("rumpun")}>
                <option value="">Otomatis</option>
                {RUMPUN.map((r) => (
                  <option key={r.key} value={r.key}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Dosen pengampu</span>
              <input className={field} value={f.dosen} onChange={set("dosen")} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Revisi / tanggal</span>
              <input className={field} value={f.revisi} onChange={set("revisi")} placeholder="mis. Rev. 2 · Agustus 2026" />
            </label>
            <div className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">Dokumen PDF</span>
              <div className="flex flex-wrap items-center gap-2">
                <input className={`${field} flex-1`} value={f.pdf} onChange={set("pdf")} placeholder="/rps/nama-file.pdf atau URL lengkap" />
                <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                  {uploading ? "Mengunggah…" : "Unggah PDF"}
                  <input type="file" accept="application/pdf" className="sr-only" onChange={upload} disabled={uploading} />
                </label>
              </div>
            </div>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">CPMK (satu per baris)</span>
              <textarea className={field} rows={4} value={f.cpmk} onChange={set("cpmk")} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Topik mingguan (16 baris, minggu 8 & 16 = ujian)</span>
              <textarea className={field} rows={8} value={f.minggu} onChange={set("minggu")} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Penilaian (&ldquo;Label: bobot&rdquo; per baris)</span>
              <textarea className={field} rows={8} value={f.penilaian} onChange={set("penilaian")} placeholder={"Tugas: 30\nUTS: 35\nUAS: 35"} />
            </label>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={save}>Simpan RPS</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
