"use client";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronGlyph } from "@/components/home/glyphs";
import { cn } from "@/lib/utils";

/** shadcn/ui NavigationMenu (Radix) — dropdown navbar, aksesibel keyboard. */
export function NavigationMenu({ className, children, ...props }) {
  return (
    <NavigationMenuPrimitive.Root className={cn("relative z-10 flex items-center", className)} {...props}>
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({ className, ...props }) {
  return <NavigationMenuPrimitive.List className={cn("flex list-none items-center gap-1", className)} {...props} />;
}

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export const navTriggerClass =
  "nav-link group relative inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground data-[state=open]:text-foreground data-[active]:text-foreground";

export function NavigationMenuTrigger({ className, children, ...props }) {
  return (
    <NavigationMenuPrimitive.Trigger className={cn(navTriggerClass, className)} {...props}>
      {children}
      <ChevronGlyph
        className="size-3.5 opacity-60 transition-transform duration-300 group-data-[state=open]:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

export function NavigationMenuContent({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "absolute left-0 top-full mt-2 w-max min-w-[16rem] rounded-xl border bg-popover p-2 text-popover-foreground shadow-[0_18px_40px_-18px_rgb(26_6_7/0.25)]",
        "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in-0 data-[motion^=from-]:slide-in-from-top-1",
        "data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

export const NavigationMenuLink = NavigationMenuPrimitive.Link;
