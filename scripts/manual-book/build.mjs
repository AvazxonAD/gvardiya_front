/**
 * Qo'llanmaning PDF kitobi — oldindan tayyorlanadi, dastur faqat yuklab
 * beradi ("PDF kitob" tugmasi: public/manual/qollanma-<til>.pdf).
 *
 *   npm run manual:pdf
 *
 * Manba — saytdagi qo'llanmaning o'zi: guides/*.ts matnlari va
 * public/manual/* skrinshotlari (sections.ts). Qo'llanma matni yoki rasmlari
 * o'zgarsa, kitobni qayta yig'ing. Skrinshotlar — `npm run manual:shots`,
 * 1-sahifadagi "qo'llanma qayerda" rasmi — `npm run manual:capture`.
 * Menyuda bor, qo'llanmada yo'q bo'lim bo'lsa — ogohlantiradi (CLAUDE.md).
 *
 * Kitob A4 albom (yotiq) varaqlarda: PDF da rasmni bosib kattalashtirib
 * bo'lmaydi, shuning uchun har bir skrinshot to'liq va katta — iloji boricha
 * butun sahifa kengligida, kesilmasdan. Matni qisqa bosqichda rasm matn
 * bilan bir sahifada (rasm kamida ~70% kenglikda), aks holda alohida varaqda.
 *
 * Tillar: uz (lotin), cyrl (uz matni kirillga o'girilgan), ru.
 */
import { build } from "esbuild";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launchChrome } from "./cdp.mjs";

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = path.join(CLIENT, "public");
const LANGS = (process.env.LANGS || "uz,cyrl,ru").split(",");
// Bosqichlar logi (DEBUG=1) va faqat ba'zi bo'limlar (ONLY=start,contract) — sinash uchun
const t0 = Date.now();
const log = (...a) => process.env.DEBUG && console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

/* ── Qo'llanma ma'lumotlari: TS manbadan (esbuild bilan) ───────────── */

