import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegulasiShell } from "@/components/regulasi/regulasi-shell";
import { PreviewBridge } from "@/components/regulasi-cms/preview-bridge";
import { regulasiSnapshot } from "@/lib/regulasi-cms/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pratinjau Regulasi Akademik", robots: { index: false, follow: false } };

export default async function PreviewRegulasiPage() {
  if (!(await auth())?.user) redirect("/admin/login");
  const { value, curriculum } = await regulasiSnapshot();
  return <RegulasiShell><PreviewBridge initial={value} curriculum={curriculum} /></RegulasiShell>;
}
