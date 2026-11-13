"use client";
import { ToastProvider } from "@/components/ui/toast";
import { AosProvider } from "@/components/motion/aos-provider";
import { LiveRefresh } from "@/components/realtime/live-refresh";

/** Provider global design system: toast + AOS + penyegaran realtime (Pusher). Dipasang sekali di app/layout.js */
export function Providers({ children }) {
  return (
    <AosProvider>
      <ToastProvider>
        {children}
        <LiveRefresh />
      </ToastProvider>
    </AosProvider>
  );
}
