/**
 * Skrinshot paytida API javoblarini namuna ma'lumot bilan almashtirish
 * (DevTools Fetch domeni) — capture.mjs va shots.mjs uchun umumiy.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { APP_URL, CLIENT } from "./session.mjs";

/** Frontend so'rov yuboradigan API manzili — vite kabi .env fayllaridan (development) */
export function apiUrl() {
  if (process.env.API_URL) return process.env.API_URL.replace(/\/$/, "");
  let url;
  for (const name of [".env", ".env.local", ".env.development", ".env.development.local"]) {
    const file = path.join(CLIENT, name);
    if (!existsSync(file)) continue;
    const m = readFileSync(file, "utf8").match(/^\s*VITE_API_URL\s*=\s*(.+?)\s*$/m);
    if (m) url = m[1].replace(/^["']|["']$/g, "");
  }
  if (!url) throw new Error("VITE_API_URL topilmadi — API_URL ni ko'rsating");
  return url.replace(/\/$/, "");
}

/** Backend javobi ko'rinishida */
export const ok = (data, meta) => ({
  code: 200,
  message: "Muvaffaqiyatli bajarildi",
  success: true,
  data,
  ...(meta ? { meta } : {}),
});

/**
 * API so'rovlarini ushlaydi. `mocks` — [usul, yo'l (API manzilidan keyin),
 * (searchParams) => javob]; birinchi mos kelgani olinadi.
 *
 * - Yozuvchi so'rovlar (POST/PUT/PATCH/DELETE) backendga UMUMAN yuborilmaydi:
 *   so'rov bosqichidayoq namunasi (bo'lmasa — `{ success: true }`) bilan
 *   javob beriladi. Skrinshot bazaga hech narsa yozmasin — masalan,
 *   shartnoma hujjati sahifasi ochilganda PDF ni o'zi yuklaydi (PATCH
 *   /contract/:id/upload-pdf).
 * - O'qish (GET) — javob bosqichida: namunasi bo'lsa javob tanasi
 *   almashtiriladi (backendning CORS sarlavhalari saqlanadi), bo'lmasa —
 *   o'zgarishsiz o'tadi va `passed` ga yoziladi (oxirida ko'rib chiqish uchun).
 */
export function interceptApi(chrome, mocks, api = apiUrl()) {
  const base = new URL(api);
  const prefix = base.pathname.replace(/\/$/, "");
  const appOrigin = new URL(APP_URL).origin;
  const passed = new Set();
  const blocked = new Set();
  const json = (body) => Buffer.from(JSON.stringify(body)).toString("base64");

  chrome.on("Fetch.requestPaused", async ({ requestId, request, responseStatusCode, responseErrorReason, responseHeaders = [] }) => {
    const url = new URL(request.url);
    const rel = url.pathname.slice(prefix.length) || "/";
    const mock = mocks.find(([method, re]) => method === request.method && re.test(rel));
    const atResponse = responseStatusCode !== undefined || responseErrorReason !== undefined;
    const write = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    try {
      if (!atResponse) {
        if (!write) {
          await chrome.send("Fetch.continueRequest", { requestId });
          return;
        }
        if (!mock) blocked.add(`${request.method} ${rel}`);
        await chrome.send("Fetch.fulfillRequest", {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: "Content-Type", value: "application/json; charset=utf-8" },
            { name: "Access-Control-Allow-Origin", value: appOrigin },
            { name: "Access-Control-Allow-Credentials", value: "true" },
          ],
          body: json(mock ? mock[2](url.searchParams) : ok(null)),
        });
        return;
      }
      if (!mock) {
        if (request.method !== "OPTIONS") passed.add(`${request.method} ${rel}`);
        await chrome.send("Fetch.continueRequest", { requestId });
        return;
      }
      const headers = responseHeaders.filter(
        (h) => !/^(content-type|content-length|content-encoding|etag|last-modified|cache-control)$/i.test(h.name)
      );
      headers.push(
        { name: "Content-Type", value: "application/json; charset=utf-8" },
        { name: "Cache-Control", value: "no-store" }
      );
      await chrome.send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: headers,
        body: json(mock[2](url.searchParams)),
      });
    } catch (error) {
      console.warn(`so'rov ${request.method} ${rel}: ${error.message}`);
    }
  });

  const pattern = `${base.origin}${prefix}/*`;
  return {
    passed,
    /** Sahifa ochilishidan OLDIN chaqiriladi — birinchi so'rovlar ham ushlansin */
    enable: () =>
      chrome.send("Fetch.enable", {
        patterns: [
          { urlPattern: pattern, requestStage: "Request" },
          { urlPattern: pattern, requestStage: "Response" },
        ],
      }),
    /** Namunasiz o'tgan va to'xtatilgan yozuvchi so'rovlar ro'yxati (bo'lsa) */
    report() {
      if (passed.size) {
        console.log(
          "\nNamunasiz (backenddan kelgan) so'rovlar — skrinshotda ularning ma'lumoti ko'rinmasin:\n  " +
            [...passed].sort().join("\n  ")
        );
      }
      if (blocked.size) {
        console.log(
          "\nBackendga yuborilmagan yozuvchi so'rovlar (javob — { success: true }):\n  " + [...blocked].sort().join("\n  ")
        );
      }
    },
  };
}
