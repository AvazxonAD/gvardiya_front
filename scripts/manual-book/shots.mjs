/**
 * Qo'llanma skrinshotlari (public/manual/<bo'lim>/*.webp) — dasturning o'zidan,
 * NAMUNA ma'lumot bilan. API javoblari brauzerning o'zida almashtiriladi
 * (DevTools Fetch domeni, ma'lumot — fixtures.mjs): skrinshotda haqiqiy
 * tashkilot, odam yoki summa ko'rinmaydi. Bosiladigan joy qizil ramka bilan
 * belgilanadi (eski skrinshotlar uslubida). "Bugun" — 26.09.2026, davr —
 * sentyabr (namuna ma'lumotlar bilan mos), ekran 1440×900 (1,5× — 2160×1350),
 * animatsiyalar o'chiq.
 *
 * Kerak: ishlab turgan frontend (APP_URL, odatda http://localhost:5175),
 * ishlab turgan backend (VITE_API_URL — javob kelishi kerak, namuna faqat
 * uning tanasini almashtiradi) va backend/.env (sessiya uchun JWT kaliti).
 * Almashtirilmagan API so'rovlari oxirida ro'yxat qilib chiqariladi — ular
 * haqiqiy backenddan keladi, skrinshotga tushmaganini tekshiring.
 *
 *   npm run manual:shots                                # hammasi
 *   ONLY=moddiy-baza npm run manual:shots               # bitta bo'lim
 *   ONLY=contract/12-bekor-qilish npm run manual:shots  # bitta rasm
 *   ONLY=admin/ npm run manual:shots                    # super-admin qo'llanmasi
 *
 * Ikki qo'llanma: viloyat ssenariylari (SCENES) viloyat admini (USER_ID,
 * odatda 1), super-admin ssenariylari (scenes-admin.mjs, public/manual/admin/)
 * super-admin (ADMIN_USER_ID, odatda 8) sessiyasi bilan olinadi.
 *
 * Yangi sahifa: fixtures.mjs (super-admin — fixtures-admin.mjs) ga ma'lumot,
 * MOCKS ga API yo'li, SCENES ga ssenariy (sahifa, amallar, ramkalar). Keyin
 * `npm run manual:pdf`.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { launchChrome, sleep } from "./cdp.mjs";
import {
  ACCOUNTS,
  BAZA_BALANCE,
  BAZA_MONITORING,
  BAZA_RASXOD,
  BAZA_RASXOD_META,
  CANCELLED_CONTRACTS,
  CANCELLED_PRIXODS,
  PRIXODS,
  PRIXOD_META,
  CONTRACT_DOC,
  CONTRACT_ORG,
  CONTRACTS,
  DASH_BATALON,
  DASH_COUNT,
  DASH_DISTRIBUTION,
  DASH_ORG_DEBT,
  DASH_ORG_DEBT_META,
  DASH_RED,
  DASH_SOLDIER,
  FIO_LIST,
  FIO_LIST_META,
  RASXOD_DOCS,
  RASXOD_META,
  REKVIZIT,
  SOLDIER_ROWS,
  WORKER_BATALONS,
  WORKER_IMPORT_CHECK,
  WORKERS,
  WORKERS_META,
  contractMeta,
  soldierMeta,
} from "./fixtures.mjs";
import { interceptApi, ok } from "./mock-api.mjs";
import { ADMIN_MOCKS, ADMIN_SCENES } from "./scenes-admin.mjs";
import { APP_URL, BACKEND, CLIENT, VIEW, mintSession, openApp } from "./session.mjs";

const OUT_DIR = path.join(CLIENT, "public/manual");
const ONLY = (process.env.ONLY || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Namuna ma'lumotlardagi "bugun" va sahifalardagi davr */
const TODAY = "2026-09-26T10:30:00+05:00";
const PERIOD = { startDate: "2026-09-01", endDate: "2026-09-30" };

/** Sahifalar localStorage'da eslab qoladigan ko'rinish holatlari — har ssenariydan oldin tozalanadi */
const UI_STATE_KEYS = JSON.stringify(["contract.filtersOpen"]);

/* ── Namuna API javoblari ─────────────────────────────────────────── */

const searchRows = (rows, text, keys) => {
  const q = (text || "").trim().toLowerCase();
  return q ? rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q))) : rows;
};

