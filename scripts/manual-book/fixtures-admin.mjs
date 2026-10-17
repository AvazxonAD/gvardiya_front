/**
 * Super-admin qo'llanmasi skrinshotlari uchun NAMUNA ma'lumotlar
 * (scenes-admin.mjs dagi mock javoblar). Viloyat nomlari — haqiqiy (umumiy
 * ma'lumot), qolgan hamma narsa — raqamlar, tashkilotlar, odamlar, loginlar —
 * o'ylab topilgan. Jamilar qatorlar yig'indisiga teng.
 *
 * Bitta "voqea": 2026-yil sentyabr, "bugun" — 26.09.2026. Sirdaryo viloyati
 * dasturda hali ishlamayapti (hamma joyda 0, monitoringda «Hech qachon»),
 * Qoraqalpog'iston bu oy hech narsa kiritmagan.
 */

import { sumText } from "./fixtures.mjs";

/* ── Umumiy ───────────────────────────────────────────────────────── */

export const REGIONS = [
  { id: 1, name: "Toshkent shahar" },
  { id: 2, name: "Toshkent viloyati" },
  { id: 3, name: "Andijon viloyati" },
  { id: 4, name: "Buxoro viloyati" },
  { id: 5, name: "Farg‘ona viloyati" },
  { id: 6, name: "Jizzax viloyati" },
  { id: 7, name: "Xorazm viloyati" },
  { id: 8, name: "Namangan viloyati" },
  { id: 9, name: "Navoiy viloyati" },
  { id: 10, name: "Qashqadaryo viloyati" },
  { id: 11, name: "Qoraqalpog‘iston Respublikasi" },
  { id: 12, name: "Samarqand viloyati" },
  { id: 13, name: "Surxondaryo viloyati" },
  { id: 14, name: "Sirdaryo viloyati" },
];
const regionName = (id) => REGIONS.find((r) => r.id === Number(id))?.name ?? "";

const r2 = (v) => Math.round(v * 100) / 100;
const k = (v) => Math.round(v / 1000) * 1000; // mingtagacha yaxlitlash
const sum = (rows, f) => r2(rows.reduce((s, r) => s + (typeof f === "function" ? f(r) : r[f]) , 0));

/** Sahifalash: { pageCount, count, currentPage, nextPage, backPage } */
export function pageMeta(count, page = 1, limit = 15) {
  const pageCount = Math.max(1, Math.ceil(count / limit));
  return {
    pageCount: count ? pageCount : 0,
    count,
    currentPage: page,
    nextPage: page >= pageCount ? null : page + 1,
    backPage: page <= 1 ? null : page - 1,
  };
}

/** Sanadan kun ayirish (YYYY-MM-DD) */
const minusDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};
const TODAY = "2026-09-26";

/* ── Viloyatlar bo'yicha shartnomalar (dashboard, qarzdorlik) ─────── */

// [shartnomalar, shundan to'liq to'langan, jami summa, to'langanlarning summasi]
const STATS = {
  1: [58, 41, 742_000_000, 521_000_000],
  2: [37, 26, 468_300_000, 329_100_000],
  3: [29, 21, 351_200_000, 248_600_000],
  4: [26, 19, 318_400_000, 226_900_000],
  5: [33, 24, 402_700_000, 287_500_000],
  6: [18, 12, 214_600_000, 140_300_000],
  7: [21, 15, 256_900_000, 181_200_000],
  8: [27, 20, 334_500_000, 243_800_000],
  9: [19, 14, 238_100_000, 171_400_000],
  10: [31, 22, 377_800_000, 262_900_000],
  11: [16, 10, 193_200_000, 118_700_000],
  12: [41, 30, 509_600_000, 368_200_000],
  13: [22, 15, 271_500_000, 182_600_000],
  14: [0, 0, 0, 0],
};

/** Viloyat qatori: qarzdorlar, qolgan qarz va uning muddat bo'yicha bo'linishi */
function regionRow(id) {
  const [count, paidCount, summa, paidContracts] = STATS[id];
  const debtCount = count - paidCount;
  const debtValue = summa - paidContracts; // qarzdor shartnomalarning to'liq summasi
  const debt = k(debtValue * 0.86); // qolgan qarz (qisman to'langan)
  const notDueCount = Math.round(debtCount * 0.36);
  const lateCount = Math.round(debtCount * 0.13);
  const notDue = k(debt * 0.36);
  const late = k(debt * 0.12);
  return {
    id,
    name: regionName(id),
    count,
    paidCount,
    summa,
    paidContracts,
    debtCount,
    debtValue,
    debt,
    paid: summa - debt, // tushgan pul (qisman to'lovlar bilan)
    notDueCount,
    lateCount,
    overdueCount: debtCount - notDueCount - lateCount,
    notDue,
    late,
    overdue: debt - notDue - late,
    notDueValue: k(debtValue * 0.36),
    lateValue: k(debtValue * 0.12),
  };
}
const ROWS = REGIONS.map((r) => regionRow(r.id));
const rowsFor = (regionId) => (regionId ? ROWS.filter((r) => r.id === Number(regionId)) : ROWS);

