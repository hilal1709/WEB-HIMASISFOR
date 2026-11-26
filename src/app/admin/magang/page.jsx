import { readdir } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MagangEditor } from "@/components/magang-cms/editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "CMS Magang", robots: { index: false, follow: false } };

export default async function AdminMagangPage() {
  if (!(await auth())?.user) redirect("/admin/login");
  const files = await readdir(path.join(process.cwd(), "public", "lottie")).catch(() => []);
  const assets = files.filter((file) => /^[a-z0-9_-]+\.json$/i.test(file)).sort().map((file) => [
    "/lottie/" + file, file.slice(0, -5).replaceAll("-", " "),
  ]);
  return <MagangEditor assets={assets} />;
}
