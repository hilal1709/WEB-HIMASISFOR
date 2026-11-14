import { redirect } from "next/navigation";

/** Pengelola prestasi lama digantikan Ruang Kurator. */
export default function LegacyAchievements() {
  redirect("/admin/prestasi");
}
