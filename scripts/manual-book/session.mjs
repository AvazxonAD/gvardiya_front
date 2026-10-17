/**
 * Skrinshotlar uchun umumiy: dasturga kirgan foydalanuvchi sessiyasi va
 * ilovani shu sessiya bilan ochish (capture.mjs, shots.mjs).
 *
 * JWT backend/.env dagi kalit bilan yasaladi (memory:
 * reference-headless-ui-check). Skrinshotda haqiqiy F.I.Sh. va hisob raqam
 * emas — namuna qiymatlar ko'rinadi.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const BACKEND = path.resolve(process.env.BACKEND_DIR || path.join(CLIENT, "../backend"));
export const APP_URL = process.env.APP_URL || "http://localhost:5175";

/**
 * Qo'llanma skrinshotlari: ekran 1440×900, 1,5× — rasm 2160×1350 (mavjud
 * skrinshotlar bilan bir xil masshtab).
 */
export const VIEW = { width: 1440, height: 900, scale: 1.5 };

/** Yuqori paneldagi hisob raqam — namuna (eski skrinshotlardagi bilan bir xil) */
const SAMPLE_ACCOUNT = { account_number_id: 2, account_number: "20208000900100001001" };

const backendRequire = createRequire(path.join(BACKEND, "package.json"));

/** Viloyat foydalanuvchisi nomidan sessiya (odatda id 1 — viloyat admini) */
export async function mintSession(userId = Number(process.env.USER_ID || 1)) {
  backendRequire("dotenv").config({ path: path.join(BACKEND, ".env") });
  const jwt = backendRequire("jsonwebtoken");
  const { getFullByIdService } = backendRequire(path.join(BACKEND, "src/auth/auth.service.js"));
  const full = await getFullByIdService(userId);
  const { password, pinfl, ...user } = full; // eslint-disable-line no-unused-vars
  user.has_pinfl = Boolean(pinfl);
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    algorithm: "HS256",
    issuer: "gvardiya-api",
    expiresIn: "30m",
  });
  return { token, user: { ...user, fio: "Namuna Administrator" } };
}

/**
 * Ilovani sessiya bilan ochadi: ekran o'lchami va localStorage (token,
 * foydalanuvchi, til — lotin, yorug' mavzu, hisob raqam, davr).
 * `period` — sahifalardagi standart davr ({ startDate, endDate }).
 */
export async function openApp(chrome, session, { period, view = VIEW } = {}) {
  await chrome.send("Emulation.setDeviceMetricsOverride", {
    width: view.width,
    height: view.height,
    deviceScaleFactor: view.scale,
    mobile: false,
  });
  await chrome.navigate(APP_URL, 1000);
  await chrome.evaluate(`
    sessionStorage.clear();
    sessionStorage.setItem("token", ${JSON.stringify(session.token)});
    localStorage.setItem("user", ${JSON.stringify(JSON.stringify({ user: session.user }))});
    localStorage.setItem("lang", "0");
    localStorage.setItem("theme", "light");
    localStorage.setItem("account", ${JSON.stringify(JSON.stringify(SAMPLE_ACCOUNT))});
    ${period ? `localStorage.setItem("standartDate", ${JSON.stringify(JSON.stringify(period))});` : ""}
    true`);
}
