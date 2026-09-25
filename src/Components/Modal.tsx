/** @format */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn, pxToRem } from "@/lib/utils";
import { Button } from "@/ui";

/**
 * Loyihaning eski modali — ko'rinishi `@/ui` Modal bilan tenglashtirildi
 * (burchak radiusi, soya, balandlik chegarasi, yopish tugmasi).
 *
 * Props interfeysi o'zgarmadi (`open`, `closeModal`, `title`, `w`, `style`,
 * `className`): 23 ta sahifa shu ko'rinishda chaqiradi. Ko'rinishdan tashqari
 * uchta xatti-harakat qo'shildi:
 *  - Escape bosilganda yopiladi;
 *  - ochiq turganda orqa fon aylanmaydi;
 *  - portal orqali `body` ga chiziladi, shuning uchun ota elementning
 *    `overflow`/`transform` uslublari modalni kesib qo'ymaydi.
 */
function Modal({
  closeModal,
  open,
  title,
  children,
  w,
  style,
  className,
}: any) {
  /* `closeModal` refda saqlanadi: chaqiruvchilar uni deyarli har doim
     joyida yozilgan strelka funksiyasi sifatida beradi va u har renderda
     YANGI bo'ladi. Effekt unga bog'langanida, modal ichidagi maydonga
     bitta harf yozilishi ham effektni tozalab, qaytadan ishga tushirardi
     — `body` ning `overflow` i bir zumda ochilib-yopilib, sahifa
     titrardi. Endi effekt faqat `open` ga bog'liq. */
  const closeModalRef = useRef(closeModal);
  useEffect(() => {
    closeModalRef.current = closeModal;
  });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModalRef.current?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-[2px]"
        onClick={closeModal}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        style={{ width: pxToRem(w) ?? "25rem", ...style }}
        className={cn(
          "relative z-10 flex max-h-[calc(100vh-3rem)] max-w-full animate-zoom-in flex-col",
          "rounded-xl border border-border bg-card text-card-foreground shadow-xl",
          className
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="truncate text-base font-semibold leading-tight text-foreground">
            {title}
          </h2>
          {closeModal && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeModal}
              aria-label="Yopish"
              className="-mr-1 -mt-1 shrink-0"
            >
              <X />
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
