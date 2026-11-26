import { CURTAIN_KEY } from "@/lib/konversi-content";
import { Topbar, SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { HeadingStyle } from "@/components/home/shared";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { KonversiProvider } from "./konversi-provider";
import { KonversiHero } from "./konversi-hero";
import { ExchangeDesk } from "./exchange-desk";
import { ClaimStepper } from "./claim-stepper";
import { TranscriptCompare } from "./transcript-compare";
import { KonversiBanner } from "./konversi-banner";
import { KonversiClosing } from "./konversi-closing";

const sections = { hero: KonversiHero, calculator: ExchangeDesk, steps: ClaimStepper, examples: TranscriptCompare, closing: KonversiClosing };

export function KonversiShell({ data, preview = false }) {
  const { blocks, copy } = data;
  const has = (name) => blocks.some(({ key, visible }) => key === name && visible);
  const visible = blocks.filter((block) => block.visible);
  const placeInSteps = visible.findIndex((block) => block.key === "notice") === visible.findIndex((block) => block.key === "steps") + 1 && has("steps") && has("notice");
  return (
    <div className="kampus konversi-page" data-aos-wait>
      {!preview && (
        <PageCurtain storageKey={CURTAIN_KEY} kicker={copy.feedback.loaderKicker} title={copy.feedback.loaderTitle}
          accent={copy.feedback.loaderAccent} label={copy.feedback.loaderLabel} />
      )}
      <Topbar />
      <SiteHeader />
      <KonversiProvider data={data} preview={preview}>
        <HeadingStyle value="rule">
          <main>
            {!has("hero") && <h1 className="sr-only">{copy.hero.title} {copy.hero.accent}</h1>}
            {!has("calculator") && <span id="kalkulator" className="block scroll-mt-24" />}
            {!has("steps") && <span id="alur" className="block scroll-mt-24" />}
            {!has("examples") && <span id="contoh" className="block scroll-mt-24" />}
            {visible.map(({ key }) => {
              if (key === "notice") return placeInSteps ? null : <KonversiBanner key={key} standalone />;
              const Block = sections[key];
              return <Block key={key} showNotice={key === "steps" && placeInSteps} />;
            })}
          </main>
        </HeadingStyle>
      </KonversiProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
