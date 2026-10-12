import { tt } from "@/utils";

/**
 * "Moddiy baza" (viloyat) va "Markaziy baza" (super-admin) — bir xil
 * sahifalar (Monitoring, Chiqimlar). Farqi faqat shu sozlamada:
 *
 *   - Moddiy baza: F.I.Sh. chiqimlaridagi 75% ulush, tanlangan hisob raqam
 *     va foydalanuvchi viloyati bo'yicha (backend: moddiy.baza);
 *   - Markaziy baza: F.I.Sh. chiqimlaridagi 10% ulush (markaziy devon
 *     moddiy bazasiga), respublika miqyosida — barcha viloyat va hisob
 *     raqamlar (backend: markaziy.baza, faqat super-admin).
 */
export type BazaConfig = {
  /** API asosi: `${api}/monitoring`, `${api}/monitoring/balance`, `${api}/rasxod` */
  api: string;
  /** So'rovlarga tanlangan hisob raqam qo'shiladi (moddiy baza) */
  withAccount: boolean;
  /** Xodim ruhsati kaliti (super-admin xodim emas — unda `can` doim true) */
  permKey: string;
  /** Kirim hujjatlarida "Viloyat" ustuni (markaziy — barcha viloyatlardan) */
  showRegion: boolean;
  /** Matnlar — funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi */
  labels: () => BazaLabels;
};

export type BazaLabels = {
  /** Plitka va jadval sarlavhasi: "Moddiy bazaga ajratildi (kirim)" */
  allocated: string;
  /** Kirim jadvalidagi ulush ustuni: "Moddiy bazaga" */
  share: string;
  /** To'lanmagan hujjatlar izohida: "moddiy bazaga" */
  shareLower: string;
  /** Chiqim oynasi izohi: "Moddiy bazaga ajratilgan mablag' hisobidan" */
  fromFunds: string;
  /** Chiqim oynasidagi qoldiq sarlavhasi: "08.10.2026 holatiga moddiy baza mablag'i" */
  fundsAt: (date: string) => string;
  /** Eksport sarlavhasi: "Moddiy baza chiqimlari" */
  expenses: string;
};

export const MODDIY_BAZA: BazaConfig = {
  api: "/moddiy-baza",
  withAccount: true,
  permKey: "moddiy_baza",
  showRegion: false,
  labels: () => ({
    allocated: tt("Moddiy bazaga ajratildi (kirim)", "Выделено на мат. базу (приход)"),
    share: tt("Moddiy bazaga", "На мат. базу"),
    shareLower: tt("moddiy bazaga", "на мат. базу"),
    fromFunds: tt("Moddiy bazaga ajratilgan mablag' hisobidan", "За счёт средств, выделенных на материальную базу"),
    fundsAt: (date) => tt(`${date} holatiga moddiy baza mablag'i`, `Средства материальной базы на ${date}`),
    expenses: tt("Moddiy baza chiqimlari", "Расходы материальной базы"),
  }),
};

export const MARKAZIY_BAZA: BazaConfig = {
  api: "/admin/markaziy-baza",
  withAccount: false,
  permKey: "markaziy_baza",
  showRegion: true,
  labels: () => ({
    allocated: tt("Markaziy bazaga ajratildi (kirim)", "Выделено на центр. базу (приход)"),
    // Ustun tor (140px): "(10%)" bilan sarlavha yonidagisiga chiqib ketardi
    share: tt("Markaziy bazaga", "На центр. базу"),
    shareLower: tt("markaziy bazaga", "на центр. базу"),
    fromFunds: tt(
      "Markaziy devon moddiy bazasiga ajratilgan mablag' hisobidan",
      "За счёт средств, выделенных на материальную базу центрального аппарата"
    ),
    fundsAt: (date) => tt(`${date} holatiga markaziy baza mablag'i`, `Средства центральной базы на ${date}`),
    expenses: tt("Markaziy baza chiqimlari", "Расходы центральной базы"),
  }),
};
