/**
 * Qo'llanma skrinshotlari uchun NAMUNA ma'lumotlar — shots.mjs API
 * javoblarini shular bilan almashtiradi. Hammasi o'ylab topilgan:
 * tashkilot, odam, hisob raqam va summalar haqiqiy emas.
 *
 * Raqamlar o'zaro mos: jamilar qatorlar yig'indisiga teng, shartnomalar
 * (41–49) va «Hodimlarning pul hisob-kitobi» hujjatlari (17–26) eski
 * skrinshotlardagi bilan bir xil — moddiy baza kirimi ham shulardan.
 * Davr — 2026-yil sentyabr, "bugun" — 26.09.2026 (shots.mjs dagi TODAY).
 *
 * Yangi sahifa skrinshoti uchun shu yerga ma'lumot, shots.mjs dagi MOCKS ga
 * API yo'li qo'shiladi.
 */

/** Backenddagi returnStringSumma kabi: 26586560 → "26 586 560,00" */
export const sumText = (n) => {
  const [int, frac = ""] = (Math.round(n * 100) / 100).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${frac}`;
};

const total = (rows, key) => Math.round(rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) * 100) / 100;

/** GET /account — yuqori paneldagi hisob raqam (session.mjs dagi bilan bir xil) */
export const ACCOUNTS = [{ id: 2, account_number: "20208000900100001001" }];

/* ── Tashkilotlar ─────────────────────────────────────────────────── */

const ORG = {
  savdo: {
    organization_id: 501,
    organization_name: '"Namuna Savdo" MCHJ',
    organization_address: "Namuna sh., Navoiy ko'chasi, 12",
    organization_str: "305112233",
    organization_account_number: "20208000900400001001",
  },
  saroy: {
    organization_id: 502,
    organization_name: '"Madaniyat Saroyi" DM',
    organization_address: "Namuna sh., Amir Temur ko'chasi, 45",
    organization_str: "201445566",
    organization_account_number: "20208000900400001002",
  },
  sport: {
    organization_id: 503,
    organization_name: '"Yangi Avlod Sport" MCHJ',
    organization_address: "Namuna sh., Yoshlik ko'chasi, 3",
    organization_str: "307889900",
    organization_account_number: "20208000900400001003",
  },
  hokimlik: {
    organization_id: 504,
    organization_name: "Namuna shahar hokimligi",
    organization_address: "Namuna sh., Mustaqillik maydoni, 1",
    organization_str: "200123456",
    organization_account_number: "20208000900400001004",
  },
  konsert: {
    organization_id: 505,
    organization_name: '"Konsert Plyus" MCHJ',
    organization_address: "Namuna sh., Bobur ko'chasi, 7",
    organization_str: "306667788",
    organization_account_number: "20208000900400001005",
  },
};

/* ── Shartnomalar ro'yhati ────────────────────────────────────────── */

/** Tadbirdan 3 kun oldin — to'lov muddati (backend: helper/debt.status.js) */
const minusDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};

/** Ro'yxat qatori — backend javobidagi kalitlar bilan (contract/db.js) */
function contract(c) {
  const debt = Math.round((c.summa - c.paid) * 100) / 100;
  return {
    id: 9000 + Number(c.doc_num),
    doc_num: c.doc_num,
    doc_date: c.doc_date,
    result_summa: c.summa,
    adress: c.adress,
    dist: false,
    verification_boss: c.boss ?? null,
    verification_lawyer: c.lawyer ?? null,
    send_lawyer: Boolean(c.sent),
    file: null,
    template_id: 1,
    template_name: "Bir kunlik",
    status: c.cancelled ? "cancelled" : "active",
    cancelled_at: c.cancelled?.at ?? null,
    cancelled_by_fio: c.cancelled?.by ?? null,
    // Bekor qilish to'sig'i: pul tushgan / chiqim (contract.cancel.js)
    cancel_block: c.block ?? null,
    ...ORG[c.org],
    organization_bank_name: "Namuna bank",
    organization_mfo: "00000",
    gazna_number: null,
    gazna_number_id: null,
    account_number: null,
    organ_account_number_id: null,
    remaining_balance: debt,
    remaining_summa: c.paid,
    debt_status: debt > 0 ? c.debt : "paid",
    event_date: c.event,
    payment_due_date: minusDays(c.event, 3),
    tasks: [],
    worker_task_status: c.workers ? "Bajarilgan" : "Bajarilmagan",
    worker_task_count: c.workers ? 1 : 0,
    rasxod_summa: c.rasxod ?? 0,
  };
}

// "Bugun" 26.09.2026: not_due — muddat kelmagan, late — muddat o'tgan,
// tadbir hali oldinda, overdue — tadbir boshlangan (pul tushmagan)
export const CONTRACTS = [
  contract({
    doc_num: "41", doc_date: "2026-09-02", org: "savdo", adress: "«Namuna Savdo» savdo majmuasi",
    summa: 1540000, paid: 1540000, rasxod: 1540000, event: "2026-09-05",
    workers: true, boss: "success", lawyer: "success", sent: true, block: "prixod",
  }),
  contract({
    doc_num: "42", doc_date: "2026-09-05", org: "saroy", adress: "Madaniyat saroyi, katta zal",
    summa: 2494800, paid: 1000000, event: "2026-09-28", debt: "late",
    boss: "update", lawyer: "update", sent: true, block: "prixod",
  }),
  contract({
    doc_num: "43", doc_date: "2026-09-08", org: "sport", adress: "«Yangi Avlod» stadioni",
    summa: 2464000, paid: 0, event: "2026-10-10", debt: "not_due", lawyer: "rejected",
  }),
  contract({
    doc_num: "44", doc_date: "2026-09-10", org: "konsert", adress: "«Konsert Plyus» konsert zali",
    summa: 4656960, paid: 3000000, rasxod: 2661120, event: "2026-09-20", debt: "overdue",
    boss: "success", lawyer: "success", sent: true, block: "prixod",
  }),
  contract({
    doc_num: "45", doc_date: "2026-09-12", org: "hokimlik", adress: "Mustaqillik maydoni",
    summa: 11088000, paid: 5000000, event: "2026-09-30", debt: "not_due", sent: true, block: "prixod",
  }),
  contract({
    doc_num: "46", doc_date: "2026-09-15", org: "savdo", adress: "«Namuna Savdo» savdo majmuasi",
    summa: 1540000, paid: 0, event: "2026-10-12", debt: "not_due",
  }),
  contract({
    doc_num: "47", doc_date: "2026-09-18", org: "saroy", adress: "Madaniyat saroyi, kichik zal",
    summa: 739200, paid: 739200, rasxod: 739200, event: "2026-09-19",
    workers: true, boss: "success", lawyer: "success", sent: true, block: "prixod",
  }),
  contract({
    doc_num: "48", doc_date: "2026-09-20", org: "sport", adress: "«Yangi Avlod» sport majmuasi",
    summa: 1293600, paid: 500000, rasxod: 554400, event: "2026-09-28", debt: "late",
    workers: true, boss: "success", lawyer: "success", sent: true, block: "prixod",
  }),
  contract({
    doc_num: "49", doc_date: "2026-09-22", org: "konsert", adress: "«Konsert Plyus» ochiq maydoni",
    summa: 770000, paid: 0, event: "2026-09-23", debt: "overdue", workers: true, sent: true,
  }),
];

export const CANCELLED_CONTRACTS = [
  contract({
    doc_num: "40", doc_date: "2026-09-01", org: "konsert", adress: "«Konsert Plyus» ochiq maydoni",
    summa: 3080000, paid: 0, event: "2026-09-19", debt: "not_due",
    cancelled: { at: "2026-09-11 16:05", by: "Namuna Buxgalter" },
  }),
  contract({
    doc_num: "38", doc_date: "2026-08-28", org: "savdo", adress: "«Namuna Savdo» savdo majmuasi",
    summa: 1155000, paid: 0, event: "2026-09-12", debt: "not_due",
    cancelled: { at: "2026-09-04 10:42", by: "Namuna Administrator" },
  }),
];

/** Ro'yxat javobining `meta` si — jamilar qatorlardan hisoblanadi */
export function contractMeta(rows) {
  const by = (status) => {
    const list = rows.filter((r) => r.remaining_balance > 0 && r.debt_status === status);
    const summa = total(list, "remaining_balance");
    return { count: list.length, summa, debt: summa };
  };
  return {
    pageCount: rows.length ? 1 : 0,
    count: rows.length,
    currentPage: 1,
    nextPage: null,
    backPage: null,
    internal_summa: sumText(total(rows, "result_summa")),
    debet_summa: sumText(total(rows, "remaining_summa")),
    kredit_summa: sumText(total(rows, "remaining_balance")),
    rasxod_summa: sumText(total(rows, "rasxod_summa")),
    page_result_summa: total(rows, "result_summa"),
    page_prixod_summa: total(rows, "remaining_summa"),
    debt_by_status: { not_due: by("not_due"), late: by("late"), overdue: by("overdue") },
  };
}

/* ── Moddiy baza ──────────────────────────────────────────────────── */

// «Hodimlarning pul hisob-kitobi» hujjatlari (17–26): moddiy bazaga —
// hujjat summasining 67,5% i (90% ning 75% i). 25 va 26 hali to'lanmagan
const FIO_DOCS = [
  { n: 17, date: "2026-09-01", batalon: "3-batalon", summa: 369600, paid: true },
  { n: 18, date: "2026-09-01", batalon: "1-batalon", summa: 862400, paid: true },
  { n: 19, date: "2026-09-02", batalon: "2-batalon", summa: 677600, paid: true },
  { n: 20, date: "2026-09-02", batalon: "3-batalon", summa: 492800, paid: true },
  { n: 21, date: "2026-09-04", batalon: "1-batalon", summa: 1232000, paid: true },
  { n: 22, date: "2026-09-04", batalon: "2-batalon", summa: 924000, paid: true },
  { n: 23, date: "2026-09-11", batalon: "3-batalon", summa: 739200, paid: true },
  { n: 24, date: "2026-09-18", batalon: "1-batalon", summa: 554400, paid: true },
  { n: 25, date: "2026-09-21", batalon: "2-batalon", summa: 431200, paid: false },
  { n: 26, date: "2026-09-24", batalon: "3-batalon", summa: 308000, paid: false },
].map((d) => ({ ...d, share: Math.round(d.summa * 0.675 * 100) / 100 }));

/** Moddiy baza chiqimlari (yangisi birinchi — ro'yxat tartibi) */
export const BAZA_RASXOD = [
  { id: 4, doc_num: "4", doc_date: "2026-09-24", summa: 640000, comment: "Radiostansiya akkumulyatorlari — 8 dona" },
  { id: 3, doc_num: "3", doc_date: "2026-09-19", summa: 865000, comment: "Xizmat avtomobili ta'miri: tormoz kolodkalari almashtirildi" },
  { id: 2, doc_num: "2", doc_date: "2026-09-12", summa: 2180000, comment: "Shaxsiy tarkib uchun qishki qo'lqoplar — 40 juft" },
  { id: 1, doc_num: "1", doc_date: "2026-09-05", summa: 1450000, comment: "Kanselyariya tovarlari: qog'oz, papkalar, printer kartriji" },
];

// Sentyabrgacha: jami ajratilgan va sarflangan (boshlang'ich qoldiq — farqi)
const BEFORE = { kirim: 9870500, chiqim: 7414200 };

const paidDocs = FIO_DOCS.filter((d) => d.paid);
const unpaidDocs = FIO_DOCS.filter((d) => !d.paid);
const kirim = total(paidDocs, "share");
const chiqim = total(BAZA_RASXOD, "summa");
const opening = BEFORE.kirim - BEFORE.chiqim;
const pending = { count: unpaidDocs.length, summa: total(unpaidDocs, "share") };

/** GET /moddiy-baza/monitoring */
export const BAZA_MONITORING = {
  from: "2026-09-01",
  to: "2026-09-30",
  opening,
  kirim,
  chiqim,
  closing: Math.round((opening + kirim - chiqim) * 100) / 100,
  pending,
  kirim_docs: paidDocs.map((d) => ({
    id: 100 + d.n,
    doc_num: String(d.n),
    doc_date: d.date,
    batalon_name: d.batalon,
    doc_summa: d.summa,
    summa: d.share,
  })),
  chiqim_docs: [...BAZA_RASXOD].reverse(),
};

/** GET /moddiy-baza/monitoring/balance — 26.09.2026 holatiga (shu kun ham) */
export const BAZA_BALANCE = {
  date: "2026-09-26",
  kirim: BEFORE.kirim + kirim,
  chiqim: BEFORE.chiqim + chiqim,
  qoldiq: Math.round((BEFORE.kirim + kirim - BEFORE.chiqim - chiqim) * 100) / 100,
  pending,
};

/** GET /moddiy-baza/rasxod — `meta.summa` matn ko'rinishida (backend kabi) */
export const BAZA_RASXOD_META = {
  pageCount: 1,
  count: BAZA_RASXOD.length,
  currentPage: 1,
  nextPage: null,
  backPage: null,
  summa: sumText(chiqim),
};

/* ── Muddatli harbiy xizmatchilar ─────────────────────────────────── */

// Soat narxi (BXM bo'yicha) — summa = soat × narx
const HOUR = 23800;

const contractOf = Object.fromEntries(CONTRACTS.map((c) => [c.doc_num, c]));

/** Tadbir qatori: shartnoma (41–49) topshirig'ida bitta batalon xizmatchilari */
function soldierRow(r) {
  const c = contractOf[r.doc];
  const hours = r.workers * r.time * (r.days ?? 1);
  const debt = c.remaining_balance;
  return {
    task_id: 7000 + Number(r.doc),
    contract_id: c.id,
    doc_num: c.doc_num,
    doc_date: c.doc_date,
    organization_name: c.organization_name,
    organization_str: c.organization_str,
    address: c.adress,
    comment: null,
    event_from: r.from,
    event_to: r.to ?? r.from,
    start_time: r.start,
    end_time: r.end,
    task_time: r.time,
    worker_number: r.people,
    task_summa: r.people * r.time * HOUR,
    batalon_id: r.batalon,
    batalon_name: `${r.batalon}-batalon`,
    worker_count: r.workers,
    hours,
    people: r.workers,
    summa: hours * HOUR,
    contract_summa: c.result_summa,
    contract_paid: c.remaining_summa,
    contract_debt: debt,
    is_paid: debt <= 0,
    pay_status: debt <= 0 ? "paid" : c.remaining_summa > 0 ? "partial" : "unpaid",
  };
}

export const SOLDIER_ROWS = [
  soldierRow({ doc: "41", batalon: 1, workers: 2, time: 8, people: 6, from: "2026-09-05", start: "10:00", end: "18:00" }),
  soldierRow({ doc: "41", batalon: 2, workers: 1, time: 8, people: 6, from: "2026-09-05", start: "10:00", end: "18:00" }),
  soldierRow({ doc: "42", batalon: 1, workers: 4, time: 4, people: 10, from: "2026-09-28", start: "18:00", end: "22:00" }),
  soldierRow({ doc: "44", batalon: 1, workers: 6, time: 4, people: 16, from: "2026-09-20", start: "19:00", end: "23:00" }),
  soldierRow({ doc: "44", batalon: 3, workers: 5, time: 4, people: 16, from: "2026-09-20", start: "19:00", end: "23:00" }),
  soldierRow({ doc: "45", batalon: 1, workers: 4, time: 12, days: 2, people: 20, from: "2026-09-30", to: "2026-10-01", start: "08:00", end: "20:00" }),
  soldierRow({ doc: "45", batalon: 2, workers: 3, time: 12, days: 2, people: 20, from: "2026-09-30", to: "2026-10-01", start: "08:00", end: "20:00" }),
  soldierRow({ doc: "45", batalon: 3, workers: 2, time: 12, days: 2, people: 20, from: "2026-09-30", to: "2026-10-01", start: "08:00", end: "20:00" }),
  soldierRow({ doc: "47", batalon: 2, workers: 2, time: 4, people: 4, from: "2026-09-19", start: "15:00", end: "19:00" }),
  soldierRow({ doc: "48", batalon: 3, workers: 3, time: 6, people: 8, from: "2026-09-28", start: "09:00", end: "15:00" }),
];

/** Jamlanma: tadbir (topshiriq) va shartnomalar takrorlanmasdan sanaladi */
function soldierTotals(rows) {
  const contracts = new Map(rows.map((r) => [r.contract_id, r]));
  const paidRows = rows.filter((r) => r.is_paid);
  return {
    task_count: new Set(rows.map((r) => r.task_id)).size,
    worker_count: total(rows, "worker_count"),
    contract_count: contracts.size,
    paid_contract_count: [...contracts.values()].filter((r) => r.is_paid).length,
    unpaid_contract_count: [...contracts.values()].filter((r) => !r.is_paid).length,
    hours: total(rows, "hours"),
    summa: total(rows, "summa"),
    paid_summa: total(paidRows, "summa"),
    unpaid_summa: Math.round((total(rows, "summa") - total(paidRows, "summa")) * 100) / 100,
  };
}

/** GET /moddiy-baza/muddatli-harbiy — `meta` (jami, batalonlar kesimi, ro'yxat jamlari) */
export function soldierMeta(rows) {
  const totals = soldierTotals(SOLDIER_ROWS);
  const ids = [...new Set(SOLDIER_ROWS.map((r) => r.batalon_id))].sort();
  const batalons = ids.map((id) => {
    const t = soldierTotals(SOLDIER_ROWS.filter((r) => r.batalon_id === id));
    return {
      batalon_id: id,
      batalon_name: `${id}-batalon`,
      ...t,
      summa_percent: Math.round((t.summa / totals.summa) * 10000) / 100,
    };
  });
  const debtContracts = new Map(rows.filter((r) => r.contract_debt > 0).map((r) => [r.contract_id, r]));
  return {
    pageCount: rows.length ? 1 : 0,
    count: rows.length,
    currentPage: 1,
    nextPage: null,
    backPage: null,
    list_summa: total(rows, "summa"),
    list_hours: total(rows, "hours"),
    list_debt: total([...debtContracts.values()], "contract_debt"),
    list_debt_contract_count: debtContracts.size,
    totals,
    batalons,
  };
}

/* ── Dashboard ────────────────────────────────────────────────────── */
// Raqamlar eski dashboard skrinshotlaridagi bilan bir xil

const listMeta = (rows, extra = {}) => ({
  pageCount: rows.length ? 1 : 0,
  count: rows.length,
  currentPage: 1,
  nextPage: null,
  backPage: null,
  ...extra,
});

/** GET /region/dashboard/count — summa: shartnomalarning to'liq summasi, debt: qolgan qarz */
export const DASH_COUNT = {
  all_contract: { count: 38, summa: 468900000 },
  prixod_contract: { count: 26, summa: 316800000 },
  rasxod_contract: { count: 12, summa: 152100000 },
  debt_by_status: {
    not_due: { count: 6, summa: 86500000, debt: 73100000 },
    late: { count: 3, summa: 35000000, debt: 29800000 },
    overdue: { count: 3, summa: 30600000, debt: 25200000 },
  },
};

/** GET /region/dashboard/distribution — ulushlar jami chiqimga (all_rasxod) nisbatan */
export const DASH_DISTRIBUTION = (() => {
  const parts = { summa_65: 121500000, summa_25: 40500000, rasxod_summa: 54600000, summa_10: 18000000 };
  const all = Object.values(parts).reduce((s, v) => s + v, 0);
  const pct = (v) => Math.round((v / all) * 10000) / 100;
  const fio = parts.summa_65 + parts.summa_25 + parts.summa_10;
  return {
    fio_summa: fio,
    fio_summa_percent: pct(fio),
    summa_65: parts.summa_65,
    summa_65_percent: pct(parts.summa_65),
    summa_25: parts.summa_25,
    summa_25_percent: pct(parts.summa_25),
    rasxod_summa: parts.rasxod_summa,
    rasxod_summa_percent: pct(parts.rasxod_summa),
    all_rasxod: all,
    prixod: { count: 26, summa: 316800000 },
  };
})();

/** GET /region/dashboard/red-border */
export const DASH_RED = {
  red_count: 3,
  red_workers: [
    ["Namunaev Jasur", 1, "1-batalon", 8250000, 3300000],
    ["Misolov Bekzod", 2, "2-batalon", 7140000, 2950000],
    ["Namunaeva Dilnoza", 3, "3-batalon", 5600000, 2240000],
  ].map(([worker_name, batalon_id, batalon_name, summa, average], i) => ({
    worker_id: 9001 + i,
    worker_name,
    batalon_id,
    batalon_name,
    batalon_workers_count: 40,
    batalon_summa: average * 40,
    region_name: "Namuna viloyati",
    summa,
    average,
    threshold: average * 2,
    times_average: Math.round((summa / average) * 100) / 100,
  })),
};

/** GET /region/dashboard/soldier-tasks — muddatli harbiy xizmatchilar */
export const DASH_SOLDIER = (() => {
  const rows = [
    { batalon_id: 1, batalon_name: "1-batalon", task_count: 14, worker_count: 62, total_time: 1626, total_summa: 38700000 },
    { batalon_id: 2, batalon_name: "2-batalon", task_count: 11, worker_count: 48, total_time: 1235, total_summa: 29350000 },
    { batalon_id: 3, batalon_name: "3-batalon", task_count: 7, worker_count: 31, total_time: 683, total_summa: 16250000 },
  ];
  return {
    total_task_count: total(rows, "task_count"),
    total_time: total(rows, "total_time"),
    total_summa: total(rows, "total_summa"),
    total_worker_count: total(rows, "worker_count"),
    count: rows.length,
    rows,
  };
})();

/** GET /region/dashboard/batalon-stats */
export const DASH_BATALON = (() => {
  const rows = [
    { batalon_id: 1, batalon_name: "1-batalon", task_count: 21, worker_count: 48, total_summa: 158400000, total_time: 6655 },
    { batalon_id: 2, batalon_name: "2-batalon", task_count: 17, worker_count: 41, total_summa: 121300000, total_time: 5097 },
    { batalon_id: 4, batalon_name: '"Qalqon Qo\'riqlash" MCHJ', task_count: 9, worker_count: 22, total_summa: 86700000, total_time: 3643 },
    { batalon_id: 3, batalon_name: "3-batalon", task_count: 12, worker_count: 35, total_summa: 66200000, total_time: 2781 },
  ];
  const grand = { summa: total(rows, "total_summa"), time: total(rows, "total_time"), tasks: total(rows, "task_count") };
  const pct = (v, all) => Math.round((v / all) * 10000) / 100;
  return {
    grand_summa: grand.summa,
    grand_time: grand.time,
    grand_task_count: grand.tasks,
    count: rows.length,
    rows: rows.map((r) => ({
      ...r,
      summa_percent: pct(r.total_summa, grand.summa),
      time_percent: pct(r.total_time, grand.time),
      task_percent: pct(r.task_count, grand.tasks),
    })),
  };
})();

/** GET /region/dashboard/organization-debt — qarzdor tashkilotlar (davr oxirigacha) */
export const DASH_ORG_DEBT = [
  [ORG.savdo, 64800000, 18300000, 15000000],
  [ORG.hokimlik, 52400000, 12000000, 12000000],
  [ORG.sport, 41250000, 8750000, 21100000],
  [ORG.saroy, 36900000, 6900000, 0],
  [ORG.konsert, 29600000, 4100000, 25500000],
  [{ organization_id: 506, organization_name: '"Sharq Ko\'rgazma Markazi" MCHJ', organization_str: "307778899", organization_address: "Namuna sh., Beruniy ko'chasi, 18" }, 24750000, 5250000, 0],
  [{ organization_id: 507, organization_name: "Namuna tumani hokimligi", organization_str: "201987654", organization_address: "Namuna tumani, Markaziy ko'chasi, 4" }, 18400000, 0, 18400000],
  [{ organization_id: 508, organization_name: '"Oltin Vodiy Festival" MCHJ', organization_str: "308889900", organization_address: "Namuna sh., Istiqlol ko'chasi, 5" }, 14200000, 3700000, 0],
  [{ organization_id: 509, organization_name: '"Bahor Bog\'i" MCHJ', organization_str: "309990011", organization_address: "Namuna sh., Bog'ishamol ko'chasi, 9" }, 12000000, 4500000, 0],
].map(([org, total_summa, paid_summa, overdue_summa], i) => ({
  organization_id: org.organization_id,
  organization_name: org.organization_name,
  organization_str: org.organization_str,
  organization_address: org.organization_address,
  contract_count: [3, 2, 2, 2, 2, 1, 1, 1, 1][i],
  total_summa,
  paid_summa,
  debt_summa: total_summa - paid_summa,
  overdue_summa,
  not_due_summa: total_summa - paid_summa - overdue_summa,
  late_summa: 0,
}));

export const DASH_ORG_DEBT_META = listMeta(DASH_ORG_DEBT, { total_debt: total(DASH_ORG_DEBT, "debt_summa") });

/* ── Chiqimlar kitobi ─────────────────────────────────────────────── */

const RECEIVER = {
  iio: { batalon_id: 31, batalon_name: "Namuna shahar IIB", batalon_address: "Namuna sh., Navoiy ko'chasi, 1", batalon_str: "200345678" },
  fvv: { batalon_id: 32, batalon_name: "Namuna shahar FVB", batalon_address: "Namuna sh., Bobur ko'chasi, 21", batalon_str: "200456789" },
  mg: { batalon_id: 33, batalon_name: "1234-harbiy qism", batalon_address: "Namuna sh., Harbiylar shaharchasi", batalon_str: "200567890" },
};

/** GET /rasxod — chiqim hujjatlari (yangisi birinchi) */
export const RASXOD_DOCS = [
  [16, "2026-09-17", RECEIVER.iio, "Avgust oyi (qo'shimcha)", 1848000, false],
  [15, "2026-09-10", RECEIVER.fvv, "16–31 avgust", 3326400, true],
  [14, "2026-09-03", RECEIVER.mg, "1–15 avgust", 3880800, true],
  [13, "2026-09-01", RECEIVER.iio, "Iyul oyi", 3326400, true],
].map(([n, doc_date, receiver, opisanie, summa, is_paid]) => ({
  id: 800 + n,
  doc_num: String(n),
  doc_date,
  opisanie,
  ...receiver,
  batalon_bank_name: "Namuna bank",
  batalon_mfo: "00999",
  batalon_account_number: `2020800090060000${receiver.batalon_id}01`,
  summa,
  is_paid,
}));

/**
 * `meta` — "Ommaviy tadbirlar hisoboti"dagi "O'tkazildi" bilan solishtirish:
 * sahifa jami = hisobot − outside + other (+ duplicate + cancelled + batalon)
 */
export const RASXOD_META = (() => {
  const summa = total(RASXOD_DOCS, "summa");
  const period_contract = { iiv: 4989600, fvv: 3326400, mg_qism: 3588000, outside: 1108800, other: 1586400, duplicate: 0, cancelled: 0, batalon: 0 };
  period_contract.summa = period_contract.iiv + period_contract.fvv + period_contract.mg_qism;
  if (period_contract.summa - period_contract.outside + period_contract.other !== summa) throw new Error("RASXOD_META: tenglik buzildi");
  return listMeta(RASXOD_DOCS, { summa_from: sumText(0), summa_to: sumText(0), summa: sumText(summa), period_contract });
})();

/* ── Hodimlarning pul hisob-kitobi ────────────────────────────────── */

const round2 = (n) => Math.round(n * 100) / 100;

/** Hujjat summasining taqsimoti (splitSumma.ts kabi): 10% boshqarmaga, qolgani 75% / 25% */
function fioSplit(summa) {
  const summa_10 = round2(summa * 0.1);
  const summa_remaining = round2(summa - summa_10);
  const summa_65 = round2(summa_remaining * 0.75);
  const summa_25 = round2(summa_remaining - summa_65);
  const summa_1_25 = round2(summa_25 / 1.25);
  const summa_25_2 = round2(summa_25 - summa_1_25);
  const summa_12 = round2(summa_1_25 * 0.12);
  const worker_summa = round2(summa_1_25 - summa_12);
  return { summa, summa_10, summa_remaining, summa_65, summa_25, summa_1_25, summa_25_2, summa_12, worker_summa };
}

/** GET /rasxod/fio — hujjatlar 17–26 (yangisi birinchi) */
export const FIO_LIST = [...FIO_DOCS].reverse().map((d) => ({
  id: 900 + d.n,
  doc_num: String(d.n),
  doc_date: d.date,
  batalon_id: Number.parseInt(d.batalon, 10),
  batalon_name: d.batalon,
  batalon_address: "Namuna sh., Harbiylar shaharchasi",
  batalon_str: "200678901",
  batalon_account_number: "20208000900700000101",
  ...fioSplit(d.summa),
  is_paid: d.paid,
}));

/**
 * `meta` — pastdagi jami kataklar va "Ommaviy tadbirlar hisoboti"ga tushadigan
 * 25% (viloyatning barcha hisob raqamlari bo'yicha — boshqa hisob raqamdagisi bilan)
 */
export const FIO_LIST_META = (() => {
  const keys = ["summa", "summa_10", "summa_remaining", "summa_65", "summa_25", "summa_1_25", "summa_25_2", "summa_12", "worker_summa"];
  const sums = Object.fromEntries(keys.map((k) => [k, total(FIO_LIST, k)]));
  const other_accounts = 221760;
  return listMeta(FIO_LIST, { ...sums, mass_report: { sarf_25: round2(sums.summa_25 + other_accounts), other_accounts } });
})();

/* ── Rekvizitlar va shartnoma hujjati («Ishni boshlash», 2-bosqich) ─── */

/**
 * Ma'lumotnoma → Rekvizitlar (GET /doer, /boss, /adress, /bank, /str): har
 * matn uch xil — kirill (asosiy maydon), lotin (_uz), rus (_ru). «Ijrochi
 * nomi» — faqat hudud nomi: shablonda «Milliy gvardiyasi ${ijrochi} bo'yicha
 * boshqarmasi» / «по ${ijrochi}»; «Hujjat sarlavhasi» — shartnoma tuzilgan joy
 */
export const REKVIZIT = {
  doer: {
    id: 1,
    doer: "Намуна вилояти",
    doer_uz: "Namuna viloyati",
    doer_ru: "Образцовой области",
    title: "Намуна ш.",
    title_uz: "Namuna sh.",
    title_ru: "г. Намуна",
  },
  boss: { id: 1, boss: "Каримов Азиз Бахтиёрович", boss_uz: "Karimov Aziz Baxtiyorovich", boss_ru: "Каримов Азиз Бахтиёрович" },
  adress: {
    id: 1,
    adress: "Намуна ш., Мустақиллик кўчаси, 12",
    adress_uz: "Namuna sh., Mustaqillik ko'chasi, 12",
    adress_ru: "г. Намуна, ул. Мустакиллик, 12",
  },
  bank: {
    id: 1,
    bank: "Марказий банк ҳисоб-китоб маркази",
    bank_uz: "Markaziy bank hisob-kitob markazi",
    bank_ru: "Расчётный центр Центрального банка",
    mfo: "00014",
  },
  str: { id: 1, str: "201234567" },
};

const c46 = CONTRACTS.find((c) => c.doc_num === "46");

/** GET /contract/:id — ro'yxatdagi 46-shartnoma, 1 kunlik shablon (id 4) */
export const CONTRACT_DOC = {
  id: c46.id,
  doc_num: c46.doc_num,
  doc_date: c46.doc_date,
  period: "2026-12-31",
  adress: c46.adress,
  start_date: "2026-10-12",
  end_date: "2026-10-12",
  discount: null,
  discount_money: 0,
  summa: c46.result_summa,
  result_summa: c46.result_summa,
  organization_id: c46.organization_id,
  account_number_id: 2,
  organ_account_number_id: null,
  gazna_number_id: null,
  start_time: "10:00",
  end_time: "15:00",
  all_worker_number: 11,
  all_task_time: 5,
  dist: false,
  date: null,
  send_lawyer: false,
  verification_lawyer: null,
  verification_boss: null,
  template_id: 4,
  // Saqlangan PDF bor — sahifa hujjatdan PDF yasab, uni yuklashga urinmasin
  file: "/uploads/namuna-shartnoma-46.pdf",
  didox_id: null,
  didox_status: null,
  status: "active",
  cancelled_at: null,
  organization_name: c46.organization_name,
  organization_address: c46.organization_address,
  organization_str: c46.organization_str,
  organization_bank_name: c46.organization_bank_name,
  organization_mfo: c46.organization_mfo,
  gazna_number: null,
  account_number: ACCOUNTS[0].account_number,
  organization_account_number: c46.organization_account_number,
  remaining_balance: c46.remaining_balance,
  // 11 xodim × 5 soat × 28 000 (bir soat narxi) = 1 540 000
  tasks: [
    {
      id: 1,
      batalon_id: 31,
      task_time: 5,
      worker_number: 11,
      summa: c46.result_summa,
      timemoney: 28000,
      discount_money: 0,
      result_summa: c46.result_summa,
      task_date: "2026-10-12",
      local_date: "2026-10-12",
      batalon_name: "1-batalon",
      address: c46.adress,
      remaining_task_time: 0,
      bxm_id: 1,
    },
  ],
};

/** GET /organization/:id — buyurtmachi (46-shartnoma) */
export const CONTRACT_ORG = {
  id: c46.organization_id,
  name: c46.organization_name,
  address: c46.organization_address,
  str: c46.organization_str,
  bank_name: c46.organization_bank_name,
  mfo: c46.organization_mfo,
  boss: "Aliyev Sardor Rustamovich",
  gazna_numbers: [],
  account_numbers: [{ id: 1, account_number: c46.organization_account_number }],
};

/* ── Hodimlar ro'yhati va Exceldan import ─────────────────────────── */

/** GET /batalon?birgada=false — xodimlar sahifasidagi batalon filtri */
export const WORKER_BATALONS = [
  { id: 31, name: "1-batalon", birgada: false },
  { id: 32, name: "2-batalon", birgada: false },
  { id: 33, name: "3-batalon", birgada: false },
];

// Raqamlar namuna (jadvalda baribir yashirin ko'rinadi); muddatli harbiyda karta yo'q
const W = (id, fio, batalon, { muddatli = false, xisob = true } = {}) => {
  const b = WORKER_BATALONS.find((x) => x.name === batalon);
  return {
    id,
    fio,
    batalon_name: batalon,
    batalon: b,
    account_number: muddatli ? null : `86000000000${String(4000 + id).padStart(5, "0")}`,
    xisob_raqam: xisob && !muddatli ? `2020600090010000${String(1000 + id)}` : null,
    pinfl: `3010199000${String(1000 + id)}`,
    is_muddatli_harbiy: muddatli,
    user_id: 1,
  };
};

/** GET /worker — ro'yxat */
export const WORKERS = [
  W(1, "Namunaev Jasur Akmalovich", "1-batalon"),
  W(2, "Misolov Bobur Karimovich", "1-batalon", { xisob: false }),
  W(3, "Sinovov Aziz Rustamovich", "1-batalon", { muddatli: true }),
  W(4, "Namunaev Otabek Ilhomovich", "1-batalon"),
  W(5, "Misolov Sardor Anvarovich", "2-batalon"),
  W(6, "Sinovov Umid Shavkatovich", "2-batalon", { xisob: false }),
  W(7, "Namunaev Farrux Odilovich", "2-batalon", { muddatli: true }),
  W(8, "Misolov Jamshid Baxtiyorovich", "2-batalon"),
  W(9, "Sinovov Sherzod Ravshanovich", "3-batalon"),
  W(10, "Namunaev Akbar Sobirovich", "3-batalon", { xisob: false }),
  W(11, "Misolov Sanjar Ilhomovich", "3-batalon"),
  W(12, "Sinovov Diyorbek Anvarovich", "3-batalon", { muddatli: true }),
];
export const WORKERS_META = listMeta(WORKERS);

/** POST /worker/import/check — tekshiruv natijasi (raqamlar yashirilgan, backenddagi kabi) */
const IW = (row, fio, batalon, karta, xisob, ok = true) => ({
  row,
  ok,
  fio,
  batalon_name: batalon,
  karta_raqam: karta ? `•••• ${karta}` : null,
  xisob_raqam: xisob ? `•••• ${xisob}` : null,
  pinfl: null,
});
const IMPORT_WORKERS = [
  IW(2, "Namunaev Otabek Ilhomovich", "1-batalon", "4101", "5101"),
  IW(3, "Misolov Jamshid Baxtiyorovich", "1-batalon", "4102", "5102"),
  IW(4, "Sinovov Umid Shavkatovich", "2-batalon", "4103", null),
  IW(5, "Namunaev Jasur Akmalovich", "1-batalon", "4104", "5104", false),
  IW(6, "Misolova Gulnora Erkinovna", "2-batalon", null, "5106"),
  IW(7, "Sinovov Farrux Odilovich", "4-batalon", null, null, false),
  IW(8, "Namunaev Sherzod Ravshanovich", "3-batalon", null, null),
];
export const WORKER_IMPORT_CHECK = {
  data: {
    workers: IMPORT_WORKERS,
    issues: [
      { level: "error", row: 5, message: "«Namunaev Jasur Akmalovich» «1-batalon» batalonida allaqachon bor" },
      {
        level: "error",
        row: 7,
        message: "«4-batalon» batalon viloyatda yo'q. Viloyatdagi batalonlar: 1-batalon, 2-batalon, 3-batalon",
      },
      { level: "error", row: 7, message: "«Karta raqami» Excelda son bo'lib qolgan — oxirgi raqamlari yo'qolgan. Katakni matn formatida qayta yozing" },
      {
        level: "warning",
        row: 8,
        message: "1 ta xodimda karta ham, hisob raqami ham yo'q — ularga pul o'tkazib bo'lmaydi (qatorlar: 8)",
      },
    ],
  },
  meta: {
    total: IMPORT_WORKERS.length,
    valid: IMPORT_WORKERS.filter((w) => w.ok).length,
    skipped: 0,
    errors: 3,
    warnings: 1,
    by_batalon: [
      { name: "1-batalon", count: 3 },
      { name: "2-batalon", count: 2 },
      { name: "4-batalon", count: 1 },
      { name: "3-batalon", count: 1 },
    ],
  },
};

/* ── Kirimlar kitobi (GET /prixod, GET /prixod/cancelled) ─────────── */

// Kirimlar shartnomalarning `paid` summalari bilan mos: jami 11 779 200
// (dashboarddagi «Kelib tushgan» bilan bir xil). Chiqim qilingan
// shartnomalar (41, 44, 47, 48) kirimini bekor qilib bo'lmaydi — cancel_block.
const PX = (doc_num, contract, date, summa, opisanie, extra = {}) => {
  const c = CONTRACTS.find((x) => x.doc_num === contract) ?? CANCELLED_CONTRACTS.find((x) => x.doc_num === contract);
  return {
    id: 7000 + Number(doc_num),
    prixod_doc_num: doc_num,
    prixod_date: date,
    prixod_summa: summa,
    opisanie,
    contract_id: c.id,
    contract_doc_num: contract,
    contract_doc_date: c.doc_date,
    contract_summa: c.result_summa,
    organization_id: c.organization_id,
    organization_name: c.organization_name,
    organization_address: c.organization_address,
    organization_str: c.organization_str,
    organization_account_number: c.organization_account_number,
    cancel_block: c.rasxod_summa > 0 ? "rasxod" : null,
    ...extra,
  };
};
export const PRIXODS = [
  PX("107", "48", "2026-09-22", 500000, "Qisman to'lov"),
  PX("106", "47", "2026-09-18", 739200, "To'liq to'lov"),
  PX("105", "45", "2026-09-16", 5000000, "Avans"),
  PX("104", "44", "2026-09-18", 1000000, "Qisman to'lov"),
  PX("103", "44", "2026-09-14", 2000000, "Avans"),
  PX("102", "42", "2026-09-10", 1000000, "Avans"),
  PX("101", "41", "2026-09-04", 1540000, "To'liq to'lov"),
];
export const PRIXOD_META = {
  count: PRIXODS.length,
  pageCount: 1,
  currentPage: 1,
  nextPage: null,
  backPage: null,
  summa: sumText(total(PRIXODS, "prixod_summa")),
  from_balance: "0,00",
  to_balance: sumText(total(PRIXODS, "prixod_summa")),
};
export const CANCELLED_PRIXODS = [
  PX("099", "43", "2026-09-12", 1232000, "Avans — tadbir ko'chirildi", {
    contract_status: "active",
    cancelled_at: "2026-09-20 15:10",
    cancelled_by_fio: "Namuna Buxgalter",
  }),
  PX("098", "40", "2026-09-03", 3080000, "Avans", {
    contract_status: "cancelled",
    cancelled_at: "2026-09-10 09:30",
    cancelled_by_fio: "Namuna Administrator",
  }),
];
