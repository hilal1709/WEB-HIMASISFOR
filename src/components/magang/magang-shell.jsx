import { CURTAIN_KEY } from "@/lib/magang-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { MagangBody } from "./magang-body";

export function MagangShell({ data, preview = false }) {
  const hero = data.copy.hero;
  return (
    <div className="kampus" data-aos-wait>
      {!preview && <PageCurtain storageKey={CURTAIN_KEY} title={hero.curtainTitle} accent={hero.curtainAccent} label={hero.loading} />}
      <Topbar />
      <SiteHeader />
      <MagangBody data={data} preview={preview} />
      <SiteFooter />
      <AosReady />
    </div>
  );
}
