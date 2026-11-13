import { getHomeContent } from "@/lib/home-cms/server";
import { SiteFooter as SiteFooterView } from "./site-footer-view";

export { SOCIAL_ICON } from "./site-footer-view";

/** Kaki situs global — isinya dikelola di Studio Beranda (section "Kaki situs"). */
export async function SiteFooter() {
  const { footer } = await getHomeContent();
  return <SiteFooterView content={footer} />;
}
