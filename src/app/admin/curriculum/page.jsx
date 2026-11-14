import { redirect } from "next/navigation";

/** Pengelola kurikulum lama digantikan Kartografer Kurikulum. */
export default function CurriculumRedirect() {
  redirect("/admin/kurikulum");
}