/** [usul, yo'l (API manzilidan keyin), javob] — birinchi mos kelgani olinadi */
const MOCKS = [
  // Yuqori paneldagi hisob raqam shu ro'yxatdan yangilanadi — haqiqiysi ko'rinmasin
  ["GET", /^\/account\/?$/, () => ok(ACCOUNTS)],
  [
    "GET",
    /^\/contract\/?$/,
    (q) => {
      if (q.get("contract_status") !== "cancelled") return ok(CONTRACTS, contractMeta(CONTRACTS));
      const rows = searchRows(CANCELLED_CONTRACTS, q.get("search"), ["doc_num", "organization_name", "organization_str"]);
      return ok(rows.slice(0, Number(q.get("limit")) || rows.length), contractMeta(rows));
    },
  ],
  // Kirimlar kitobi va uning «Bekor qilinganlar» oynasi
  [
    "GET",
    /^\/prixod\/cancelled$/,
    (q) => {
      const rows = searchRows(CANCELLED_PRIXODS, q.get("search"), ["prixod_doc_num", "contract_doc_num", "organization_name", "opisanie"]);
      return ok(rows.slice(0, Number(q.get("limit")) || rows.length), { count: rows.length, pageCount: 1, currentPage: 1 });
    },
  ],
  ["GET", /^\/prixod\/?$/, () => ok(PRIXODS, PRIXOD_META)],
  ["GET", /^\/moddiy-baza\/monitoring\/balance$/, () => ok(BAZA_BALANCE)],
  ["GET", /^\/moddiy-baza\/monitoring$/, () => ok(BAZA_MONITORING)],
  ["GET", /^\/moddiy-baza\/rasxod$/, () => ok(BAZA_RASXOD, BAZA_RASXOD_META)],
  ["GET", /^\/moddiy-baza\/muddatli-harbiy$/, () => ok(SOLDIER_ROWS, soldierMeta(SOLDIER_ROWS))],
  ["GET", /^\/region\/dashboard\/count$/, () => ok(DASH_COUNT)],
  ["GET", /^\/region\/dashboard\/distribution$/, () => ok(DASH_DISTRIBUTION)],
  ["GET", /^\/region\/dashboard\/red-border$/, () => ok(DASH_RED)],
  ["GET", /^\/region\/dashboard\/soldier-tasks$/, () => ok(DASH_SOLDIER)],
  ["GET", /^\/region\/dashboard\/batalon-stats$/, () => ok(DASH_BATALON)],
  ["GET", /^\/region\/dashboard\/organization-debt$/, () => ok(DASH_ORG_DEBT, DASH_ORG_DEBT_META)],
  ["GET", /^\/rasxod\/?$/, () => ok(RASXOD_DOCS, RASXOD_META)],
  ["GET", /^\/rasxod\/fio\/?$/, () => ok(FIO_LIST, FIO_LIST_META)],
  // Ma'lumotnoma → Rekvizitlar va shartnoma hujjati (shablon matni — backendning
  // o'zidan: u dastur kodidagi umumiy matn, haqiqiy ma'lumot emas)
  ["GET", /^\/doer\/?$/, () => ok(REKVIZIT.doer)],
  ["GET", /^\/boss\/?$/, () => ok(REKVIZIT.boss)],
  ["GET", /^\/adress\/?$/, () => ok(REKVIZIT.adress)],
  ["GET", /^\/bank\/?$/, () => ok(REKVIZIT.bank)],
  ["GET", /^\/str\/?$/, () => ok(REKVIZIT.str)],
  ["GET", /^\/account\/\d+$/, () => ok(ACCOUNTS[0])],
  ["GET", /^\/contract\/\d+$/, () => ok(CONTRACT_DOC)],
  ["GET", /^\/contract\/\d+\/verification(\/history)?$/, () => ok([])],
  ["GET", /^\/organization\/\d+$/, () => ok(CONTRACT_ORG)],
  // Hodimlar ro'yhati va Exceldan import (tekshiruv — yozuvchi so'rov, backendga bormaydi)
  ["GET", /^\/worker\/?$/, () => ok(WORKERS, WORKERS_META)],
  ["GET", /^\/batalon\/?$/, () => ok(WORKER_BATALONS)],
  ["POST", /^\/worker\/import\/check$/, () => ok(WORKER_IMPORT_CHECK.data, WORKER_IMPORT_CHECK.meta)],
];

/** Xodimlar importiga yuklanadigan fayl — yangi shablon (backend worker/import.js), namuna batalonlar bilan */
async function sampleWorkersFile() {
  const backendRequire = createRequire(path.join(BACKEND, "package.json"));
  const { buildTemplate } = backendRequire(path.join(BACKEND, "src/worker/import.js"));
  const { makeT } = backendRequire(path.join(BACKEND, "src/utils/doc.lang.js"));
  const file = path.join(mkdtempSync(path.join(tmpdir(), "manual-workers-")), "Xodimlar_oktabr.xlsx");
  writeFileSync(file, Buffer.from(await buildTemplate(WORKER_BATALONS, makeT("uz"))));
  return file;
}

/** Sahifadagi "bugun"ni almashtirish: sana tanlovlari va standart sanalar namuna davrida bo'lsin */
const fakeToday = (iso) => `(() => {
  const Real = Date;
  const shift = ${new Date(iso).getTime()} - Real.now();
  function FakeDate(...args) {
    if (!new.target) return new Real(Real.now() + shift).toString();
    return args.length ? new Real(...args) : new Real(Real.now() + shift);
  }
  FakeDate.prototype = Real.prototype;
  FakeDate.now = () => Real.now() + shift;
  FakeDate.parse = Real.parse;
  FakeDate.UTC = Real.UTC;
  globalThis.Date = FakeDate;
})();`;

