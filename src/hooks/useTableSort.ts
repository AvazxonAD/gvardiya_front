import { useCallback, useState } from "react";

export type SortDir = "asc" | "desc";
export type SortState = { by: string; dir: SortDir } | null;

/**
 * Jadval ustunlari bo'yicha saralash holati — saralashning o'zi BACKENDDA.
 *
 * Sarlavha bosilganda: o'sish → kamayish → saralashsiz (standart tartib).
 * `sort` ni `usePagedFetch` filtrlariga qo'shing — o'zgarganda ro'yxat
 * 1-sahifadan qayta olinadi; so'rovga `sortParams(sort)` qo'shiladi.
 */
export function useTableSort(initial: SortState = null) {
  const [sort, setSort] = useState<SortState>(initial);

  const toggle = useCallback((key: string) => {
    setSort((prev) => {
      if (!prev || prev.by !== key) return { by: key, dir: "asc" };
      if (prev.dir === "asc") return { by: key, dir: "desc" };
      return null;
    });
  }, []);

  const reset = useCallback(() => setSort(initial), [initial]);

  return { sort, setSort, toggle, reset };
}

/** So'rov qatoriga qo'shiladigan qism: "&sort_by=...&sort_dir=..." (yoki bo'sh). */
export const sortParams = (sort: SortState) =>
  sort ? `&sort_by=${encodeURIComponent(sort.by)}&sort_dir=${sort.dir}` : "";

/** Params obyekti ko'rinishida (axios/useRequest uchun). */
export const sortParamsObject = (sort: SortState) =>
  sort ? { sort_by: sort.by, sort_dir: sort.dir } : {};