/* ── Dashboard (/admin/dashboard/*) ───────────────────────────────── */

const group = (count, summa) => ({ count, summa });

export function dashCount(regionId) {
  const rows = rowsFor(regionId);
  const debtCount = sum(rows, "debtCount");
  const debtValue = sum(rows, "debtValue");
  const notDueValue = sum(rows, "notDueValue");
  const lateValue = sum(rows, "lateValue");
  return {
    all_contract: group(sum(rows, "count"), sum(rows, "summa")),
    prixod_contract: group(sum(rows, "paidCount"), sum(rows, "paidContracts")),
    rasxod_contract: group(debtCount, debtValue),
    debt_by_status: {
      not_due: { count: sum(rows, "notDueCount"), summa: notDueValue, debt: sum(rows, "notDue") },
      late: { count: sum(rows, "lateCount"), summa: lateValue, debt: sum(rows, "late") },
      overdue: { count: sum(rows, "overdueCount"), summa: r2(debtValue - notDueValue - lateValue), debt: sum(rows, "overdue") },
    },
  };
}

export const dashByRegion = () =>
  ROWS.map((r) => ({
    region_id: r.id,
    region_name: r.name,
    data: {
      all_contract: group(r.count, r.summa),
      prixod_contract: group(r.paidCount, r.paidContracts),
      rasxod_contract: group(r.debtCount, r.debtValue),
    },
  }));

/** Kirim bo'lgan pulning taqsimoti: xodimlarga (10/67,5/22,5) va hamkorlarga */
function split(paid, id = 0) {
  const fio = k(paid * (0.58 + (id % 5) * 0.015));
  const rasxod = k(paid * (0.16 + (id % 3) * 0.01));
  const all = fio + rasxod;
  const pct = (v) => (all ? r2((v * 100) / all) : 0);
  const s65 = r2(fio * 0.675);
  const s25 = r2(fio * 0.225);
  return {
    fio_summa: fio,
    fio_summa_percent: pct(fio),
    summa_65: s65,
    summa_65_percent: pct(s65),
    summa_25: s25,
    summa_25_percent: pct(s25),
    rasxod_summa: rasxod,
    rasxod_summa_percent: pct(rasxod),
    all_rasxod: all,
  };
}

export function dashDistribution(regionId) {
  const rows = rowsFor(regionId);
  const parts = rows.map((r) => split(r.paidContracts, r.id));
  const fio = sum(parts, "fio_summa");
  const rasxod = sum(parts, "rasxod_summa");
  const all = fio + rasxod;
  const pct = (v) => (all ? r2((v * 100) / all) : 0);
  const s65 = sum(parts, "summa_65");
  const s25 = sum(parts, "summa_25");
  return {
    fio_summa: fio,
    fio_summa_percent: pct(fio),
    summa_65: s65,
    summa_65_percent: pct(s65),
    summa_25: s25,
    summa_25_percent: pct(s25),
    rasxod_summa: rasxod,
    rasxod_summa_percent: pct(rasxod),
    all_rasxod: all,
    prixod: group(sum(rows, "paidCount"), sum(rows, "paidContracts")),
  };
}

export const dashDistributionByRegion = () =>
  ROWS.map((r) => ({ region_id: r.id, region_name: r.name, jami_kirim: r.paidContracts, ...split(r.paidContracts, r.id) }));

const RED_WORKERS = [
  { worker_id: 9001, worker_name: "Namunaev Jasur", batalon_id: 1, batalon_name: "1-batalon", batalon_workers_count: 12, batalon_summa: 18_360_000, region_id: 1, summa: 3_520_000 },
  { worker_id: 9002, worker_name: "Misolov Bekzod", batalon_id: 2, batalon_name: "2-batalon", batalon_workers_count: 9, batalon_summa: 11_070_000, region_id: 12, summa: 2_610_000 },
  { worker_id: 9003, worker_name: "Sinovov Akmal", batalon_id: 3, batalon_name: "1-batalon", batalon_workers_count: 10, batalon_summa: 12_400_000, region_id: 5, summa: 2_540_000 },
].map((w) => {
  const average = Math.round(w.batalon_summa / w.batalon_workers_count);
  return {
    ...w,
    region_name: regionName(w.region_id),
    average,
    threshold: average * 2,
    times_average: Math.round((w.summa / average) * 10) / 10,
  };
});

export function dashRedBorder(regionId) {
  const list = regionId ? RED_WORKERS.filter((w) => w.region_id === Number(regionId)) : RED_WORKERS;
  return { red_count: list.length, red_workers: list };
}

/* ── Shartnomalar ro'yxati (dashboard va qarzdorlik oynalari) ─────── */

