"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CloseGlyph } from "@/components/home/glyphs";
import { cn } from "@/lib/utils";

/** shadcn/ui Sheet (panel samping / lembar bawah berbasis Radix Dialog). `side`: right | left | bottom. */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({ side = "right", className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-[60] flex flex-col bg-background shadow-xl outline-none duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "bottom"
            ? "inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-xl border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
            : side === "right"
              ? "inset-y-0 right-0 w-[min(88vw,380px)] border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
              : "inset-y-0 left-0 w-[min(88vw,380px)] border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Tutup menu"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <CloseGlyph className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn("text-base font-semibold", className)} {...props} />;
}
export function SheetDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={cn("sr-only", className)} {...props} />;
}
