"use client";
import { useEffect, useState } from "react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** true di layar < 640px. */
export function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setCompact(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return compact;
}

/** Modal di layar lebar, lembar bawah (`Sheet side="bottom"`) di ponsel. */
export function ResponsiveDialog({ open, onOpenChange, children, className, sheetClassName, ...props }) {
  const compact = useCompact();
  if (compact)
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className={cn("bg-white p-0", sheetClassName)} {...props}>
          {children}
        </SheetContent>
      </Sheet>
    );
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={cn("max-h-[88dvh] overflow-y-auto p-0", className)} {...props}>
        {children}
      </ModalContent>
    </Modal>
  );
}