const ORGS = [
  '"Namuna Savdo" MCHJ',
  '"Madaniyat Saroyi" DM',
  '"Yangi Avlod Sport" MCHJ',
  '"Konsert Plyus" MCHJ',
  "Namuna shahar hokimligi",
  '"Bahor Event" MCHJ',
  '"Ipak Yo\'li Tadbirlar" MCHJ',
  '"Sport Olami" MCHJ',
  '"Navro\'z Konsert" MCHJ',
  '"Shahar Bog\'i" DUK',
  '"Olimp Arena" MCHJ',
  '"Yoshlar Markazi" DM',
];
const STATUS_GAP = { not_due: -14, late: -2, overdue: 21 }; // tadbir sanasi: bugundan necha kun oldin (+) / keyin (−)

/** Barcha qarzdor shartnomalar — dashboard kataklaridagi sonlar bilan mos */
const DEBT_CONTRACTS = (() => {
  const list = [];
  const total = dashCount();
  const order = [
    ...Array(total.debt_by_status.not_due.count).fill("not_due"),
    ...Array(total.debt_by_status.late.count).fill("late"),
    ...Array(total.debt_by_status.overdue.count).fill("overdue"),
  ];
  // Aralashtirib, sana bo'yicha kamayuvchi tartibda (backend: doc_date DESC)
  const mixed = order.map((s, i) => ({ s, w: (i * 37) % order.length })).sort((a, b) => a.w - b.w);
  const active = REGIONS.filter((r) => STATS[r.id][0] > 0);
  mixed.forEach(({ s }, i) => {
    const region = active[(i * 5) % active.length];
    const summa = [1_540_000, 2_494_800, 2_464_000, 4_656_960, 1_293_600, 3_080_000, 924_000, 6_160_000][i % 8];
    const paid = s === "overdue" && i % 3 === 0 ? 0 : k(summa * [0, 0.3, 0.5, 0][i % 4]);
    const event = minusDays(TODAY, STATUS_GAP[s] + (i % 9));
    list.push({
      id: 20000 + i,
      doc_num: String(400 - i),
      doc_date: minusDays(TODAY, 1 + Math.floor(i * 1.7)),
      result_summa: summa,
      organization_name: ORGS[i % ORGS.length],
      user_name: "Namuna Administrator",
      region_id: region.id,
      region_name: region.name,
      paid_summa: paid,
      debt_summa: summa - paid,
      debt_status: s,
      event_date: event,
      payment_due_date: minusDays(event, 3),
    });
  });
  return list;
})();

export function dashContracts(q) {
  const type = q.get("type") || "debt";
  const page = Number(q.get("page")) || 1;
  const limit = Number(q.get("limit")) || 15;
  const regionId = q.get("region_id");
  let rows = DEBT_CONTRACTS;
  if (regionId) rows = rows.filter((r) => r.region_id === Number(regionId));
  if (["not_due", "late", "overdue"].includes(type)) rows = rows.filter((r) => r.debt_status === type);
  return { data: rows.slice((page - 1) * limit, page * limit), meta: pageMeta(rows.length, page, limit) };
}

/* ── Qarzdorlik (/admin/dashboard/overview*) ──────────────────────── */

export function debtOverview(regionId) {
  const rows = rowsFor(regionId);
  const overdue = sum(rows, "overdue");
  const overdueCount = sum(rows, "overdueCount");
  // Muddati o'tgan qarz yoshi: 5 guruh (oxirgisi — qoldiq, yig'indi aniq teng bo'lsin)
  const shares = [0.22, 0.31, 0.22, 0.16];
  const aging = ["0_30", "31_90", "91_180", "181_365"].map((bucket, i) => ({
    bucket,
    count: Math.round(overdueCount * shares[i]),
    summa: k(overdue * shares[i]),
  }));
  aging.push({
    bucket: "365_plus",
    count: overdueCount - sum(aging, "count"),
    summa: r2(overdue - sum(aging, "summa")),
  });
  // Oylar bo'yicha qolgan qarz: oxirgi 12 oy, yaqin oylarda ko'proq
  const debt = sum(rows, "debt");
  const weights = [1, 1, 1.5, 1.5, 2, 2, 3, 3, 4, 5, 6, 8];
  const wsum = weights.reduce((a, b) => a + b, 0);
  const monthly = weights.map((w, i) => {
    const d = new Date(Date.UTC(2025, 9 + i, 1));
    const debtM = k((debt * w) / wsum);
    const collected = 0.97 - i * 0.035;
    const contractM = k(debtM / (1 - collected));
    return { month: d.toISOString().slice(0, 7), contract_summa: contractM, paid_summa: contractM - debtM, debt_summa: debtM };
  });
  return {
    summary: {
      contract_count: sum(rows, "count"),
      contract_summa: sum(rows, "summa"),
      paid_summa: sum(rows, "paid"),
      debt_summa: debt,
      debt_count: sum(rows, "debtCount"),
      not_due_count: sum(rows, "notDueCount"),
      not_due_summa: sum(rows, "notDue"),
      late_count: sum(rows, "lateCount"),
      late_summa: sum(rows, "late"),
      overdue_count: overdueCount,
      overdue_summa: overdue,
      debtor_orgs: 58,
    },
    aging,
    regions: [...ROWS]
      .sort((a, b) => b.debt - a.debt || a.id - b.id)
      .map((r) => ({
        region_id: r.id,
        region_name: r.name,
        contract_count: r.count,
        contract_summa: r.summa,
        paid_summa: r.paid,
        debt_summa: r.debt,
        debt_count: r.debtCount,
        not_due_summa: r.notDue,
        late_summa: r.late,
        overdue_summa: r.overdue,
      })),
    organizations: [],
    monthly,
  };
}

