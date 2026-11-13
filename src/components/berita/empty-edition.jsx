"use client";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useWarta } from "./warta-provider";

/** Kosong: Lottie `empty-news` + tombol lepas filter. */
export function EmptyEdition({ what }) {
  const { query, category, setRawQuery, pickCategory } = useWarta();
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <LottieIllustration src="/lottie/empty-news.json" label="Belum ada tulisan" className="w-36" />
      <p className="mt-3 font-serif text-xl text-navy">{query || category ? `Tidak ada ${what} yang cocok` : `Belum ada ${what}`}</p>
      <p className="mt-1 max-w-sm text-sm text-text/55">{query || category ? "Coba kata lain atau lepas kategori yang dipilih." : "Redaksi sedang menyiapkan edisi berikutnya."}</p>
      {(query || category) && (
        <button
          type="button"
          onClick={() => {
            setRawQuery("");
            if (category) pickCategory(category);
          }}
          className="u-gold mt-4 text-sm font-semibold text-maroon"
        >
          Lepas semua saringan
        </button>
      )}
    </div>
  );
}
