import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { FileDown, FileSpreadsheet, Loader2, MoreVertical } from "lucide-react";

import { alertt } from "@/Redux/LanguageSlice";
import { getErrorMessage } from "@/lib/errorMessage";
import { excelBlobToPdf } from "@/lib/excelToPdf";
import { saveBlob } from "@/lib/tableExport";
import { cn } from "@/lib/utils";
import { tt } from "@/utils";

/**
 * Yuklab olish menyusi: "⋮" tugmasi, bosilganda nomi yozilgan bandlar
 * ("Excel formatda yuklab olish", "PDF formatda yuklab olish" va h.k.).
 *
 * Ilgari har bir jadvalda yonma-yon bir nechta "Excel" / "PDF" tugmalari
 * turardi va qaysi biri nima berishi tushunarsiz edi.
 *
 * Menyu `body` ga chiziladi va tugmaga nisbatan `fixed` joylashadi —
 * jadval (overflow) yoki modal ichida kesilib qolmaydi.
 */

export type ExportMenuItem = {
  key: string;
  label: string;
  /** Qo'shimcha izoh (kichik harfda, band ostida) */
  hint?: string;
  icon?: ReactNode;
  run: () => Promise<void> | void;
  /** Ko'rinadi, lekin bosib bo'lmaydi (masalan xodimda ruhsat yo'q) */
  disabled?: boolean;
  /** O'chirilganda sichqoncha ustiga kelganda chiqadigan izoh */
  disabledTitle?: string;
};

type Props = {
  items: ExportMenuItem[];
  /** Tugma ustidagi yozuv (title) */
  title?: string;
  className?: string;
  /** Kichik (jadval qatori uchun) */
  size?: "sm" | "xs";
};

export default function ExportMenu({ items, title, className, size = "sm" }: Props) {
  const dispatch = useDispatch();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Joylashuv: tugma ostida, o'ng chetga tekislangan; pastda joy bo'lmasa — tepada
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      const m = menuRef.current;
      if (!t || !m) return;
      const mw = m.offsetWidth;
      const mh = m.offsetHeight;
      let left = t.right - mw;
      if (left < 8) left = Math.min(t.left, window.innerWidth - mw - 8);
      let top = t.bottom + 6;
      if (top + mh > window.innerHeight - 8) top = Math.max(8, t.top - mh - 6);
      setPos({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = async (item: ExportMenuItem) => {
    setOpen(false);
    if (busy) return;
    setBusy(item.key);
    try {
      await item.run();
    } catch (error: any) {
      console.error(error);
      const failed = tt("Faylni yuklab olishda xatolik yuz berdi", "Ошибка при выгрузке файла");
      dispatch(
        alertt({
          success: false,
          // Server sababi bo'lsa o'sha ("Ma'lumot topilmadi" kabi), umumiy matn emas
          text:
            error?.message === "EMPTY"
              ? tt("Yuklab olish uchun ma'lumot yo'q", "Нет данных для выгрузки")
              : error?.message === "BAD_FILE"
              ? failed
              : getErrorMessage(error, failed),
        })
      );
    } finally {
      setBusy(null);
    }
  };

  if (!items.length) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={title ?? tt("Yuklab olish", "Скачать")}
        aria-label={title ?? tt("Yuklab olish", "Скачать")}
        onClick={(e) => {
          e.stopPropagation();
          setPos(null);
          setOpen((v) => !v);
        }}
        disabled={!!busy}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground",
          "transition-colors hover:bg-accent disabled:opacity-60 [&_svg]:shrink-0",
          size === "xs" ? "size-7 [&_svg]:size-4" : "size-8 [&_svg]:size-[1.125rem]",
          open && "bg-accent",
          className
        )}
      >
        {busy ? <Loader2 className="animate-spin" /> : <MoreVertical />}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? "visible" : "hidden",
            }}
            className="z-[1000] min-w-[15rem] max-w-[22rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                aria-disabled={item.disabled || undefined}
                title={item.disabled ? item.disabledTitle : undefined}
                onClick={() => !item.disabled && run(item)}
                className="flex w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-[0.8125rem] font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent [&_svg]:mt-px [&_svg]:size-4 [&_svg]:shrink-0"
              >
                {item.icon}
                <span className="flex min-w-0 flex-col">
                  <span>{item.label}</span>
                  {item.hint && (
                    <span className="text-[0.6875rem] font-normal text-muted-foreground">
                      {item.hint}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

/* ── Tayyor bandlar ─────────────────────────────────────────────────── */

export const excelIcon = <FileSpreadsheet className="text-success" />;
export const pdfIcon = <FileDown className="text-destructive" />;

/**
 * Backend hisobot (Excel fayl) uchun ikki band: Excel va xuddi o'sha
 * hisobotning PDF varianti (Excel faylning o'zidan yasaladi).
 *
 * `name` — hisobot nomi, masalan "Taqsimot vedomosti"; berilmasa umumiy
 * "Excel formatda / PDF formatda yuklab olish" yoziladi.
 */
export function reportItems(opts: {
  key: string;
  fetchBlob: () => Promise<Blob>;
  fileName: string;
  name?: string;
}): ExportMenuItem[] {
  const { key, fetchBlob, fileName, name } = opts;
  const base = fileName.replace(/\.xlsx?$/i, "");
  const get = async () => {
    const blob = await fetchBlob();
    // Server xato qaytarsa (JSON) — fayl sifatida saqlanmasin, uning matni ko'rsatilsin
    if (blob?.type.includes("json")) {
      const body = await blob.text().then(JSON.parse).catch(() => null);
      throw new Error(body?.message || "BAD_FILE");
    }
    if (!blob || blob.size === 0) throw new Error("BAD_FILE");
    return blob;
  };
  return [
    {
      key: `${key}-excel`,
      icon: excelIcon,
      label: name ? `${name} — Excel` : tt("Excel formatda yuklab olish", "Скачать в формате Excel"),
      hint: name ? tt("Excel formatda yuklab olish", "Скачать в формате Excel") : undefined,
      run: async () => saveBlob(await get(), `${base}.xlsx`),
    },
    {
      key: `${key}-pdf`,
      icon: pdfIcon,
      label: name ? `${name} — PDF` : tt("PDF formatda yuklab olish", "Скачать в формате PDF"),
      hint: name ? tt("PDF formatda yuklab olish", "Скачать в формате PDF") : undefined,
      run: async () => excelBlobToPdf(await get(), `${base}.pdf`),
    },
  ];
}
