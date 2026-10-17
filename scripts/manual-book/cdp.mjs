/**
 * Headless Chrome bilan ishlash (DevTools protokoli, qo'shimcha paketsiz):
 * Node 22+ dagi global WebSocket orqali.
 *
 *   const chrome = await launchChrome();
 *   await chrome.send("Page.navigate", { url });
 *   ...
 *   await chrome.close();
 *
 * Chrome yo'li: CHROME_PATH muhit o'zgaruvchisi yoki Windows'dagi odatiy joy.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DEFAULT_CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launchChrome({ width = 1600, height = 1000 } = {}) {
  const { existsSync } = await import("node:fs");
  const exe = process.env.CHROME_PATH || DEFAULT_CHROME.find((p) => existsSync(p));
  if (!exe) throw new Error("Chrome topilmadi — CHROME_PATH ni ko'rsating");

  const port = 9400 + Math.floor(Math.random() * 400);
  const profile = mkdtempSync(path.join(tmpdir(), "manual-book-"));
  const proc = spawn(
    exe,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      `--window-size=${width},${height}`,
      "--allow-file-access-from-files",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let target;
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(250);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      /* Chrome hali ochilmagan */
    }
  }
  if (!target) throw new Error("Chrome DevTools ulanmadi");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });

  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      for (const fn of listeners.get(msg.method)) fn(msg.params);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  /** Hodisaga doimiy obuna (masalan, `Fetch.requestPaused`) */
  const on = (method, fn) => {
    if (!listeners.has(method)) listeners.set(method, new Set());
    listeners.get(method).add(fn);
  };

  const once = (method) =>
    new Promise((resolve) => {
      const fn = (params) => {
        listeners.get(method).delete(fn);
        resolve(params);
      };
      on(method, fn);
    });

  /** Sahifada JS bajarish, natija qiymat sifatida */
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result?.value;
  };

  /** Sahifani ochib, yuklanib bo'lishini kutish */
  const navigate = async (url, wait = 0) => {
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url });
    await loaded;
    if (wait) await sleep(wait);
  };

  await send("Page.enable");
  await send("Runtime.enable");

  const close = async () => {
    try {
      ws.close();
    } catch {
      /* allaqachon yopilgan */
    }
    proc.kill();
    await sleep(300);
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* Chrome fayllarni hali qo'yib yubormagan bo'lishi mumkin */
    }
  };

  return { send, on, evaluate, navigate, close };
}
