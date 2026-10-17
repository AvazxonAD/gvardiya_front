import { adminBaza } from "./guides/admin/baza";
import { adminBxm } from "./guides/admin/bxm";
import { adminDashboard } from "./guides/admin/dashboard";
import { adminDebt } from "./guides/admin/debt";
import { adminImport } from "./guides/admin/import";
import { adminLogs } from "./guides/admin/logs";
import { adminMonitoring } from "./guides/admin/monitoring";
import { adminStart } from "./guides/admin/start";
import { adminUsers } from "./guides/admin/users";
import { adminVideos } from "./guides/admin/videos";
import { batalon } from "./guides/batalon";
import { contract } from "./guides/contract";
import { dashboard } from "./guides/dashboard";
import { logs } from "./guides/logs";
import { moddiyBaza } from "./guides/moddiyBaza";
import { organisation } from "./guides/organisation";
import { prixod } from "./guides/prixod";
import { rasxod } from "./guides/rasxod";
import { rasxodWorkers } from "./guides/rasxodWorkers";
import { report } from "./guides/report";
import { spravochnik } from "./guides/spravochnik";
import { staff } from "./guides/staff";
import { start } from "./guides/start";
import { workers } from "./guides/workers";
import type { SectionGuide, Text } from "./types";

export type SectionData = {
  id: string;
  /** Menyu yo'li — foydalanuvchida shu bo'lim yo'q bo'lsa bo'lim yashiriladi */
  path?: string;
  title: Text;
  guide: SectionGuide;
};

/** Viloyat foydalanuvchilari (admin, yurist, buxgalter) — viloyat menyusi tartibida (`layout/menu.tsx`, REGION_MENU) */
export const REGION_SECTIONS: SectionData[] = [
  { id: "start", title: ["Ishni boshlash", "Начало работы"], guide: start },
  { id: "dashboard", path: "/", title: ["Dashboard", "Дашборд"], guide: dashboard },
  { id: "contract", path: "/contract", title: ["Shartnomalar ro'yhati", "Список договоров"], guide: contract },
  { id: "workers", path: "/workers", title: ["Hodimlar ro'yhati", "Список сотрудников"], guide: workers },
  { id: "batalon", path: "/batalon", title: ["Quyi tuzilmalar", "Подразделения"], guide: batalon },
  { id: "report", path: "/report", title: ["Qarzdorlik", "Задолженность"], guide: report },
  { id: "organisation", path: "/organisation", title: ["Tashkilot", "Организация"], guide: organisation },
  { id: "prixod", path: "/prixod", title: ["Kirimlar kitobi", "Книга приходов"], guide: prixod },
  { id: "rasxod", path: "/rasxod", title: ["Chiqimlar kitobi", "Книга расходов"], guide: rasxod },
  {
    id: "rasxod-workers",
    path: "/rasxod-workers",
    title: ["Hodimlarning pul hisob-kitobi", "Расчёты с сотрудниками"],
    guide: rasxodWorkers,
  },
  { id: "moddiy-baza", path: "/moddiy-baza", title: ["Moddiy baza", "Материальная база"], guide: moddiyBaza },
  { id: "staff", path: "/staff", title: ["Foydalanuvchilar", "Пользователи"], guide: staff },
  { id: "logs", path: "/logs", title: ["Qaydlar", "Журнал"], guide: logs },
  { id: "spravochnik", path: "/spravichnik", title: ["Ma'lumotnoma", "Справочник"], guide: spravochnik },
];

/** Super-admin — o'z menyusi tartibida (`layout/menu.tsx`, ADMIN_MENU) */
export const ADMIN_SECTIONS: SectionData[] = [
  { id: "admin-start", title: ["Ishni boshlash", "Начало работы"], guide: adminStart },
  { id: "admin-dashboard", path: "/", title: ["Dashboard", "Дашборд"], guide: adminDashboard },
  { id: "admin-debt", path: "/debt", title: ["Qarzdorlik", "Задолженность"], guide: adminDebt },
  { id: "admin-monitoring", path: "/monitoring-data", title: ["Monitoring", "Мониторинг"], guide: adminMonitoring },
  { id: "admin-baza", path: "/markaziy-baza", title: ["Markaziy baza", "Центральная база"], guide: adminBaza },
  { id: "admin-import", path: "/contract-import", title: ["Shartnoma importi", "Импорт договоров"], guide: adminImport },
  { id: "admin-users", path: "/users", title: ["Foydalanuvchilar", "Пользователи"], guide: adminUsers },
  { id: "admin-logs", path: "/logs", title: ["Qaydlar", "Журнал"], guide: adminLogs },
  { id: "admin-videos", path: "/video-lessons", title: ["Video darslar", "Видеоуроки"], guide: adminVideos },
  { id: "admin-bxm", path: "/spravichnik", title: ["Ma'lumotnoma", "Справочник"], guide: adminBxm },
];

export type ManualAudience = "region" | "admin";

/**
 * Ikki alohida qo'llanma: viloyat foydalanuvchisi super-admin bo'limlarini
 * ko'rmaydi va aksincha. Saytdagi qo'llanma (`index.tsx`), "PDF kitob"
 * tugmasi (`BookButton.tsx`) va PDF kitoblar (`scripts/manual-book/build.mjs`:
 * public/manual/<pdf>-<til>.pdf) shundan quriladi.
 */
export const MANUALS: Record<ManualAudience, { sections: SectionData[]; pdf: string }> = {
  region: { sections: REGION_SECTIONS, pdf: "qollanma" },
  admin: { sections: ADMIN_SECTIONS, pdf: "qollanma-admin" },
};

/**
 * Kim qaysi qo'llanmani ko'radi: viloyatga bog'langan foydalanuvchi (admin,
 * yurist, buxgalter) — viloyatnikini, viloyatsiz (super-admin) —
 * super-adminnikini. Batalon foydalanuvchisida qo'llanma yo'q.
 */
export const manualAudience = (user: any): ManualAudience => (user?.region_id ? "region" : "admin");
