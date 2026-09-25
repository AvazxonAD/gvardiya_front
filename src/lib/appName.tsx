import { getAppLang } from "./lang";

/**
 * Dastur nomi — tanlangan tilda.
 *
 * Qo'shtirnoq ichidagi "Tadbir-Hisob" — xos nom, u TARJIMA ham,
 * kirillga o'girish ham qilinmaydi (shuning uchun `tt()` ishlatilmaydi —
 * u lotin matnni kirillga avtomatik o'girib yuborardi).
 */
export const APP_BRAND = "Tadbir-Hisob";

type Parts = { before: string; brand: string; after: string };

/** Nom qismlari: brendni alohida (masalan, qalin) chizish uchun */
export function appNameParts(): Parts {
  switch (getAppLang()) {
    case "ru":
      return {
        before: "Информационная система",
        brand: `«${APP_BRAND}»`,
        after: "Финансово-экономического управления Национальной гвардии",
      };
    case "cyrl":
      return {
        before: "Миллий Гвардия молия иқтисод бошқармаси",
        brand: `"${APP_BRAND}"`,
        after: "ахборот тизими",
      };
    default:
      return {
        before: "Milliy Gvardiya moliya iqtisod boshqarmasi",
        brand: `"${APP_BRAND}"`,
        after: "axborot tizimi",
      };
  }
}

/** To'liq nom matn ko'rinishida (sarlavha, title, alt uchun) */
export function appFullName(): string {
  const { before, brand, after } = appNameParts();
  return `${before} ${brand} ${after}`;
}

/** To'liq nom — brend qismi qalin */
export function AppFullName({ className }: { className?: string }) {
  const { before, brand, after } = appNameParts();
  return (
    <span className={className}>
      {before} <span className="font-semibold text-foreground">{brand}</span> {after}
    </span>
  );
}
