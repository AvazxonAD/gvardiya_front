/**
 * "Qaydlar" — foydalanuvchi amallari jurnali (backend: `src/audit.log`).
 *
 * Har bir API so'rovi yoziladi: kim, qachon, qaysi bo'limda, qanday amal,
 * natijasi. Super-admin barcha qaydlarni, viloyat admini faqat o'z
 * viloyatinikini ko'radi.
 */

export type LogRole = "super_admin" | "region_admin" | "lawyer" | "accountant" | "batalon";

export type LogAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "login"
  | "logout"
  | "other";

export interface IActionLog {
  /** BIGSERIAL — `pg` drayveri matn qilib qaytaradi */
  id: string;
  user_id: number | null;
  /** O'sha paytdagi nusxa: foydalanuvchi keyin o'zgarsa ham saqlanadi */
  user_login: string | null;
  user_fio: string | null;
  user_role: LogRole | null;
  region_id: number | null;
  region_name: string | null;
  batalon_id: number | null;
  batalon_name: string | null;
  method: string;
  /** Marshrut prefiksi: "contract", "rasxod/fio" ... */
  module: string;
  action: LogAction;
  /** "/contract/:id/send-lawyer" */
  route: string;
  /** Haqiqiy yo'l va query */
  url: string;
  /** BIGINT — matn */
  entity_id: string | null;
  status: number;
  success: boolean;
  error: string | null;
  duration_ms: number | null;
  ip: string | null;
  created_at: string;
}

type Json = Record<string, unknown>;

/** Bitta qayd to'liq (`GET /logs/:id`) — ro'yxatda og'ir ustunlar kelmaydi */
export interface IActionLogDetails extends IActionLog {
  user_agent: string | null;
  /** So'rov tanasi — parol va tokenlar "***" bilan yashirilgan */
  body: Json | null;
  /** Javob tanasi — faqat o'zgartiruvchi so'rovlarda (GET saqlanmaydi) */
  response: Json | null;
  /** Yozuvning so'rovdan OLDINGI holati (tahrirlash, o'chirish) */
  old_data: Json | null;
  /** Yozuvning so'rovdan KEYINGI holati (yaratishda — yangi yozuv) */
  new_data: Json | null;
}

export interface IActionLogStats {
  count: number;
  /** Ko'rish va yuklab olishdan boshqa amallar */
  changes: number;
  errors: number;
  users: number;
}

export interface IActionLogMeta {
  pageCount: number;
  count: number;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
  stats: IActionLogStats;
}

/** Filtrdagi foydalanuvchi */
export interface IActionLogUser {
  id: number;
  login: string;
  fio: string | null;
  role: LogRole;
  region_name: string | null;
  batalon_name: string | null;
}

/** Foydalanuvchi kesimida: tanlangan davrda nima qilgani */
export interface IActionLogSummary extends IActionLogUser {
  isdeleted: boolean;
  total: number;
  views: number;
  creates: number;
  updates: number;
  deletes: number;
  /** Yuklab olish va import */
  files: number;
  errors: number;
  last_login_at: string | null;
  last_at: string | null;
  last_ip: string | null;
}
