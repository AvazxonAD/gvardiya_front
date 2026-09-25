import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  BookMarked,
  Building2,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Shield,
  UserCog,
  UserMinus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { can, isStaffUser, menuKeyForPath } from "@/lib/permissions";

export type SubItem = {
  /** `/spravichnik` ga nisbatan yo'l */
  path: string;
  uz: string;
  ru: string;
};

export type MenuItem = {
  path: string;
  uz: string;
  ru: string;
  icon: LucideIcon;
  subItems?: SubItem[];
  /** Xodimda ruhsat yo'q — menyuda ko'rinadi, lekin bosib bo'lmaydi */
  disabled?: boolean;
};

/**
 * Rol bo'yicha menyular.
 *
 * Ilgari bitta ro'yxat 4 xil `.filter()` bilan kesilardi va bir xil `id`
 * takrorlanardi — qaysi rol nimani ko'rishini o'qib bo'lmasdi. Endi har
 * rolning menyusi alohida va oshkora.
 */

// Viloyat: ijrochi, rahbar, manzil, bank, STIR va hisob raqamlari — bitta
// "Rekvizitlar" sahifasida. BXM umumiy (super-admin), ushlanma olib tashlangan.
const SPRAVOCHNIK_SUB: SubItem[] = [
  { path: "/", uz: "Rekvizitlar", ru: "Реквизиты" },
];

// Super-admin: respublika bo'yicha umumiy ma'lumotnomalar
const ADMIN_SPRAVOCHNIK_SUB: SubItem[] = [
  { path: "/", uz: "BXM", ru: "БХМ" },
];

/** Viloyat (region) foydalanuvchisi — to'liq moliyaviy kontur */
const REGION_MENU: MenuItem[] = [
  { path: "/", uz: "Dashboard", ru: "Дашборд", icon: LayoutDashboard },
  { path: "/contract", uz: "Shartnomalar ro'yhati", ru: "Список договоров", icon: FileText },
  { path: "/workers", uz: "Hodimlar ro'yhati", ru: "Список сотрудников", icon: Users },
  { path: "/batalon", uz: "Quyi tuzilmalar", ru: "Подразделения", icon: Shield },
  { path: "/report", uz: "Qarzdorlik", ru: "Задолженность", icon: BarChart3 },
  {
    path: "/organisation",
    uz: "Tashkilot",
    ru: "Организация",
    icon: Building2,
  },
  { path: "/prixod", uz: "Kirimlar kitobi", ru: "Книга приходов", icon: ArrowDownToLine },
  { path: "/rasxod", uz: "Chiqimlar kitobi", ru: "Книга расходов", icon: ArrowUpFromLine },
  {
    path: "/rasxod-workers",
    uz: "Hodimlarning pul hisob-kitobi",
    ru: "Расчёты с сотрудниками",
    icon: UserMinus,
  },
  // Yurist va buxgalterni viloyat admini o'zi ochadi (buxgalterda yo'q)
  { path: "/staff", uz: "Foydalanuvchilar", ru: "Пользователи", icon: UserCog },
  // Viloyat foydalanuvchilari amallari (faqat o'z viloyati)
  { path: "/logs", uz: "Qaydlar", ru: "Журнал", icon: History },
  { path: "/video-lessons", uz: "Video darslar", ru: "Видеоуроки", icon: Video },
  // Ma'lumotnoma — eng pastda
  {
    path: "/spravichnik",
    uz: "Ma'lumotnoma",
    ru: "Справочник",
    icon: BookMarked,
    subItems: SPRAVOCHNIK_SUB,
  },
];

/** Markaziy admin — umumiy ko'rsatkichlar va foydalanuvchilar */
const ADMIN_MENU: MenuItem[] = [
  { path: "/", uz: "Dashboard", ru: "Дашборд", icon: LayoutDashboard },
  // Eski "Hisobot" o'rniga — qarzdorlik tahlili
  { path: "/debt", uz: "Qarzdorlik", ru: "Задолженность", icon: BarChart3 },
  {
    path: "/users",
    uz: "Foydalanuvchilar",
    ru: "Пользователи",
    icon: UserCog,
  },
  { path: "/logs", uz: "Qaydlar", ru: "Журнал", icon: History },
  { path: "/video-lessons", uz: "Video darslar", ru: "Видеоуроки", icon: Video },
  {
    path: "/spravichnik",
    uz: "Ma'lumotnoma",
    ru: "Справочник",
    icon: BookMarked,
    subItems: ADMIN_SPRAVOCHNIK_SUB,
  },
];

/** JSTB xodimi — faqat super-admin dashboardi (backend ham faqat shuni ochadi) */
const JSTB_MENU: MenuItem[] = [
  { path: "/", uz: "Dashboard", ru: "Дашборд", icon: LayoutDashboard },
];

/** Batalon — faqat shaxsiy tarkib va topshiriqlar */
const BATALON_MENU: MenuItem[] = [
  {
    path: "/batalon/tasks",
    uz: "Topshiriqlar",
    ru: "Задания",
    icon: ClipboardList,
  },
  { path: "/batalon/workers", uz: "Hodimlar ro'yhati", ru: "Список сотрудников", icon: Users },
];

/**
 * Viloyat xodimi (yurist, buxgalter) — admin menyusining o'zi, lekin
 * "ko'rish" ruhsati berilmagan bo'limlar o'chirilgan (disabled) holda
 * ko'rinadi. "Foydalanuvchilar" (xodimlarni boshqarish) faqat adminda.
 */
function staffMenu(user: any): MenuItem[] {
  return REGION_MENU.filter((m) => m.path !== "/staff").map((m) => {
    const key = menuKeyForPath(m.path);
    return { ...m, disabled: !(key && can(user, key, "read")) };
  });
}

export function getMenuForUser(user: any): MenuItem[] {
  if (isStaffUser(user)) return staffMenu(user);
  if (user?.type === "jstb") return JSTB_MENU;
  if (user?.batalon) return BATALON_MENU;
  if (user?.region_id) return REGION_MENU;
  return ADMIN_MENU;
}

/** Foydalanuvchi kirgandan keyin tushadigan sahifa */
export function getHomePathForUser(user: any): string {
  if (isStaffUser(user)) return staffMenu(user).find((m) => !m.disabled)?.path ?? "/";
  if (user?.batalon) return "/batalon/tasks";
  return "/";
}
