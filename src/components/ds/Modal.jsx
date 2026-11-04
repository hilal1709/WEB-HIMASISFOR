"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SIZES = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl" };

/**
 * Modal Sisfor DS (shadcn Dialog + stagger GSAP pada isi).
 * <Modal open={open} onOpenChange={setOpen} title="Judul" description="…" footer={<Button/>}>…</Modal>
 */
export default function Modal({ open, onOpenChange, title, description, icon, footer, size = "md", className, children }) {
  const bodyRef = useRef(null);

  useGSAP(
    () => {
      if (!open || !bodyRef.current) return;
      gsap.fromTo(
        bodyRef.current.querySelectorAll("[data-modal-item]"),
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power3.out", delay: 0.05 }
      );
    },
    { dependencies: [open], scope: bodyRef }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SIZES[size], "max-h-[90vh] overflow-y-auto", className)}>
        <div ref={bodyRef} className="grid gap-4">
          {(title || icon) && (
            <DialogHeader data-modal-item>
              {icon && <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>}
              {title && <DialogTitle>{title}</DialogTitle>}
              {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
            </DialogHeader>
          )}
          {children && <div data-modal-item>{children}</div>}
          {footer && <DialogFooter data-modal-item>{footer}</DialogFooter>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
