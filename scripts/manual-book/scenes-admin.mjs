/**
 * Super-admin qo'llanmasi skrinshotlari (public/manual/admin/*): mock API
 * yo'llari va ssenariylar. shots.mjs ularni super-admin sessiyasi bilan
 * ishga tushiradi (ADMIN_USER_ID, odatda 8). Ma'lumot — fixtures-admin.mjs.
 *
 * Ssenariy tuzilishi shots.mjs dagi SCENES bilan bir xil; ready/frames va
 * ui.* ga berilgan funksiyalar sahifada bajariladi (window.__shots).
 */
import { copyFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ADMIN_USERS,
  BAZA_BALANCE,
  BAZA_MONITORING,
  BAZA_RASXOD,
  BAZA_RASXOD_META,
  BXM_ROWS,
  IMPORT_CHECK,
  IMPORT_OPTIONS,
  IMPORT_OPTIONS_NO_REKVIZIT,
  LOG_USERS,
  REGIONS,
  VIDEO_LESSONS,
  dashByRegion,
  dashContracts,
  dashCount,
  dashDistribution,
  dashDistributionByRegion,
  dashRedBorder,
  debtOrganizations,
  debtOverview,
  logDetails,
  logsList,
  logsSummary,
  monitoringRows,
} from "./fixtures-admin.mjs";
import { ok } from "./mock-api.mjs";
import { CLIENT } from "./session.mjs";

const region = (q) => q.get("region_id") || null;
const paged = ({ data, meta }) => ok(data, meta);

/** [usul, yo'l, javob] — shots.mjs dagi MOCKS bilan birlashtiriladi */
export const ADMIN_MOCKS = [
  ["GET", /^\/admin\/regions\/?$/, () => ok(REGIONS)],
  ["GET", /^\/admin\/dashboard\/count$/, (q) => ok(dashCount(region(q)))],
  ["GET", /^\/admin\/dashboard\/by-region$/, () => ok(dashByRegion())],
  ["GET", /^\/admin\/dashboard\/distribution\/by-region$/, () => ok(dashDistributionByRegion())],
  ["GET", /^\/admin\/dashboard\/distribution$/, (q) => ok(dashDistribution(region(q)))],
  ["GET", /^\/admin\/dashboard\/red-border$/, (q) => ok(dashRedBorder(region(q)))],
  ["GET", /^\/admin\/dashboard\/contracts$/, (q) => paged(dashContracts(q))],
  ["GET", /^\/admin\/dashboard\/overview\/organizations$/, (q) => paged(debtOrganizations(q))],
  ["GET", /^\/admin\/dashboard\/overview$/, (q) => ok(debtOverview(region(q)))],
  ["GET", /^\/admin\/monitoring\/data$/, (q) => ok(monitoringRows(), { month: q.get("month") })],
  ["GET", /^\/admin\/markaziy-baza\/monitoring\/balance$/, () => ok(BAZA_BALANCE)],
  ["GET", /^\/admin\/markaziy-baza\/monitoring$/, () => ok(BAZA_MONITORING)],
  ["GET", /^\/admin\/markaziy-baza\/rasxod$/, () => ok(BAZA_RASXOD, BAZA_RASXOD_META)],
  // Namangan (8) — rekvizitlari chala viloyat: import to'xtatiladi
  ["GET", /^\/admin\/contract-import\/options$/, (q) => ok(region(q) === "8" ? IMPORT_OPTIONS_NO_REKVIZIT : IMPORT_OPTIONS)],
  // Yozuvchi so'rovlar backendga umuman bormaydi (mock-api.mjs) — tekshiruv ham joyida javob oladi.
  // "Import qilish" (POST /admin/contract-import) hech qachon bosilmaydi!
  ["POST", /^\/admin\/contract-import\/check$/, () => ok(IMPORT_CHECK.data, IMPORT_CHECK.meta)],
  ["GET", /^\/admin\/user\/?$/, () => ok(ADMIN_USERS)],
  ["GET", /^\/logs\/users$/, () => ok(LOG_USERS)],
  ["GET", /^\/logs\/summary$/, () => ok(logsSummary())],
  ["GET", /^\/logs\/\d+$/, () => ok(logDetails())],
  ["GET", /^\/logs\/?$/, (q) => paged(logsList(q))],
  ["GET", /^\/video-lessons\/?$/, () => ok(VIDEO_LESSONS)],
  ["GET", /^\/bxm\/?$/, () => ok(BXM_ROWS)],
];

