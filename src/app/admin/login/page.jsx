import { Suspense } from "react";
import { LoginShell } from "@/components/login/login-shell";

export const metadata = {
  title: "Masuk CMS - Sistem Informasi UISI",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginShell />
    </Suspense>
  );
}