/** Qarzdor tashkilotlar — 58 ta, kechikishi bo'yicha (eng uzoq birinchi) */
const ORG_WORDS = ["Bahor", "Ipak Yo'li", "Olimp", "Navro'z", "Yoshlik", "Zarafshon", "Oltin Vodiy", "Sharq", "Istiqlol", "Mehr", "Tong", "Lola", "Chinor", "Dilkusho", "Guliston"];
const ORG_KINDS = ["Event", "Konsert", "Sport", "Savdo"];
const DEBTOR_ORGS = Array.from({ length: 58 }, (_, i) => {
  const region = REGIONS.filter((r) => STATS[r.id][0] > 0)[(i * 3) % 13];
  const base = `"${ORG_WORDS[i % ORG_WORDS.length]} ${ORG_KINDS[Math.floor(i / ORG_WORDS.length) % ORG_KINDS.length]}" MCHJ`;
  const debt = k(2_400_000 + ((i * 7919) % 41) * 1_150_000);
  const days = i < 44 ? 420 - i * 9 : null;
  return {
    organization_id: 700 + i,
    name: base,
    str: String(300_000_101 + i * 7_331),
    region_name: region.name,
    debt_count: 1 + (i % 5),
    debt_summa: debt,
    overdue_summa: days ? k(debt * 0.7) : 0,
    max_days: days,
  };
});

export function debtOrganizations(q) {
  const page = Number(q.get("page")) || 1;
  const limit = Number(q.get("limit")) || 20;
  const search = (q.get("search") || "").toLowerCase();
  const regionId = q.get("region_id");
  let rows = DEBTOR_ORGS;
  if (regionId) rows = rows.filter((r) => r.region_name === regionName(regionId));
  if (search) rows = rows.filter((r) => r.name.toLowerCase().includes(search) || r.str.includes(search));
  return {
    data: rows.slice((page - 1) * limit, page * limit),
    meta: { count: rows.length, page, limit, sort: q.get("sort") || "days", dir: q.get("dir") || "desc" },
  };
}

/* ── Monitoring (/admin/monitoring/data) ──────────────────────────── */

// [shartnoma, summa, tashkilot, xodim, to'lov, to'langan summa, oxirgi kiritish]
const MONITORING = {
  1: [14, 187_400_000, 5, 9, 11, 132_600_000, "2026-09-26T09:42:10"],
  2: [9, 112_800_000, 3, 4, 7, 81_300_000, "2026-09-25T16:05:44"],
  3: [7, 86_100_000, 2, 6, 6, 61_900_000, "2026-09-25T11:20:03"],
  4: [6, 74_500_000, 2, 3, 5, 52_700_000, "2026-09-24T15:48:21"],
  5: [8, 99_300_000, 4, 5, 6, 70_100_000, "2026-09-26T08:57:36"],
  6: [3, 35_200_000, 1, 0, 2, 22_400_000, "2026-09-19T10:14:52"],
  7: [5, 61_800_000, 2, 2, 4, 43_600_000, "2026-09-23T14:31:09"],
  8: [7, 84_600_000, 3, 4, 5, 60_200_000, "2026-09-25T17:02:47"],
  9: [4, 49_900_000, 1, 2, 3, 35_800_000, "2026-09-22T12:40:18"],
  10: [8, 96_700_000, 3, 5, 6, 67_300_000, "2026-09-24T09:15:30"],
  11: [0, 0, 0, 0, 0, 0, "2026-07-14T11:20:00"],
  12: [10, 126_400_000, 4, 7, 8, 90_500_000, "2026-09-26T10:05:12"],
  13: [5, 63_200_000, 2, 3, 3, 41_800_000, "2026-09-21T16:27:55"],
  14: [0, 0, 0, 0, 0, 0, null],
};

export const monitoringRows = () =>
  REGIONS.map((r) => {
    const [c, cs, o, w, p, ps, last] = MONITORING[r.id];
    return {
      region_id: r.id,
      region_name: r.name,
      contract_count: c,
      contract_summa: cs,
      organization_count: o,
      worker_count: w,
      prixod_count: p,
      prixod_summa: ps,
      last_at: last,
    };
  });

