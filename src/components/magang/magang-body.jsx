import { HeadingStyle } from "@/components/home/shared";
import { MagangProvider } from "./magang-provider";
import { MagangHero } from "./magang-hero";
import { RouteDoors } from "./route-doors";
import { JobBoard } from "./job-board";
import { ApplicationTracker } from "./application-tracker";
import { Logbook } from "./logbook";
import { MagangClosing } from "./magang-closing";

const sections = {
  routes: RouteDoors,
  jobs: JobBoard,
  tracker: ApplicationTracker,
  logbook: Logbook,
  closing: MagangClosing,
};

export function MagangBody({ data, preview = false }) {
  return (
    <MagangProvider data={data} preview={preview}>
      <HeadingStyle value="centered">
        <main>
          <MagangHero />
          {data.blocks.filter(({ visible }) => visible).map(({ key }) => {
            const Section = sections[key];
            return <Section key={key} />;
          })}
        </main>
      </HeadingStyle>
    </MagangProvider>
  );
}
