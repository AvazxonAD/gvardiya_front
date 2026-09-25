import type { SelectOption } from "@/ui";
import type { IActionLog, LogAction, LogRole } from "@/types/actionLog";
import { tt } from "@/utils";

/**
 * Qaydlarni o'qiladigan qilish. Backend til bilmaydigan kalitlarni yozadi
 * (`module`, `action`, `route`), bu yerda ular joriy tilga aylanadi.
 * Bo'lim nomlari menyudagi (`layout/menu.tsx`) nomlar bilan bir xil.
 */

type Pair = readonly [uz: string, ru: string];
type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "brand";

const t = ([uz, ru]: Pair) => tt(uz, ru);

/** Kalitlar — backend `audit.log/recorder.js` dagi MODULES */
const MODULES: Record<string, Pair> = {
  auth: ["Tizimga kirish", "Вход в систему"],
  contract: ["Shartnoma", "Договор"],
  worker: ["F.I.Sh.", "Ф.И.О"],
  batalon: ["Batalon", "Батальон"],
  organization: ["Tashkilot", "Организация"],
  prixod: ["Kirim", "Приход"],
  rasxod: ["Chiqim", "Расход"],
  "rasxod/fio": ["Chiqim F.I.Sh.", "Расход Ф.И.О"],
  rasxod_organ: ["Chiqim (tashkilot)", "Расход (организация)"],
  task: ["Topshiriqlar", "Задания"],
  worker_task: ["Xodim topshiriqlari", "Задания сотрудников"],
  bxm: ["BXM", "БХМ"],
  account: ["Hisob raqami", "Номер счета"],
  doer: ["Ijrochi", "Исполнитель"],
  boss: ["Rahbari", "Руководитель"],
  adress: ["Manzil", "Адрес"],
  bank: ["Bank", "Банк"],
  str: ["STIR", "ИНН"],
  deduction: ["Ushlanma", "Удержание"],
  template: ["Shablon", "Шаблон"],
  monitoring: ["Monitoring", "Мониторинг"],
  "region/dashboard": ["Asosiy sahifa", "Главная"],
  "region/users": ["Batalon foydalanuvchilari", "Пользователи батальонов"],
  "batalon/worker": ["Batalon: F.I.Sh.", "Батальон: Ф.И.О"],
  "batalon/tasks": ["Batalon: topshiriqlar", "Батальон: задания"],
  "batalon/worker-tasks": ["Batalon: xodim topshiriqlari", "Батальон: задания сотрудников"],
  didox: ["Didox", "Didox"],
  org: ["Tashkilot qidiruvi", "Поиск организации"],
  eimzo: ["E-IMZO", "E-IMZO"],
  script: ["Xizmat skriptlari", "Служебные скрипты"],
  "video-lessons": ["Video darslar", "Видеоуроки"],
  "admin/user": ["Foydalanuvchilar", "Пользователи"],
  "admin/regions": ["Viloyatlar", "Области"],
  "admin/dashboard": ["Asosiy sahifa (admin)", "Главная (админ)"],
  "admin/monitoring": ["Monitoring (admin)", "Мониторинг (админ)"],
};

const ACTIONS: Record<LogAction, { label: Pair; tone: Tone }> = {
  create: { label: ["Qo'shish", "Создание"], tone: "success" },
  update: { label: ["Tahrirlash", "Изменение"], tone: "primary" },
  delete: { label: ["O'chirish", "Удаление"], tone: "danger" },
  view: { label: ["Ko'rish", "Просмотр"], tone: "neutral" },
  export: { label: ["Yuklab olish", "Выгрузка"], tone: "brand" },
  import: { label: ["Import", "Импорт"], tone: "brand" },
  login: { label: ["Kirish", "Вход"], tone: "warning" },
  logout: { label: ["Chiqish", "Выход"], tone: "neutral" },
  other: { label: ["Boshqa", "Другое"], tone: "neutral" },
};

