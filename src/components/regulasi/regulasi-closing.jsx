"use client";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useToast } from "@/components/ui/toast";
import { useRegulasi } from "./regulasi-provider";

/**
 * Penutup: ajakan membawa pasal yang ditandai ke dosen wali (salin daftar → toast), lalu tiga tautan lanjutan.
 * Tanpa CTA PMB / statistik (tidak mengulang beranda).
 */
export function RegulasiClosing() {
  const { marks, findPasal } = useRegulasi();
  const toast = useToast();
  const picked = marks.map((id) => findPasal(id)).filter(Boolean);

  const copyList = () => {
    const text = `Pasal yang ingin saya tanyakan:\n${picked.map((p) => `• Pasal ${p.no} ${p.title}`).join("\n")}`;
    const ok = () => toast.success(`${picked.length} pasal disalin`, { description: "Tempel di pesan untuk dosen wali." });
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok, () => toast.error("Daftar tidak bisa disalin"));
    else toast.error("Daftar tidak bisa disalin");
  };

  const next = [
    { href: "/curiculum", kicker: "Kurikulum & RPS", title: "Mata kuliah tiap semester" },
    { href: "/jalur-kelulusan", kicker: "Jalur kelulusan", title: "Empat cara menyelesaikan tugas akhir" },
    { href: "/profile#layanan", kicker: "Layanan akademik", title: "Persuratan dan persetujuan kaprodi" },
  ];

  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pb-24 md:pt-20">
      <Container>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={["Ada pasal yang", "masih membingungkan?"]} />
            <p className="mt-4 max-w-lg text-pretty text-[16px] leading-relaxed text-text/65">
              {picked.length
                ? `Kamu menandai ${picked.length} pasal. Salin daftarnya dan bawa ke dosen wali saat perwalian.`
                : "Tandai pasalnya di atas, lalu bawa daftarnya ke dosen wali saat perwalian."}
            </p>
            {picked.length > 0 && (
              <button
                type="button"
                onClick={copyList}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98] animate-in fade-in-0 slide-in-from-bottom-2"
              >
                Salin daftar pasal
              </button>
            )}
          </div>
          <div className="pointer-events-none hidden lg:block">
            <div className="relative"><ElvoPeek pose="thumbs-up" size={110} side="left" say="Bertanya lebih cepat daripada menebak." /></div>
          </div>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {next.map((l) => (
            <li key={l.href} className="bg-white">
              <a href={l.href} className="group flex h-full items-center justify-between gap-4 p-5 transition-colors duration-300 hover:bg-cream sm:p-6">
                <span>
                  <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                  <span className="mt-1 block font-serif text-[1.15rem] leading-tight text-navy">{l.title}</span>
                </span>
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
