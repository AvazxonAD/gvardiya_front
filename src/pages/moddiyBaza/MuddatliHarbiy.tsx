import Paginatsiya from "@/Components/Paginatsiya";
import ExportButtons from "@/Components/ExportButtons";
import { excelIcon, pdfIcon, type ExportMenuItem } from "@/Components/ExportMenu";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import FilterActions from "@/Components/FilterActions";
import { SortLabel } from "@/Components/reusable/table/Table";
import { EXPORT_ALL_LIMIT, exportToExcel, exportToPdf, type ExportColumn } from "@/lib/tableExport";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { sortParamsObject, useTableSort } from "@/hooks/useTableSort";
import { useRequest } from "@/hooks/useRequest";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import { formatDate, formatNum, formatSum, toNumber, tt } from "@/utils";
import { useEffect, useState, type ReactNode } from "react";
import { useDebounce } from "use-debounce";
import { useDispatch, useSelector } from "react-redux";
import { Search, Users } from "lucide-react";
import {
  Badge,
  DataTable,
  EmptyState,
  Input,
  ListCard,
  MiniBar,
  Select,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
  type TableColumn,
} from "@/ui";

/**
 * "Moddiy baza" -> "Muddatli harbiy xizmatchilar": muddatli xizmatchilar
 * ishtirok etgan tadbirlardan yig'ilgan pul (faqat ko'rish).
 *
 * Ularga F.I.Sh. bo'yicha to'lov qilinmaydi, shuning uchun puli tadbirdagi
 * ishtirok — topshiriq summasidagi ulushi bo'yicha hisoblanadi. Yig'indilar
 * viloyat dashboardidagi "Muddatli harbiy xizmatchilar kesimida" vidjeti
 * bilan bir xil: davr — shartnoma sanasi, barcha hisob raqamlar. Qidiruv va
 * filtrlar faqat pastdagi ro'yxatga ta'sir qiladi.
 */

const API_PATH = "/moddiy-baza/muddatli-harbiy";

type PayStatus = "paid" | "partial" | "unpaid";
type StatusFilter = "" | "paid" | "unpaid";

type MuddatliRow = {
  task_id: number;
  contract_id: number;
  doc_num: string;
  doc_date: string;
  organization_name: string | null;
  organization_str: string | null;
  address: string | null;
  comment: string | null;
  event_from: string | null;
  event_to: string | null;
  start_time: string | null;
  end_time: string | null;
  task_time: number | null;
  worker_number: number | null;
  task_summa: number | null;
  batalon_id: number;
  batalon_name: string;
  worker_count: number;
  hours: number;
  /** Taxminiy kishi soni: kishi-soat / topshiriq soati */
  people: number | null;
  summa: number;
  contract_summa: number | null;
  contract_paid: number;
  /** Shartnomaning qolgan qarzi (summa − tushgan), to'langanda 0 */
  contract_debt: number;
  is_paid: boolean;
  pay_status: PayStatus;
};

type Totals = {
  task_count: number;
  worker_count: number;
  contract_count: number;
  paid_contract_count: number;
  unpaid_contract_count: number;
  hours: number;
  summa: number;
  paid_summa: number;
  unpaid_summa: number;
};

type BatalonRow = Totals & {
  batalon_id: number;
  batalon_name: string;
  summa_percent: number;
};

/** Batalonlar jadvalidagi qator: batalon yoki oxirgi "Jami" qatori */
type BatalonTableRow = BatalonRow & { isTotal?: boolean };

type Meta = {
  pageCount: number;
  count: number;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
  list_summa: number;
  list_hours: number;
  /** Ro'yxatdagi shartnomalarning qolgan qarzi — har shartnoma bir marta */
  list_debt?: number;
  list_debt_contract_count?: number;
  totals: Totals;
  batalons: BatalonRow[];
};

// Soat va kishi soni: kasr bo'lsa 2 xonagacha, butun bo'lsa kasrsiz
const qty = (v?: number | null) => {
  const n = Math.round((Number(v) || 0) * 100) / 100;
  const [int, frac] = String(n).split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (frac ? `,${frac}` : "");
};