async function loadData() {
  const tmp = mkdtempSync(path.join(tmpdir(), "manual-data-"));
  const out = path.join(tmp, "data.mjs");
  const src = (p) => JSON.stringify(path.join(CLIENT, p).replace(/\\/g, "/"));
  await build({
    stdin: {
      contents: `export { MANUALS } from ${src("src/pages/video-lessons/manual/sections.ts")};
                 export { latinToCyrillic } from ${src("src/utils.ts")};`,
      resolveDir: CLIENT,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: out,
    logLevel: "error",
  });
  const data = await import(pathToFileURL(out).href);
  rmSync(tmp, { recursive: true, force: true });
  return data;
}

/**
 * Ikki kitob — viloyat va super-admin uchun alohida (sections.ts dagi
 * MANUALS): har biri o'z menyusi bo'yicha, o'z 1-sahifa rasmi bilan.
 * `skip` — menyuda bor, lekin bo'limi bo'lmaydigan sahifa (viloyatda qo'llanma
 * "Video darslar" ichida turadi; super-admin uchun esa u darslarni
 * boshqarish sahifasi — bo'limi bor).
 */
const AUDIENCE_BOOK = {
  region: {
    menu: "REGION_MENU",
    skip: ["/video-lessons"],
    where: "manual/book/qayerda.webp",
    title: ["Foydalanuvchi qo'llanmasi", "Руководство пользователя"],
    roleNote: [
      "Ba'zi bo'limlar faqat viloyat adminida bor: yurist va buxgalter faqat o'zlariga ochilgan bo'limlarni ko'radi.",
      "Некоторые разделы есть только у администратора области: юрист и бухгалтер видят только открытые им разделы.",
    ],
  },
  admin: {
    menu: "ADMIN_MENU",
    skip: [],
    where: "manual/book/qayerda-admin.webp",
    title: ["Super-admin qo'llanmasi", "Руководство супер-администратора"],
    roleNote: [
      "Bu kitob super-admin uchun. Viloyat foydalanuvchilarining qo'llanmasi alohida — ular uni o'z «Video darslar» bo'limidan yuklab oladi.",
      "Эта книга — для супер-администратора. Руководство пользователей областей отдельное — они скачивают его в своём разделе «Video darslar».",
    ],
  },
};

const AUDIENCES = (process.env.AUDIENCE || Object.keys(AUDIENCE_BOOK).join(",")).split(",");

/**
 * Qo'llanma menyudan orqada qolmasin (CLAUDE.md qoidasi): menyudagi
 * (menu.tsx) har bir yo'lga sections.ts da bo'lim bo'lishi kerak va
 * aksincha — menyudan olib tashlangan bo'lim qo'llanmada qolmasin.
 */
function checkMenuCoverage(menuName, sectionList, skip) {
  const src = readFileSync(path.join(CLIENT, "src/layout/menu.tsx"), "utf8");
  const block = src.match(new RegExp(`const ${menuName}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`))?.[1];
  if (!block) return { error: `menu.tsx da ${menuName} topilmadi — tekshiruvni yangilang` };
  const menu = [...block.matchAll(/\bpath:\s*"([^"]+)"/g)].map((m) => m[1]);
  const sections = sectionList.map((s) => s.path).filter(Boolean);
  return {
    missing: menu.filter((p) => !sections.includes(p) && !skip.includes(p)),
    stale: sections.filter((p) => !menu.includes(p)),
  };
}

/* ── Kitobning o'z matnlari ────────────────────────────────────────── */

// Kitobning o'z matnlari (ikkala kitob uchun umumiy). Sarlavha, 1-sahifa
// rasmi va mundarija izohi — AUDIENCE_BOOK da
const BOOK = {
  app: ["«Tadbir-Hisob» axborot tizimi", "Информационная система «Tadbir-Hisob»"],
  org: [
    "Milliy gvardiya moliya iqtisod boshqarmasi",
    "Управление финансов и экономики Национальной гвардии",
  ],
  whereTitle: ["Qo'llanma dasturda qayerda?", "Где руководство в программе?"],
  whereLead: [
    "Shu kitobdagi barcha ko'rsatmalar dasturning o'zida ham bor — ekranda, rasmlarni kattalashtirib ko'rish mumkin. Uni quyidagicha oching:",
    "Все инструкции этой книги есть и в самой программе — на экране, с возможностью увеличить рисунки. Откройте их так:",
  ],
  where: [
    [
      "Chap menyudan «Video darslar» bo'limini oching.",
      "В левом меню откройте раздел «Video darslar» (Видеоуроки).",
    ],
    [
      "Yuqori paneldagi «Qo'llanma» tugmasini bosing — qo'llanma ochiladi: chapda bo'limlar ro'yxati, o'ngda bosqichma-bosqich ko'rsatmalar.",
      "Нажмите кнопку «Qo'llanma» (Руководство) на верхней панели — откроется руководство: слева список разделов, справа пошаговые инструкции.",
    ],
    [
      "«PDF kitob» tugmasi — shu kitobni yuklab olish (qo'llanma sahifasida ham bor).",
      "Кнопка «PDF kitob» — скачать эту книгу (есть и на странице руководства).",
    ],
  ],
  whereNote: [
    "Kitobni boshidan oxirigacha o'qish shart emas: kerakli bo'limni keyingi sahifadagi mundarijadan toping. Rasmlardagi qizil ramka — bosiladigan yoki to'ldiriladigan joy.",
    "Читать книгу целиком не обязательно: найдите нужный раздел в содержании на следующей странице. Красная рамка на рисунках — место, куда нажимать или что заполнять.",
  ],
  toc: ["Mundarija", "Содержание"],
  section: ["bo'lim", "раздел"],
  step: ["bosqich", "шаг"],
  need: ["Tayyorlab qo'ying", "Подготовьте"],
  steps: ["Bosqichlar", "Шаги"],
  tip: ["Maslahat", "Совет"],
  warn: ["E'tibor bering", "Обратите внимание"],
  done: ["Natija", "Результат"],
  picture: ["Rasm", "Рисунок"],
  page: ["bet", "стр."],
};

/**
 * Kirill varianti: dastur nomlari va qisqartmalar o'girilmaydi
 * ("USB Manager" -> "УСБ Манагер" bo'lib qolmasin).
 */
const KEEP_LATIN = ["USB Manager", "E-IMZO", "Didox", "PDF", "Excel", "Word", "IMZO"];
function toCyrillic(text, latinToCyrillic) {
  // Nomlar vaqtincha "\u0001<n>\u0001" belgisiga almashtiriladi — o'giruvchi unga tegmaydi
  const kept = [];
  const masked = KEEP_LATIN.reduce((s, word) => {
    if (!s.includes(word)) return s;
    kept.push(word);
    return s.split(word).join(`\u0001${kept.length - 1}\u0001`);
  }, String(text));
  return latinToCyrillic(masked).replace(/\u0001(\d+)\u0001/g, (_, i) => kept[Number(i)]);
}

/* ── Joylashuv (mm): A4 albom, maydonlar ────────────────────────────── */

const PAGE = { w: 297, h: 210, padX: 12, padY: 9 };
const CONTENT_W = PAGE.w - PAGE.padX * 2; // 273
// Sahifa ichidagi asosiy qism: sarlavha qatori (9) va pastki qator (8) dan tashqari
const BODY_H = PAGE.h - PAGE.padY * 2 - 9 - 8; // 175
// Rasm 16:10 — to'liq kenglikda balandligi 170mm. Matn bilan bir sahifada
// rasm uchun kamida shuncha joy qolishi kerak (≈ 70% kenglik, ekrandagi
// yozuvlar ~7pt — o'qiladi); qolmasa rasm keyingi varaqqa to'liq o'lchamda
const MIN_FILL_IMG_H = 118;
const CAPTION_H = 7;

// Bosqich matni balandligi taxmin qilinmaydi — brauzerda o'lchanadi
// (measureHtml): har bosqich bir va ikki ustunda sahifa kengligida chiziladi.

/* ── HTML ──────────────────────────────────────────────────────────── */

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fileUrl = (src) => pathToFileURL(path.join(PUBLIC, src)).href;

const CSS = `
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; font-size: 10.5pt; line-height: 1.45;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.page {
  width: ${PAGE.w}mm; height: ${PAGE.h}mm; padding: ${PAGE.padY}mm ${PAGE.padX}mm;
  display: flex; flex-direction: column; overflow: hidden; page-break-after: always; position: relative;
}
.ph { height: 9mm; display: flex; align-items: flex-start; justify-content: space-between; gap: 6mm;
  font-size: 8.5pt; color: #64748b; border-bottom: 0.3mm solid #e2e8f0; }
.ph b { color: #2563eb; font-weight: 600; }
.pb { flex: 1; min-height: 0; display: flex; flex-direction: column; padding-top: 4mm; }
.pf { height: 8mm; display: flex; align-items: flex-end; justify-content: space-between;
  font-size: 8pt; color: #94a3b8; }
.pf .n { color: #475569; font-weight: 600; }

h1 { font-size: 21pt; line-height: 1.2; margin: 0 0 2mm; color: #0f172a; }
h2 { font-size: 15pt; line-height: 1.25; margin: 0; color: #0f172a; }
p { margin: 0 0 2mm; }

/* 1-sahifa */
.brand { display: flex; align-items: center; gap: 4mm; margin-bottom: 4mm; }
.brand img { width: 13mm; height: 13mm; }
.brand .t1 { font-size: 9pt; color: #64748b; }
.brand .t2 { font-size: 13pt; font-weight: 700; color: #0f172a; }
.where { display: grid; grid-template-columns: 82mm minmax(0, 1fr); gap: 6mm; flex: 1; min-height: 0; }
.where ol { list-style: none; margin: 3mm 0; padding: 0; display: flex; flex-direction: column; gap: 3mm; }
.where li { display: flex; gap: 3mm; }
.badge { flex: none; width: 7mm; height: 7mm; border-radius: 50%; background: #e11d48; color: #fff;
  font-weight: 700; font-size: 10pt; display: flex; align-items: center; justify-content: center; }
.note { font-size: 9.5pt; color: #475569; border-left: 0.8mm solid #2563eb; padding: 1mm 0 1mm 3mm; margin-top: 2mm; }

/* Mundarija */
.toc { columns: 2; column-gap: 12mm; font-size: 9.6pt; }
.toc .sec { break-inside: avoid; margin-bottom: 2.2mm; }
.toc .row { display: flex; align-items: baseline; gap: 2mm; }
.toc .row .dots { flex: 1; border-bottom: 0.25mm dotted #cbd5e1; transform: translateY(-1mm); }
.toc .row.s { font-weight: 700; color: #0f172a; font-size: 10.5pt; }
.toc .row.st { padding-left: 7mm; color: #334155; line-height: 1.35; }
.toc .num { color: #2563eb; font-weight: 700; min-width: 6mm; }

/* Bo'lim boshi */
.opener { display: grid; grid-template-columns: 60mm 1fr; gap: 10mm; flex: 1; }
.opener .big { font-size: 64pt; font-weight: 800; color: #dbeafe; line-height: 1; }
.opener .kicker { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; color: #2563eb; font-weight: 700; }
.box { border: 0.3mm solid #e2e8f0; background: #f8fafc; border-radius: 2mm; padding: 3mm 4mm; margin-top: 4mm; }
.box .cap { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700; margin-bottom: 1.5mm; }
.box ul, .box ol { margin: 0; padding-left: 5mm; }
.box li { margin: 0.8mm 0; }

/* Bosqich */
.st-head { display: flex; align-items: center; gap: 3mm; margin-bottom: 2.5mm; }
.st-num { flex: none; width: 8.5mm; height: 8.5mm; border-radius: 50%; background: #2563eb; color: #fff;
  font-weight: 700; font-size: 11pt; display: flex; align-items: center; justify-content: center; }
.items { margin: 0 0 2mm; padding: 0; list-style: none; }
.items li { display: flex; gap: 2mm; margin: 0.6mm 0; }
.items .mk { flex: none; color: #2563eb; font-weight: 700; min-width: 4.5mm; text-align: right; }
.call { display: flex; gap: 2.5mm; border-radius: 1.5mm; padding: 2mm 3mm; margin: 1.5mm 0; border: 0.3mm solid; font-size: 10pt; }
.call b { flex: none; }
.call.tip { background: #eff6ff; border-color: #bfdbfe; }
.call.tip b { color: #1d4ed8; }
.call.warn { background: #fffbeb; border-color: #fde68a; }
.call.warn b { color: #b45309; }
.call.ok { background: #f0fdf4; border-color: #bbf7d0; }
.call.ok b { color: #15803d; }

.cols2 { column-count: 2; column-gap: 8mm; }
.cols2 p, .cols2 li, .cols2 .call { break-inside: avoid; }
.cols2 .call { display: block; }
.cols2 .call b { margin-right: 1.5mm; }

/* Rasm */
figure { margin: 0; display: flex; flex-direction: column; align-items: center; }
figure.fill { flex: 1; min-height: 0; margin-top: 2mm; }
.imgbox { flex: 1; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; }
.imgbox img { display: block; max-width: 100%; max-height: 100%; border: 0.3mm solid #cbd5e1; border-radius: 1mm; box-shadow: 0 0.6mm 2mm rgba(15,23,42,0.12); }
figcaption { height: ${CAPTION_H}mm; padding-top: 1.8mm; font-size: 9pt; color: #475569; text-align: center; }
figcaption b { color: #0f172a; }
`;

/** Rasmlarni joyiga moslash: tomonlar nisbati saqlanadi, kesilmaydi */
const FIT_SCRIPT = `
window.__fit = async () => {
  const imgs = [...document.querySelectorAll(".imgbox img")];
  await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = r; i.onerror = r; }))));
  const broken = imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src"));
  // PDF hajmi: webp rasmlar PDF ga siqilmasdan tushadi (bitta skrinshot ~1 MB).
  // JPEG ga o'giriladi — Chrome uni PDF ga o'zgartirmasdan qo'yadi.
  const q = Number(window.__jpegQuality || 0.82);
  await Promise.all(imgs.filter((i) => i.naturalWidth).map(async (img) => {
    // Eni 1800 px dan oshmaydi: to'liq kenglikda (273 mm) ~170 dpi — chop etishga yetarli
    const k = Math.min(1, 1800 / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", q);
    await new Promise((r) => { img.onload = r; img.onerror = r; img.src = url; });
  }));
  for (const img of imgs) {
    if (!img.naturalWidth) continue;
    const box = img.parentElement;
    const bw = box.clientWidth, bh = box.clientHeight;
    const k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
    img.style.width = Math.floor(img.naturalWidth * k) + "px";
    img.style.height = Math.floor(img.naturalHeight * k) + "px";
  }
  const pxPerMm = 96 / 25.4;
  const overflow = [...document.querySelectorAll(".page")]
    .map((p, i) => ({ i: i + 1, over: p.scrollHeight - p.clientHeight }))
    .filter((x) => x.over > 2);
  const small = imgs
    .filter((i) => i.naturalWidth)
    .map((i) => ({ src: i.getAttribute("src").split("/manual/")[1], wmm: Math.round(i.getBoundingClientRect().width / pxPerMm) }))
    .filter((x) => x.wmm < 180);
  return { broken, overflow, small, pages: document.querySelectorAll(".page").length };
};`;

/** `book` — AUDIENCE_BOOK dagi kitob (sarlavha, 1-sahifa rasmi, mundarija izohi) */
function renderBook({ sections: SECTION_LIST, latinToCyrillic }, lang, heights, book) {
  const txt = (pair) => {
    if (!pair) return "";
    if (lang === "ru") return pair[1];
    return lang === "cyrl" ? toCyrillic(pair[0], latinToCyrillic) : pair[0];
  };
  const T = (k) => txt(k === "title" || k === "roleNote" ? book[k] : BOOK[k]);
  const bookTitle = `${T("app")} · ${T("title")}`;

  const stepText = (step, k, outro, cols = 1) => {
    const List = step.ordered ? "ol" : "ul";
    const items = (step.items || [])
      .map((it, i) => `<li><span class="mk">${step.ordered ? `${i + 1}.` : "•"}</span><span>${esc(txt(it))}</span></li>`)
      .join("");
    return `
      <div class="st-head"><span class="st-num">${k + 1}</span><h2>${esc(txt(step.title))}</h2></div>
      <div class="${cols === 2 ? "cols2" : ""}">
      <p>${esc(txt(step.body))}</p>
      ${items ? `<${List} class="items">${items}</${List}>` : ""}
      ${step.warn ? `<div class="call warn"><b>${T("warn")}:</b><span>${esc(txt(step.warn))}</span></div>` : ""}
      ${step.tip ? `<div class="call tip"><b>${T("tip")}:</b><span>${esc(txt(step.tip))}</span></div>` : ""}
      ${outro ? `<div class="call ok"><b>${T("done")}:</b><span>${esc(txt(outro))}</span></div>` : ""}
      </div>`;
  };


  // O'lchash: har bosqich matni bir va ikki ustunda, sahifa kengligida
  if (!heights) {
    const blocks = SECTION_LIST.flatMap((sec, si) =>
      (sec.guide.steps || []).flatMap((step, k, all) => {
        const outro = k === all.length - 1 ? sec.guide.outro : null;
        return [1, 2].map(
          (cols) => `<div class="m" data-key="${si}.${k}.${cols}">${stepText(step, k, outro, cols)}</div>`
        );
      })
    );
    return {
      measureHtml: `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
        .m { width: ${CONTENT_W}mm; display: flow-root; }</style></head><body>${blocks.join("")}</body></html>`,
    };
  }

  /* 1) Sahifalar ro'yxati (raqami aniq bo'lishi uchun avval tuziladi) */
  const pages = []; // { kind, ... }
  pages.push({ kind: "where" });

  // Mundarija qatorlari: bo'lim + bosqichlar; 2 ustun × ~34 qator bir sahifaga
  const tocLines = SECTION_LIST.reduce((n, s) => n + 1 + (s.guide.steps?.length || 0), 0);
  const tocPages = Math.max(1, Math.ceil(tocLines / 66));
  for (let i = 0; i < tocPages; i++) pages.push({ kind: "toc", part: i });

  const toc = []; // { sec, title, page, steps: [{ title, page }] }
  SECTION_LIST.forEach((sec, si) => {
    const entry = { n: si + 1, title: txt(sec.title), page: pages.length + 1, steps: [] };
    pages.push({ kind: "opener", sec, si });
    const steps = sec.guide.steps || [];
    steps.forEach((step, k) => {
      const last = k === steps.length - 1;
      const outro = last ? sec.guide.outro : null;
      const shots = step.shots || [];
      // Rasm matn bilan bir sahifada — agar rasmga yetarli joy qolsa; matn
      // uzun bo'lsa ikki ustunda; baribir sig'masa rasm keyingi varaqda
      // BODY_H ichida .pb ning yuqori bo'shlig'i (4mm) va rasm ustidagi bo'shliq (2mm) bor
      const fits = (cols) => BODY_H - 4 - heights[`${si}.${k}.${cols}`] - CAPTION_H - 2 >= MIN_FILL_IMG_H;
      const cols = shots.length > 0 && !fits(1) && fits(2) ? 2 : 1;
      const fill = shots.length > 0 && fits(cols);
      entry.steps.push({ title: txt(step.title), page: pages.length + 1 });
      pages.push({ kind: "step", sec, si, step, k, outro, cols, shot: fill ? shots[0] : null, shotIndex: 0, shotTotal: shots.length });
      shots.slice(fill ? 1 : 0).forEach((shot, j) => {
        pages.push({ kind: "shot", sec, si, step, k, shot, shotIndex: (fill ? 1 : 0) + j, shotTotal: shots.length });
      });
    });
    toc.push(entry);
  });
  const total = pages.length;

  /* 2) HTML */
  const header = (left, right = "") =>
    `<header class="ph"><span>${left}</span><span>${right}</span></header>`;
  const footer = (n) =>
    `<footer class="pf"><span>${esc(bookTitle)}</span><span><span class="n">${n}</span> / ${total}</span></footer>`;
  const secLabel = (p) => `<b>${p.si + 1}. ${esc(txt(p.sec.title))}</b>`;

  const figure = (shot, p, fill) => {
    const label =
      p.shotTotal > 1
        ? `${T("picture")} ${p.si + 1}.${p.k + 1}.${p.shotIndex + 1}`
        : `${T("picture")} ${p.si + 1}.${p.k + 1}`;
    return `<figure class="fill">
      <div class="imgbox"><img src="${fileUrl(shot.src)}" alt=""></div>
      <figcaption><b>${label}.</b> ${esc(txt(shot.caption))}</figcaption>
    </figure>`;
  };

  const html = pages
    .map((p, idx) => {
      const n = idx + 1;
      let body = "";
      let head = header(esc(T("app")), esc(T("title")));

      if (p.kind === "where") {
        const items = BOOK.where
          .map((it, i) => `<li><span class="badge">${i + 1}</span><span>${esc(txt(it))}</span></li>`)
          .join("");
        body = `
          <div class="where">
            <div>
              <div class="brand">
                <img src="${fileUrl("../src/assets/logo.png")}" alt="">
                <div><div class="t1">${esc(T("org"))}</div><div class="t2">${esc(T("app"))}</div></div>
              </div>
              <h1>${esc(T("whereTitle"))}</h1>
              <p>${esc(T("whereLead"))}</p>
              <ol>${items}</ol>
              <div class="note">${esc(T("whereNote"))}</div>
            </div>
            <figure class="fill" style="margin-top:0">
              <div class="imgbox"><img src="${fileUrl(book.where)}" alt=""></div>
            </figure>
          </div>`;
      } else if (p.kind === "toc") {
        // Bo'limlarni sahifalarga taqsimlash (qatorlar soni bo'yicha)
        const perPage = Math.ceil(toc.length / tocPages);
        const part = toc.slice(p.part * perPage, (p.part + 1) * perPage);
        const rows = part
          .map(
            (s) => `<div class="sec">
              <div class="row s"><span class="num">${s.n}.</span><span>${esc(s.title)}</span><span class="dots"></span><span>${s.page}</span></div>
              ${s.steps
                .map((st, i) => `<div class="row st"><span>${i + 1}. ${esc(st.title)}</span><span class="dots"></span><span>${st.page}</span></div>`)
                .join("")}
            </div>`
          )
          .join("");
        body = `<h1>${esc(T("toc"))}</h1>
          <p class="note" style="margin:0 0 4mm">${esc(T("roleNote"))}</p>
          <div class="toc">${rows}</div>`;
      } else if (p.kind === "opener") {
        const g = p.sec.guide;
        const need = g.need?.length
          ? `<div class="box"><div class="cap">${T("need")}</div><ul>${g.need.map((x) => `<li>${esc(txt(x))}</li>`).join("")}</ul></div>`
          : "";
        const steps = g.steps?.length
          ? `<div class="box"><div class="cap">${T("steps")}</div><ol>${toc[p.si].steps
              .map((st) => `<li>${esc(st.title)} — ${st.page}-${T("page")}</li>`)
              .join("")}</ol></div>`
          : "";
        head = header(secLabel(p), esc(T("title")));
        body = `<div class="opener">
            <div><div class="kicker">${p.si + 1}-${T("section")}</div><div class="big">${String(p.si + 1).padStart(2, "0")}</div></div>
            <div><h1>${esc(txt(p.sec.title))}</h1><p>${esc(txt(g.intro))}</p>${need}${steps}</div>
          </div>`;
      } else if (p.kind === "step") {
        head = header(secLabel(p), `${p.k + 1}-${T("step")}`);
        body = stepText(p.step, p.k, p.outro, p.cols) + (p.shot ? figure(p.shot, p, true) : "");
      } else if (p.kind === "shot") {
        head = header(`${secLabel(p)} › ${p.k + 1}. ${esc(txt(p.step.title))}`, `${p.k + 1}-${T("step")}`);
        body = figure(p.shot, p, true);
      }
      return `<section class="page">${head}<main class="pb">${body}</main>${footer(n)}</section>`;
    })
    .join("\n");

  return {
    total,
    html: `<!doctype html><html lang="${lang === "ru" ? "ru" : "uz"}"><head><meta charset="utf-8">
      <title>${esc(bookTitle)}</title><style>${CSS}</style><script>${FIT_SCRIPT}</script></head>
      <body>${html}</body></html>`,
  };
}

/* ── PDF ───────────────────────────────────────────────────────────── */

async function printPdf(chrome, htmlFile, outFile) {
  log("navigate", htmlFile);
  await chrome.navigate(pathToFileURL(htmlFile).href, 300);
  log("loaded");
  const report = await chrome.evaluate("window.__fit()");
  log("fit", JSON.stringify(report).slice(0, 200));
  const res = await chrome.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    transferMode: "ReturnAsStream",
  });
  log("printed");
  const chunks = [];
  for (;;) {
    const part = await chrome.send("IO.read", { handle: res.stream, size: 512 * 1024 });
    chunks.push(Buffer.from(part.data, part.base64Encoded ? "base64" : "utf8"));
    if (part.eof) break;
  }
  await chrome.send("IO.close", { handle: res.stream });
  writeFileSync(outFile, Buffer.concat(chunks));
  return report;
}