/* ── Markaziy baza (/admin/markaziy-baza/*) ───────────────────────── */

// To'langan «Chiqim F.I.Sh.» hujjatlari: markaziy bazaga — hujjat summasining 10% i
const BAZA_DOCS = [
  { n: "18", date: "2026-09-01", region: 1, batalon: "1-batalon", summa: 862_400, paid: true },
  { n: "7", date: "2026-09-03", region: 12, batalon: "2-batalon", summa: 1_155_000, paid: true },
  { n: "11", date: "2026-09-05", region: 5, batalon: "1-batalon", summa: 739_200, paid: true },
  { n: "21", date: "2026-09-08", region: 1, batalon: "3-batalon", summa: 1_232_000, paid: true },
  { n: "4", date: "2026-09-10", region: 3, batalon: "1-batalon", summa: 554_400, paid: true },
  { n: "9", date: "2026-09-15", region: 8, batalon: "2-batalon", summa: 924_000, paid: true },
  { n: "15", date: "2026-09-17", region: 4, batalon: "1-batalon", summa: 677_600, paid: true },
  { n: "6", date: "2026-09-22", region: 10, batalon: "1-batalon", summa: 492_800, paid: true },
  { n: "12", date: "2026-09-23", region: 12, batalon: "1-batalon", summa: 431_200, paid: false },
  { n: "25", date: "2026-09-24", region: 1, batalon: "2-batalon", summa: 308_000, paid: false },
].map((d, i) => ({ ...d, id: 600 + i, share: r2(d.summa * 0.1) }));

export const BAZA_RASXOD = [
  { id: 3, doc_num: "3", doc_date: "2026-09-22", summa: 290_000, comment: "Kanselyariya tovarlari: qog'oz va papkalar" },
  { id: 2, doc_num: "2", doc_date: "2026-09-12", summa: 410_000, comment: "Printer kartrijlari — 4 dona" },
  { id: 1, doc_num: "1", doc_date: "2026-09-04", summa: 180_000, comment: "Pochta va kuryer xarajatlari" },
];
const BAZA_BEFORE = { kirim: 3_146_800, chiqim: 2_410_000 };

const bazaPaid = BAZA_DOCS.filter((d) => d.paid);
const bazaUnpaid = BAZA_DOCS.filter((d) => !d.paid);
const bazaKirim = sum(bazaPaid, "share");
const bazaChiqim = sum(BAZA_RASXOD, "summa");
const bazaPending = { count: bazaUnpaid.length, summa: sum(bazaUnpaid, "share") };

export const BAZA_MONITORING = {
  from: "2026-09-01",
  to: "2026-09-30",
  opening: BAZA_BEFORE.kirim - BAZA_BEFORE.chiqim,
  kirim: bazaKirim,
  chiqim: bazaChiqim,
  closing: r2(BAZA_BEFORE.kirim - BAZA_BEFORE.chiqim + bazaKirim - bazaChiqim),
  pending: bazaPending,
  kirim_docs: bazaPaid.map((d) => ({
    id: d.id,
    doc_num: d.n,
    doc_date: d.date,
    region_name: regionName(d.region),
    batalon_name: d.batalon,
    doc_summa: d.summa,
    summa: d.share,
  })),
  chiqim_docs: [...BAZA_RASXOD].reverse(),
};

export const BAZA_BALANCE = {
  date: TODAY,
  kirim: BAZA_BEFORE.kirim + bazaKirim,
  chiqim: BAZA_BEFORE.chiqim + bazaChiqim,
  qoldiq: r2(BAZA_BEFORE.kirim + bazaKirim - BAZA_BEFORE.chiqim - bazaChiqim),
  pending: bazaPending,
};

// `summa` — matn ko'rinishida, backenddagi kabi ("880 000,00")
export const BAZA_RASXOD_META = { ...pageMeta(BAZA_RASXOD.length), summa: sumText(bazaChiqim) };

/* ── Shartnoma importi (/admin/contract-import/*) ─────────────────── */

export const IMPORT_OPTIONS = {
  region: { id: 3, name: "Andijon viloyati" },
  admin: { id: 54, login: "andijon_admin", fio: "Namunaev Jasur" },
  accounts: [{ id: 701, account_number: "20208000900100001003" }],
  batalons: [
    { id: 31, name: "1-batalon" },
    { id: 32, name: "2-batalon" },
    { id: 33, name: "3-batalon" },
  ],
  templates: [
    { id: 1, shablon_name: "Bir kunlik" },
    { id: 2, shablon_name: "Ko'p kunlik" },
    { id: 3, shablon_name: "Kechki tadbir" },
  ],
  missing: [],
  emptyRekvizit: [],
};