const count = (v?: number | null) => formatNum(v ?? 0, true);

// Shartnoma bo'yicha kirim: buyurtmachidan shartnomaga pul tushganmi.
// Xizmatchiga to'lov emas — muddatli xizmatchilarga to'lov qilinmaydi
const kirimLabel = (s: PayStatus) =>
  s === "paid"
    ? tt("Pul tushgan", "Поступили")
    : s === "partial"
      ? tt("Qisman tushgan", "Поступили частично")
      : tt("Pul tushmagan", "Не поступили");

const KIRIM_CLS: Record<PayStatus, string> = {
  paid: "text-success",
  partial: "text-warning",
  unpaid: "text-destructive",
};

const eventDates = (r: MuddatliRow) => {
  const from = formatDate(r.event_from ?? undefined);
  const to = formatDate(r.event_to ?? undefined);
  if (!from) return "";
  if (!to || from === to) return from;
  // Bir yil ichida — qisqa ko'rinish: 31.08–01.09.2026
  return from.slice(6) === to.slice(6) ? `${from.slice(0, 5)}–${to}` : `${from} – ${to}`;
};

// Pul ustuni: PDF da formatlangan matn, Excelda esa yig'ish uchun son
function moneyCol<T>(header: string, get: (r: T) => number | null | undefined): ExportColumn<T> {
  return {
    header,
    value: (r) => formatNum(get(r) ?? 0),
    excelValue: (r) => toNumber(get(r) ?? 0) || 0,
    align: "right",
  };
}

// Funksiyalar: `tt` til tanlovini chaqirilgan paytda o'qiydi
const listExportColumns = (): ExportColumn<MuddatliRow>[] => [
  { header: tt("Shartnoma №", "№ договора"), value: (r) => r.doc_num, width: 10, align: "center" },
  { header: tt("Shartnoma sanasi", "Дата договора"), value: (r) => formatDate(r.doc_date), align: "center" },
  { header: tt("Tashkilot", "Организация"), value: (r) => r.organization_name ?? "" },
  { header: tt("Tadbir manzili", "Место мероприятия"), value: (r) => r.address ?? "" },
  { header: tt("Tadbir sanasi", "Дата мероприятия"), value: eventDates, align: "center" },
  { header: tt("Batalon", "Батальон"), value: (r) => r.batalon_name, align: "center" },
  { header: tt("Soat", "Часы"), value: (r) => qty(r.hours), excelValue: (r) => r.hours, align: "right" },
  moneyCol(tt("Summa", "Сумма"), (r: MuddatliRow) => r.summa),
  { header: tt("Shartnoma bo'yicha kirim", "Поступления по договору"), value: (r) => kirimLabel(r.pay_status) },
  // Shartnomaniki: bir shartnomaning bir necha tadbiri bo'lsa qatorlarda takrorlanadi
  moneyCol(tt("Shartnoma qarzdorligi", "Задолженность по договору"), (r: MuddatliRow) => r.contract_debt),
];

const batalonExportColumns = (): ExportColumn<BatalonTableRow>[] => [
  { header: tt("Batalon", "Батальон"), value: (r) => (r.isTotal ? tt("Jami", "Итого") : r.batalon_name) },
  { header: tt("Tadbirlar", "Мероприятия"), value: (r) => r.task_count, align: "right" },
  { header: tt("Soat", "Часы"), value: (r) => qty(r.hours), excelValue: (r) => r.hours, align: "right" },
  moneyCol(tt("Summa", "Сумма"), (r: BatalonTableRow) => r.summa),
  moneyCol(tt("To'langan shartnomalardan", "Из оплаченных договоров"), (r: BatalonTableRow) => r.paid_summa),
  moneyCol(tt("To'lanmagan shartnomalarda", "В неоплаченных договорах"), (r: BatalonTableRow) => r.unpaid_summa),
  { header: tt("Ulush, %", "Доля, %"), value: (r) => (r.isTotal ? "" : r.summa_percent), align: "right" },
];

