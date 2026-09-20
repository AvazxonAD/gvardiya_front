export type IOrganization = {
  id: number;
  name: string;
  address: string;
  str: string;
  bank_name: string;
  mfo: string;
  boss: string;
  account_numbers: { account_number: string }[];
  gazna_numbers: { gazna_number: string }[];
};

/**
 * Backend tashkilotning hisob raqamlarini MASSIV qilib qaytaradi
 * (`account_numbers`, `gazna_numbers`) — bitta tashkilotda bir nechta
 * raqam bo'lishi mumkin.
 *
 * Kodning bir necha joyida esa skalyar `o.account_number` / `o.treasury1`
 * o'qilardi. Bunday maydonlar umuman yo'q, ya'ni qiymat doim `undefined`
 * edi: "Joriy hisob" maydoni va tashkilot tanlash jadvalining ikkita
 * ustuni har doim bo'sh chiqardi. Tur tekshiruvi o'chirilgani sababli
 * (`tsconfig` dagi yaroqsiz `ignoreDeprecations`) buni build ushlamagan.
 *
 * Quyidagi yordamchilar shu shaklni bitta joyda hal qiladi.
 */
/**
 * Chiqim (rasxod) tahrirlash sahifalarida `selectedO` ga tashkilot emas,
 * BATALON ma'lumoti solinadi va u yerda hisob raqami skalyar bo'ladi
 * (`data.batalon_account_number`). Bir xil maydon ikki xil shaklda
 * kelgani uchun yordamchilar ikkalasini ham qabul qiladi.
 */
export type OrganizationLike = Partial<IOrganization> & {
  /** Eski/batalon shakli — bitta raqam */
  account_number?: string;
  gazna_number?: string;
};

export const orgAccountNumbers = (o?: OrganizationLike | null): string[] => {
  const list = (o?.account_numbers ?? [])
    .map((a) => a?.account_number ?? "")
    .filter(Boolean);
  if (list.length) return list;
  return o?.account_number ? [o.account_number] : [];
};

export const orgGaznaNumbers = (o?: OrganizationLike | null): string[] => {
  const list = (o?.gazna_numbers ?? [])
    .map((g) => g?.gazna_number ?? "")
    .filter(Boolean);
  if (list.length) return list;
  return o?.gazna_number ? [o.gazna_number] : [];
};

/** Hujjatlarda ko'rsatiladigan asosiy (birinchi) hisob raqami. */
export const primaryAccountNumber = (o?: OrganizationLike | null): string =>
  orgAccountNumbers(o)[0] ?? "";

/** Asosiy (birinchi) g'azna hisobi. */
export const primaryGaznaNumber = (o?: OrganizationLike | null): string =>
  orgGaznaNumbers(o)[0] ?? "";
