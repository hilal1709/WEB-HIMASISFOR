import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";
import { dateParts, fmtShort, fmtTime } from "@/lib/berita-content";
import { ArrowLink, Container, SectionHeader } from "./shared";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/** Berita (2/3) + Agenda dengan blok tanggal (1/3) — tata letak khas situs kampus. */
export function NewsScene({ data, content: c = HOME_DEFAULTS.news }) {
  const news = (data?.posts ?? []).filter((p) => p.type === "berita");
  const lead0 = news.find((p) => p.featured) ?? news[0];
  const items = lead0 ? [lead0, ...news.filter((p) => p !== lead0)].slice(0, 4).map((p) => ({ ...p, tag: p.category, date: fmtShort(p.publishedAt), body: p.excerpt, image: p.cover, href: `/berita/${p.slug}` })) : [];
  const [lead, ...rest] = items;
  const now = Date.now();
  const AGENDA = (data?.events ?? [])
    .filter((e) => new Date(e.endAt ?? e.startAt).getTime() >= now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 4)
    .map((e) => ({ ...e, day: dateParts(e.startAt).day, month: dateParts(e.startAt).month.slice(0, 3), time: `${fmtTime(e.startAt)} WIB`, href: `/berita?rubrik=agenda#agenda-${e.slug}` }));
  return (
    <section id="berita" className="py-16 md:py-24">
      <Container>
        <SectionHeader
          title={c.title}
          body={c.body}
          action={c.more?.label ? <ArrowLink href={c.more.href}>{c.more.label}</ArrowLink> : null}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
          <div className="grid gap-6 md:grid-cols-2">
            {lead && <a href={lead.href} data-aos="fade-up" className="group md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr] md:gap-6">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-cream-2">
                {lead.image && <Image src={lead.image} alt="" fill sizes="(min-width:1024px) 480px, 100vw" className="scale-[1.06] object-cover transition-transform duration-700 ease-cinematic group-hover:scale-[1.12]" />}
              </div>
              <div className="mt-4 md:mt-0 md:self-center">
                <Meta item={lead} />
                <h3 className="mt-2 font-serif text-[1.65rem] leading-tight text-navy">
                  <span className="u-gold">{lead.title}</span>
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-text/65">{lead.body}</p>
              </div>
            </a>}
            {rest.map((n, i) => (
              <a key={n.title} href={n.href} data-aos="fade-up" data-aos-delay={(i + 1) * 70} className={`group ${i === 2 ? "md:hidden lg:hidden" : ""}`}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-cream-2">
                  {n.image && <Image src={n.image} alt="" fill sizes="(min-width:1024px) 320px, 100vw" className="scale-[1.06] object-cover transition-transform duration-700 ease-cinematic group-hover:scale-[1.12]" />}
                </div>
                <Meta item={n} className="mt-4" />
                <h3 className="mt-1.5 font-serif text-xl leading-snug text-navy transition-colors group-hover:text-maroon">{n.title}</h3>
              </a>
            ))}
          </div>

          <aside aria-label="Agenda" className="relative rounded-lg border border-line bg-white p-6 md:p-7">
            <div className="absolute -top-[70px] right-3 z-10">
              <div className="relative"><ElvoPeek pose={c.mascot.pose} size={78} say={c.mascot.say} delay={0.4} /></div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="flex items-center gap-2 font-serif text-2xl text-navy">
                {c.agendaLottie && <LottieIllustration src={c.agendaLottie} className="size-11 shrink-0" />}
                {c.agendaTitle}
              </h3>
              {c.calendar?.label && <a href={c.calendar.href} className="u-gold text-sm font-semibold text-maroon">{c.calendar.label}</a>}
            </div>
            {!AGENDA.length && (
              <div className="flex flex-col items-center py-8 text-center">
                {c.emptyLottie && <LottieIllustration src={c.emptyLottie} className="w-28" />}
                <p className="mt-2 text-sm text-text/55">{c.emptyText}</p>
              </div>
            )}
            <ul className="mt-5 divide-y divide-line">
              {AGENDA.map((a, i) => (
                <li key={a.slug} data-aos="fade-up" data-aos-delay={i * 60}>
                  <a href={a.href} className="group flex gap-4 py-4">
                    <span className="flex w-14 shrink-0 flex-col items-center rounded-md bg-navy py-2 transition-colors duration-300 group-hover:bg-maroon">
                      <span className="font-serif text-2xl leading-none text-gold-soft transition-colors group-hover:text-white">{a.day}</span>
                      <span className="kicker mt-1 text-[10px] text-white/70 transition-colors group-hover:text-white/90">{a.month}</span>
                    </span>
                    <span>
                      <span className="block text-[15px] font-medium leading-snug text-navy">{a.title}</span>
                      <span className="mt-1 block text-xs text-text/55">{a.place} · {a.time}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function Meta({ item, className = "" }) {
  return (
    <p className={`flex items-center gap-2 text-xs text-text/55 ${className}`}>
      <span className="kicker text-[11px] text-maroon">{item.tag}</span>
      <span aria-hidden className="h-3 w-px bg-line" />
      <time>{item.date}</time>
    </p>
  );
}
