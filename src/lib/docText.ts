import { getAppLang, type AppLang } from "./lang";

/**
 * Shartnoma hujjati (ko'rinish, chop etish, PDF) matnlari — tanlangan tilda.
 *
 * Interfeysdagi `tt()` kirillni lotindan avtomatik o'giradi; yuridik hujjat
 * uchun bu yetarli emas, shuning uchun bu yerda uchala til aniq yozilgan.
 * Shartnoma matnining o'zi backenddan (`/template/:id`) shu tilda keladi.
 *
 * Til sahifa almashganda qayta yuklanadi (AppNavbar `location.reload()`),
 * lekin baribir funksiyalarni komponent ichida chaqiring — modul darajasida
 * til qotib qoladi.
 */

type Tri = Record<AppLang, string>;

const TEXT = {
  docNumSuffix: { uz: "-son", cyrl: "-сон", ru: "" },
  docNumPrefix: { uz: "", cyrl: "", ru: "№ " },
  requisitesTitle: {
    uz: "8. Tomonlarning rekvizitlari",
    cyrl: "8. Томонларнинг реквизитлари",
    ru: "8. Реквизиты сторон",
  },
  customer: { uz: "Buyurtmachi:", cyrl: "Буюртмачи:", ru: "Заказчик:" },
  executor: { uz: "Bajaruvchi:", cyrl: "Бажарувчи:", ru: "Исполнитель:" },
  address: { uz: "Manzil:", cyrl: "Манзил:", ru: "Адрес:" },
  inn: { uz: "INN:", cyrl: "ИНН:", ru: "ИНН:" },
  bank: { uz: "Bank rekvizitlari:", cyrl: "Банк реквизитлари:", ru: "Банковские реквизиты:" },
  mfo: { uz: "MFO:", cyrl: "МФО:", ru: "МФО:" },
  account: { uz: "h/r:", cyrl: "х/р:", ru: "р/с:" },
  treasury: { uz: "G'aznachiligi h/r:", cyrl: "Ғазначилиги х/р:", ru: "Р/с казначейства:" },
  head: { uz: "Rahbari:", cyrl: "Раҳбари:", ru: "Руководитель:" },
  annexOf: {
    uz: "sonli shartnomaga ilova",
    cyrl: "сонли шартномага илова",
    ru: "Приложение к договору №",
  },
  smetaSubject: {
    uz: "Ommaviy tadbirni o'tkazishda fuqarolar xavfsizligini ta'minlash va jamoat tartibini saqlashni tashkil etishda",
    cyrl: "Оммавий тадбирни ўтказишда фуқаролар хавсизлигини таъминлаш ва жамоат тартибини сақлашни ташкил этишда",
    ru: "При организации обеспечения безопасности граждан и охраны общественного порядка при проведении массового мероприятия",
  },
  smetaTitle: { uz: "Xarajatlar smetasi", cyrl: "Харажатлар сметаси", ru: "Смета расходов" },

  // Smeta jadvali ustunlari
  smPlace: { uz: "Tadbir o'tadigan joy nomi", cyrl: "Тадбир ўтадиган жой номи", ru: "Место проведения мероприятия" },
  smDate: { uz: "Tadbir o'tadigan sanasi", cyrl: "Тадбир ўтадиган санаси", ru: "Дата проведения мероприятия" },
  smUnit: {
    uz: "Jalb etiladigan shaxsiy tarkib vakolatli davlat idoralari yoki organlar nomi",
    cyrl: "Жалб этиладиган шахсий таркиб ваколатли давлат идоралари ёки органлар номи",
    ru: "Наименование уполномоченных государственных органов, личный состав которых привлекается",
  },
  smWorkers: {
    uz: "Jami ishlatilgan shaxsiy tarkib soni",
    cyrl: "Жами ишлатилган шахсий таркиб сони",
    ru: "Общая численность задействованного личного состава",
  },
  smHours: {
    uz: "Ommaviy tadbir o'tkazish vaqti (soat)",
    cyrl: "Оммавий тадбир ўтказиш вақти (соат)",
    ru: "Время проведения мероприятия (часы)",
  },
  smRate: {
    uz: "Bir kishilik soatbay ish haqi (BHM*7%)",
    cyrl: "Бир кишилик соатбай иш ҳақи (БҲМ*7%)",
    ru: "Почасовая оплата на одного человека (БРВ*7%)",
  },
  smTotal: { uz: "Jami hisoblangan (3*4*5)", cyrl: "Жами ҳисобланган (3*4*5)", ru: "Всего начислено (3*4*5)" },
  smDiscount: { uz: "Chegirma", cyrl: "Чегирма", ru: "Скидка" },
  smGrand: { uz: "Umumiy hisoblangan", cyrl: "Умумий ҳисобланган", ru: "Итого начислено" },
  smSum: { uz: "Jami", cyrl: "Жами", ru: "Итого" },
} satisfies Record<string, Tri>;

