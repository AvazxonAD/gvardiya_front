import { useEffect, useRef } from "react";

type Args = {
  /** Joriy sahifa raqami */
  page: number;
  /** Sahifa raqamini o'zgartiruvchi setter */
  setPage: (page: number) => void;
  /** Filtr qiymatlari: qidiruv matni, tanlangan batalon, sana oralig'i va h.k. */
  filters: unknown[];
  /**
   * Ma'lumotni serverdan olib keluvchi funksiya.
   * Tozalash funksiyasini qaytarsa (masalan, kechikkan javobni bekor qilish
   * uchun `stale` bayrog'i), u `useEffect` tozalashi sifatida ishlatiladi.
   */
  fetch: () => unknown;
};

/**
 * Sahifalangan ro'yxatlar uchun: filtr o'zgarsa 1-sahifaga qaytaradi,
 * qolgan hollarda joriy sahifa ma'lumotini oladi.
 *
 * Ilgari har bir sahifada shu mantiq qo'lda yozilgan va xato edi:
 *
 *     if ((searchId || searchingText) && currentPage !== 1) setCurrentPage(1);
 *     else getInfo();
 *
 * Bu shart filtr QIYMATI bor-yo'qligini tekshirardi, o'zgarganini emas.
 * Natijada qidiruv yoki batalon filtri yoqilgan bo'lsa, foydalanuvchi
 * 2-sahifani bosishi bilan sahifa darhol 1 ga qaytarilib, varaqlash
 * umuman ishlamay qolardi (F.I.O, batalon F.I.O va topshiriqlar sahifalari).
 *
 * Endi 1-sahifaga qaytarish faqat filtrning o'zi o'zgarganda bo'ladi —
 * bu kerak, chunki eski sahifa raqami yangi natijada mavjud bo'lmasligi mumkin.
 */
export function usePagedFetch({ page, setPage, filters, fetch }: Args) {
  const prevFilters = useRef(filters);

  useEffect(() => {
    const prev = prevFilters.current;
    const filterChanged =
      prev.length !== filters.length || filters.some((f, i) => f !== prev[i]);
    prevFilters.current = filters;

    if (filterChanged && page !== 1) {
      // Sahifa o'zgarishi shu effektni qayta ishga tushiradi —
      // ma'lumot o'sha yurishda olinadi, ya'ni ikki marta so'rov ketmaydi.
      setPage(1);
      return;
    }

    // `fetch` async bo'lsa Promise qaytaradi — uni React'ga tozalash sifatida
    // berib bo'lmaydi, shuning uchun faqat funksiya qaytsa ishlatiladi.
    const cleanup = fetch();
    return typeof cleanup === "function" ? (cleanup as () => void) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...filters]);
}