/* ── Sahifa ichidagi yordamchilar ─────────────────────────────────── */

/** Sahifaga `window.__shots` sifatida o'rnatiladi (toString orqali — tashqi o'zgaruvchisiz) */
function pageHelpers() {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const S = {
    /** Matni shu so'z bilan boshlangan (exact — aynan teng) ko'rinib turgan element */
    byText(selector, text, { exact = false, nth = 0, root = document } = {}) {
      const t = norm(text);
      const found = [...root.querySelectorAll(selector)].filter(
        (el) => shown(el) && (exact ? norm(el.textContent) === t : norm(el.textContent).startsWith(t))
      );
      return found[nth] ?? null;
    },
    /** Jadval qatori: birinchi katagi shu matn */
    row(firstCell, root = document) {
      return [...root.querySelectorAll("tbody tr")].find((tr) => norm(tr.cells[0]?.textContent) === norm(firstCell)) ?? null;
    },
    /** Ochiq oyna (eng ustidagisi) */
    dialog() {
      const list = [...document.querySelectorAll('[role="dialog"]')].filter(shown);
      return list[list.length - 1] ?? null;
    },
    /** Jamlanma katakchasi — yorlig'i bo'yicha */
    tile(label, root = document) {
      return S.byText("p, span", label, { root })?.closest(".rounded-md.border") ?? null;
    },
    /** Katakcha — faqat <p> yorliq bo'yicha (jadvaldagi bir xil matnli belgilar — <span>) */
    ptile(label, root = document) {
      return S.byText("p", label, { root })?.closest(".rounded-md.border") ?? null;
    },
    /** Matn ichidagi so'z yoki ibora (alohida elementi yo'q) — Range bilan o'lchanadi */
    textRect(text, root = document.body) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const i = n.textContent.indexOf(text);
        if (i < 0) continue;
        const range = document.createRange();
        range.setStart(n, i);
        range.setEnd(n, i + text.length);
        const r = range.getBoundingClientRect();
        if (r.width > 0) return { x: r.left, y: r.top, w: r.width, h: r.height };
      }
      return null;
    },
    rect(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    },
    /** Bir nechta elementni o'rab olgan to'rtburchak */
    union(...els) {
      const rs = els.map((e) => (e instanceof Element ? S.rect(e) : e ?? null));
      if (rs.some((r) => !r)) return null;
      const x = Math.min(...rs.map((r) => r.x));
      const y = Math.min(...rs.map((r) => r.y));
      return {
        x,
        y,
        w: Math.max(...rs.map((r) => r.x + r.w)) - x,
        h: Math.max(...rs.map((r) => r.y + r.h)) - y,
      };
    },
    /** Jadval ustunlari (sarlavhadan jadvalning ko'rinib turgan pastigacha) */
    columns(first, last = first) {
      if (!first || !last) return null;
      const a = first.getBoundingClientRect();
      const b = last.getBoundingClientRect();
      const table = first.closest("table");
      let bottom = table.getBoundingClientRect().bottom;
      for (let p = table.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowY;
        if (o === "auto" || o === "scroll") {
          bottom = Math.min(bottom, p.getBoundingClientRect().bottom);
          break;
        }
      }
      return { x: a.left, y: a.top, w: b.right - a.left, h: bottom - a.top };
    },
    /** Qizil ramkalar (eski skrinshotlar uslubida) — ekran chetidan chiqmaydi */
    frame(rects, pad = 3) {
      const W = innerWidth;
      const H = innerHeight;
      for (const r of rects) {
        const x = Math.max(3, r.x - pad);
        const y = Math.max(3, r.y - pad);
        const w = Math.min(W - 3, r.x + r.w + pad) - x;
        const h = Math.min(H - 3, r.y + r.h + pad) - y;
        const d = document.createElement("div");
        d.className = "__shot-frame";
        Object.assign(d.style, {
          position: "fixed",
          left: `${x}px`,
          top: `${y}px`,
          width: `${w}px`,
          height: `${h}px`,
          boxSizing: "border-box",
          border: "2.5px solid #e11d48",
          borderRadius: "8px",
          boxShadow: "0 0 0 3px rgba(225, 29, 72, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.9)",
          pointerEvents: "none",
          zIndex: "2147483647",
        });
        document.body.appendChild(d);
      }
    },
    /**
     * Ochilgan qatlamning (hover'dagi popover) nusxasini o'z joyida qotirish:
     * captureScreenshot paytida sichqoncha "chiqib ketgan" hisoblanib, asli
     * yopilib qoladi
     */
    pin(el) {
      if (!el) return false;
      const copy = el.cloneNode(true);
      copy.classList.add("__shot-frame");
      copy.style.pointerEvents = "none";
      document.body.appendChild(copy);
      return true;
    },
    clear() {
      document.querySelectorAll(".__shot-frame").forEach((d) => d.remove());
    },
  };
  window.__shots = S;
  return true;
}

