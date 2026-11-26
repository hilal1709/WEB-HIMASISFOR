import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";

export function RegulasiShell({ children }) {
  return (
    <div className="kampus" data-aos-wait>
      <Topbar />
      <SiteHeader />
      {children}
      <SiteFooter />
      <AosReady />
    </div>
  );
}