/** Umumiy "bo'lim + amal" dan aniqroq nomi bor ishlar: `${method} ${route}` */
const OPERATIONS: Record<string, Pair> = {
  "POST /auth": ["Login va parol bilan kirish", "Вход по логину и паролю"],
  "POST /auth/eimzo": ["E-IMZO bilan kirishni tasdiqlash", "Подтверждение входа через E-IMZO"],
  "POST /auth/logout": ["Tizimdan chiqish", "Выход из системы"],
  "PATCH /auth": ["Profilni o'zgartirish", "Изменение профиля"],
  "GET /contract/view/:id": ["Hujjatni ko'rish", "Просмотр документа"],
  "PATCH /contract/:id/send-lawyer": ["Yuristga yuborish", "Отправка юристу"],
  "PATCH /contract/:id/upload-pdf": ["PDF faylni yuklash", "Загрузка PDF"],
  "PATCH /contract/:id/verify-lawyer": ["Yurist tasdiqladi", "Подтверждено юристом"],
  "PATCH /contract/:id/verify-boss": ["Rahbar tasdiqladi", "Подтверждено руководителем"],
  "PATCH /contract/:id/reject-lawyer": ["Yurist rad etdi", "Отклонено юристом"],
  "GET /contract/:id/verification": ["Tasdiqlash holati", "Статус подтверждения"],
  "GET /contract/:id/verification/history": ["Tasdiqlash tarixi", "История подтверждения"],
  "POST /contract/check": ["Tekshirish", "Проверка"],
  "POST /prixod/check": ["Tekshirish", "Проверка"],
  "GET /worker/template": ["Import shablonini yuklab olish", "Скачивание шаблона импорта"],
  "POST /didox/login": ["Didox'ga kirish", "Вход в Didox"],
  "POST /didox/contract": ["Didox'da shartnoma yaratish", "Создание договора в Didox"],
  "POST /didox/contract/:id/send": ["Didox'ga yuborish", "Отправка в Didox"],
  "POST /didox/contract/:id/sign": ["Didox'da imzolash", "Подписание в Didox"],
  "POST /didox/organization/complete": ["Tashkilotni Didox'dan to'ldirish", "Заполнение организации из Didox"],
  "GET /didox/search/:id": ["STIR bo'yicha qidirish", "Поиск по ИНН"],
  "GET /org/search/:id": ["STIR bo'yicha qidirish", "Поиск по ИНН"],
  "GET /eimzo/bridge-token": ["E-IMZO ulanish tokeni", "Токен подключения E-IMZO"],
  "POST /script/organization/fill-by-inn": ["Tashkilotlarni STIR bo'yicha to'ldirish", "Заполнение организаций по ИНН"],
};

/** Nomi berilmagan yo'llardagi tez-tez uchraydigan qismlar: "/export/batalon" */
const SEGMENTS: Record<string, Pair> = {
  export: ["Eksport", "Экспорт"],
  export2: ["Eksport", "Экспорт"],
  export3: ["Eksport", "Экспорт"],
  excel: ["Excel", "Excel"],
  pdf: ["PDF", "PDF"],
  import: ["Import", "Импорт"],
  template: ["Shablon", "Шаблон"],
  "umumiy-hisobot": ["Umumiy hisobot", "Общий отчет"],
  batalon: ["batalon", "батальон"],
};

const ROLES: Record<LogRole, Pair> = {
  super_admin: ["Super admin", "Супер админ"],
  region_admin: ["Viloyat admin", "Админ области"],
  lawyer: ["Yurist", "Юрист"],
  accountant: ["Buxgalter", "Бухгалтер"],
  batalon: ["Batalon", "Батальон"],
};

export const moduleLabel = (key: string) => (MODULES[key] ? t(MODULES[key]) : key);

export const actionLabel = (action: LogAction) => t((ACTIONS[action] ?? ACTIONS.other).label);

export const actionTone = (action: LogAction): Tone => (ACTIONS[action] ?? ACTIONS.other).tone;

export const roleLabel = (role: LogRole | null) => (role && ROLES[role] ? t(ROLES[role]) : "");

/** So'rov qancha vaqtda bajarilgani: 54 -> "0.054 sek", 1240 -> "1.24 sek" */
export const formatDuration = (ms: number | null) =>
  ms == null ? "—" : `${(ms / 1000).toFixed(ms < 1000 ? 3 : 2)} ${tt("sek", "сек")}`;

/**
 * Aniq ish nomi: "Yuristga yuborish", "Didox'da imzolash" ... Nomi yo'q
 * yo'llarda bo'limdan keyingi qism qaytadi ("Eksport / batalon"), oddiy
 * ro'yxat yoki bitta yozuvda — null.
 */
export function describeLog(log: Pick<IActionLog, "method" | "route" | "module">): string | null {
  const op = OPERATIONS[`${log.method} ${log.route}`];
  if (op) return t(op);

  const rest = log.route
    .slice(log.module.length + 1)
    .split("/")
    .filter((s) => s && s !== ":id")
    .map((s) => (SEGMENTS[s] ? t(SEGMENTS[s]) : s))
    .join(" / ");
  return rest || null;
}

/** Viloyat adminiga super-admin bo'limlari ko'rsatilmaydi */
export function moduleOptions(isSuper: boolean): SelectOption[] {
  return Object.entries(MODULES)
    .filter(([key]) => isSuper || !key.startsWith("admin/"))
    .map(([value, pair]) => ({ value, label: t(pair) }))
    .sort((a, b) => a.label.localeCompare(b.label, "uz"));
}

export function actionOptions(): SelectOption[] {
  return (Object.keys(ACTIONS) as LogAction[]).map((value) => ({
    value,
    label: actionLabel(value),
  }));
}
