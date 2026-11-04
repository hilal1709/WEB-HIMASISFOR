import Link from "next/link";
import LottiePlayer from "./LottiePlayer";
import { Button } from "@/components/ui/button";
import { BackgroundGrid } from "@/components/aceternity";

/** Tampilan 404 Sisfor DS dengan ilustrasi Lottie. */
export default function NotFoundView() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      <BackgroundGrid />
      <div className="relative text-center">
        <LottiePlayer name="not-found" className="mx-auto w-48 sm:w-56" ariaLabel="Halaman tidak ditemukan" />
        <p className="font-serif text-6xl text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-zinc-500">Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
        <Button asChild size="lg" className="mt-8"><Link href="/">Kembali ke Beranda</Link></Button>
      </div>
    </div>
  );
}
