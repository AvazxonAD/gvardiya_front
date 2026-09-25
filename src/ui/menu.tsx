import * as React from "react";
import { cn } from "@/lib/utils";

type MenuContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
};
const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error("Menu qismlari <Menu> ichida bo'lishi kerak");
  return ctx;
}

/**
 * Yengil ochiladigan menyu — tashqariga bosilganda va Escape bosilganda
 * yopiladi, klaviatura bilan boshqariladi. Qo'shimcha radix paketi talab
 * qilmaydi.
 */
function Menu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

function MenuTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen } = useMenu();
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

function MenuContent({
  className,
  align = "end",
  children,
}: {
  className?: string;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const { open } = useMenu();
  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        "absolute top-[calc(100%+0.375rem)] z-50 min-w-[13rem] animate-zoom-in",
        "overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

function MenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-2.5 py-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function MenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

type MenuItemProps = React.ComponentProps<"button"> & {
  /** Yopilmasin (masalan, checkbox rejimi) */
  keepOpen?: boolean;
  tone?: "default" | "danger";
};

function MenuItem({
  className,
  onClick,
  keepOpen,
  tone = "default",
  ...props
}: MenuItemProps) {
  const { setOpen } = useMenu();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => {
        onClick?.(e);
        if (!keepOpen) setOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[0.8125rem] font-medium",
        "outline-none transition-colors",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        tone === "danger"
          ? "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 [&_svg]:text-destructive"
          : "text-foreground hover:bg-accent focus-visible:bg-accent [&:hover_svg]:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Menu, MenuTrigger, MenuContent, MenuItem, MenuLabel, MenuSeparator };
