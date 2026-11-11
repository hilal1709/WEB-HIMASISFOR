"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Modal custom berbasis Radix Dialog (aksesibel: fokus terkunci, Esc menutup). */
export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;

export function ModalContent({ className, children, hideClose = false, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-navy-deep/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-line bg-white p-6 text-text shadow-[0_30px_80px_-30px_rgb(14_24_48/0.6)] outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        <div className="absolute inset-x-0 top-0 flex h-1">
          <span className="w-2/3 bg-maroon" />
          <span className="flex-1 bg-gold" />
        </div>
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Tutup"
            className="absolute right-4 top-4 rounded-md p-1.5 text-text/50 transition-colors hover:bg-cream hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function ModalHeader({ className, ...props }) {
  return <div className={cn("mb-4 flex flex-col gap-1.5 pr-6", className)} {...props} />;
}
export function ModalTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn("font-serif text-xl leading-snug text-navy", className)} {...props} />;
}
export function ModalDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn("text-sm leading-relaxed text-text/65", className)} {...props} />;
}
export function ModalFooter({ className, ...props }) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

/** Dialog konfirmasi siap pakai (mis. hapus data di CMS). */
export function ConfirmModal({
  open,
  onOpenChange,
  title = "Yakin?",
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  destructive = false,
  loading = false,
  onConfirm,
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline-navy" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "maroon"} className={destructive ? "rounded-md" : undefined} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
