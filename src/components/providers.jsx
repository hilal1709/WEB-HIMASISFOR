"use client";
import { ToastProvider } from "@/components/ui/toast";
import { AosProvider } from "@/components/motion/aos-provider";

/** Provider global design system: toast + AOS. Dipasang sekali di app/layout.js */
export function Providers({ children }) {
  return (
    <AosProvider>
      <ToastProvider>{children}</ToastProvider>
    </AosProvider>
  );
}
