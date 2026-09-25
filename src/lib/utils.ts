import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDocDate } from "./docText";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Piksel o'lchamni `rem` ga o'giradi: `380` / `"380px"` → `"23.75rem"`.
 *
 * Interfeys katta monitorda `html` shrift o'lchami orqali kattalashadi
 * (index.css), shuning uchun inline `style` dagi o'lchamlar ham `rem` da
 * bo'lishi kerak — aks holda ular joyida qolib, qolgan hamma narsa
 * kattalashadi. `%`, `vw`, `rem` kabi boshqa birliklar o'zgarishsiz qaytadi.
 */
export function pxToRem(value: number | string | undefined | null) {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") return `${value / 16}rem`;
  const px = /^(-?\d*\.?\d+)px$/.exec(value.trim());
  return px ? `${Number(px[1]) / 16}rem` : value;
}

/**
 * html2canvas `onclone` — nusxadagi ildiz shriftni 16px ga qotiradi.
 *
 * html2canvas hujjatni joriy oyna o'lchamidagi iframe'ga nusxalab chizadi,
 * `@media print` esa bu yerda ishlamaydi. Katta monitorda ildiz shrift
 * kattaroq bo'lgani uchun hujjat ichidagi `rem` dagi chekinish va
 * sarlavhalar ham kattalashib, PDF qaysi monitorda yaratilganiga qarab
 * boshqacha sahifalanardi. Nusxada 16px qilinsa, PDF har doim bir xil.
 */
export function pinPdfRootFontSize(clonedDoc: Document) {
  clonedDoc.documentElement.style.fontSize = "16px";
}

export const getFullDate = (promptdate: string) => {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

  // Sana ISO ko'rinishida ham kelishi mumkin ("2026-08-03T00:00:00.000Z") —
  // ilgari bunday holatda xom matn chiqib qolardi.
  const value = String(promptdate ?? "").slice(0, 10);

  if (regex.test(value)) {
    // Hujjat sanasi tanlangan tilda: "2024-yil 05-yanvar" / "2024-йил 05-январь" / "05 января 2024 г."
    const [year, month, day] = value.split("-").map(Number);
    return formatDocDate(year, month, day);
  } else {
    return promptdate
  }

};

// need function
export function getMonth(month: any) {
  switch (month) {
    case "01":
      return "январь";
    case "02":
      return "февраль";
    case "03":
      return "март";
    case "04":
      return "апрель";
    case "05":
      return "май";
    case "06":
      return "июнь";
    case "07":
      return "июль";
    case "08":
      return "август";
    case "09":
      return "сентябрь";
    case "10":
      return "октябрь";
    case "11":
      return "ноябрь";
    case "12":
      return "декабрь";
    default:
      return "server xatolik";
  }
}
