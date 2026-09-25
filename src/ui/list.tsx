import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

/**
 * Ro'yxat sahifalari uchun umumiy qoliplar.
 *
 * Loyihadagi o'nlab sahifa bir xil tuzilishga ega: yuqorida filtrlar
 * paneli, o'rtada jadval, pastda jamlanma va sahifalash. Ilgari har biri
 * buni o'zicha yozardi — turlicha bo'shliq, turlicha chegara, ba'zilari
 * gorizontal aylanib ketardi. Shu yerdagi uchta komponent o'sha tuzilishni
 * bir joyga yig'adi.
 */

/** Sahifaning asosiy paneli: filtr + jadval + sahifalash bitta kartada */
export function ListCard({
  toolbar,
  footer,
  children,
  className,
  bodyClassName,
}: {
  /** Yuqoridagi filtrlar qatori */
  toolbar?: React.ReactNode;
  /** Pastdagi jamlanma va sahifalash */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        // Kompyuter ekranida karta ekrandan oshmaydi: filtrlar, jamlanma va
        // sahifalash doim ko'rinib turadi, faqat jadval o'zi aylanadi (sahifa
        // emas). 6rem — yuqori panel (h-14) va `main` ning tepa/past
        // bo'shlig'i (py-5), AppShell bilan mos bo'lishi shart. 24rem dan
        // pastga tushmaydi: juda past oynada jadval ko'rinmay qolmasin —
        // unda sahifaning o'zi aylanadi. Qisqa ro'yxatda karta mazmunicha.
        "lg:flex lg:max-h-[max(24rem,calc(100dvh_-_6rem))] lg:min-h-0 lg:flex-col",
        className
      )}
    >
      {toolbar && (
        <div className="shrink-0 border-b border-border px-3 py-3 sm:px-4">{toolbar}</div>
      )}

      {/* Jadval qutisi shu yerda qisqaradi va o'zi aylanadi. `--table-max-h`
          jadvallarning o'z balandlik chegarasini o'chiradi (`Table`,
          `DataTable`), oradagi o'ramlar esa `index.css` dagi `list-body`
          qoidasi bilan qisqaradi. `overflow-auto` — zaxira: nimadir
          qisqarmasa ham mazmun kesilib qolmasin. */}
      <div
        data-slot="list-body"
        className={cn(
          "min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-auto lg:[--table-max-h:none]",
          bodyClassName
        )}
      >
        {children}
      </div>

      {footer && (
        <div className="shrink-0 border-t border-border bg-muted/30">{footer}</div>
      )}
    </Card>
  );
}

/**
 * Filtrlar qatori. O'ralishga ruxsat beriladi — aks holda tor ekranda
 * boshqaruvlar karta chetidan chiqib ketadi.
 */
export function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

/** Qatorni ikkiga bo'ladi: chapda filtrlar, o'ngda amallar */
export function ToolbarSpacer() {
  return <div className="ml-auto" aria-hidden />;
}

const TONES = {
  neutral: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
} as const;

/** Jadval ostidagi kichik jamlanma katakchasi */
export function SummaryTile({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-md border border-border bg-card px-3 py-2",
        className
      )}
    >
      <p className="truncate text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-[0.875rem] font-semibold tabular-nums",
          TONES[tone]
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Jamlanma katakchalari uchun setka */
export function SummaryRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 px-3 pt-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