export type DocTextKey = keyof typeof TEXT;

/** Hujjat matni joriy tilda */
export const docText = (key: DocTextKey, lang: AppLang = getAppLang()): string => TEXT[key][lang];

/** "{num}-son" / "№ {num}" */
export const docNum = (num: string | number, lang: AppLang = getAppLang()): string =>
  `${TEXT.docNumPrefix[lang]}${num ?? ""}${TEXT.docNumSuffix[lang]}`;

/** "{num} сонли шартномага илова" / "Приложение к договору № {num}" */
export const docAnnex = (num: string | number, lang: AppLang = getAppLang()): string =>
  lang === "ru" ? `${TEXT.annexOf.ru} ${num}` : `${num} ${TEXT.annexOf[lang]}`;

const MONTHS: Record<AppLang, string[]> = {
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
  cyrl: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
};
// Ruscha sanada oy qaratqich kelishigida: "05 января 2026 г."
const MONTHS_RU_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

/** Oy nomi (1..12), bosh harf bilan yoki kichik */
export const monthName = (month: number, lang: AppLang = getAppLang(), capital = false): string => {
  const m = MONTHS[lang][month - 1] ?? "";
  return capital ? m.charAt(0).toUpperCase() + m.slice(1) : m;
};

/** "2026-yil 05-yanvar" / "2026-йил 05-январь" / "05 января 2026 г." */
export const formatDocDate = (year: number, month: number, day: number, lang: AppLang = getAppLang()): string => {
  const dd = String(day).padStart(2, "0");
  if (lang === "ru") return `${dd} ${MONTHS_RU_GEN[month - 1] ?? ""} ${year} г.`;
  return `${year}${lang === "uz" ? "-yil" : "-йил"} ${dd}-${MONTHS[lang][month - 1] ?? ""}`;
};

/**
 * "Oylar oralig'ida" shablonidagi `${start_month}` / `${end_month}`:
 * uz/cyrl — "2026-йил Январь" va "Март"; ru — "январь" va "март 2026 г."
 * (ruscha gapda "на период январь – март 2026 г." bo'lib o'qiladi).
 */
export const monthRange = (start: Date, end: Date, lang: AppLang = getAppLang()): [string, string] => {
  const sm = start.getMonth() + 1;
  const em = end.getMonth() + 1;
  if (lang === "ru") return [monthName(sm, lang), `${monthName(em, lang)} ${end.getFullYear()} г.`];
  const yil = lang === "uz" ? "-yil" : "-йил";
  return [`${start.getFullYear()}${yil} ${monthName(sm, lang, true)}`, monthName(em, lang, true)];
};

/**
 * Sanasiz (chop etish uchun) variantda 1.1-banddagi ijrochi va "tasdiqlangan"
 * so'zlari orasidagi qism chiziq bilan almashtiriladi. Belgilar shablon
 * matniga mos bo'lishi kerak (backend `contract.shablon/templates/*.js`).
 */
export const blankMarkers = (lang: AppLang = getAppLang()): [string, string] =>
  lang === "ru"
    ? ["«Исполнитель»", "согласно утверждённому"]
    : lang === "uz"
    ? ["«Bajaruvchi»", "tasdiqlangan"]
    : ["«Бажарувчи»", "тасдиқланган"];

/**
 * Spravochnik qiymatining til varianti: `field_ru` / `field_uz` ustunlari
 * to'ldirilgan bo'lsa o'sha, aks holda (bo'sh yoki "-") asosiy qiymat.
 * Asosiy ustun kirill hujjat uchun ishlatiladi.
 */
export const pickLang = (row: any, field: string, lang: AppLang = getAppLang()): string => {
  const base = row?.[field] ?? "";
  if (lang === "cyrl") return base;
  const v = String(row?.[`${field}_${lang}`] ?? "").trim();
  return v && v !== "-" ? v : base;
};
