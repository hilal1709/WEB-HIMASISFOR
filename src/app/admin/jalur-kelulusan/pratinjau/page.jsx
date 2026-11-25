import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JalurView } from "@/components/jalur/jalur-view";
import { readPreviewJalur } from "@/lib/jalur-cms/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pratinjau Jalur Kelulusan", robots: { index: false, follow: false } };

export default async function PreviewJalurPage() {
  if (!(await auth())?.user) redirect("/admin/login");
  return <JalurView data={await readPreviewJalur()} />;
}
