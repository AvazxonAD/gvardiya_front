import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  BookMarked,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Scale,
  Shield,
  UserCog,
  UserMinus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

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
};

/**
 * Rol bo'yicha menyular.
 *
 * Ilgari bitta ro'yxat 4 xil `.filter()` bilan kesilardi va bir xil `id`
 * takrorlanardi — qaysi rol nimani ko'rishini o'qib bo'lmasdi. Endi har
 * rolning menyusi alohida va oshkora.
 */

const SPRAVOCHNIK_SUB: SubItem[] = [
  { path: "/", uz: "BXM", ru: "БХМ" },
  { path: "/hisobRaqami", uz: "Hisob raqami", ru: "Номер счета" },
  { path: "/ijrochi", uz: "Ijrochi", ru: "Исполнитель" },
  { path: "/rahbar", uz: "Rahbari", ru: "Руководитель" },
  { path: "/manzil", uz: "Manzil", ru: "Адрес" },
  { path: "/bank", uz: "Bank", ru: "Банк" },
  { path: "/mfo", uz: "INN", ru: "ИНН" },
  { path: "/deduction", uz: "Ushlanma", ru: "Удержание" },
];

/** Viloyat (region) foydalanuvchisi — to'liq moliyaviy kontur */
const REGION_MENU: MenuItem[] = [
  { path: "/", uz: "Asosiy", ru: "Главная", icon: LayoutDashboard },
  { path: "/contract", uz: "Shartnoma", ru: "Договор", icon: FileText },
  { path: "/workers", uz: "F.I.O", ru: "Ф.И.О", icon: Users },
  { path: "/batalon", uz: "Batalon", ru: "Батальон", icon: Shield },
  { path: "/report", uz: "Hisobot", ru: "Отчетность", icon: BarChart3 },
  {
    path: "/organisation",
    uz: "Organizatsiya",
    ru: "Организация",
    icon: Building2,
  },
  { path: "/prixod", uz: "Kirim", ru: "Приход", icon: ArrowDownToLine },
  { path: "/rasxod", uz: "Chiqim", ru: "Расход", icon: ArrowUpFromLine },
  {
    path: "/rasxod-workers",
    uz: "Chiqim F.I.O",
    ru: "Расход Ф.И.О",
    icon: UserMinus,
  },
  {
    path: "/spravichnik",
    uz: "Spravochnik",
    ru: "Справочник",
    icon: BookMarked,
    subItems: SPRAVOCHNIK_SUB,
  },
  { path: "/video-lessons", uz: "Video darslar", ru: "Видеоуроки", icon: Video },
];

/** Markaziy admin — umumiy ko'rsatkichlar va foydalanuvchilar */
const ADMIN_MENU: MenuItem[] = [
  { path: "/", uz: "Asosiy", ru: "Главная", icon: LayoutDashboard },
  { path: "/report", uz: "Hisobot", ru: "Отчетность", icon: BarChart3 },
  {
    path: "/users",
    uz: "Foydalanuvchilar",
    ru: "Пользователи",
    icon: UserCog,
  },
  { path: "/video-lessons", uz: "Video darslar", ru: "Видеоуроки", icon: Video },
];

/** Batalon — faqat shaxsiy tarkib va topshiriqlar */
const BATALON_MENU: MenuItem[] = [
  {
    path: "/batalon/tasks",
    uz: "Topshiriqlar",
    ru: "Задания",
    icon: ClipboardList,
  },
  { path: "/batalon/workers", uz: "F.I.O", ru: "Ф.И.О", icon: Users },
];

/** Yurist — faqat shartnomalarni ko'rish */
const LAWYER_MENU: MenuItem[] = [
  {
    path: "/lawyer-contract",
    uz: "Yurist shartnoma",
    ru: "Договор юриста",
    icon: Scale,
  },
];

export function getMenuForUser(user: any): MenuItem[] {
  if (user?.type === "lawyer") return LAWYER_MENU;
  if (user?.batalon) return BATALON_MENU;
  if (user?.region_id) return REGION_MENU;
  return ADMIN_MENU;
}

/** Foydalanuvchi kirgandan keyin tushadigan sahifa */
export function getHomePathForUser(user: any): string {
  if (user?.type === "lawyer") return "/lawyer-contract";
  if (user?.batalon) return "/batalon/tasks";
  return "/";
}