/** Import sahifasiga yuklanadigan fayl — shablonning nusxasi, namuna nomi bilan */
function sampleImportFile() {
  const dir = mkdtempSync(path.join(tmpdir(), "manual-import-"));
  const file = path.join(dir, "Andijon_shartnomalar_oktabr.xlsx");
  copyFileSync(path.join(CLIENT, "../backend/src/template/contracts.template.xlsx"), file);
  return file;
}

/** Import: viloyat tanlanadi va fayl yuklanadi — tekshiruv natijasi chiqadi */
async function importPreview(ui) {
  await ui.choose(() => window.__shots.byText("button", "Viloyatni tanlang"), "Andijon viloyati");
  await ui.upload(() => document.querySelector('input[type="file"]'), sampleImportFile());
  await ui.waitFor(() => window.__shots.byText("p", "Yangi batalonlar"));
}

export const ADMIN_SCENES = [
  /* ── Dashboard ─────────────────────────────────────────────────── */
  {
    id: "admin/dashboard/01-korsatkichlar",
    path: "/",
    ready: () => window.__shots.byText("p", "378", { exact: true }) && document.querySelectorAll("path.uz-region").length > 10,
    frames: () => {
      const S = window.__shots;
      const card = (t) => S.byText("p", t)?.closest(".dash-glass");
      const inputs = [...document.querySelectorAll("header input")];
      const report = [...document.querySelectorAll("header button")].filter((b) =>
        (b.getAttribute("aria-label") || "").startsWith("Ommaviy tadbirlar hisoboti")
      );
      return [
        inputs.length === 2 && S.union(inputs[0].parentElement, inputs[1].parentElement),
        S.union(card("Jami shartnomalar"), card("Qarzdorligi bor shartnomalar")),
        S.union(S.ptile("Muddati kelmagan"), S.ptile("Muddati o'tgan")),
        report.length === 2 && S.union(...report),
      ];
    },
  },
  {
    id: "admin/dashboard/02-royxat",
    path: "/",
    ready: () => window.__shots.byText("p", "378", { exact: true }),
    async act(ui) {
      await ui.click(() => window.__shots.byText("p", "Qarzdorligi bor shartnomalar")?.closest(".dash-glass")?.querySelector("button"));
      await ui.waitFor(() => window.__shots.byText("th", "To'lov muddati") && document.querySelectorAll("tbody tr").length > 10);
      // Jadval keng — oxirgi ustun to'liq ko'rinsin (gorizontal aylantirish)
      await ui.scrollTo(() => window.__shots.byText("th", "To'lov muddati"), "nearest");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const th = S.byText("th", "To'lov muddati");
      const panel = th?.closest(".shadow-2xl");
      return [
        S.rect(panel && [...panel.querySelectorAll("button")].find((b) => b.getAttribute("title") === "Yuklab olish")),
        S.columns(th),
        S.union(S.byText("button", "Oldingi", { root: panel }), S.byText("button", "Keyingi", { root: panel })),
      ];
    },
  },
  {
    id: "admin/dashboard/03-xarita",
    path: "/",
    ready: () => window.__shots.byText("p", "378", { exact: true }) && document.querySelectorAll("path.uz-region").length > 10,
    async act(ui) {
      // Samarqand viloyati — xarita ro'yxatida (types.ts, mapRegions) 5-o'rinda
      await ui.jsClick(() => document.querySelectorAll("path.uz-region")[4]);
      await ui.waitFor(() => window.__shots.byText("button", "Samarqand viloyati"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [
        S.rect(S.byText("button", "Samarqand viloyati")),
        S.rect(document.querySelectorAll("path.uz-region")[4]),
        S.union(
          S.byText("p", "Jami shartnomalar")?.closest(".dash-glass"),
          S.byText("p", "Qarzdorligi bor shartnomalar")?.closest(".dash-glass")
        ),
      ];
    },
  },
  {
    id: "admin/dashboard/04-taqsimot",
    path: "/",
    ready: () => window.__shots.byText("p", "378", { exact: true }),
    async act(ui) {
      await ui.click(() => window.__shots.byText("h2", "Kirim bo'lgan pulning taqsimoti")?.closest(".dash-glass")?.querySelector("button"));
      await ui.waitFor(() => window.__shots.byText("h3", "Kirim bo'lgan pulning taqsimoti — viloyatlar") && document.querySelectorAll("tbody tr").length > 10);
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const panel = S.byText("h3", "Kirim bo'lgan pulning taqsimoti — viloyatlar")?.closest(".rounded-2xl");
      return [S.rect(panel?.querySelector(".grid")), S.columns(S.byText("th", "Jami kirim", { root: panel }), S.byText("th", "Qolgan", { root: panel }))];
    },
  },
  {
    id: "admin/dashboard/05-qizil",
    path: "/",
    ready: () => window.__shots.byText("p", "378", { exact: true }),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Ro'yxatni ko'rsatish"));
      await ui.waitFor(() => window.__shots.byText("td", "Namunaev Jasur"));
      await ui.scrollTo(() => window.__shots.byText("th", "Necha marta"), "nearest");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [S.columns(S.byText("th", "Xodimning olgan summasi"), S.byText("th", "Necha marta"))];
    },
  },

  /* ── Qarzdorlik ────────────────────────────────────────────────── */
  {
    id: "admin/debt/01-kartochkalar",
    path: "/debt",
    ready: () => window.__shots.byText("button", "Jami qarz") && window.__shots.byText("h3, h2", "Muddati o'tgan qarz yoshi"),
    frames: () => {
      const S = window.__shots;
      return [
        S.union(S.byText("button", "Jami qarz"), S.byText("button", "Muddati o'tgan")),
        S.rect(S.byText("div", "To'lov muddati — tadbirdan 3 kun oldin")),
      ];
    },
  },
  {
    id: "admin/debt/02-viloyatlar",
    path: "/debt",
    ready: () => window.__shots.byText("td", "Toshkent shahar"),
    async act(ui) {
      await ui.scrollTo(() => window.__shots.byText("h3", "Viloyatlar kesimida")?.parentElement, "start", 96);
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const head = S.byText("h3", "Viloyatlar kesimida");
      return [S.rect(head?.parentElement), S.columns(S.byText("th", "Qarz", { exact: true }))];
    },
  },
  {
    id: "admin/debt/03-tashkilotlar",
    path: "/debt",
    ready: () => window.__shots.byText("button", "Yana 20 ta"),
    async act(ui) {
      await ui.scrollTo(() => window.__shots.byText("h3", "Qarzdor tashkilotlar")?.parentElement, "start", 96);
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [
        S.rect(document.querySelector('input[placeholder="Nomi yoki STIR (INN)"]')),
        S.columns(S.byText("th", "Kechikish")),
      ];
    },
  },

  /* ── Monitoring ────────────────────────────────────────────────── */
  {
    id: "admin/monitoring/01-jadval",
    path: "/monitoring-data",
    ready: () => window.__shots.byText("td", "Andijon viloyati"),
    frames: () => {
      const S = window.__shots;
      const prev = document.querySelector('button[aria-label="Oldingi oy"]');
      const next = document.querySelector('button[aria-label="Keyingi oy"]');
      // Katakcha yorlig'i — <p> (jadvaldagi «Kiritgan» belgisi — <span>)
      const tile = (t) => S.byText("p", t)?.closest(".rounded-md.border");
      return [S.union(prev, next), S.columns(S.byText("th", "Holat")), S.union(tile("Kiritgan"), tile("To'langan summa"))];
    },
  },

  /* ── Markaziy baza ─────────────────────────────────────────────── */
  {
    id: "admin/markaziy-baza/01-monitoring",
    path: "/markaziy-baza",
    ready: () => window.__shots.byText("p", "Davrdagi to'lanmagan"),
    frames: () => {
      const S = window.__shots;
      return [S.union(S.ptile("Boshlang'ich qoldiq"), S.ptile("Yakuniy qoldiq")), S.columns(S.byText("th", "Viloyat"))];
    },
  },
  {
    id: "admin/markaziy-baza/02-chiqim",
    path: "/markaziy-baza/rasxod",
    ready: () => window.__shots.row("3"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Qo'shish"));
      await ui.waitFor(() => window.__shots.dialog()?.querySelector("textarea"));
      await ui.type(() => window.__shots.dialog().querySelector("input"), "4");
      await ui.type(() => window.__shots.dialog().querySelector('input[placeholder="0.00"]'), "450000");
      await ui.type(() => window.__shots.dialog().querySelector("textarea"), "Ofis jihozlari: kreslo — 2 dona");
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
        S.union(d?.querySelector('input[placeholder="0.00"]'), d && S.byText("span", "Bu chiqimdan keyin qoldiq", { root: d })),
        S.rect(d && S.byText("button", "Saqlash", { root: d })),
      ];
    },
  },

  /* ── Shartnoma importi ─────────────────────────────────────────── */
  {
    id: "admin/import/03-rekvizitlar",
    path: "/contract-import",
    ready: () => window.__shots.byText("button", "Viloyatni tanlang"),
    async act(ui) {
      await ui.choose(() => window.__shots.byText("button", "Viloyatni tanlang"), "Namangan viloyati");
      await ui.waitFor(() => window.__shots.byText("span", "— Avval viloyat rekvizitlarini to'ldiring"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const banner = S.byText("span", "— Avval viloyat rekvizitlarini to'ldiring")?.closest("div");
      return [S.rect(banner), S.rect(S.byText("button", "Import qilish"))];
    },
  },
  {
    id: "admin/import/01-tekshirish",
    path: "/contract-import",
    ready: () => window.__shots.byText("button", "Viloyatni tanlang"),
    async act(ui) {
      await importPreview(ui);
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const tables = document.querySelectorAll("table");
      return [
        S.union(S.ptile("Shartnomalar"), S.ptile("Yangi batalonlar"), S.ptile("Ogohlantirishlar")),
        S.rect(tables[0]),
        S.columns(S.byText("th", "Batalon × xodim × soat")),
      ];
    },
  },
  {
    id: "admin/import/02-tasdiqlash",
    path: "/contract-import",
    ready: () => window.__shots.byText("button", "Viloyatni tanlang"),
    async act(ui) {
      await importPreview(ui);
      await ui.click(() => window.__shots.byText("button", "Import qilish"));
      await ui.waitFor(() => window.__shots.dialog() && window.__shots.byText("div", "Avtomatik yaratiladi:", { root: window.__shots.dialog() }));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      const box = d && S.byText("div", "Avtomatik yaratiladi:", { root: d })?.parentElement;
      return [S.rect(box), S.rect(d && S.byText("button", "Import qilish", { root: d }))];
    },
  },

  /* ── Foydalanuvchilar ──────────────────────────────────────────── */
  {
    id: "admin/users/01-royxat",
    path: "/users",
    ready: () => window.__shots.byText("td", "Namunaev Jasur"),
    frames: () => {
      const S = window.__shots;
      return [
        S.rect(document.querySelector('input[placeholder^="F.I.Sh., login"]')),
        S.columns(S.byText("th", "Turi")),
        S.rect(S.byText("button", "Qo'shish")),
      ];
    },
  },
  {
    id: "admin/users/02-qoshish",
    path: "/users",
    ready: () => window.__shots.byText("td", "Namunaev Jasur"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Qo'shish"));
      await ui.waitFor(() => window.__shots.dialog()?.querySelector("input"));
      await ui.choose(() => window.__shots.byText("button", "Turni tanlang", { root: window.__shots.dialog() }), "Viloyat admin");
      await ui.choose(() => window.__shots.byText("button", "Hudud tanlang", { root: window.__shots.dialog() }), "Jizzax viloyati");
      const field = (i) => `() => [...window.__shots.dialog().querySelectorAll("input:not([type=file])")][${i}]`;
      await ui.type(field(0), "Andozaev Bobur");
      await ui.type(field(1), "jizzax_admin");
      await ui.type(field(2), "Jizzax#2026x");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      // Parol talablari — ikki ustunli ro'yxat (birinchi bandning ota-elementi)
      const first = d && S.byText("li, div, span", "Kamida 8 ta belgi", { root: d });
      return [S.rect(first?.parentElement), S.rect(d && S.byText("button", "Saqlash", { root: d }))];
    },
  },

  /* ── Qaydlar ───────────────────────────────────────────────────── */
  {
    id: "admin/logs/01-qaydlar",
    path: "/logs",
    ready: () => window.__shots.byText("td", "Namuna Administrator") || window.__shots.byText("span", "Namuna Administrator"),
    frames: () => {
      const S = window.__shots;
      // Filtrlar — tanlangan matni bo'yicha (aria-label "Foydalanuvchi" yuqori
      // paneldagi foydalanuvchi menyusida ham bor)
      return [
        S.rect(S.byText("button", "Barcha viloyatlar")),
        S.union(S.byText("button", "Barcha foydalanuvchilar"), document.querySelector('input[placeholder^="Login, F.I.Sh."]')),
        S.columns(S.byText("th", "Natija")),
      ];
    },
  },
  {
    id: "admin/logs/02-tafsilot",
    path: "/logs",
    ready: () => document.querySelectorAll("tbody tr").length > 5,
    async act(ui) {
      await ui.click(() => document.querySelectorAll("tbody tr")[2]);
      await ui.waitFor(() => window.__shots.byText("div, p, h3, h4, span", "O'zgarishlar: oldin → keyin"));
      await ui.scrollTo(() => window.__shots.byText("div, p, h3, h4, span", "O'zgarishlar: oldin → keyin"), "center");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const head = S.byText("div, p, h3, h4, span", "O'zgarishlar: oldin → keyin");
      const table = head?.parentElement?.querySelector("table") ?? head?.closest("section, div")?.querySelector("table");
      return [S.union(head, table)];
    },
  },
  {
    id: "admin/logs/03-kesim",
    path: "/logs",
    ready: () => document.querySelectorAll("tbody tr").length > 5,
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Foydalanuvchilar kesimida"));
      await ui.waitFor(() => window.__shots.byText("th", "Oxirgi faollik"));
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      return [
        S.rect(S.byText("button", "Foydalanuvchilar kesimida")),
        S.columns(S.byText("th", "Jami"), S.byText("th", "Xatolar")),
        S.union(S.ptile("Foydalanuvchilar"), S.ptile("Xatolar")),
      ];
    },
  },

  /* ── Video darslar ─────────────────────────────────────────────── */
  {
    id: "admin/videos/01-royxat",
    path: "/video-lessons",
    ready: () => window.__shots.byText("td", "Shartnoma yaratish") || window.__shots.byText("span", "Shartnoma yaratish"),
    frames: () => {
      const S = window.__shots;
      const row = document.querySelectorAll("tbody tr")[0];
      return [
        S.union(S.byText("header button", "Qo'llanma"), S.byText("header a", "PDF kitob")),
        S.rect(S.byText("button", "Qo'shish")),
        S.rect(row?.cells[row.cells.length - 1]),
      ];
    },
  },
  {
    id: "admin/videos/02-qoshish",
    path: "/video-lessons",
    ready: () => window.__shots.byText("td", "Shartnoma yaratish") || window.__shots.byText("span", "Shartnoma yaratish"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Qo'shish"));
      await ui.waitFor(() => window.__shots.dialog()?.querySelector("textarea"));
      await ui.type(() => window.__shots.dialog().querySelector("input"), "Markaziy baza");
      await ui.type(() => window.__shots.dialog().querySelector("textarea"), "Monitoring va chiqimlar: 10% ulush, qoldiq");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [S.rect(d && [...d.querySelectorAll("input")].find((i) => i.type === "file")?.closest("div")), S.rect(d && S.byText("button", "Saqlash", { root: d }))];
    },
  },

  /* ── Ma'lumotnoma: BXM ─────────────────────────────────────────── */
  {
    id: "admin/bxm/01-royxat",
    path: "/spravichnik",
    ready: () => window.__shots.byText("td", "412000"),
    async act(ui) {
      await ui.click(() => window.__shots.byText("button", "Qo'shish"));
      await ui.waitFor(() => window.__shots.dialog()?.querySelector("input"));
      await ui.type(() => window.__shots.dialog().querySelector("input"), "450000");
      await ui.rest();
    },
    frames: () => {
      const S = window.__shots;
      const d = S.dialog();
      return [S.rect(d?.querySelector("input")), S.rect(d && S.byText("button", "Qo'shish", { root: d }))];
    },
  },
].map((s) => ({ ...s, audience: "admin" }));
