import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { tt } from "../utils";
import Select from "./Select";

const PAGE_SIZES = [10, 15, 20, 30, 40, 50, 100].map((n) => ({
  id: n,
  name: String(n),
}));

/**
 * Sahifalash — yangi dizayn tokenlariga o'tkazildi.
 *
 * Props interfeysi o'zgarmadi. `framer-motion` olib tashlandi: bu yerda u
 * faqat bosishdagi kichik masshtab uchun ishlatilardi, xuddi shu narsa CSS
 * bilan ham bo'ladi va har bir sahifada ortiqcha kutubxona yuklanmaydi.
 */
const Paginatsiya = ({
  currentPage,
  setCurrentPage,
  totalPages,
  limet,
  setLimet,
  count,
}: any) => {
  const getVisiblePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 2) return [1, 2, 3, "..."];
    if (currentPage >= totalPages - 1)
      return ["...", totalPages - 2, totalPages - 1, totalPages];
    return ["...", currentPage - 1, currentPage, currentPage + 1, "..."];
  };

  const atStart = currentPage <= 1;
  const atEnd = currentPage >= totalPages;

  const stepClass = (disabled: boolean) =>
    cn(
      "flex h-8 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium",
      "transition-colors active:scale-[0.98]",
      disabled
        ? "cursor-not-allowed text-muted-foreground/50"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    );

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 py-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={stepClass(atStart)}
          onClick={() => !atStart && setCurrentPage(currentPage - 1)}
          disabled={atStart}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">{tt("Oldinga", "Назад")}</span>
        </button>

        {getVisiblePages().map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              type="button"
              aria-current={currentPage === page ? "page" : undefined}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "size-8 rounded-md text-[13px] font-medium tabular-nums",
                "transition-colors active:scale-[0.98]",
                currentPage === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              className="w-6 text-center text-[13px] text-muted-foreground"
            >
              …
            </span>
          )
        )}

        <button
          type="button"
          className={stepClass(atEnd)}
          onClick={() => !atEnd && setCurrentPage(currentPage + 1)}
          disabled={atEnd}
        >
          <span className="hidden sm:inline">{tt("Keyingi", "Вперёд")}</span>
          <ChevronRight className="size-4" />
        </button>
      </div>

      {limet && (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span>{tt("qatorlar:", "строк:")}</span>
          <Select
            value={limet}
            up
            data={PAGE_SIZES}
            onChange={(e: any) => setLimet(e)}
            w={88}
          />
          <span className="ml-1">{tt("jami:", "итого:")}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {count}
          </span>
        </div>
      )}
    </div>
  );
};

export default Paginatsiya;
