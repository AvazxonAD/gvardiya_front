/**
 * Tanlangan tilni backend tushunadigan kodga aylantiradi.
 *
 * Interfeysda til `localStorage.lang` da raqam bilan saqlanadi:
 * "0" — o'zbekcha (lotin), "1" — o'zbekcha (kirill), "2" — ruscha.
 * Backend esa `x-app-lang` sarlavhasini kutadi va `locales/json/{lng}.json`
 * dan xabar oladi (uz / cyrl / ru).
 *
 * Ilgari bu sarlavha umuman yuborilmasdi, shuning uchun server xabarlari
 * ("Shartnoma topilmadi!" va h.k.) rus tilini tanlagan foydalanuvchida ham
 * o'zbekcha chiqardi.
 */
export type AppLang = "uz" | "cyrl" | "ru";

export function getAppLang(): AppLang {
  try {
    const v = localStorage.getItem("lang");
    return v === "2" ? "ru" : v === "1" ? "cyrl" : "uz";
  } catch {
    return "uz"; // localStorage yopiq bo'lsa ham so'rov buzilmasin
  }
}

export const LANG_HEADER = "x-app-lang";
