import { useSelector } from "react-redux";

import { tt } from "@/utils";
import { cn } from "@/lib/utils";

/**
 * Viloyat xodimlari (yurist, buxgalter) ruhsatlari — backenddagi
 * `helper/permissions.js` bilan bir xil kalitlar.
 *
 * Viloyat admini "Foydalanuvchilar" sahifasidagi "Ruxsatlar" oynasida har bir
 * xodimga qaysi bo'limlarni ko'rish (read) va ularda nima qilish mumkinligini
 * (create, update, delete, sign) belgilaydi. Admin va boshqa rollarda
 * cheklov yo'q — `can` doim `true`.
 */

export type PermAction = "read" | "create" | "update" | "delete" | "sign";
export type Permissions = Record<string, PermAction[]>;

export type PermMenu = {
  key: string;
  /** Menyudagi yo'l (layout/menu.tsx) */
  path: string;
  uz: string;
  ru: string;
  actions: PermAction[];
};

const CRUD: PermAction[] = ["read", "create", "update", "delete"];

/** "Ruxsatlar" oynasidagi qatorlar tartibi */
export const PERM_MENUS: PermMenu[] = [
  { key: "dashboard", path: "/", uz: "Dashboard", ru: "Дашборд", actions: ["read"] },
  {
    key: "contract",
    path: "/contract",
    uz: "Shartnomalar ro'yhati",
    ru: "Список договоров",
    actions: [...CRUD, "sign"],
  },
  { key: "workers", path: "/workers", uz: "Hodimlar ro'yhati", ru: "Список сотрудников", actions: CRUD },
  { key: "batalon", path: "/batalon", uz: "Quyi tuzilmalar", ru: "Подразделения", actions: CRUD },
  { key: "report", path: "/report", uz: "Qarzdorlik", ru: "Задолженность", actions: ["read"] },
  { key: "organisation", path: "/organisation", uz: "Tashkilot", ru: "Организация", actions: CRUD },
  { key: "prixod", path: "/prixod", uz: "Kirimlar kitobi", ru: "Книга приходов", actions: CRUD },
  { key: "rasxod", path: "/rasxod", uz: "Chiqimlar kitobi", ru: "Книга расходов", actions: CRUD },
  {
    key: "rasxod_workers",
    path: "/rasxod-workers",
    uz: "Hodimlarning pul hisob-kitobi",
    ru: "Расчёты с сотрудниками",
    actions: CRUD,
  },
  { key: "spravochnik", path: "/spravichnik", uz: "Ma'lumotnoma", ru: "Справочник", actions: CRUD },
  { key: "logs", path: "/logs", uz: "Qaydlar", ru: "Журнал", actions: ["read"] },
  { key: "video_lessons", path: "/video-lessons", uz: "Video darslar", ru: "Видеоуроки", actions: ["read"] },
];

export const menuKeyForPath = (path: string) =>
  PERM_MENUS.find((m) => m.path === path)?.key;

export const isStaffUser = (user: any) =>
  Boolean(user?.region_id) &&
  !user?.batalon &&
  (user?.type === "lawyer" || user?.type === "accountant");

export function can(user: any, menu: string, action: PermAction = "read"): boolean {
  if (!isStaffUser(user)) return true;
  return Boolean((user?.permissions as Permissions | undefined)?.[menu]?.includes(action));
}

/** Sahifa ichida: `const perm = usePermission("contract"); perm.create && <Qo'shish/>` */
export function usePermission(menu: string) {
  const user = useSelector((s: any) => s.auth.user);
  return {
    read: can(user, menu, "read"),
    create: can(user, menu, "create"),
    update: can(user, menu, "update"),
    delete: can(user, menu, "delete"),
    sign: can(user, menu, "sign"),
  };
}

/**
 * Ruxsat yo'q amal tugmasi yashirilmaydi — o'chirilgan (disabled) holda
 * ko'rinadi va "Ruxsat yo'q" izohini ko'rsatadi.
 *
 * `ui/Button` da `disabled:pointer-events-none` bor — u holda `title` izohi
 * chiqmaydi va bosish ostidagi qatorga (row onClick) o'tib ketadi. Shuning
 * uchun pointer-events qaytariladi; o'chirilgan <button> baribir onClick
 * chaqirmaydi.
 *
 * `<Button {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"), "h-6")}>`
 */
export const NO_ACCESS_BTN_CLASS =
  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:active:scale-100";

export const noAccessTitle = () => tt("Ruxsat yo'q", "Нет доступа");

export function permBtn(allowed: boolean, title?: string, className?: string) {
  return {
    disabled: !allowed,
    "aria-disabled": !allowed || undefined,
    title: allowed ? title : noAccessTitle(),
    className: cn(className, !allowed && NO_ACCESS_BTN_CLASS),
  };
}
