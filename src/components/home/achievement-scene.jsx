"use client";
import { useState } from "react";
import Image from "next/image";
import { ACHIEVEMENTS, VIDEOS } from "@/lib/home-content";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLink, Container, PlaceholderTag, SceneTitle } from "./shared";
import { VideoCard } from "./video-player";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

const TABS = [
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "dosen", label: "Dosen" },
];

/**
 * Mahasiswa Berprestasi — section navy: video Kisah Sukses Mawapres + daftar prestasi (CMS)
 * dengan Tabs Dosen/Mahasiswa.
 */
export function AchievementScene({ data }) {
  const [tab, setTab] = useState("mahasiswa");
  const fromCms = Boolean(data?.dosen?.length || data?.mahasiswa?.length);
  const tabs = {
    dosen: data?.dosen?.length ? data.dosen : ACHIEVEMENTS.tabs.dosen,
    mahasiswa: data?.mahasiswa?.length ? data.mahasiswa : ACHIEVEMENTS.tabs.mahasiswa,
  };
  const index = TABS.findIndex((t) => t.value === tab);

  return (
    <section id="prestasi" className="relative bg-maroon-deep py-16 text-white md:py-24">
      <Container className="relative">
        <div className="absolute -top-4 right-[30%] z-10 hidden lg:block">
          <div className="relative"><ElvoPeek pose="proud" size={100} say="Bangga sama prestasi kakak-kakak tingkat!" tone="dark" delay={0.9} /></div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={["Mahasiswa", "berprestasi", "& rekognisi dosen"]} tone="dark" />
            <p data-aos="fade-up" className="mt-4 text-[16.5px] leading-relaxed text-white/70">{ACHIEVEMENTS.body}</p>
          </div>
          <div className="flex items-end gap-5">
            <LottieIllustration src="/lottie/trophy-dark.json" className="hidden w-24 md:block" />
            <ArrowLink href="/achievement" tone="dark">Semua prestasi</ArrowLink>
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div data-aos="fade-up">
            <VideoCard video={VIDEOS.mawapres} label="Kisah sukses" />
            <p className="mt-4 text-sm leading-relaxed text-white/65">Felix Atmaja, mahasiswa berprestasi Sistem Informasi UISI 2023, bercerita tentang magang bersertifikat, pertukaran mahasiswa, dan kompetisi.</p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-md bg-white/10 p-1 text-white">
              <span aria-hidden className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded bg-white transition-transform duration-500 ease-cinematic" style={{ transform: `translateX(${index * 100}%)` }} />
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="min-w-28 rounded data-[state=active]:text-maroon data-[state=inactive]:text-white/70">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((t) => (
              <TabsContent key={t.value} value={t.value} className="mt-6">
                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {tabs[t.value].slice(0, 4).map((a, i) => (
                    <li key={a.title + i} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500" style={{ animationDelay: `${i * 70}ms`, animationFillMode: "both" }}>
                      <a href="/achievement" className="group flex items-center gap-4 py-4">
                        <span className="relative size-14 shrink-0 overflow-hidden rounded bg-white/10">
                          {a.image && <Image src={a.image} alt="" fill sizes="56px" className="object-cover object-top transition-transform duration-500 group-hover:scale-110" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="kicker block text-[11px] text-gold-soft">
                            {a.level}
                            {a.year && <span className="ml-2 font-medium normal-case tracking-normal text-white/50">{a.year}</span>}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-[15px] font-medium leading-snug text-white transition-colors group-hover:text-gold-soft">{a.title}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                {!fromCms && <PlaceholderTag tone="dark" className="mt-4" />}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Container>
    </section>
  );
}