/** Rekvizitlari chala viloyat — import to'xtatiladi (matn backend controller.js: missingText bilan bir xil) */
const EMPTY_REKVIZIT = ["Hujjat sarlavhasi", "Bank nomi", "MFO"];
export const IMPORT_OPTIONS_NO_REKVIZIT = {
  ...IMPORT_OPTIONS,
  region: { id: 8, name: "Namangan viloyati" },
  admin: { id: 59, login: "namangan_admin", fio: "Namunaev Jasur" },
  emptyRekvizit: EMPTY_REKVIZIT,
  missing: [
    {
      key: "rekvizit",
      message:
        `Avval viloyat rekvizitlarini to'ldiring. Bo'sh maydonlar: ${EMPTY_REKVIZIT.join(", ")}. ` +
        "Viloyat admini (namangan_admin) «Ma'lumotnoma» → «Rekvizitlar» bo'limida to'ldirib, saqlaydi",
    },
  ],
};

// Bir soat narxi: BXM 412 000 × 7% = 28 840
const HOUR = 28_840;
const task = (row, batalon, workers, hours, isNew = false) => ({
  row,
  batalon_name: batalon,
  batalon_new: isNew,
  worker_number: workers,
  task_time: hours,
  bxm_summa: 412_000,
  summa: workers * hours * HOUR,
});
const contract = (c) => ({ ok: true, organization_db_name: null, ...c, summa: sum(c.tasks, "summa") });

const IMPORT_CONTRACTS = [
  contract({
    doc_num: "110", rows: [3, 4], doc_date: "2026-09-02", start_date: "2026-10-03", end_date: "2026-10-03",
    start_time: "18:00", end_time: "22:00", organization: '"Bahor Event" MCHJ', organization_str: "305667781",
    organization_id: null, adress: "Andijon sh., Bobur shoh ko'chasi, «Bahor» konsert zali", template_id: 3,
    tasks: [task(3, "1-batalon", 12, 4), task(4, "2-batalon", 8, 4)],
  }),
  contract({
    doc_num: "111", rows: [5], doc_date: "2026-09-04", start_date: "2026-10-05", end_date: "2026-10-05",
    start_time: "09:00", end_time: "15:00", organization: "Andijon shahar hokimligi", organization_str: "200456128",
    organization_id: 812, organization_db_name: "Andijon shahar hokimligi", adress: "Mustaqillik maydoni", template_id: 1,
    tasks: [task(5, "1-batalon", 20, 6)],
  }),
  contract({
    doc_num: "112", rows: [6, 7], doc_date: "2026-09-07", start_date: "2026-10-10", end_date: "2026-10-12",
    start_time: "10:00", end_time: "18:00", organization: '"Olimp Arena" MCHJ', organization_str: "307114559",
    organization_id: null, adress: "«Olimp Arena» sport majmuasi", template_id: 2,
    tasks: [task(6, "2-batalon", 10, 24), task(7, "4-batalon", 6, 24, true)],
  }),
  contract({
    doc_num: "113", rows: [8], doc_date: "2026-09-09", start_date: "2026-10-14", end_date: "2026-10-14",
    start_time: "19:00", end_time: "23:00", organization: '"Navro\'z Konsert" MCHJ', organization_str: "306223417",
    organization_id: 845, organization_db_name: '"Navro\'z Konsert" MCHJ', adress: "Navro'z bog'i, ochiq sahna", template_id: 3,
    tasks: [task(8, "3-batalon", 15, 4)],
  }),
];

export const IMPORT_CHECK = {
  data: {
    contracts: IMPORT_CONTRACTS,
    issues: [
      {
        level: "warning",
        row: 3,
        doc_num: "110",
        message: "2 ta tashkilot viloyatda yo'q — yangi yaratiladi: «\"Bahor Event\" MCHJ», «\"Olimp Arena\" MCHJ»",
      },
      { level: "warning", row: 7, doc_num: "112", message: "«4-batalon» batalon viloyatda yo'q — yangi yaratiladi (1 ta qatorda)" },
    ],
  },
  meta: {
    contracts: IMPORT_CONTRACTS.length,
    tasks: sum(IMPORT_CONTRACTS, (c) => c.tasks.length),
    total_summa: sum(IMPORT_CONTRACTS, "summa"),
    new_organizations: 2,
    new_batalons: 1,
    new_batalon_names: ["4-batalon"],
    errors: 0,
    warnings: 2,
  },
};

/* ── Foydalanuvchilar (/admin/user) ───────────────────────────────── */

const user = (id, fio, login, type, regionId, pinfl) => ({
  id,
  fio,
  login,
  image: null,
  region_id: regionId,
  type,
  pinfl,
  created_at: "2026-03-02T09:00:00.000Z",
  name: regionId ? regionName(regionId) : null,
});

