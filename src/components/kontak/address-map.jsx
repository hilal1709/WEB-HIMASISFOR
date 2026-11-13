"use client";
import { useEffect, useState } from "react";
import { ADDRESS, MAP_EMBED, MAP_ROUTE } from "@/lib/kontak-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LordIcon } from "@/components/media/lord-icon";
import { Skeleton } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useKontak } from "./kontak-provider";
import { Postmark } from "./postmark";

/**
 * "Alamat pos": peta Google tertanam selebar layar (diredam agar senada cream) dengan kartu alamat bergaya
 * amplop di atasnya. Peta dimuat lambat dengan kerangka shimmer.
 */
export function AddressMap() {
  const { office } = useKontak();
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Program Studi Sistem Informasi UISI\n${ADDRESS}`);
      toast.success("Alamat disalin", { description: "Siap ditempel di aplikasi peta atau ojek daring." });
    } catch {
      toast.error("Gagal menyalin alamat");
    }
  };

  return (
    <section id="lokasi" className="scroll-mt-24 pt-16 md:pt-24">
      <Container>
        <SectionHeader title={["Alamat", "pos", "kami"]} body="Urusan yang lebih nyaman dibicarakan langsung? Temui kami di sekretariat prodi." />
      </Container>

      <div className="relative mt-10 md:mt-14">
        <div className="relative h-[460px] overflow-hidden md:h-[560px]">
          {!ready && <Skeleton className="absolute inset-0 rounded-none bg-cream-2" />}
          {/* dirender setelah hidrasi agar onLoad tidak terlewat; batas waktu 5 dtk bila event tak datang */}
          {mounted && (
            <iframe
              title="Peta lokasi Universitas Internasional Semen Indonesia"
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setReady(true)}
              className={cn("kt-map size-full border-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
            />
          )}
        </div>

        {/* kartu alamat bergaya amplop */}
        <Container className="relative -mt-36 md:absolute md:inset-x-0 md:bottom-10 md:mt-0">
          <div data-aos="fade-up" className="relative max-w-[440px] overflow-hidden rounded-[6px] border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgb(20_33_61/0.55)] md:p-7">
            <span aria-hidden className="kt-airmail absolute inset-x-0 top-0 h-1.5" />
            <span aria-hidden className="absolute -bottom-7 -right-7">
              <Postmark className="size-24 opacity-30" center="GRESIK" />
            </span>
            <div className="kt-loc flex items-start gap-3">
              <LordIcon name="location" size={30} trigger="hover" target=".kt-loc" colors="primary:#14213d,secondary:#6e1423" />
              <div>
                <p className="font-serif text-[19px] leading-snug text-navy">{office.room}</p>
                <p className="text-[14px] text-text/60">{office.building}</p>
                {office.sample && <PlaceholderTag className="mt-2" />}
              </div>
            </div>
            <address className="mt-4 border-t border-dashed border-navy/15 pt-4 text-[14.5px] not-italic leading-relaxed text-text/75">{ADDRESS}</address>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={MAP_ROUTE} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-md bg-maroon px-5 text-[14.5px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.97]">
                Petunjuk arah
              </a>
              <button type="button" onClick={copy} className="u-gold text-[14.5px] font-semibold text-navy">
                Salin alamat
              </button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