/** Jamlanma katakchasidagi shartnomalar soni (summadan keyin, kichik harfda) */
function ContractCount({ n }: { n?: number }) {
  return (
    <span className="ml-1.5 text-[0.75rem] font-normal text-muted-foreground">
      · {count(n)} {tt("ta shartnoma", "дог.")}
    </span>
  );
}

/** Karta ichidagi bo'lim sarlavhasi (batalonlar / tadbirlar ro'yxati) */
function SectionHead({ title, hint, right }: { title: string; hint?: string; right?: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-card px-3 py-2 sm:px-4">
      <h2 className="text-[0.75rem] font-semibold uppercase tracking-wide text-foreground">{title}</h2>
      {hint && <span className="text-[0.75rem] text-muted-foreground">{hint}</span>}
      {right && (
        <div className="ml-auto flex items-center gap-2 text-[0.75rem] tabular-nums text-muted-foreground">{right}</div>
      )}
    </div>
  );
}

export default function MuddatliHarbiy() {
  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const [period, setPeriod] = useState({ fromDate: startDate, toDate: endDate });

  useEffect(() => {
    setPeriod({ fromDate: startDate, toDate: endDate });
  }, [startDate, endDate]);

  const [rows, setRows] = useState<MuddatliRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Ro'yxat filtrlari (jami va batalonlar kesimi faqat davrga bog'liq)
  const [q, setQ] = useState("");
  const [searchText] = useDebounce(q.trim(), 500);
  const [status, setStatus] = useState<StatusFilter>("");
  // Nomi ham saqlanadi: boshqa davrda bu batalon bo'lmasa ham tanlov ko'rinib tursin
  const [batalon, setBatalon] = useState<{ id: string; name: string } | null>(null);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const request = useRequest();
  const dispatch = useDispatch();

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listParams = (p: number, l: number) => ({
    from: period.fromDate,
    to: period.toDate,
    page: p,
    limit: l,
    ...(searchText ? { search: searchText } : {}),
    ...(status ? { status } : {}),
    ...(batalon ? { batalon_id: batalon.id } : {}),
    ...sortParamsObject(sort),
  });

  const fetchData = async (isStale: () => boolean = () => false) => {
    if (!period.fromDate || !period.toDate) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await request.get(API_PATH, { params: listParams(page, limit) });
      if (isStale()) return;
      if (res.data.success) {
        setRows(Array.isArray(res.data.data) ? res.data.data : []);
        setMeta(res.data.meta);
      }
    } catch (error: any) {
      if (isStale()) return;
      dispatch(alertt({ text: error.response?.data?.message || error.message }));
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  // Filtr o'zgarsa 1-sahifaga qaytadi; kechikkan javob yangisini bosib ketmasin
  usePagedFetch({
    page,
    setPage,
    filters: [limit, period.fromDate, period.toDate, searchText, status, batalon?.id, sort],
    fetch: () => {
      let stale = false;
      fetchData(() => stale);
      return () => {
        stale = true;
      };
    },
  });

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setBatalon(null);
    resetSort();
    setPeriod({ fromDate: startDate, toDate: endDate });
  };

  const totals = meta?.totals;
  const batalons = meta?.batalons ?? [];

  const batalonRows: BatalonTableRow[] =
    totals && batalons.length
      ? [
          ...batalons,
          { ...totals, batalon_id: 0, batalon_name: tt("Jami", "Итого"), summa_percent: 100, isTotal: true },
        ]
      : [];

  const batalonOptions = batalons.map((b) => ({ value: String(b.batalon_id), label: b.batalon_name }));
  if (batalon && !batalonOptions.some((o) => o.value === batalon.id)) {
    batalonOptions.push({ value: batalon.id, label: batalon.name });
  }

  const selectBatalon = (id: string) => {
    const option = batalonOptions.find((o) => o.value === id);
    setBatalon(option ? { id: option.value, name: option.label } : null);
  };

  // Batalon qatorini bosish — ro'yxatni shu batalon bo'yicha filtrlash (qayta bosilsa — bekor)
  const toggleBatalonRow = (r: BatalonTableRow) => {
    if (r.isTotal || batalon?.id === String(r.batalon_id)) setBatalon(null);
    else setBatalon({ id: String(r.batalon_id), name: r.batalon_name });
  };

  const periodTitle = `${formatDate(period.fromDate)} – ${formatDate(period.toDate)}`;

  // Batalonlar kesimi brauzerda eksport qilinadi — ma'lumot allaqachon sahifada
  const batalonExport = () => {
    if (!batalonRows.length) throw new Error("EMPTY");
    return {
      title: `${tt("Muddatli harbiy xizmatchilar — batalonlar kesimida", "Срочнослужащие — в разрезе батальонов")} ${periodTitle}`,
      columns: batalonExportColumns(),
      rows: batalonRows,
    };
  };

  const batalonExportItems: ExportMenuItem[] = [
    {
      key: "batalon-excel",
      icon: excelIcon,
      label: tt("Excel formatda yuklab olish", "Скачать в формате Excel"),
      hint: tt("Batalonlar kesimida", "В разрезе батальонов"),
      run: () => exportToExcel(batalonExport()),
    },
    {
      key: "batalon-pdf",
      icon: pdfIcon,
      label: tt("PDF formatda yuklab olish", "Скачать в формате PDF"),
      hint: tt("Batalonlar kesimida", "В разрезе батальонов"),
      run: () => exportToPdf(batalonExport()),
    },
  ];

  // DataTable o'zi faqat brauzerda saralaydi — saralash backendda, sarlavhani o'zimiz chizamiz.
  // `wrap` — uzun nom tor ustunda ikki qatorga tushadi (sarlavha katagi nowrap)
  const sortHeader = (text: string, key: string, title?: string, wrap = false) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className={wrap ? "whitespace-normal text-left uppercase leading-tight" : "uppercase"}
      title={title}
    >
      <SortLabel text={text} sortKey={key} sort={sort} />
    </button>
  );

  // Son katagi: tor ekranda ham bir qatorda ("12 582,5" bo'linib ketmasin), "Jami" qatori qalin
  const numCls = (r: BatalonTableRow) =>
    `whitespace-nowrap tabular-nums${r.isTotal ? " font-semibold" : ""}`;

  const batalonColumns: TableColumn<BatalonTableRow>[] = [
    {
      key: "name",
      header: tt("Batalon", "Батальон"),
      cell: (r) =>
        r.isTotal ? (
          <span className="font-semibold">{tt("Jami", "Итого")}</span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="font-medium">{r.batalon_name}</span>
            {batalon?.id === String(r.batalon_id) && <Badge tone="primary">{tt("Filtr", "Фильтр")}</Badge>}
          </span>
        ),
    },
    {
      key: "tasks",
      header: tt("Tadbirlar", "Мероприятия"),
      align: "right",
      cell: (r) => <span className={numCls(r)}>{count(r.task_count)}</span>,
    },
    {
      key: "hours",
      header: tt("Soat", "Часы"),
      align: "right",
      cell: (r) => <span className={numCls(r)}>{qty(r.hours)}</span>,
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      cell: (r) => <span className="whitespace-nowrap font-semibold tabular-nums">{formatSum(r.summa)}</span>,
    },
    {
      key: "paid",
      header: tt("To'langan shartnomalardan", "Из оплаченных договоров"),
      align: "right",
      cell: (r) => <span className="whitespace-nowrap tabular-nums text-success">{formatSum(r.paid_summa)}</span>,
    },
    {
      key: "unpaid",
      header: tt("To'lanmagan shartnomalarda", "В неоплаченных договорах"),
      align: "right",
      cell: (r) => (
        <span
          className={`whitespace-nowrap tabular-nums ${r.unpaid_summa > 0 ? "text-warning" : "text-muted-foreground"}`}
          title={`${tt("To'lanmagan shartnomalar", "Неоплаченных договоров")}: ${count(r.unpaid_contract_count)}`}
        >
          {formatSum(r.unpaid_summa)}
        </span>
      ),
    },
    {
      key: "share",
      header: tt("Ulush", "Доля"),
      align: "right",
      width: "8rem",
      cell: (r) => (r.isTotal ? null : <MiniBar percent={r.summa_percent} />),
    },
  ];

  const listColumns: TableColumn<MuddatliRow>[] = [
    {
      key: "doc_num",
      header: sortHeader("№", "doc_num", tt("Shartnoma raqami", "Номер договора")),
      width: "4.5rem",
      align: "center",
      cell: (r) => <span className="font-medium tabular-nums">{r.doc_num}</span>,
    },
    {
      key: "doc_date",
      header: sortHeader(tt("Sana", "Дата"), "doc_date", tt("Shartnoma sanasi", "Дата договора")),
      width: "6.75rem",
      align: "center",
      cell: (r) => <span className="whitespace-nowrap tabular-nums">{formatDate(r.doc_date)}</span>,
    },
    {
      key: "organization",
      header: sortHeader(tt("Tashkilot", "Организация"), "organization_name"),
      cell: (r) => (
        <div className="min-w-0">
          <span className="block truncate" title={r.organization_name ?? ""}>
            {r.organization_name || "—"}
          </span>
          {r.organization_str && (
            <span className="block truncate text-[0.75rem] tabular-nums text-muted-foreground">
              {tt("INN", "ИНН")}: {r.organization_str}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "event",
      header: tt("Tadbir", "Мероприятие"),
      cell: (r) => {
        // Topshiriqning o'zi: necha kishi, necha soat (muddatli xizmatchilardan tashqari ham)
        const sub = [
          r.worker_number ? tt(`${r.worker_number} kishi`, `${r.worker_number} чел.`) : "",
          r.task_time ? tt(`${qty(r.task_time)} soat`, `${qty(r.task_time)} ч`) : "",
          r.comment ?? "",
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <div className="min-w-0">
            <span className="block truncate" title={r.address ?? ""}>
              {r.address || "—"}
            </span>
            {sub && (
              <span className="block truncate text-[0.75rem] text-muted-foreground" title={sub}>
                {sub}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "event_date",
      header: sortHeader(tt("Tadbir sanasi", "Дата события"), "event_date"),
      width: "9.5rem",
      hideOnMobile: true,
      cell: (r) => (
        <div className="min-w-0 whitespace-nowrap tabular-nums">
          <span className="block truncate" title={eventDates(r)}>
            {eventDates(r) || "—"}
          </span>
          {r.start_time && r.end_time && (
            <span className="block text-[0.75rem] text-muted-foreground">
              {r.start_time}–{r.end_time}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "batalon",
      header: sortHeader(tt("Batalon", "Батальон"), "batalon_name"),
      width: "6rem",
      align: "center",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums">{r.batalon_name}</span>,
    },
    {
      key: "hours",
      header: sortHeader(tt("Soat", "Часы"), "hours"),
      width: "5.5rem",
      align: "right",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums">{qty(r.hours)}</span>,
    },
    {
      key: "summa",
      header: sortHeader(tt("Summa", "Сумма"), "summa"),
      width: "9rem",
      align: "right",
      cell: (r) => <span className="whitespace-nowrap font-medium tabular-nums">{formatSum(r.summa)}</span>,
    },
    {
      // Buyurtmachidan shartnomaga pul tushganmi (kirimlar). Oddiy matn, tugma
      // emas: ilgari "To'lov" nomli belgi xizmatchiga to'lov tugmasidek ko'rinardi
      key: "kirim",
      header: sortHeader(
        tt("Shartnoma bo'yicha kirim", "Поступления по договору"),
        "pay_status",
        tt(
          "Buyurtmachidan shartnomaga pul tushganmi (kirimlar bo'yicha)",
          "Поступили ли деньги от заказчика по договору (по приходам)"
        ),
        true
      ),
      width: "8.75rem",
      cell: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap font-medium ${KIRIM_CLS[r.pay_status]}`}
          title={`${tt("Shartnoma summasi", "Сумма договора")}: ${formatSum(r.contract_summa ?? 0)}\n${tt(
            "Tushgan",
            "Поступило"
          )}: ${formatSum(r.contract_paid ?? 0)}`}
        >
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
          {kirimLabel(r.pay_status)}
        </span>
      ),
    },
    {
      // Shartnomaniki: bir shartnomaning bir necha tadbiri bo'lsa har qatorda
      // takrorlanadi — to'g'ri jami ro'yxat sarlavhasida (har shartnoma bir marta)
      key: "debt",
      header: sortHeader(
        tt("Qarzdorlik", "Задолженность"),
        "contract_debt",
        tt(
          "Shartnoma bo'yicha qolgan qarz: shartnoma summasi − tushgan pul",
          "Остаток долга по договору: сумма договора − поступило"
        )
      ),
      width: "8.5rem",
      align: "right",
      cell: (r) =>
        r.contract_debt > 0 ? (
          <span className="whitespace-nowrap font-medium tabular-nums text-destructive">
            {formatSum(r.contract_debt)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        flush
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker
                defaultValue={period.fromDate}
                onChange={(val) => setPeriod({ ...period, fromDate: val })}
              />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker
                defaultValue={period.toDate}
                onChange={(val) => setPeriod({ ...period, toDate: val })}
              />
            </div>

            <div className="w-full sm:w-64">
              <Input
                inputSize="sm"
                startIcon={<Search />}
                placeholder={tt("№, tashkilot, manzil yoki batalon", "№, организация, адрес или батальон")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-44">
              <Select
                selectSize="sm"
                aria-label={tt("Batalon", "Батальон")}
                placeholder={tt("Barcha batalonlar", "Все батальоны")}
                options={batalonOptions}
                value={batalon?.id ?? ""}
                onChange={(e) => selectBatalon(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-52">
              <Select
                selectSize="sm"
                aria-label={tt("Shartnoma to'lovi", "Оплата договора")}
                placeholder={tt("Barcha shartnomalar", "Все договоры")}
                options={[
                  { value: "paid", label: tt("To'langan shartnomalar", "Оплаченные договоры") },
                  { value: "unpaid", label: tt("To'lanmagan shartnomalar", "Неоплаченные договоры") },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              />
            </div>

            <FilterActions onRefresh={() => fetchData()} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              title={`${tt("Muddatli harbiy xizmatchilar ishtirokidagi tadbirlar", "Мероприятия с участием срочнослужащих")} ${periodTitle}`}
              columns={listExportColumns()}
              extraItems={batalonExportItems}
              fetchRows={async () => {
                const res = await request.get(API_PATH, { params: listParams(1, EXPORT_ALL_LIMIT) });
                return (res?.data?.data ?? []) as MuddatliRow[];
              }}
            />
          </Toolbar>
        }
        footer={
          <>
            {/* Besh katakcha bir qatorda (ro'yxatga joy qolsin); nomi uzunroq katakchalar kengroq */}
            <SummaryRow className="sm:grid-cols-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_minmax(0,1.05fr)_minmax(0,0.6fr)_minmax(0,0.6fr)]">
              <SummaryTile
                label={
                  <span title={tt("Muddatli harbiy xizmatchilar ishtirokidagi pul", "Деньги за участие срочнослужащих")}>
                    {tt("Jami (ishtirok puli)", "Итого (за участие)")}
                  </span>
                }
                value={formatSum(totals?.summa ?? 0)}
                tone="primary"
              />
              <SummaryTile
                label={
                  <span title={tt("Shundan to'liq to'langan shartnomalardan", "Из них по полностью оплаченным договорам")}>
                    {tt("Shundan to'langan shartnomalardan", "Из них по оплаченным договорам")}
                  </span>
                }
                value={
                  <>
                    {formatSum(totals?.paid_summa ?? 0)}
                    <ContractCount n={totals?.paid_contract_count} />
                  </>
                }
                tone="success"
              />
              <SummaryTile
                label={
                  <span title={tt("To'liq to'lanmagan (qisman to'langan ham) shartnomalarda", "В не полностью оплаченных договорах (в т.ч. частично)")}>
                    {tt("To'lanmagan shartnomalarda", "В неоплаченных договорах")}
                  </span>
                }
                value={
                  <>
                    {formatSum(totals?.unpaid_summa ?? 0)}
                    <ContractCount n={totals?.unpaid_contract_count} />
                  </>
                }
                tone={(totals?.unpaid_summa ?? 0) > 0 ? "warning" : "neutral"}
              />
              {/* Har katakchada bitta son: "479 / 33 114" ko'rinishida ming xonasidagi
                  bo'shliq tufayli soat ikki son ("33" va "114") bo'lib o'qilardi */}
              <SummaryTile
                label={
                  <span title={tt("Muddatli harbiy xizmatchilar ishtirok etgan tadbirlar soni", "Количество мероприятий с участием срочнослужащих")}>
                    {tt("Tadbirlar soni", "Мероприятий")}
                  </span>
                }
                value={count(totals?.task_count)}
              />
              <SummaryTile
                label={
                  <span title={tt("Muddatli harbiy xizmatchilarning jami ishlagan soati (kishi-soat)", "Всего отработано срочнослужащими (чел.-ч)")}>
                    {tt("Jami soat", "Всего часов")}
                  </span>
                }
                value={qty(totals?.hours)}
              />
            </SummaryRow>

            <Paginatsiya
              currentPage={page}
              setCurrentPage={setPage}
              totalPages={meta?.pageCount ?? 0}
              limet={limit}
              setLimet={setLimit}
              count={meta?.count ?? 0}
            />
          </>
        }
      >
        {/* Batalonlar kesimi — qisqa jadval, o'z joyida aylanadi; ro'yxatga joy qolsin */}
        {(loading && !meta) || batalonRows.length ? (
          <section className="shrink-0 border-b border-border">
            <SectionHead
              title={tt("Batalonlar kesimida", "В разрезе батальонов")}
              hint={tt("Qatorni bosing — ro'yxat shu batalon bo'yicha", "Нажмите на строку — список по батальону")}
            />
            <DataTable
              columns={batalonColumns}
              rows={batalonRows}
              keyOf={(r) => (r.isTotal ? "total" : r.batalon_id)}
              loading={loading && !meta}
              loadingRows={3}
              // Past ekranda ro'yxatga joy qolsin: ekran balandligining ~choragi
              className="max-h-[min(12.5rem,24dvh)]"
              onRowClick={toggleBatalonRow}
            />
          </section>
        ) : null}

        <section className="min-h-0 lg:flex-1">
          <SectionHead
            title={tt("Tadbirlar ro'yxati", "Список мероприятий")}
            right={
              meta ? (
                <>
                  <span>
                    {count(meta.count)} {tt("ta", "шт.")}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-foreground">{formatSum(meta.list_summa ?? 0)}</span>
                  {!!meta.list_debt && (
                    <>
                      <span aria-hidden>·</span>
                      <span
                        title={tt(
                          "Ro'yxatdagi shartnomalarning qolgan qarzi — har shartnoma bir marta hisoblangan",
                          "Остаток долга по договорам списка — каждый договор учтён один раз"
                        )}
                      >
                        {tt("qarzdorlik", "задолженность")}{" "}
                        <span className="font-medium text-destructive">{formatSum(meta.list_debt)}</span>{" "}
                        ({count(meta.list_debt_contract_count)} {tt("ta shartnoma", "дог.")})
                      </span>
                    </>
                  )}
                </>
              ) : null
            }
          />
          <DataTable
            columns={listColumns}
            rows={rows}
            keyOf={(r) => `${r.task_id}-${r.batalon_id}`}
            loading={loading}
            loadingRows={8}
            fixedLayout
            // Qat'iy kengliklar yig'indisi ~58,5rem (telefonda ~37,5rem): tor ekranda
            // Tashkilot va Tadbir ustunlari yo'qolib ketmasin — jadval gorizontal aylanadi
            className="[&_table]:min-w-[60rem] md:[&_table]:min-w-[81rem]"
            empty={
              <EmptyState
                icon={Users}
                title={tt("Tadbirlar topilmadi", "Мероприятия не найдены")}
                description={tt(
                  "Tanlangan davr va filtrlar bo'yicha muddatli harbiy xizmatchilar ishtirok etgan tadbir yo'q.",
                  "За выбранный период и фильтры нет мероприятий с участием срочнослужащих."
                )}
              />
            }
          />
        </section>
      </ListCard>
    </div>
  );
}
