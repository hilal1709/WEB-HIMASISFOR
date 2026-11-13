import { getHomeContent } from "@/lib/home-cms/server";
import { SiteHeader as SiteHeaderView, Topbar as TopbarView } from "./site-header-view";

/** Kepala situs global — isinya dikelola di Studio Beranda (section "Kepala situs"). */
export async function Topbar() {
  const { header } = await getHomeContent();
  return <TopbarView content={header} />;
}

export async function SiteHeader() {
  const { header } = await getHomeContent();
  return <SiteHeaderView content={header} />;
}
