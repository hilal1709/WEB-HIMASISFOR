"use client";
import AnimationProvider from "./AnimationProvider";
import Toaster from "@/components/ds/Toaster";
import { ConfirmProvider } from "@/components/ds/ConfirmProvider";

export default function AppProviders({ children }) {
  return (
    <AnimationProvider>
      <ConfirmProvider>
        {children}
        <Toaster />
      </ConfirmProvider>
    </AnimationProvider>
  );
}
