import { PageLoader } from "@/components/ui/loader";
import { COPY } from "@/lib/konversi-cms/copy";
import { readPublicKonversi } from "@/lib/konversi-cms/server";

export default async function Loading() {
  const feedback = await readPublicKonversi().then((data) => data.copy.feedback).catch(() => COPY.feedback);
  return <PageLoader label={feedback.routeLoading} />;
}