/** Sichqoncha va klaviatura — haqiqiy hodisalar (CDP Input), React ularni o'zinikidek oladi */
function makeUi(chrome) {
  const center = async (fn) => {
    const p = await chrome.evaluate(`(() => {
      const el = (${fn})();
      if (!el) return null;
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
      // Ikki qatorga bo'lingan matnda umumiy to'rtburchak markazi bo'sh joyga
      // tushadi — birinchi qatorning markazi olinadi
      const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);
    if (!p) throw new Error(`element topilmadi: ${fn}`);
    return p;
  };
  const mouse = (type, { x, y }, button = "left") =>
    chrome.send("Input.dispatchMouseEvent", { type, x, y, button, clickCount: button === "none" ? 0 : 1 });

  const ui = {
    async waitFor(fn, timeout = 10000) {
      const until = Date.now() + timeout;
      while (Date.now() < until) {
        if (await chrome.evaluate(`Boolean(window.__shots && (${fn})())`)) return;
        await sleep(120);
      }
      throw new Error(`kutilgan holat bo'lmadi: ${fn}`);
    },
    async hover(fn) {
      await mouse("mouseMoved", await center(fn), "none");
      await sleep(450);
    },
    async click(fn) {
      const p = await center(fn);
      await mouse("mouseMoved", p, "none");
      await mouse("mousePressed", p);
      await mouse("mouseReleased", p);
      await sleep(550);
    },
    async type(fn, text) {
      await ui.click(fn);
      await chrome.send("Input.insertText", { text });
      await sleep(250);
    },
    /** Ochilgan qatlamni rasm olinguncha qotirish (`__shots.pin`) */
    async pin(fn) {
      if (!(await chrome.evaluate(`window.__shots.pin((${fn})())`))) throw new Error(`qotiriladigan element yo'q: ${fn}`);
    },
    /** Radix Select: ochish va variantni matni bo'yicha tanlash */
    async choose(triggerFn, text) {
      await ui.click(triggerFn);
      const option = `() => [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent.trim() === ${JSON.stringify(text)})`;
      await ui.waitFor(option);
      await ui.click(option);
    },
    /** Fayl maydoniga (yashirini ham) fayl qo'yish — `change` hodisasi bilan */
    async upload(fn, file) {
      const { result } = await chrome.send("Runtime.evaluate", { expression: `(${fn})()` });
      if (!result?.objectId) throw new Error(`fayl maydoni topilmadi: ${fn}`);
      await chrome.send("DOM.setFileInputFiles", { files: [file], objectId: result.objectId });
      await sleep(600);
    },
    /** Sichqonchasiz bosish: SVG shaklning markazi qo'shni shaklga tushib qolishi mumkin */
    async jsClick(fn) {
      const done = await chrome.evaluate(`(() => {
        const el = (${fn})();
        if (!el) return false;
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return true;
      })()`);
      if (!done) throw new Error(`element topilmadi: ${fn}`);
      await sleep(550);
    },
    /**
     * Elementni ko'rinadigan joyga aylantirish (block: "start" | "center" |
     * "end" | "nearest"; gorizontal — eng yaqin). `margin` — tepadan bo'sh joy
     * (px): "start" da element yopishqoq yuqori panel ostida qolmasin
     */
    async scrollTo(fn, block = "start", margin = 0) {
      const done = await chrome.evaluate(`(() => {
        const el = (${fn})();
        if (!el) return false;
        el.style.scrollMarginTop = "${margin}px";
        el.scrollIntoView({ block: ${JSON.stringify(block)}, inline: "nearest" });
        return true;
      })()`);
      if (!done) throw new Error(`element topilmadi: ${fn}`);
      await sleep(400);
    },
    /**
     * Sichqonchani bo'sh joyga olib qo'yish — tugmalarda hover rangi qolmasin.
     * Yuqori panelning ustki cheti: rasm olishdan oldin (ramka chizilgach)
     * Chrome hover'ni koordinatani VIEW.scale ga bo'lib qayta hisoblaydi —
     * pastki burchak (1436, 896) jadval o'rtasidagi (957, 597) qatorni
     * bo'yab qo'yardi. (1436, 4) ham, (957, 3) ham — panelning bo'sh joyi
     */
    async rest() {
      await mouse("mouseMoved", { x: VIEW.width - 4, y: 4 }, "none");
      await sleep(300);
    },
  };
  return ui;
}

/* ── Ssenariylar ──────────────────────────────────────────────────── */

