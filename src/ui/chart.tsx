import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Yengil grafik primitivlari.
 *
 * Loyihada uchta grafik kutubxonasi bir vaqtda turibdi (chart.js,
 * recharts, @mui/x-charts). Oddiy taqqoslash va ulush ko'rsatish uchun
 * ularning hech biri kerak emas — quyidagilar sof SVG/CSS, mavzu
 * tokenlariga bog'langan va bundle'ga hech nima qo'shmaydi.
 */

/** Diagramma ohanglari soni — `--chart-1..10` tokenlari */
export const CHART_TONES = 10;

/** Diagramma rangi — ohanglar aylanma tarzda beriladi */
export const chartColor = (i: number) =>
  `hsl(var(--chart-${(i % CHART_TONES) + 1}))`;

/* ═══════════════════════════════════════════════════════════════════
   BarList — nomlangan qiymatlarni taqqoslash
   ═══════════════════════════════════════════════════════════════════ */

export type BarListItem = {
  id: string | number;
  label: string;
  value: number;
  /** O'ngda ko'rsatiladigan formatlangan matn */
  display?: string;
  /** Qo'shimcha kichik izoh */
  meta?: string;
};

export function BarList({
  items,
  onSelect,
  activeId,
  emptyText = "Ma'lumot yo'q",
  className,
}: {
  items: BarListItem[];
  onSelect?: (item: BarListItem) => void;
  activeId?: string | number | null;
  emptyText?: string;
  className?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  if (!items.length) {
    return (
      <p className={cn("py-8 text-center text-[13px] text-muted-foreground", className)}>
        {emptyText}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, i) => {
        const pct = Math.max((item.value / max) * 100, 1.5);
        const active = activeId != null && activeId === item.id;
        const Row = onSelect ? "button" : "div";

        return (
          <Row
            key={item.id}
            {...(onSelect
              ? { type: "button" as const, onClick: () => onSelect(item) }
              : {})}
            className={cn(
              "group w-full rounded-md px-2 py-1.5 text-left transition-colors",
              onSelect && "hover:bg-accent",
              active && "bg-accent"
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] font-medium text-foreground">
                {item.label}
              </span>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                {item.display ?? item.value.toLocaleString("ru-RU")}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-none bg-muted">
                <div
                  className="h-full rounded-none transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: chartColor(i) }}
                />
              </div>
              {item.meta && (
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {item.meta}
                </span>
              )}
            </div>
          </Row>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Donut — ulushlar. Bo'laklar bosiladigan bo'lishi mumkin.
   ═══════════════════════════════════════════════════════════════════ */

export type DonutSlice = {
  id: string | number;
  label: string;
  value: number;
  /** Ohangni majburan belgilash — aks holda tartib raqami bo'yicha */
  color?: string;
};

export function Donut({
  data,
  size = 190,
  thickness = 26,
  centerLabel,
  centerValue,
  onSelect,
  activeId,
  formatValue = (v) => v.toLocaleString("ru-RU"),
  className,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: React.ReactNode;
  centerValue?: React.ReactNode;
  onSelect?: (slice: DonutSlice) => void;
  activeId?: string | number | null;
  formatValue?: (v: number) => string;
  className?: string;
}) {
  const [hovered, setHovered] = React.useState<DonutSlice | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 overflow-visible" role="img">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className="stroke-muted"
        />
        {total > 0 &&
          data.map((d, i) => {
            const len = (d.value / total) * circumference;
            const dash = `${len} ${circumference - len}`;
            const active =
              hovered?.id === d.id || (activeId != null && activeId === d.id);

            const el = (
              <circle
                key={`${d.id}-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                strokeWidth={active ? thickness + 6 : thickness}
                stroke={d.color ?? chartColor(i)}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className={cn(
                  "transition-[stroke-width] duration-150",
                  onSelect && "cursor-pointer"
                )}
                onMouseEnter={() => setHovered(d)}
                onMouseLeave={() => setHovered(null)}
                onClick={onSelect ? () => onSelect(d) : undefined}
              >
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {hovered ? (
          <>
            <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">
              {hovered.label}
            </span>
            <span className="mt-0.5 text-[15px] font-semibold leading-tight tabular-nums text-foreground">
              {formatValue(hovered.value)}
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {total > 0 ? ((hovered.value / total) * 100).toFixed(1) : 0}%
            </span>
          </>
        ) : (
          <>
            {centerValue && (
              <span className="text-[16px] font-semibold leading-tight tabular-nums text-foreground">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {centerLabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Legend — donut yonidagi ro'yxat, bosiladigan bo'lishi mumkin
   ═══════════════════════════════════════════════════════════════════ */

export type LegendItem = {
  id?: string | number;
  label: string;
  value?: string;
  percent?: number;
  color?: string;
};

export function Legend({
  items,
  onSelect,
  activeId,
  className,
}: {
  items: LegendItem[];
  onSelect?: (item: LegendItem, index: number) => void;
  activeId?: string | number | null;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-0.5", className)}>
      {items.map((it, i) => {
        const Row = onSelect ? "button" : "div";
        const active = activeId != null && it.id === activeId;

        return (
          <li key={`${it.id ?? it.label}-${i}`}>
            <Row
              {...(onSelect
                ? { type: "button" as const, onClick: () => onSelect(it, i) }
                : {})}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                onSelect && "hover:bg-accent",
                active && "bg-accent"
              )}
            >
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: it.color ?? chartColor(i) }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {it.label}
              </span>
              {it.percent != null && (
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {it.percent.toFixed(1)}%
                </span>
              )}
              {it.value && (
                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  {it.value}
                </span>
              )}
            </Row>
          </li>
        );
      })}
    </ul>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ColumnChart — trend
   ═══════════════════════════════════════════════════════════════════ */

export type Column = { label: string; value: number; highlight?: boolean };

export function ColumnChart({
  data,
  height = 200,
  formatValue = (v: number) => v.toLocaleString("ru-RU"),
  className,
}: {
  data: Column[];
  height?: number;
  formatValue?: (v: number) => string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1 sm:gap-1.5" style={{ height }} role="img">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${d.label}: ${formatValue(d.value)}`}
            >
              <span className="pointer-events-none absolute inset-x-0 -top-1 z-10 hidden -translate-y-full justify-center group-hover:flex">
                <span className="whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium tabular-nums text-popover-foreground shadow-md">
                  {formatValue(d.value)}
                </span>
              </span>

              <div
                className={cn(
                  "w-full rounded-t-[3px] transition-[height,opacity] duration-500 ease-out",
                  d.highlight
                    ? "bg-primary"
                    : "bg-primary/35 group-hover:bg-primary/60"
                )}
                style={{ height: `${Math.max(pct, 1)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1 border-t border-border pt-2 sm:gap-1.5">
        {data.map((d, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 text-center text-[10px] uppercase tracking-wide",
              d.highlight
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