export const ADMIN_USERS = [
  user(52, "Andozaev Sardor", "buxoro_admin", "admin", 4, "31508801234567"),
  user(58, "Andozaeva Nigora", "toshkent_admin", "admin", 1, "41203851234561"),
  user(61, "Ko'rsatkichev Aziz", "jstb_tahlil", "jstb", null, "30611792345671"),
  user(63, "Kuzatuvchiev Rustam", "jstb_monitoring", "jstb", null, ""),
  user(55, "Misolova Dilnoza", "andijon_yurist", "lawyer", 3, "42111901234568"),
  user(54, "Namunaev Jasur", "andijon_admin", "admin", 3, "31907881234562"),
  user(59, "Nusxaeva Malika", "fargona_buxgalter", "accountant", 5, "40402871234563"),
  user(56, "Sinovov Bekzod", "andijon_buxgalter", "accountant", 3, "30108891234564"),
  user(57, "Tajribaev Olim", "samarqand_admin", "admin", 12, "31212841234565"),
];

/* ── Qaydlar (/logs*) ─────────────────────────────────────────────── */

const ROLE_OF = { admin: "region_admin", lawyer: "lawyer", accountant: "accountant", jstb: "super_admin" };

export const LOG_USERS = [
  { id: 8, login: "super-admin", fio: "Namuna Administrator", role: "super_admin", region_name: null, batalon_name: null },
  ...ADMIN_USERS.map((u) => ({
    id: u.id,
    login: u.login,
    fio: u.fio,
    role: ROLE_OF[u.type],
    region_name: u.name,
    batalon_name: null,
  })),
];
const logUser = (id) => LOG_USERS.find((u) => u.id === id);

// [vaqt (26.09 yoki 25.09), foydalanuvchi id, usul, bo'lim, amal, yo'l, url, obyekt, holat, xato, ms]
const LOG_ROWS = [
  ["2026-09-26T05:25:41Z", 8, "POST", "admin/contract-import", "import", "/admin/contract-import", "/admin/contract-import", null, 200, null, 1840],
  ["2026-09-26T05:24:58Z", 8, "POST", "admin/contract-import", "other", "/admin/contract-import/check", "/admin/contract-import/check", null, 200, null, 3420],
  ["2026-09-26T05:12:44Z", 54, "PUT", "organization", "update", "/organization/:id", "/organization/845", "845", 200, null, 64],
  ["2026-09-26T05:09:13Z", 54, "POST", "contract", "create", "/contract", "/contract", "9113", 200, null, 212],
  ["2026-09-26T05:02:37Z", 57, "POST", "prixod", "create", "/prixod", "/prixod", "5521", 200, null, 98],
  ["2026-09-26T04:58:02Z", 59, "GET", "rasxod/fio", "export", "/rasxod/fio/export", "/rasxod/fio/export", null, 200, null, 1270],
  ["2026-09-26T04:51:19Z", 55, "PUT", "contract", "update", "/contract/:id/lawyer", "/contract/9108/lawyer", "9108", 200, null, 77],
  ["2026-09-26T04:47:55Z", 58, "DELETE", "prixod", "delete", "/prixod/:id", "/prixod/5507", "5507", 200, null, 59],
  ["2026-09-26T04:41:30Z", 61, "GET", "admin/dashboard", "view", "/admin/dashboard/count", "/admin/dashboard/count", null, 200, null, 118],
  ["2026-09-26T04:40:12Z", 61, "POST", "auth", "login", "/auth", "/auth", null, 200, null, 245],
  ["2026-09-26T04:33:06Z", 56, "POST", "auth", "login", "/auth", "/auth", null, 401, "Login yoki parol noto'g'ri", 182],
  ["2026-09-26T04:20:48Z", 8, "PUT", "admin/user", "update", "/admin/user/:id", "/admin/user/59", "59", 200, null, 133],
  ["2026-09-26T04:15:22Z", 52, "POST", "rasxod", "create", "/rasxod", "/rasxod", "3312", 200, null, 141],
  ["2026-09-26T04:03:57Z", 57, "GET", "contract", "view", "/contract/view/:id", "/contract/view/9087", "9087", 200, null, 86],
  ["2026-09-25T13:48:10Z", 8, "POST", "bxm", "create", "/bxm", "/bxm/", "4", 201, null, 52],
  ["2026-09-25T12:31:44Z", 58, "POST", "contract", "create", "/contract", "/contract", "9095", 400, "Shartnoma raqami avval kiritilgan", 47],
  ["2026-09-25T11:05:29Z", 54, "POST", "auth/logout", "logout", "/auth/logout", "/auth/logout", null, 200, null, 21],
  ["2026-09-25T09:17:36Z", 8, "POST", "video-lessons", "create", "/video-lessons", "/video-lessons", "6", 200, null, 8650],
].map(([at, uid, method, module, action, route, url, entity, status, error, ms], i) => {
  const u = logUser(uid);
  return {
    id: String(15240 - i),
    user_id: uid,
    user_login: u.login,
    user_fio: u.fio,
    user_role: u.role,
    region_id: null,
    region_name: u.region_name,
    batalon_id: null,
    batalon_name: null,
    method,
    module: module === "auth/logout" ? "auth" : module,
    action,
    route,
    url,
    entity_id: entity,
    status,
    success: status < 400,
    error,
    duration_ms: ms,
    ip: `10.12.${(uid * 7) % 40}.${20 + ((uid * 13) % 200)}`,
    created_at: at,
  };
});

