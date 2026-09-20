import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
  // Ma'lumot jadvallari uchun: 10 ta ustunli jadval 1200px da
  // qatorma-qator o'ralib ketardi. Katta ekranda kengroq joy beriladi,
  // kichigida esa oyna baribir ekranga sig'adi.
  full: "max-w-[min(1600px,calc(100vw-2rem))]",
} as const;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: keyof typeof SIZES;
  /** Pastdagi tugmalar qatori */
  footer?: React.ReactNode;
  /** Fonga bosganda yopilmasin (tahrir shakllari uchun) */
  dismissOnOverlay?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Yagona modal oyna. Loyihada 19 xil qo'lda yozilgan overlay bor edi —
 * yangi ekranlar faqat shuni ishlatadi.
 *
 * Escape bilan yopiladi, ochilganda sahifa skrolli bloklanadi, yopilganda
 * fokus chaqirgan elementga qaytadi.
 */
function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  dismissOnOverlay = true,
  className,
  children,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descId = React.useId();

  /*
   * `onClose` refda saqlanadi, chunki chaqiruvchilar uni deyarli har doim
   * joyida yozilgan strelka funksiyasi sifatida beradi (`onClose={() =>
   * setOpen(false)}`) — u har renderda YANGI funksiya bo'ladi.
   *
   * Ilgari quyidagi effekt `[open, onClose]` ga bog'langan edi va shu
   * sababli ota komponent har qayta renderlanganda (masalan, modal
   * ichidagi qidiruv maydoniga bitta harf yozilganda) effekt tozalanib,
   * qaytadan ishga tushardi: fokus avval chaqiruvchi tugmaga, keyin
   * modal ichidagi birinchi elementga sakrab, matn yozib bo'lmay
   * qolardi. Endi effekt faqat `open` ga bog'liq.
   */
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Escape + sahifa skrollini bloklash + fokusni tiklash
  React.useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Ochilgandan keyin fokusni panel ichiga olib kiramiz. Avval
    // MAZMUN qismidan qidiriladi: sarlavhadagi yopish tugmasi hujjat
    // tartibida birinchi bo'lgani uchun, butun panel bo'ylab qidirilsa
    // fokus doim o'shanga tushib qolardi.
    const raf = requestAnimationFrame(() => {
      const controls =
        "[data-autofocus], input:not([type=hidden]), textarea, select";
      const target =
        bodyRef.current?.querySelector<HTMLElement>(controls) ??
        panelRef.current?.querySelector<HTMLElement>(`${controls}, button`);
      target?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      openerRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-[2px]"
        onClick={dismissOnOverlay ? onClose : undefined}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative flex max-h-[calc(100vh-3rem)] w-full flex-col",
          "animate-zoom-in rounded-xl border border-border bg-card shadow-xl",
          SIZES[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="truncate text-base font-semibold leading-tight text-foreground"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 text-[13px] text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Yopish"
              className="-mr-1 -mt-1 shrink-0"
            >
              <X />
            </Button>
          </div>
        )}

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
        >
          {children}
        </div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export { Modal };
