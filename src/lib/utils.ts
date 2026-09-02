import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFullDate = (promptdate: string) => {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

  // Sana ISO ko'rinishida ham kelishi mumkin ("2026-08-03T00:00:00.000Z") —
  // ilgari bunday holatda xom matn chiqib qolardi.
  const value = String(promptdate ?? "").slice(0, 10);

  if (regex.test(value)) {
    const date = new Date(value);
    const day = date.getDate().toString().padStart(2, "0"); // "05"
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // "01"
    const year = date.getFullYear().toString(); // "2024"
    month = getMonth(month);

    return `${year}-йил ${day}-${month}`;
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