export function logsList(q) {
  const page = Number(q.get("page")) || 1;
  const limit = Number(q.get("limit")) || 20;
  const rows = LOG_ROWS;
  return {
    data: rows.slice((page - 1) * limit, page * limit),
    meta: {
      ...pageMeta(rows.length, page, limit),
      stats: {
        count: rows.length,
        changes: rows.filter((r) => !["view", "export"].includes(r.action)).length,
        errors: rows.filter((r) => !r.success).length,
        users: new Set(rows.map((r) => r.user_id)).size,
      },
    },
  };
}

/** Qayd tafsilotlari: tashkilot tahrirlangan (oldin → keyin) */
export function logDetails(id) {
  const row = LOG_ROWS.find((r) => r.id === String(id)) ?? LOG_ROWS[2];
  const before = {
    id: 845,
    name: '"Navro\'z Konsert" MCHJ',
    str: "306223417",
    address: "Andijon sh., Navoiy ko'chasi, 4",
    bank_name: "Namuna bank",
    mfo: "00873",
    xisob_raqam: "•••• 1203",
    updated_at: "2026-09-12T08:10:00.000Z",
  };
  return {
    ...row,
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36",
    body: { name: '"Navro\'z Konsert" MCHJ', address: "Andijon sh., Bobur shoh ko'chasi, 17", mfo: "00873", xisob_raqam: "•••• 4471" },
    response: { success: true, message: "Muvaffaqiyatli o'zgartirildi" },
    old_data: before,
    new_data: { ...before, address: "Andijon sh., Bobur shoh ko'chasi, 17", xisob_raqam: "•••• 4471", updated_at: "2026-09-26T05:12:44.000Z" },
  };
}

export function logsSummary() {
  return LOG_USERS.map((u) => {
    const mine = LOG_ROWS.filter((r) => r.user_id === u.id);
    const count = (a) => mine.filter((r) => r.action === a).length;
    const last = mine[0];
    const login = mine.find((r) => r.action === "login" && r.success);
    return {
      ...u,
      isdeleted: false,
      total: mine.length,
      views: count("view"),
      creates: count("create"),
      updates: count("update"),
      deletes: count("delete"),
      files: count("export") + count("import"),
      errors: mine.filter((r) => !r.success).length,
      last_login_at: login?.created_at ?? (mine.length ? "2026-09-25T03:55:00Z" : null),
      last_at: last?.created_at ?? null,
      last_ip: last?.ip ?? null,
    };
  }).sort((a, b) => (b.last_at ?? "").localeCompare(a.last_at ?? "") || a.fio.localeCompare(b.fio));
}

/* ── Video darslar (/video-lessons) ───────────────────────────────── */

const lesson = (id, position, title, description, mb, at) => ({
  id,
  title,
  description,
  file: `/uploads/namuna-dars-${id}.mp4`,
  file_size: Math.round(mb * 1024 * 1024),
  mime_type: "video/mp4",
  position,
  created_at: at,
  updated_at: at,
  author_fio: "Namuna Administrator",
});

export const VIDEO_LESSONS = [
  lesson(1, 1, "Ishni boshlash: rekvizitlar va hisob raqami", "Viloyat rekvizitlari, hisob raqami va quyi tuzilmalarni kiritish", 46.3, "2026-03-04T06:12:00Z"),
  lesson(2, 2, "Shartnoma yaratish", "Shartnoma, topshiriqlar va BXM — bosqichma-bosqich", 82.7, "2026-03-04T06:40:00Z"),
  lesson(3, 3, "Kirim va chiqim", "Kirimlar kitobi, Chiqimlar kitobi va qarzdorlik", 64.1, "2026-03-11T09:05:00Z"),
  lesson(4, 4, "Hodimlarga to'lov hujjati", "«Chiqim F.I.Sh.»: yaratish, taqsimot va «To'landi» belgisi", 71.5, "2026-04-02T07:30:00Z"),
  lesson(5, 5, "Moddiy baza", "Monitoring, chiqimlar va muddatli harbiy xizmatchilar", 38.9, "2026-09-09T10:20:00Z"),
  lesson(6, 6, "Qarzdorlik tahlili", "Kartochkalar, diagrammalar va qarzdor tashkilotlar", 29.4, "2026-09-25T09:17:36Z"),
];

/* ── BXM (/bxm) ───────────────────────────────────────────────────── */

export const BXM_ROWS = [340_000, 375_000, 412_000].map((summa, i) => ({ id: i + 1, summa, bxm_07: r2(summa * 0.07) }));
