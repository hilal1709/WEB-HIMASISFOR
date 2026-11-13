"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

const MODE = { luring: "Luring", daring: "Daring", hibrid: "Hibrid" };
const dayOf = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric" });
const monthOf = (d) => new Date(d).toLocaleDateString("id-ID", { month: "short" });
const timeOf = (d) => new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const dateLong = (d) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

/** Sampul dari CMS bisa berupa path relatif ("../img/…") atau URL penuh. */
const coverSrc = (c) => (/^https?:\/\//.test(c) ? c : "/" + c.replace(/^(\.\.?\/)+/, "").replace(/^\/+/, ""));

function AgendaPanel({ events, loading }) {
  return (
    <div data-aos="fade-up" className="flex flex-col rounded-xl bg-navy p-5 text-white sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl">Agenda prodi</h2>
        <Link href="/admin/warta" className="text-xs font-semibold text-gold-soft underline-offset-4 hover:underline">
          Kelola agenda
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-16 w-14 bg-white/10" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-4/5 bg-white/10" />
                <Skeleton className="h-3 w-1/2 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : events?.length ? (
        <ol className="mt-6 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="group flex gap-4 rounded-lg p-2 -mx-2 transition-colors duration-300 hover:bg-white/5">
              <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-gold/50 bg-navy-deep">
                <span className="font-serif text-2xl leading-none text-gold-soft">{dayOf(e.startAt)}</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{monthOf(e.startAt)}</span>
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="truncate font-semibold">{e.title}</p>
                <p className="mt-1 text-xs text-white/65">
                  {dateLong(e.startAt)} · {timeOf(e.startAt)} WIB
                </p>
                <p className="mt-0.5 truncate text-xs text-white/50">
                  {e.place} · {MODE[e.mode] ?? e.mode}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-center">
          <span className="rounded-xl bg-white/95 p-2"><LottieIllustration src="/lottie/calendar.json" className="size-28" label="Belum ada agenda" /></span>
          <p className="text-sm text-white/70">Belum ada agenda yang akan datang.</p>
        </div>
      )}
    </div>
  );
}

function WartaCard({ post }) {
  return (
    <Link href={`/admin/warta`} className="group block h-full overflow-hidden rounded-xl border border-line bg-white transition-transform duration-500 hover:-translate-y-1">
      <div className="relative aspect-[16/9] overflow-hidden bg-cream">
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc(post.cover)}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-maroon">
            <span className="font-serif text-5xl italic text-gold-soft/90">{post.title.charAt(0)}</span>
          </div>
        )}
        {post.status === "draf" && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-navy">Draf</span>
        )}
      </div>
      <div className="p-4">
        <p className="kicker text-maroon">{post.category}</p>
        <p className="mt-2 line-clamp-2 font-serif text-lg leading-snug text-navy">{post.title}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-px w-6 bg-gold transition-all duration-500 group-hover:w-12" />
          <span className="text-xs text-text/55">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Belum terbit"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function WartaRail({ posts, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!posts?.length) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-maroon/25 bg-white p-6 text-center">
        <LottieIllustration src="/lottie/empty-news.json" className="size-36" label="Belum ada warta" />
        <p className="text-sm text-text/60">Warta yang kamu tulis akan tampil di sini.</p>
      </div>
    );
  }
  return (
    <Swiper
      modules={[Autoplay, Pagination, A11y]}
      spaceBetween={16}
      slidesPerView={1.15}
      breakpoints={{ 640: { slidesPerView: 2 }, 1280: { slidesPerView: 2.2 } }}
      pagination={{ clickable: true }}
      autoplay={posts.length > 2 ? { delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
      className={cn("!pb-10 [--swiper-pagination-bullet-inactive-color:var(--maroon)] [--swiper-theme-color:var(--gold)]")}
    >
      {posts.map((p) => (
        <SwiperSlide key={p.id} className="!h-auto">
          <WartaCard post={p} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

/** Kiri: agenda akan datang (panel navy). Kanan: warta terbaru (slider). */
export function AgendaDesk({ events, posts, loading }) {
  return (
    <section aria-label="Agenda dan warta" className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-6">
      <AgendaPanel events={events} loading={loading} />
      <div data-aos="fade-up" data-aos-delay="100" className="min-w-0">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl text-navy">Warta terbaru</h2>
          <Link href="/admin/warta" className="text-xs font-semibold text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon-deep">
            Semua warta
          </Link>
        </div>
        <WartaRail posts={posts} loading={loading} />
      </div>
    </section>
  );
}
