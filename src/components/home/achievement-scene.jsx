"use client";
import { useState } from "react";
import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLink, Container, SceneTitle } from "./shared";
import { VideoCard } from "./video-player";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";


/**
 * Mahasiswa Berprestasi — section navy: video Kisah Sukses Mawapres + daftar prestasi (CMS)
 * dengan Tabs Dosen/Mahasiswa.
 */
export function AchievementScene({ data, content: c = HOME_DEFAULTS.achievements }) {
  const TABS = [
    { value: "mahasiswa", label: c.tabStudent },
    { value: "dosen", label: c.tabLecturer },
  ];
  const [tab, setTab] = useState("mahasiswa");
  const tabs = {
    dosen: data?.dosen?.length ? data.dosen : c.fallbackLecturer,
    mahasiswa: data?.mahasiswa?.length ? data.mahasiswa : c.fallbackStudent,
  };
  const index = TABS.findIndex((t) => t.value === tab);

  return (
    <section id="prestasi" className="relative bg-maroon-deep py-16 text-white md:py-24">
      <Container className="relative">
        <div className="absolute -top-4 right-[30%] z-10 hidden lg:block">
          <div className="relative"><ElvoPeek pose={c.mascot.pose} size={100} say={c.mascot.say} tone="dark" delay={0.9} /></div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={c.title} tone="dark" />
            <p data-aos="fade-up" className="mt-4 text-[16.5px] leading-relaxed text-white/70">{c.body}</p>
          </div>
          <div className="flex items-end gap-5">
            {c.lottie && <LottieIllustration src={c.lottie} className="hidden w-24 md:block" />}
            {c.more?.label && <ArrowLink href={c.more.href} tone="dark">{c.more.label}</ArrowLink>}
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div data-aos="fade-up">
            {c.video?.src && <VideoCard video={c.video} label={c.videoLabel} />}
            {c.caption && <p className="mt-4 text-sm leading-relaxed text-white/65">{c.caption}</p>}
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
                      <a href={c.more?.href || "/achievement"} className="group flex items-center gap-4 py-4">
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Container>
    </section>
  );
}
