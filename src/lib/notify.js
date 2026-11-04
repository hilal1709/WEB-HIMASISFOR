import { toast } from "sonner";

/**
 * API toast Sisfor DS — pengganti alert().
 *   notify.success("Data tersimpan")
 *   notify.error("Gagal menyimpan", { description: err.message })
 *   notify.promise(fetch(...), { loading: "Menyimpan…", success: "Tersimpan", error: "Gagal" })
 */
export const notify = {
  success: (title, opts) => toast.success(title, opts),
  error: (title, opts) => toast.error(title, opts),
  warning: (title, opts) => toast.warning(title, opts),
  info: (title, opts) => toast.info(title, opts),
  promise: (promise, msgs) => toast.promise(promise, msgs),
  dismiss: (id) => toast.dismiss(id),
};

export default notify;
