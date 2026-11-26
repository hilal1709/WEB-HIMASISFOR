"use client";
import { CURTAIN_KEY } from "@/lib/regulasi-content";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { RegulasiProvider } from "./regulasi-provider";
import { RegulasiHero } from "./regulasi-hero";
import { RuleSimulator } from "./rule-simulator";
import { RuleReader } from "./rule-reader";
import { ScenarioFlow } from "./scenario-flow";
import { DocShelf } from "./doc-shelf";
import { RegulasiClosing } from "./regulasi-closing";

export function RegulasiBody({ data, preview = false }) {
  return (
    <>
      {!preview && <PageCurtain storageKey={CURTAIN_KEY} {...data.curtain} />}
      <RegulasiProvider data={data} preview={preview}>
        <HeadingStyle value="bar">
          <main>
            <RegulasiHero />
            <RuleSimulator />
            <RuleReader />
            <ScenarioFlow />
            <DocShelf />
            <RegulasiClosing />
          </main>
        </HeadingStyle>
      </RegulasiProvider>
    </>
  );
}
