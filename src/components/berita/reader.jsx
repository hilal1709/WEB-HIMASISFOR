"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { fmtDate } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { LordIcon } from "@/components/media/lord-icon";
import { Container, PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { Cover } from "./cover";
import { Prose } from "./prose";

/** Garis tinta emas di bawah header situs, mengikuti progres baca isi tulisan. */
function ReadingProgress({ target }) {
  const bar = useRef(null);
  useEffect(() => {
    const el = target.current;
    if (!el || !bar.current) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const start = innerHeight * 0.3;
      const total = r.height - innerHeight * 0.4;
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(total, 1)));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => raf || (raf = requestAnimationFrame(update));
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [target]);
  return (
    <div aria-hidden className="fixed inset-x-0 top-16 z-40 h-[3px]">
      <span ref={bar} className="wt-progress block h-full bg-gold" />
    </div>
  );
}

/** Daftar isi sticky (≥ lg) dengan scroll-spy; bagian aktif ditandai garis emas. */
function Toc({ toc }) {
  const [active, setActive] = useState(toc[0]?.id);
  useEffect(() => {
    const els = toc.map((t) => document.getElementById(t.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [toc]);
  if (toc.length < 2) return null;
  return (
    <nav aria-label="Daftar isi" className="sticky top-28">
      <p className="kicker text-text/45">Di tulisan ini</p>
      <ol className="mt-4 border-l border-line">
        {toc.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(t.id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
                history.replaceState(null, "", `#${t.id}`);
              }}
              className={cn(
                "-ml-px block border-l-2 py-1.5 text-[13.5px] leading-snug transition-colors",
                t.level === 3 ? "pl-7" : "pl-4",
                active === t.id ? "border-gold font-medium text-navy" : "border-transparent text-text/55 hover:text-navy"
              )}
            >
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Satu tombol Bagikan: menu bagikan bawaan perangkat bila tersedia (sudah memuat "salin tautan"),
 * selain itu langsung menyalin tautan (Lordicon berubah jadi centang + toast).
 */
function ShareButton({ post }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = location.href.split("#")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return; // pengguna menutup menu
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      toast.success("Tautan disalin", { description: "Tempel di WhatsApp, LINE, atau grup kelasmu." });
      setTimeout(() => setDone(false), 2400);
    } catch {
      toast.error("Tidak bisa menyalin", { description: "Salin alamat dari bilah peramban." });
    }
  };
  return (
    <button type="button" onClick={share} className="group inline-flex h-9 items-center gap-2 rounded-md border border-navy/15 bg-white px-3 text-sm font-medium text-navy transition-colors hover:border-navy/40">
      <LordIcon key={done ? "c" : "s"} name={done ? "check" : "arrow-right"} size={18} trigger={done ? "once" : "hover"} target=".group" colors="primary:#14213d,secondary:#c9a227" />
      {done ? "Tersalin" : "Bagikan"}
    </button>
  );
}

/**
 * Halaman baca Warta: kepala tulisan (rubrik, judul serif, deck, penulis), sampul lebar terbuka clip-path,
 * isi 68ch + daftar isi sticky, progres baca, lalu "Baca berikutnya".
 */
export function Reader({ post, related, toc }) {
  const ref = useRef(null);
  const body = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-rd-fade]", { y: 16, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.07 });
      gsap.from("[data-rd-cover]", { clipPath: "inset(12% 8% 12% 8%)", scale: 1.02, duration: 1.4, ease: "expo.inOut", delay: 0.15 });
    }, ref);
    return () => ctx.revert();
  }, []);

  const rubric = post.type === "artikel" ? "Artikel" : "Berita";

  return (
    <article ref={ref}>
      <ReadingProgress target={body} />
      <Container className="pt-8 md:pt-12">
        <nav aria-label="Breadcrumb" data-rd-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/berita" className="u-gold transition-colors hover:text-maroon">Warta</a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <a href={`/berita?rubrik=${post.type}`} className="u-gold transition-colors hover:text-maroon">{rubric}</a>
            </li>
          </ol>
        </nav>

        <header className="mx-auto mt-8 max-w-3xl text-center">
          <p data-rd-fade className="kicker text-maroon">
            {post.category}
          </p>
          <h1 data-rd-fade className="mt-4 text-balance font-serif text-[clamp(2.1rem,5vw,3.6rem)] font-normal leading-[1.06] text-navy">
            {post.title}
          </h1>
          {post.excerpt && (
            <p data-rd-fade className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-text/65">
              {post.excerpt}
            </p>
          )}
          <div data-rd-fade className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-y border-line py-4 text-sm text-text/60">
            <span className="flex items-center gap-2.5">
              {post.authorPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.authorPhoto} alt="" className="size-9 rounded-full object-cover" />
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-cream-2 font-serif text-navy">{post.author.slice(0, 1)}</span>
              )}
              <span className="text-left">
                {post.authorSlug ? (
                  <a href={`/dosen#dosen-${post.authorSlug}`} className="u-gold block font-medium text-navy">{post.author}</a>
                ) : (
                  <span className="block font-medium text-navy">{post.author}</span>
                )}
                {post.authorRole && <span className="block text-xs text-text/50">{post.authorRole}</span>}
              </span>
            </span>
            <span aria-hidden className="hidden h-6 w-px bg-line sm:block" />
            <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt)}</time>
            <span>{post.readMinutes} menit baca</span>
            {post.sample && <PlaceholderTag />}
          </div>
        </header>

        {post.cover && <Cover data-rd-cover src={post.cover} alt="" priority sizes="(min-width:1240px) 1180px, 100vw" className="mx-auto mt-10 aspect-[21/9] max-w-6xl rounded-lg" />}

        <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[13rem_minmax(0,68ch)_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <Toc toc={toc} />
          </aside>
          <div ref={body} className="min-w-0">
            <Prose content={post.content} />
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-double border-navy pt-5">
              <p className="text-sm text-text/55">
                Diterbitkan {fmtDate(post.publishedAt)} di rubrik {rubric}.
              </p>
              <ShareButton post={post} />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="baca-berikutnya" className="mt-20 bg-cream-2/60 py-14 md:py-20">
          <Container>
            <div className="flex items-end justify-between gap-4 border-t-[3px] border-navy pt-[3px]">
              <h2 id="baca-berikutnya" className="w-full border-t border-navy pt-5 font-serif text-3xl text-navy">
                Baca <em className="italic text-maroon">berikutnya</em>
              </h2>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((p, i) => (
                <a key={p.slug} href={`/berita/${p.slug}`} data-aos="fade-up" data-aos-delay={i * 70} className="wt-story group">
                  <Cover src={p.cover} sizes="(min-width:768px) 380px, 100vw" className="aspect-[16/10] rounded-md" imgClassName="wt-ink transition-transform duration-[1.2s] ease-cinematic group-hover:scale-[1.04]" />
                  <p className="kicker mt-4 text-maroon">
                    {p.category} <span className="text-text/40">· {p.readMinutes} menit</span>
                  </p>
                  <h3 className="wt-headline mt-2 font-serif text-xl leading-snug text-navy">{p.title}</h3>
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}
