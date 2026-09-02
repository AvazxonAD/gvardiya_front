import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

/* ═══════════════════════════════════════════════════════════════════
   PageHeader — sarlavha + harakatlar qatori
   ═══════════════════════════════════════════════════════════════════ */

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-3",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-[22px]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   StatCard — asosiy ko'rsatkich
   ═══════════════════════════════════════════════════════════════════ */

const TONES = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
  brand: "text-brand bg-brand/10",
  neutral: "text-muted-foreground bg-muted",
} as const;

export function StatCard({
  label,
  value,
  hint,
  badge,
  icon: Icon,
  tone = "primary",
  loading,
  onClick,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Qiymat yonidagi kichik belgi — ulush foizi va h.k. */
  badge?: React.ReactNode;
  icon?: LucideIcon;
  tone?: keyof typeof TONES;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Root = onClick ? "button" : "div";

  return (
    <Root
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "flex items-start gap-3.5 rounded-lg border border-border bg-card p-4 text-left shadow-sm",
        "transition-[border-color,box-shadow,transform] duration-200",
        onClick &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md",
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            TONES[tone]
          )}
          aria-hidden
        >
          <Icon className="size-[18px]" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-1.5 h-6 w-24" />
        ) : (
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="truncate text-[20px] font-semibold leading-tight tabular-nums text-foreground">
              {value}
            </p>
            {badge}
          </div>
        )}
        {hint && !loading && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </Root>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EmptyState
   ═══════════════════════════════════════════════════════════════════ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <span className="mb-1 flex size-11 items-center justify-center rounded-none bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <p className="text-[14px] font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DataTable — yagona jadval ko'rinishi
   ═══════════════════════════════════════════════════════════════════ */

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  /** Katak mazmuni */
  cell: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  /** Ustun kengligi, masalan "48px" yoki "20%" */
  width?: string;
  /** `md` dan kichik ekranda yashiriladi */
  hideOnMobile?: boolean;
  /**
   * Berilsa, ustun sarlavhasi bosiladigan bo'ladi va jadval shu
   * qiymat bo'yicha saralanadi.
   */
  sortValue?: (row: T) => number | string;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

export function DataTable<T>({
  columns,
  rows,
  keyOf,
  onRowClick,
  loading,
  loadingRows = 6,
  empty,
  stickyHeader = true,
  /** Berilsa, jadval shu balandlikda ichki skroll bo'ladi */
  maxHeight,
  defaultSort,
  fixedLayout,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  keyOf: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  loadingRows?: number;
  empty?: React.ReactNode;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  /**
   * `table-layout: fixed` — ustun kengliklari aynan bajariladi.
   *
   * Odatiy `auto` rejimda `width` faqat maslahat: brauzer uni mazmunga
   * qarab qayta taqsimlaydi va `truncate` (nowrap) bo'lgan ustunlar
   * o'zlariga keragidan ko'p joy tortib oladi. Kengliklar muhim bo'lgan
   * jadvallarda shuni yoqing.
   */
  fixedLayout?: boolean;
  className?: string;
}) {
  const [sort, setSort] = React.useState<SortState>(defaultSort ?? null);

  const alignClass = (a?: Column<T>["align"]) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;

    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "ru") * dir;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key: string) =>
    setSort((cur) =>
      cur?.key !== key
        ? { key, dir: "desc" }
        : cur.dir === "desc"
        ? { key, dir: "asc" }
        : null
    );

  return (
    <div
      className={cn(
        "w-full overflow-auto",
        // Yopishqoq sarlavha faqat quti balandligi chegaralanganda ishlaydi:
        // aks holda sahifaning o'zi aylanadi va sarlavha u bilan ketadi.
        stickyHeader && !maxHeight && "max-h-[calc(100vh-16rem)]",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        className={cn("table-grid w-full text-[13px]", fixedLayout && "table-fixed")}
      >
        <thead
          className={cn(
            "bg-muted/60",
            stickyHeader && "sticky top-0 z-10 backdrop-blur-sm"
          )}
        >
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const headCls = cn(
                "whitespace-nowrap border-b border-border px-3 py-2.5",
                "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                alignClass(c.align),
                c.hideOnMobile && "hidden md:table-cell"
              );

              if (!c.sortValue) {
                return (
                  <th
                    key={c.key}
                    scope="col"
                    style={c.width ? { width: c.width } : undefined}
                    className={headCls}
                  >
                    {c.header}
                  </th>
                );
              }

              return (
                <th
                  key={c.key}
                  scope="col"
                  style={c.width ? { width: c.width } : undefined}
                  aria-sort={
                    active
                      ? sort!.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={cn(headCls, "p-0")}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className={cn(
                      "flex w-full items-center gap-1 px-3 py-2.5 transition-colors hover:text-foreground",
                      c.align === "right" && "justify-end",
                      c.align === "center" && "justify-center",
                      active && "text-foreground"
                    )}
                  >
                    {c.header}
                    {active ? (
                      sort!.dir === "asc" ? (
                        <ArrowUp className="size-3 shrink-0" />
                      ) : (
                        <ArrowDown className="size-3 shrink-0" />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 shrink-0 opacity-40" />
                    )}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 py-2.5",
                      c.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    <Skeleton className="h-3.5 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty ?? <EmptyState title="Ma'lumot topilmadi" />}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, i) => (
              <tr
                key={keyOf(row, i)}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cn(
                  "border-b border-border transition-colors last:border-0",
                  onRowClick
                    ? "cursor-pointer hover:bg-accent"
                    : "hover:bg-muted/40"
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 py-2.5 text-foreground",
                      alignClass(c.align),
                      c.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    {c.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MiniBar — jadval katagi ichidagi ulush chizig'i
   ═══════════════════════════════════════════════════════════════════ */

export function MiniBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const p = Math.max(0, Math.min(100, percent || 0));
  return (
    <span className={cn("flex items-center justify-end gap-2", className)}>
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-none bg-muted sm:block">
        <span
          className="block h-full rounded-none bg-primary transition-[width] duration-500"
          style={{ width: `${p}%` }}
        />
      </span>
      <span className="w-9 text-right text-[12px] tabular-nums text-muted-foreground">
        {p.toFixed(0)}%
      </span>
    </span>
  );
}