const main = async () => {
  const { MANUALS, latinToCyrillic } = await loadData();
  const tmp = mkdtempSync(path.join(tmpdir(), "manual-book-"));
  const chrome = await launchChrome();
  try {
    for (const audience of AUDIENCES) {
      const book = AUDIENCE_BOOK[audience];
      const manual = MANUALS[audience];
      if (!book || !manual) throw new Error(`AUDIENCE=${audience} — noma'lum kitob`);

      const coverage = checkMenuCoverage(book.menu, manual.sections, book.skip);
      if (coverage.error) console.warn(`\n⚠ ${coverage.error}\n`);
      if (coverage.missing?.length) {
        console.warn(
          `\n⚠ ${audience}: menyuda bor, qo'llanmada yo'q bo'lim: ${coverage.missing.join(", ")}\n` +
            "  → manual/sections.ts va guides/ ga qo'shing (CLAUDE.md: qo'llanma doim dastur bilan bir xil)\n"
        );
      }
      if (coverage.stale?.length) {
        console.warn(
          `\n⚠ ${audience}: qo'llanmada bor, menyuda yo'q bo'lim: ${coverage.stale.join(", ")} — sections.ts dan olib tashlang\n`
        );
      }

      const only = process.env.ONLY?.split(",");
      const data = {
        latinToCyrillic,
        sections: only ? manual.sections.filter((s) => only.includes(s.id)) : manual.sections,
      };
      if (!data.sections.length) continue;
      if (!existsSync(path.join(PUBLIC, book.where))) {
        throw new Error(`public/${book.where} yo'q — avval \`npm run manual:capture\``);
      }
      log(audience, "bo'limlar:", data.sections.length);

      for (const lang of LANGS) {
        const measureFile = path.join(tmp, `measure-${audience}-${lang}.html`);
        writeFileSync(measureFile, renderBook(data, lang, null, book).measureHtml);
        await chrome.navigate(pathToFileURL(measureFile).href, 200);
        const heights = await chrome.evaluate(`Object.fromEntries([...document.querySelectorAll(".m")].map((e) =>
          [e.dataset.key, e.getBoundingClientRect().height / (96 / 25.4)]))`);
        log("measured", Object.keys(heights).length);
        const { html, total } = renderBook(data, lang, heights, book);
        const htmlFile = path.join(tmp, `book-${audience}-${lang}.html`);
        writeFileSync(htmlFile, html);
        const out = path.join(PUBLIC, `manual/${manual.pdf}-${lang}.pdf`);
        const report = await printPdf(chrome, htmlFile, out);
        const size = (await import("node:fs")).statSync(out).size;
        console.log(
          `${audience} ${lang}: ${total} bet, ${(size / 1024 / 1024).toFixed(1)} MB -> ${path.relative(CLIENT, out)}` +
            (report.broken.length ? `\n  rasm topilmadi: ${report.broken.join(", ")}` : "") +
            (report.overflow.length ? `\n  sig'madi (bet): ${JSON.stringify(report.overflow)}` : "") +
            (report.small.length ? `\n  kichik rasm (<180mm): ${JSON.stringify(report.small)}` : "")
        );
        if (process.env.KEEP_HTML) console.log("  html:", htmlFile);
      }
    }
  } finally {
    await chrome.close();
    if (!process.env.KEEP_HTML) rmSync(tmp, { recursive: true, force: true });
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
