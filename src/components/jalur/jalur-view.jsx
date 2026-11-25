import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle, Container } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { CURTAIN_KEY } from "@/lib/jalur-kelulusan-content";
import { JalurProvider } from "./jalur-provider";
import { JalurHero } from "./jalur-hero";
import { RouteStory } from "./route-story";
import { ReadinessCheck } from "./readiness-check";
import { TradeoffCards } from "./tradeoff-cards";
import { JalurClosing } from "./jalur-closing";
import { JalurBanner } from "./jalur-banner";

export function JalurView({ data }) {
  const { copy: { identity }, sections, paths, preview } = data;
  const hasPaths = paths.length > 0;
  const curtainKey = preview ? `${CURTAIN_KEY}:pratinjau` : CURTAIN_KEY;
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={curtainKey} kicker={identity.curtainKicker} title={identity.curtainTitle} accent={identity.curtainAccent} label={identity.loading} />
      <Topbar />
      <SiteHeader />
      <JalurProvider data={data}>
        <HeadingStyle value="edge">
          <main>
            <JalurHero curtainKey={curtainKey} />
            {hasPaths && sections.story && <RouteStory />}
            {hasPaths && sections.readiness ? <ReadinessCheck /> : data.notice.visible && <Container><JalurBanner className="my-8" /></Container>}
            {hasPaths && sections.compare && <TradeoffCards />}
            {sections.closing && <JalurClosing />}
          </main>
        </HeadingStyle>
      </JalurProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
