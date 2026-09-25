import { handleStatus, tt } from "@/utils";

/*
 * Xatoni foydalanuvchiga ko'rsatiladigan ANIQ matnga aylantirish.
 *
 * Backend xatoni doim `{ success: false, message }` ko'rinishida qaytaradi
 * (`res.error`) — `error` degan maydon yo'q. Shuning uchun avvalo serverning
 * o'z matni olinadi ("Hujjat raqami" kiritilishi shart! kabi). Server matn
 * bermagan holatlar (tarmoq uzilgan, nginx sahifasi) — sababiga qarab.
 * Axios'ning "Request failed with status code 400" matni ekranga chiqmaydi.
 */

const RAW_STATUS = /^Request failed with status code (\d{3})$/;
const RAW_NETWORK = /^(Network Error|Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.?)$/i;
const RAW_TIMEOUT = /^timeout of \d+ms exceeded$/i;

export const networkErrorMessage = () =>
  tt(
    "Server bilan aloqa yo'q. Internet ulanishini tekshirib, qayta urinib ko'ring.",
    "Нет связи с сервером. Проверьте подключение к интернету и повторите попытку."
  );

const timeoutMessage = () =>
  tt(
    "Server belgilangan vaqtda javob bermadi. Qayta urinib ko'ring.",
    "Сервер не ответил вовремя. Повторите попытку."
  );

const UNKNOWN_STATUS = "Noma'lum xato yuz berdi / Неизвестная ошибка";

// Server matni bo'lmaganda — status bo'yicha. `handleStatus` da 5xx shlyuz
// kodlari yo'q (umumiy "Noma'lum xato" qaytaradi), kirill tilida esa
// noma'lum kodda yiqiladi — shu sababli ular shu yerda.
const statusMessage = (status: number) => {
  if (status === 502 || status === 503 || status === 504) {
    return tt(
      "Server vaqtincha ishlamayapti. Birozdan keyin qayta urinib ko'ring.",
      "Сервер временно недоступен. Повторите попытку чуть позже."
    );
  }
  try {
    const text = handleStatus(status);
    if (text && text !== UNKNOWN_STATUS) return text;
  } catch {
    // noma'lum kod
  }
  return `${tt("Server xatosi", "Ошибка сервера")} (${status})`;
};

// Backend ushlangan xatoni qayta o'raganda "Error: Error: matn" bo'lib qoladi
const clean = (text: string) => text.replace(/^(\s*Error:\s*)+/i, "").trim();

// Server javobidagi matn: `message` (standart), eskiroq javoblarda `error`.
// HTML sahifa (nginx 502/413) matn hisoblanmaydi.
const bodyMessage = (data: unknown): string | null => {
  if (typeof data === "string") {
    return data.trim() && !data.trim().startsWith("<") ? data : null;
  }
  const body = data as { message?: unknown; error?: unknown } | null;
  for (const value of [body?.message, body?.error]) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
};

/** Axios / fetch'ning xom matnini tushunarlisiga almashtiradi, boshqa matnga tegmaydi */
export function humanizeErrorText(text: string): string {
  const status = text.match(RAW_STATUS);
  if (status) return statusMessage(Number(status[1]));
  if (RAW_NETWORK.test(text.trim())) return networkErrorMessage();
  if (RAW_TIMEOUT.test(text.trim())) return timeoutMessage();
  return clean(text);
}

/**
 * Istalgan xatodan (axios, fetch, `{ response: { status, data } }`, Error,
 * matn) ko'rsatiladigan matn. `fallback` — hech narsa topilmasa.
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  const e = error as any;

  const response = e?.response;
  if (response) {
    const text = bodyMessage(response.data);
    if (text) return clean(text);
    if (response.status) return statusMessage(Number(response.status));
  }

  if (e?.isAxiosError) {
    if (e.code === "ERR_CANCELED") return tt("So'rov bekor qilindi", "Запрос отменён");
    if (e.code === "ECONNABORTED" || e.code === "ETIMEDOUT") return timeoutMessage();
    return networkErrorMessage();
  }

  const text = typeof error === "string" ? error : e?.message;
  if (typeof text === "string" && text.trim()) return humanizeErrorText(text);

  return fallback ?? tt("Xatolik yuz berdi", "Произошла ошибка");
}

/** Server yoki tarmoq xatosimi (kod xatosi emas) — global ushlagich uchun */
export function isRequestError(error: unknown): boolean {
  const e = error as any;
  if (e?.code === "ERR_CANCELED") return false;
  return Boolean(
    e?.isAxiosError || (e instanceof TypeError && RAW_NETWORK.test(String(e.message).trim()))
  );
}
