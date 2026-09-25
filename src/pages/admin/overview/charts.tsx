import { useState } from "react";
import { tt } from "@/utils";

/**
 * "Qarzdorlik tahlili" sahifasining diagrammalari.
 *
 * Umumiy `@/ui` BarList/ColumnChart bu yerga to'g'ri kelmadi: BarList har
 * qatorni boshqa rangga bo'yaydi (qarz yoshi — bitta o'lchov, kamalak
 * noto'g'ri o'qiladi), ColumnChart'da o'q va yil belgisi yo'q.
 */

/** Butun so'm, bo'shliq bilan: 1 779 284 070 */
export const money = (v?: number | null) =>
  Math.round(Number(v) || 0).toLocaleString("ru-RU");

/** Qisqa: 1,78 mlrd · 350 mln · 12 ming */
export const compact = (v: number) => {
  const a = Math.abs(v);
  const f = (n: number, d = 1) =>
    n.toLocaleString("ru-RU", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  if (a >= 1e9) return `${f(v / 1e9, 2)} ${tt("mlrd", "млрд")}`;
  if (a >= 1e6) return `${f(v / 1e6, a >= 1e8 ? 0 : 1)} ${tt("mln", "млн")}`;
  if (a >= 1e3) return `${f(v / 1e3, 0)} ${tt("ming", "тыс.")}`;
  return f(v, 0);
};

/* ─────────────────────────── Qarz yoshi ─────────────────────────── */

export type AgingItem = { id: string; label: string; summa: number; count: number };

// Bitta rang (qizil), yosh oshgan sari to'qroq — ketma-ket o'lchov
const AGING_OPACITY = [0.35, 0.5, 0.65, 0.82, 1];

export function AgingBars({ items }: { items: AgingItem[] }) {
  const total = items.reduce((a, i) => a + i.summa, 0);
  const max = Math.max(...items.map((i) => i.summa), 1);

  if (!total) {
    return (
      <p className="py-8 text-center text-[0.8125rem] text-muted-foreground">
        {tt("Muddati o'tgan qarz yo'q", "Просроченного долга нет")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((it, i) => {
        const share = (it.summa / total) * 100;
        return (
          <div key={it.id}>
            <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
              <span className="font-medium text-foreground">{it.label}</span>
              <span className="tabular-nums font-semibold text-foreground">{money(it.summa)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 bg-muted">
                <div
                  className="h-full bg-destructive transition-[width] duration-500 ease-out"
                  style={{
                    width: `${it.summa ? Math.max((it.summa / max) * 100, 1.5) : 0}%`,
                    opacity: AGING_OPACITY[i] ?? 1,
                  }}
                />
              </div>
              <span className="w-[6.5rem] shrink-0 text-right text-[0.6875rem] tabular-nums text-muted-foreground">
                {it.count} {tt("ta", "шт.")} · {share.toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────── Oylar bo'yicha qolgan qarz ───────────────────── */

export type MonthPoint = {
  month: string; // YYYY-MM
  contract_summa: number;
  paid_summa: number;
  debt_summa: number;
};

const MONTHS_UZ = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const MONTHS_RU = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const monthName = (m: number) => tt(MONTHS_UZ[m - 1], MONTHS_RU[m - 1]);

/** O'q uchun "chiroyli" yuqori chegara: 1, 2, 2.5, 5 × 10^n */
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * p;
};

export function MonthlyDebtChart({ data, height = 15 }: { data: MonthPoint[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = niceMax(Math.max(...data.map((d) => d.debt_summa), 0));
  const ticks = [top, top / 2, 0];
  const peak = data.reduce((best, d, i) => (d.debt_summa > data[best].debt_summa ? i : best), 0);
  const h = hover != null ? data[hover] : null;

  return (
    <div className="flex w-full gap-2 pt-3">
      {/* Y o'qi — faqat 3 ta yozuv, xira */}
      <div className="relative w-[3.25rem] shrink-0" style={{ height: `${height}rem` }}>
        {ticks.map((t, i) => (
          <span
            key={i}
            className="absolute right-0 -translate-y-1/2 text-[0.625rem] tabular-nums text-muted-foreground"
            style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
          >
            {t ? compact(t) : "0"}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height: `${height}rem` }} onMouseLeave={() => setHover(null)}>
          {/* To'r chiziqlari */}
          {ticks.map((_, i) => (
            <div
              key={i}
              className={`absolute inset-x-0 border-t ${i === ticks.length - 1 ? "border-border" : "border-dashed border-border/60"}`}
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => {
              const pct = (d.debt_summa / top) * 100;
              const active = hover === i;
              return (
                <div
                  key={d.month}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                >
                  {/* Faqat eng baland ustunga yozuv — qolgani tooltipda */}
                  {i === peak && d.debt_summa > 0 && hover == null && (
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-1 text-[0.625rem] font-semibold tabular-nums text-foreground"
                      style={{ bottom: `${pct}%` }}
                    >
                      {compact(d.debt_summa)}
                    </span>
                  )}
                  <div
                    className={`w-full max-w-[2.5rem] rounded-t-[4px] transition-colors ${
                      active ? "bg-primary" : "bg-primary/45"
                    }`}
                    style={{ height: d.debt_summa ? `${Math.max(pct, 0.8)}%` : 0 }}
                  />
                </div>
              );
            })}
          </div>

          {h && hover != null && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-[12.5rem] border border-border bg-popover p-2.5 text-[0.75rem] text-popover-foreground shadow-md"
              style={
                hover > data.length / 2
                  ? { right: `${((data.length - hover) / data.length) * 100}%` }
                  : { left: `${((hover + 1) / data.length) * 100}%` }
              }
            >
              <div className="mb-1.5 font-semibold capitalize">
                {monthName(Number(h.month.slice(5)))} {h.month.slice(0, 4)}
              </div>
              <Row label={tt("Qolgan qarz", "Остаток долга")} value={money(h.debt_summa)} strong />
              <Row label={tt("Shartnomalar", "Договоры")} value={money(h.contract_summa)} />
              <Row
                label={tt("Undirilgan", "Собрано")}
                value={`${h.contract_summa ? ((h.paid_summa / h.contract_summa) * 100).toFixed(0) : 0}%`}
              />
            </div>
          )}
        </div>

        {/* Oy yorliqlari; yanvar (va birinchi ustun) ostida yil */}
        <div className="mt-1.5 flex gap-[2px]">
          {data.map((d, i) => {
            const m = Number(d.month.slice(5));
            const showYear = i === 0 || m === 1;
            return (
              <div key={d.month} className="min-w-0 flex-1 text-center leading-tight">
                <div
                  className={`truncate text-[0.625rem] ${
                    hover === i ? "font-semibold text-foreground" : "text-muted-foreground"
                  } ${i % 2 === 1 && data.length > 12 ? "max-md:invisible" : ""}`}
                >
                  {monthName(m)}
                </div>
                <div className="h-[0.875rem] text-[0.625rem] font-medium tabular-nums text-foreground">
                  {showYear ? d.month.slice(0, 4) : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