/**
 * id — public/manual/ ichidagi fayl (".webp" siz); path — ochiladigan sahifa;
 * ready — ma'lumot chizilganini bildiruvchi shart; act — amallar (Node'da,
 * `ui` orqali); frames — ramka joylari (sahifada bajariladi, `window.__shots`).
 * ready/frames va ui.* ga berilgan funksiyalar sahifada bajariladi — tashqi
 * o'zgaruvchilarga murojaat qilmasin.
 */
const SCENES = [
  // «Ishni boshlash», 2-bosqich: Rekvizitlar va ular shartnomada qayerda chiqadi
  {
    id: "start/02-rekvizitlar",
    path: "/spravichnik",
    ready: () => [...document.querySelectorAll("input")].some((i) => i.value === "Namuna viloyati"),
    frames: () => {
      const S = window.__shots;
      // Birinchi kartochka — «Ijrochi»: 3 ta «Ijrochi nomi», keyin 3 ta «Hujjat sarlavhasi»
      const inputs = [...document.querySelectorAll("main input")];
      return [
        inputs.length >= 6 && S.union(S.byText("label", "Ijrochi nomi"), inputs[2]),
        inputs.length >= 6 && S.union(S.byText("label", "Hujjat sarlavhasi"), inputs[5]),
      ];
    },
  },
  {
    id: "start/02b-shartnomada",
    path: "/contract/view/9046",
    ready: () => window.__shots.byText("h1", "Ommaviy tadbirni") && window.__shots.byText("p", "Namuna sh.", { exact: true }),
    frames: () => {
      const S = window.__shots;
      return [
        // Sana qatorining o'ng tomoni — «Hujjat sarlavhasi»
        S.rect(S.byText("p", "Namuna sh.", { exact: true })),
        // Kirish qismida — «Ijrochi nomi» (qalin) va rahbar
        S.rect(S.byText("span", "Namuna viloyati", { exact: true })),
        S.textRect("Karimov Aziz Baxtiyorovich"),
      ];
    },
  },
  {
    id: "contract/01-royxat",
    path: "/contract",
    ready: () => window.__shots.row("49"),
    async act(ui) {
      await ui.hover(() => window.__shots.row("44")?.querySelector(".cursor-help"));
      await ui.waitFor(() => document.querySelector("[data-radix-popper-content-wrapper] p"));
      await ui.pin(() => document.querySelector("[data-radix-popper-content-wrapper]"));
    },
    frames: () => {
      const S = window.__shots;
      const th = (t) => S.byText("thead th", t);
      return [
        S.rect(S.row("41")?.cells[0].querySelector("button")),
        S.rect(document.querySelector("[data-radix-popper-content-wrapper] > *")),
        S.columns(th("Xodim"), th("Yuristga")),
      ];
    },
  },
  {
    id: "contract/02-filtr",
    path: "/contract",
    ready: () => window.__shots.row("49"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Filtrlar"));
      await ui.waitFor(() => document.getElementById("contract-filters"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const footer = S.tile("Hisoblangan summa")?.parentElement?.parentElement;
      return [
        S.rect(S.byText("button", "Filtrlar")),
        S.rect(document.getElementById("contract-filters")),
        footer && S.union(S.tile("Hisoblangan summa", footer), S.tile("Muddati o'tgan", footer)),
      ];
    },
  },
  {
    id: "contract/03-amallar",
    path: "/contract",
    ready: () => window.__shots.row("49"),
    frames: () => {
      const S = window.__shots;
      const row = S.row("43");
      return [S.rect(S.byText("thead th", "Amallar")), S.rect(row?.cells[row.cells.length - 1])];
    },
  },
  {
    id: "contract/11-yuklab-olish",
    path: "/contract",
    ready: () => window.__shots.row("49"),
    async act(ui) {
      await ui.click(() => document.querySelector('button[aria-label="Yuklab olish"]'));
      await ui.waitFor(() => document.querySelector('[role="menu"]'));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [S.rect(document.querySelector('button[aria-label="Yuklab olish"]')), S.rect(document.querySelector('[role="menu"]'))];
    },
  },
  {
    id: "prixod/03-royxat",
    path: "/prixod",
    ready: () => window.__shots.row("101"),
    frames: () => {
      const S = window.__shots;
      const row = S.row("105");
      return [
        S.rect(document.querySelector('input[placeholder^="№, tashkilot yoki tavsif"]')),
        S.rect(S.byText("button", "Bekor qilinganlar")),
        S.rect(row?.cells[row.cells.length - 1]),
        S.rect(S.tile("Davr bo'yicha kirim")),
      ];
    },
  },
  {
    id: "prixod/05-bekor-qilish",
    path: "/prixod",
    ready: () => window.__shots.row("101"),
    async act(ui) {
      await ui.click(() => window.__shots.row("105")?.querySelector('button[aria-label="Bekor qilish"]'));
      await ui.waitFor(() => window.__shots.byText("h2", "Kirimni bekor qilasizmi?"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [
        S.rect(S.row("105")?.querySelector('button[aria-label="Bekor qilish"]')),
        S.rect(d && S.byText("button", "Ha, bekor qilish", { root: d })),
      ];
    },
  },
  {
    id: "prixod/06-bekor-qilinganlar",
    path: "/prixod",
    ready: () => window.__shots.row("101"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Bekor qilinganlar"));
      await ui.waitFor(() => window.__shots.byText("button", "Faollashtirish", { root: window.__shots.dialog() ?? document }));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [
        S.rect(S.byText("button", "Bekor qilinganlar")),
        S.rect(d && S.byText("button", "Faollashtirish", { root: d })),
      ];
    },
  },
  {
    id: "contract/12-bekor-qilish",
    path: "/contract",
    ready: () => window.__shots.row("49"),
    async act(ui) {
      await ui.click(() => window.__shots.row("43")?.querySelector('button[aria-label="Bekor qilish"]'));
      await ui.waitFor(() => window.__shots.byText("h2", "Shartnomani bekor qilasizmi?"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [
        S.rect(S.row("43")?.querySelector('button[aria-label="Bekor qilish"]')),
        S.rect(d && S.byText("button", "Ha, bekor qilish", { root: d })),
      ];
    },
  },
  {
    id: "contract/13-bekor-qilinganlar",
    path: "/contract",
    ready: () => window.__shots.row("49"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Bekor qilinganlar"));
      await ui.waitFor(() => window.__shots.byText("button", "Faollashtirish"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [S.rect(d?.querySelector("input")), S.rect(d && S.byText("button", "Faollashtirish", { root: d }))];
    },
  },
  {
    id: "moddiy-baza/01-monitoring",
    path: "/moddiy-baza",
    ready: () => window.__shots.byText("p", "Davrdagi to'lanmagan"),
    frames: () => {
      const S = window.__shots;
      return [
        S.union(S.tile("Boshlang'ich qoldiq"), S.tile("Yakuniy qoldiq")),
        S.rect(S.byText("p", "Davrdagi to'lanmagan")),
      ];
    },
  },
  {
    id: "moddiy-baza/02-chiqimlar",
    path: "/moddiy-baza/rasxod",
    ready: () => window.__shots.row("4"),
    frames: () => {
      const S = window.__shots;
      const row = S.row("4");
      return [
        S.rect(S.byText("button", "Qo'shish")),
        S.rect(row?.cells[row.cells.length - 1]),
        S.rect(S.tile("Davr bo'yicha chiqim")),
      ];
    },
  },
  {
    id: "moddiy-baza/03-yangi-chiqim",
    path: "/moddiy-baza/rasxod",
    ready: () => window.__shots.row("4"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Qo'shish"));
      await ui.waitFor(() => window.__shots.dialog()?.querySelector("textarea"));
      await ui.type(() => window.__shots.dialog().querySelector("input"), "5");
      await ui.type(() => window.__shots.dialog().querySelector('input[placeholder="0.00"]'), "350000");
      await ui.type(
        () => window.__shots.dialog().querySelector("textarea"),
        "Yong'in o'chirgichlarni qayta zaryadlash — 6 dona"
      );
      await ui.waitFor(() => {
        const d = window.__shots.dialog();
        return d && d.textContent.includes("Bu chiqimdan keyin qoldiq") && !d.querySelector('[aria-busy="true"]');
      });
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [
        S.rect(d?.querySelector("[aria-busy]")),
        S.union(
          d?.querySelector('input[placeholder="0.00"]'),
          d && S.byText("span", "Bu chiqimdan keyin qoldiq", { root: d })
        ),
        S.rect(d && S.byText("button", "Saqlash", { root: d })),
      ];
    },
  },
  {
    id: "moddiy-baza/04-muddatli",
    path: "/moddiy-baza/muddatli-harbiy",
    ready: () => window.__shots.byText("h2", "Batalonlar kesimida") && document.querySelectorAll("tbody tr").length > 6,
    frames: () => {
      const S = window.__shots;
      return [
        S.rect(S.byText("h2", "Batalonlar kesimida")?.closest("section")),
        S.union(S.tile("Jami (ishtirok puli)"), S.tile("Jami soat")),
      ];
    },
  },
  {
    id: "dashboard/01-davr",
    path: "/",
    ready: () => window.__shots.row("9") && window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti"),
    frames: () => {
      const dates = [...document.querySelectorAll("input")].filter(
        (i) => /^\d\d\.\d\d\.\d{4}$/.test(i.value) && i.getBoundingClientRect().top < 80
      );
      return [dates.length === 2 ? window.__shots.union(dates[0].parentElement, dates[1].parentElement) : null];
    },
  },
  {
    id: "dashboard/02-korsatkichlar",
    path: "/",
    ready: () => window.__shots.row("9") && window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti"),
    frames: () => {
      const S = window.__shots;
      const stat = (t) => S.byText("p, span", t)?.closest("button, .rounded-lg");
      return [S.union(stat("Jami shartnomalar"), stat("Qizil chegaraga"))];
    },
  },
  {
    id: "dashboard/03-muddat",
    path: "/",
    ready: () => window.__shots.row("9") && window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti"),
    frames: () => [
      window.__shots.rect(window.__shots.byText("h3", "Qarzdorlik to'lov muddati bo'yicha")?.closest('[data-slot="card"]')),
    ],
  },
  {
    id: "dashboard/04-diagrammalar",
    path: "/",
    ready: () => window.__shots.row("9") && window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti"),
    frames: () => {
      const S = window.__shots;
      const card = (t) => S.byText("h3", t)?.closest('[data-slot="card"]');
      return [S.union(card("Umumiy batalon va birgadalar kesimida"), card("Kirim bo'lgan pulning taqsimoti"))];
    },
  },
  {
    id: "dashboard/05-qarzdorlar",
    path: "/",
    ready: () => window.__shots.row("9") && window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti"),
    async act(ui) {
      await ui.scrollTo(() => window.__shots.row("8"), "end");
      await ui.rest();
    },
    frames: () => {
      const card = window.__shots.byText("h3", "Qarzdor tashkilotlar")?.closest('[data-slot="card"]');
      return [
        window.__shots.rect(card?.querySelector('input[placeholder="Tashkilot, INN yoki manzil"]')?.parentElement),
        window.__shots.rect(card?.querySelector('button[aria-label="Yuklab olish"]')),
      ];
    },
  },
  {
    id: "dashboard/06-ommaviy-hisobot",
    path: "/",
    ready: () => window.__shots.row("9") && window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti"),
    frames: () => [window.__shots.rect(document.querySelector('[title="Ommaviy tadbirlar hisoboti"]'))],
  },
  {
    id: "rasxod/03-royxat",
    path: "/rasxod",
    ready: () => window.__shots.row("13"),
    async act(ui) {
      // To'lanmagan hujjat — menyuda «To'landi deb belgilash» (qo'llanma matnidagi kabi)
      await ui.click(() => window.__shots.row("16")?.querySelector('button[aria-label="Amallar"]'));
      await ui.waitFor(() => document.querySelector('[role="menu"]'));
      await ui.rest();
    },
    frames: () => [window.__shots.rect(window.__shots.row("16")?.querySelector('button[aria-label="Amallar"]'))],
  },
  {
    id: "rasxod/05-solishtirish",
    path: "/rasxod",
    ready: () => window.__shots.row("13") && window.__shots.byText("p", "«Ommaviy tadbirlar hisoboti»da"),
    frames: () => [window.__shots.rect(window.__shots.byText("p", "«Ommaviy tadbirlar hisoboti»da")?.parentElement)],
  },
  {
    id: "workers/02-royxat",
    path: "/workers",
    ready: () => window.__shots.byText("td", "Namunaev Jasur Akmalovich"),
    frames: () => {
      const S = window.__shots;
      const search = document.querySelector('input[placeholder^="F.I.Sh., PINFL"]');
      return [S.union(search, S.byText("button", "Hammasi")), S.union(S.byText("button", "Import", { exact: true }), S.byText("button", "Qo'shish"))];
    },
  },
  {
    id: "workers/04-yuklab-olish",
    path: "/workers",
    ready: () => window.__shots.byText("td", "Namunaev Jasur Akmalovich"),
    async act(ui) {
      await ui.click(() => document.querySelector('button[aria-label="Yuklab olish"]'));
      await ui.waitFor(() => document.querySelector('[role="menu"]'));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [S.rect(document.querySelector('button[aria-label="Yuklab olish"]')), S.rect(document.querySelector('[role="menu"]'))];
    },
  },
  {
    id: "workers/05-import",
    path: "/workers",
    ready: () => window.__shots.byText("td", "Namunaev Jasur Akmalovich"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Import", { exact: true }));
      await ui.waitFor(() => window.__shots.dialog()?.querySelector('input[type="file"]'));
      await ui.upload(() => window.__shots.dialog().querySelector('input[type="file"]'), await sampleWorkersFile());
      await ui.waitFor(() => window.__shots.dialog() && window.__shots.byText("p", "Import qilinadi", { root: window.__shots.dialog() }));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [
        S.union(S.ptile("Xodimlar", d), S.ptile("Ogohlantirishlar", d)),
        S.rect(d?.querySelector("table")),
        S.union(d && S.byText("button", "Shablonni yuklab olish", { root: d }), d && S.byText("button", "Import qilish", { root: d })),
      ];
    },
  },
  {
    id: "rasxod-workers/03-royxat",
    path: "/rasxod-workers",
    ready: () => window.__shots.row("17"),
    async act(ui) {
      await ui.click(() => window.__shots.row("26")?.querySelector('button[aria-label="Amallar"]'));
      await ui.waitFor(() => document.querySelector('[role="menu"]'));
      await ui.rest();
    },
    frames: () => [window.__shots.rect(window.__shots.row("26")?.querySelector('button[aria-label="Amallar"]'))],
  },
  {
    id: "rasxod-workers/05-hisobot-izohi",
    path: "/rasxod-workers",
    ready: () => window.__shots.row("17") && window.__shots.byText("p", "«Ommaviy tadbirlar hisoboti»da"),
    async act(ui) {
      await ui.scrollTo(() => window.__shots.byText("p", "«Ommaviy tadbirlar hisoboti»da"), "end");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [S.rect(S.tile("I va II guruh xarajatlari (25%)")), S.rect(S.byText("p", "«Ommaviy tadbirlar hisoboti»da"))];
    },
  },
];

/* ── Ishga tushirish ──────────────────────────────────────────────── */

// Har qo'llanma — o'z foydalanuvchisi: viloyat admini va super-admin (dev bazada)
const USERS = {
  region: Number(process.env.USER_ID || 1),
  admin: Number(process.env.ADMIN_USER_ID || 8),
};

/** Bitta ssenariy: sahifani ochish, amallar, ramkalar va rasm */
async function shootScene(chrome, ui, scene) {
  // Sahifalar eslab qoladigan holatlar (ochiq filtr paneli kabi) oldingi
  // ssenariydan o'tib qolmasin
  await chrome.evaluate(`${UI_STATE_KEYS}.forEach((k) => localStorage.removeItem(k)); true`);
  await chrome.navigate(`${APP_URL}${scene.path}`);
  await chrome.evaluate(`(${pageHelpers})()`);
  await ui.waitFor(scene.ready, 20000);
  // Inter (Google Fonts, display=swap) birinchi ochilishda kech keladi:
  // u yuklanmasdan olingan rasmda matn boshqa shriftda, joylashuv siljigan bo'ladi
  const fontOk = await chrome.evaluate(`(async () => {
    const loaded = () => [...document.fonts].some((f) => /Inter/.test(f.family) && f.status === "loaded");
    for (let i = 0; i < 100 && !loaded(); i++) {
      try { await document.fonts.load('16px "Inter"'); } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    await document.fonts.ready;
    return loaded();
  })()`);
  if (!fontOk) console.warn(`${scene.id}: Inter shrifti yuklanmadi (internet?) — rasm boshqa shriftda`);
  // Animatsiyalarsiz: captureScreenshot ochilish animatsiyasini qayta boshlab
  // yuborardi (popover yarim shaffof tushardi). Matn kursori ham ko'rinmasin
  await chrome.evaluate(`(() => {
    const s = document.createElement("style");
    s.textContent = "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; caret-color: transparent !important; }";
    document.head.appendChild(s);
    return true;
  })()`);
  await sleep(900); // ma'lumot yuklanishi va joylashuv tinchisin
  if (scene.act) await scene.act(ui);
  else await ui.rest();

  const rects = await chrome.evaluate(`(${scene.frames})()`);
  const missing = rects.findIndex((r) => !r);
  if (missing >= 0) throw new Error(`${scene.id}: ${missing + 1}-ramka joyi topilmadi`);

  await chrome.evaluate(`window.__shots.frame(${JSON.stringify(rects)}); true`);
  await sleep(120);
  const shot = await chrome.send("Page.captureScreenshot", {
    format: "webp",
    quality: 90,
    captureBeyondViewport: false,
  });
  await chrome.evaluate("window.__shots.clear(); true");

  const out = path.join(OUT_DIR, `${scene.id}.webp`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log(`saqlandi: ${path.relative(CLIENT, out)} (${rects.length} ta ramka)`);
}

const main = async () => {
  const all = [...SCENES, ...ADMIN_SCENES];
  const scenes = all.filter((s) => !ONLY.length || ONLY.some((o) => s.id.startsWith(o)));
  if (!scenes.length) throw new Error(`ONLY=${ONLY.join(",")} — mos ssenariy yo'q`);

  const chrome = await launchChrome();
  const net = interceptApi(chrome, [...MOCKS, ...ADMIN_MOCKS]);
  const ui = makeUi(chrome);
  try {
    await chrome.send("Page.addScriptToEvaluateOnNewDocument", { source: fakeToday(TODAY) });
    await net.enable();

    // Avval viloyat, keyin super-admin ssenariylari — har biri o'z sessiyasi bilan
    for (const [audience, userId] of Object.entries(USERS)) {
      const group = scenes.filter((s) => (s.audience ?? "region") === audience);
      if (!group.length) continue;
      await openApp(chrome, await mintSession(userId), { period: PERIOD });
      for (const scene of group) await shootScene(chrome, ui, scene);
    }
  } finally {
    await chrome.close();
  }

  net.report();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
