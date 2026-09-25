import { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortState } from "@/hooks/useTableSort";

export type ITheadItem = {
  className?: string;
  text: string;
  /**
   * Backenddagi saralash kaliti (`sort_by`). Berilsa sarlavha bosiladigan
   * bo'ladi va `onSort` chaqiriladi.
   */
  sortKey?: string;
};

type Props = {
  thead: ITheadItem[];
  children: ReactNode;
  theadClassName?: string;
  tableClassName?: string;
  tbodyClassName?: string;
  tbodyStyle?: CSSProperties;
  tableStyle?: CSSProperties;
  theadStyle?: CSSProperties;
  /** Joriy saralash holati (`useTableSort` dan). */
  sort?: SortState;
  /** Sarlavha bosilganda — odatda `useTableSort().toggle`. */
  onSort?: (key: string) => void;
};

/**
 * O'z `<table>` ini chizadigan jadvallar uchun: sarlavha matni + saralash
 * belgisi. `<th onClick={() => onSort(key)}><SortLabel .../></th>`.
 */
export const SortLabel = ({
  text,
  sortKey,
  sort,
}: {
  text: ReactNode;
  sortKey: string;
  sort?: SortState;
}) => {
  const active = sort?.by === sortKey;
  const Icon = !active ? ArrowUpDown : sort?.dir === "desc" ? ArrowDown : ArrowUp;
  return (
    <span className="inline-flex cursor-pointer select-none items-center gap-1">
      {text}
      <Icon className={cn("size-3 shrink-0", !active && "opacity-40")} />
    </span>
  );
};

/**
 * Loyihaning umumiy jadvali — yangi dizayn tokenlariga o'tkazildi.
 *
 * Props interfeysi o'zgarmadi. Ikki narsa shu yerda markazlashtirilgan:
 *
 * 1. Sarlavha qatori yopishqoq (`sticky`) — uzun ro'yxatni aylantirganda
 *    ustun nomlari ko'rinib turadi.
 * 2. Excel kabi to'liq katak chegaralari. `border-collapse` emas,
 *    `border-separate` ishlatiladi: yopishqoq sarlavhada birinchisi
 *    chegarani "yo'qotib" qo'yadi (brauzer uni jadval bilan birga
 *    aylantiradi), ikkinchisida esa chegara katakning o'ziga tegishli
 *    bo'lgani uchun joyida qoladi. Ikki marta chiziq chiqmasligi uchun
 *    har bir katakda faqat o'ng va past chegara bor, chap/yuqori chegara
 *    esa birinchi ustun va sarlavhaga beriladi.
 */
const Table = ({
  thead,
  children,
  theadClassName,
  tableClassName,
  tbodyClassName,
  tbodyStyle,
  tableStyle,
  theadStyle,
  sort,
  onSort,
}: Props) => {
  return (
    // Sarlavha yopishqoq bo'lishi uchun aynan shu quti aylanishi kerak:
    // balandlik chegaralanmasa sahifa aylanadi va `sticky` ish bermaydi.
    // `ListCard` ichida chegara o'chadi (`--table-max-h: none`) — u yerda
    // quti karta balandligiga qarab qisqaradi.
    <div
      data-slot="table-scroll"
      className={cn(
        "w-full max-h-[var(--table-max-h,calc(100vh_-_16rem))] overflow-auto",
        tableClassName
      )}
      style={tableStyle}
    >
      <table className="table-grid w-full">
        <thead
          style={theadStyle}
          className={cn(
            "bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/60",
            theadClassName,
            // Yopishqoqlik shu qutining tepasiga bog'langan va sahifalar uni
            // bekor qila olmaydi: eski `top-[80px]` sarlavhani jadval o'rtasida
            // qoldirib, ustidagi qatorlarni yopib qo'yardi.
            "sticky top-0 z-20"
          )}
        >
          <tr>
            {thead.map((e, ind) => {
              const sortable = !!(e.sortKey && onSort);
              const active = sortable && sort?.by === e.sortKey;
              const Icon = !active ? ArrowUpDown : sort?.dir === "desc" ? ArrowDown : ArrowUp;
              return (
                <th
                  key={ind}
                  aria-sort={active ? (sort?.dir === "desc" ? "descending" : "ascending") : undefined}
                  className={cn(
                    "whitespace-nowrap px-4 py-2.5 text-left align-middle",
                    "text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground",
                    e.className,
                    sortable && "cursor-pointer select-none hover:text-foreground",
                    active && "text-foreground"
                  )}
                  onClick={sortable ? () => onSort!(e.sortKey!) : undefined}
                >
                  {sortable ? (
                    <span className="inline-flex items-center gap-1">
                      {e.text}
                      <Icon className={cn("size-3 shrink-0", !active && "opacity-40")} />
                    </span>
                  ) : (
                    e.text
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody
          style={tbodyStyle}
          className={cn(
            "text-[0.8125rem] text-foreground",
            "[&>tr]:transition-colors [&>tr:hover]:bg-accent/50",
            "[&>tr>td]:px-4 [&>tr>td]:py-2.5 [&>tr>td]:align-middle",
            tbodyClassName
          )}
        >
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
