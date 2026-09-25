import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarClock,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  FileText,
  Loader2,
  RotateCcw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useDebounce } from "use-debounce";

import useApi from "@/services/api";
import { formatSum, tt } from "@/utils";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import ExportButtons from "@/Components/ExportButtons";
import { type ExportColumn } from "@/lib/tableExport";
import { PAYMENT_DUE_DAYS, debtStatusHint, debtStatusLabel } from "@/lib/debtStatus";
import ContractsModal from "@/pages/admin/dashboard/components/ContractsModal";
import RegionContractsModal from "@/pages/dashboard/ContractsModal";
import OrgContractsModal from "@/pages/dashboard/OrgContractsModal";
import type { OrganizationDebtRow } from "@/pages/region/dashboard/types";
import { ContractType } from "@/pages/admin/dashboard/types";
import { AgingBars, MonthlyDebtChart, money } from "./charts";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Input,
  MiniBar,
  StatCard,
  type TableColumn,
} from "@/ui";

/**
 * Super-admin "Qarzdorlik tahlili" (eski "Hisobot" o'rniga).
 *
 * Pul qayerda qotib qolgan: qarz holatlari (to'lov tadbirdan 3 kun oldin),
 * muddati o'tgan qarzning yoshi, viloyatlar va eng katta qarzdor
 * tashkilotlar, oylar bo'yicha qolgan qarz. Viloyat qatori bosilsa —
 * butun sahifa shu viloyatga filtrlanadi; holat kartasi bosilsa —
 * shartnomalar ro'yxati ochiladi.
 * Manba: GET admin/dashboard/overview?from&to[&region_id].
 *
 * scope="region" — viloyat foydalanuvchisi (eski "Hisobot" o'rniga): faqat
 * o'z viloyati (region/dashboard/debt-overview), viloyatlar jadvali yo'q,
 * tashkilot qatori bosilsa uning qarzdor shartnomalari ochiladi.
 */

type Summary = {
  contract_count: number;
  contract_summa: number;
  paid_summa: number;
  debt_summa: number;
  debt_count: number;
  not_due_count: number;
  not_due_summa: number;
  late_count: number;
  late_summa: number;
  overdue_count: number;
  overdue_summa: number;
  debtor_orgs: number;
};

type RegionRow = {
  region_id: number;
  region_name: string;
  contract_count: number;
  contract_summa: number;
  paid_summa: number;
  debt_summa: number;
  debt_count: number;
  not_due_summa: number;
  late_summa: number;
  overdue_summa: number;
};

type OrgRow = {
  organization_id: number;
  name: string;
  str: string | null;
  region_name: string;
  debt_count: number;
  debt_summa: number;
  overdue_summa: number;
  max_days: number | null;
};

type Data = {
  summary: Summary;
  aging: { bucket: string; count: number; summa: number }[];
  regions: RegionRow[];
  organizations: OrgRow[];
  monthly: { month: string; contract_summa: number; paid_summa: number; debt_summa: number }[];
};

const AGING = (): { id: string; label: string }[] => [
  { id: "0_30", label: tt("30 kungacha", "до 30 дней") },
  { id: "31_90", label: tt("31–90 kun", "31–90 дней") },
  { id: "91_180", label: tt("91–180 kun", "91–180 дней") },
  { id: "181_365", label: tt("181–365 kun", "181–365 дней") },
  { id: "365_plus", label: tt("1 yildan ko'p", "более 1 года") },
];

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const regionExport = (): ExportColumn<RegionRow>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Viloyat", "Регион"), value: (r) => r.region_name },
  { header: tt("Shartnoma summasi", "Сумма договоров"), value: (r) => formatSum(r.contract_summa), excelValue: (r) => r.contract_summa, align: "right" },
  { header: tt("To'langan", "Оплачено"), value: (r) => formatSum(r.paid_summa), excelValue: (r) => r.paid_summa, align: "right" },
  { header: tt("Qarz", "Долг"), value: (r) => formatSum(r.debt_summa), excelValue: (r) => r.debt_summa, align: "right" },
  { header: debtStatusLabel("not_due"), value: (r) => formatSum(r.not_due_summa), excelValue: (r) => r.not_due_summa, align: "right" },
  { header: debtStatusLabel("late"), value: (r) => formatSum(r.late_summa), excelValue: (r) => r.late_summa, align: "right" },
  { header: debtStatusLabel("overdue"), value: (r) => formatSum(r.overdue_summa), excelValue: (r) => r.overdue_summa, align: "right" },
];

const orgExport = (): ExportColumn<OrgRow>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Tashkilot", "Организация"), value: (r) => r.name },
  { header: tt("STIR", "ИНН"), value: (r) => r.str || "" },
  { header: tt("Viloyat", "Регион"), value: (r) => r.region_name },
  { header: tt("Shartnomalar", "Договоры"), value: (r) => r.debt_count, align: "center" },
  { header: tt("Qarz", "Долг"), value: (r) => formatSum(r.debt_summa), excelValue: (r) => r.debt_summa, align: "right" },
  { header: debtStatusLabel("overdue"), value: (r) => formatSum(r.overdue_summa), excelValue: (r) => r.overdue_summa, align: "right" },
  { header: tt("Eng eski (kun)", "Старейший (дн.)"), value: (r) => r.max_days ?? "", align: "center" },
];

// "Yana ko'rsatish" har bosilganda qo'shiladigan tashkilotlar soni
const ORG_PAGE = 20;

// Backend ORG_SORTS kalitlari (admin/dashboard/overview.js)
type OrgSortKey = "days" | "debt" | "overdue" | "count" | "name" | "region";

const dash = (v: number, cls = "") =>
  v ? <span className={`tabular-nums ${cls}`}>{money(v)}</span> : <span className="text-muted-foreground">—</span>;

export default function AdminDebtOverview({ scope = "admin" }: { scope?: "admin" | "region" }) {
  const isRegion = scope === "region";
  const [org, setOrg] = useState<OrgRow | null>(null);
  const api = useApi();
  const [from, setFrom] = useState("2020-01-01");
  const [to, setTo] = useState(iso(new Date()));
  const [region, setRegion] = useState<RegionRow | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ContractType | null>(null);
  // Qarzdor tashkilotlar — alohida so'rov: server tomonda saralash, qidiruv
  // va sahifalash ("Yana N ta" bilan ro'yxat pastga o'sadi)
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [orgCount, setOrgCount] = useState(0);
  const [orgPage, setOrgPage] = useState(1);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgSort, setOrgSort] = useState<{ key: OrgSortKey; dir: "asc" | "desc" }>({
    key: "days",
    dir: "desc",
  });
  const [orgSearch, setOrgSearch] = useState("");
  const [orgSearchText] = useDebounce(orgSearch.trim(), 400);

  const orgsUrl = (page: number, limit: number) =>
    (isRegion
      ? `region/dashboard/debt-overview/organizations?from=${from}&to=${to}`
      : `admin/dashboard/overview/organizations?from=${from}&to=${to}` +
        (region ? `&region_id=${region.region_id}` : "")) +
    `&page=${page}&limit=${limit}&sort=${orgSort.key}&dir=${orgSort.dir}` +
    (orgSearchText ? `&search=${encodeURIComponent(orgSearchText)}` : "");

  // Eskirgan javob (masalan qidiruvda tez yozilganda) yangisini bosib ketmasin
  const orgReq = useRef(0);

  const fetchOrgs = async (page: number) => {
    if (!from || !to) return;
    const reqId = ++orgReq.current;
    setOrgLoading(true);
    try {
      const res = await api.get<OrgRow[]>(orgsUrl(page, ORG_PAGE));
      if (reqId !== orgReq.current) return;
      if (res?.success && Array.isArray(res.data)) {
        const rows = res.data;
        setOrgs((prev) => (page === 1 ? rows : [...prev, ...rows]));
        setOrgCount((res as any).meta?.count ?? 0);
        setOrgPage(page);
      }
    } finally {
      if (reqId === orgReq.current) setOrgLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, region?.region_id, orgSort.key, orgSort.dir, orgSearchText]);

  const toggleOrgSort = (key: OrgSortKey) =>
    setOrgSort((cur) =>
      cur.key !== key
        ? { key, dir: key === "name" || key === "region" ? "asc" : "desc" }
        : { key, dir: cur.dir === "desc" ? "asc" : "desc" }
    );

  // Sarlavha — bosilsa server tomonda qayta saralanadi (butun ro'yxat bo'yicha)
  const sortHead = (key: OrgSortKey, label: string, align: "left" | "right" | "center" = "left") => {
    const active = orgSort.key === key;
    const Icon = !active ? ChevronsUpDown : orgSort.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleOrgSort(key)}
        className={`inline-flex w-full items-center gap-1 uppercase transition-colors hover:text-foreground ${
          align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""
        } ${active ? "text-foreground" : ""}`}
      >
        {label}
        <Icon className="size-3 shrink-0" />
      </button>
    );
  };

  // Eksport — ro'yxatning hammasi (ekrandagi qism emas)
  const fetchAllOrgs = async () => {
    const out: OrgRow[] = [];
    for (let page = 1; ; page++) {
      const res = await api.get<OrgRow[]>(orgsUrl(page, 500));
      const rows = res?.success && Array.isArray(res.data) ? res.data : [];
      out.push(...rows);
      if (rows.length < 500) break;
    }
    return out;
  };

  const load = async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const res = await api.get<Data>(
        isRegion
          ? `region/dashboard/debt-overview?from=${from}&to=${to}`
          : `admin/dashboard/overview?from=${from}&to=${to}` +
              (region ? `&region_id=${region.region_id}` : "")
      );
      if (res?.success) setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, region?.region_id]);

  const s = data?.summary;
  // Qidiruv bo'lsa — topilganlar soni, bo'lmasa — jami qarzdorlar
  const orgTotal = orgCount;
  // Shartnomasi yo'q viloyatlar — jadvalda bo'sh qatorlar o'rniga bitta izoh
  const activeRegions = (data?.regions ?? []).filter((r) => r.contract_count > 0);
  const emptyRegions = (data?.regions ?? []).filter((r) => r.contract_count === 0);
  const aging = AGING().map((a) => {
    const row = data?.aging.find((x) => x.bucket === a.id);
    return { id: a.id, label: a.label, summa: row?.summa ?? 0, count: row?.count ?? 0 };
  });

  const regionColumns: TableColumn<RegionRow>[] = [
    {
      key: "region",
      header: tt("Viloyat", "Регион"),
      cell: (r) => <span className="font-medium text-foreground">{r.region_name}</span>,
      sortValue: (r) => r.region_name,
    },
    {
      key: "summa",
      header: tt("Shartnoma summasi", "Сумма договоров"),
      align: "right",
      cell: (r) => dash(r.contract_summa),
      sortValue: (r) => r.contract_summa,
      hideOnMobile: true,
    },
    {
      key: "paid",
      header: tt("Undirilgan", "Собрано"),
      align: "right",
      cell: (r) => (r.contract_summa ? <MiniBar percent={pct(r.paid_summa, r.contract_summa)} /> : "—"),
      sortValue: (r) => pct(r.paid_summa, r.contract_summa),
    },
    {
      key: "debt",
      header: tt("Qarz", "Долг"),
      align: "right",
      cell: (r) => dash(r.debt_summa, "font-medium text-foreground"),
      sortValue: (r) => r.debt_summa,
    },
    {
      key: "not_due",
      header: debtStatusLabel("not_due"),
      align: "right",
      cell: (r) => dash(r.not_due_summa, "text-primary"),
      sortValue: (r) => r.not_due_summa,
      hideOnMobile: true,
    },
    {
      key: "late",
      header: debtStatusLabel("late"),
      align: "right",
      cell: (r) => dash(r.late_summa, "text-warning"),
      sortValue: (r) => r.late_summa,
    },
    {
      key: "overdue",
      header: debtStatusLabel("overdue"),
      align: "right",
      cell: (r) => dash(r.overdue_summa, "text-destructive"),
      sortValue: (r) => r.overdue_summa,
    },
  ];

  const orgColumns: TableColumn<OrgRow>[] = [
    {
      key: "n",
      header: "№",
      width: "3rem",
      align: "center",
      cell: (_r, i) => <span className="tabular-nums text-muted-foreground">{i + 1}</span>,
    },
    {
      key: "name",
      header: sortHead("name", tt("Tashkilot", "Организация")),
      cell: (r) => (
        // Kenglik chegarasi: aks holda eng uzun nom jadvalni kartadan kengaytiradi
        <div className="min-w-0 max-w-[min(42rem,50vw)]">
          <div className="truncate font-medium text-foreground" title={r.name}>
            {r.name}
          </div>
          {r.str && (
            <div className="text-[0.6875rem] text-muted-foreground">
              {tt("STIR", "ИНН")}: {r.str}
            </div>
          )}
        </div>
      ),
    },
    // Viloyat filtri tanlanganda ustun ortiqcha — hammasi bitta viloyat
    ...(region || isRegion
      ? []
      : [
          {
            key: "region",
            header: sortHead("region", tt("Viloyat", "Регион")),
            cell: (r: OrgRow) => <span className="whitespace-nowrap text-muted-foreground">{r.region_name}</span>,
            hideOnMobile: true,
          },
        ]),
    {
      key: "count",
      header: sortHead("count", tt("Shartnoma", "Договоры"), "center"),
      align: "center",
      // Bosilsa — tashkilotning qarzdor shartnomalari ro'yxati
      cell: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOrg(r);
          }}
          title={tt("Shartnomalar ro'yxati", "Список договоров")}
          className="inline-flex min-w-[2.25rem] items-center justify-center gap-1 border border-border px-2 py-0.5 tabular-nums text-primary transition-colors hover:border-primary hover:bg-primary/10"
        >
          {r.debt_count}
          <FileText className="size-3" />
        </button>
      ),
      hideOnMobile: true,
    },
    {
      key: "debt",
      header: sortHead("debt", tt("Qarz", "Долг"), "right"),
      align: "right",
      cell: (r) => dash(r.debt_summa, "font-medium text-foreground"),
    },
    {
      key: "overdue",
      header: sortHead("overdue", debtStatusLabel("overdue"), "right"),
      align: "right",
      cell: (r) => dash(r.overdue_summa, "text-destructive"),
      hideOnMobile: true,
    },
    {
      key: "days",
      header: sortHead("days", tt("Kechikish", "Просрочка"), "right"),
      align: "right",
      cell: (r) =>
        r.max_days != null ? (
          <span className={`tabular-nums ${r.max_days > 90 ? "text-destructive" : "text-warning"}`}>
            {r.max_days} {tt("kun", "дн.")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  const statusCard = (type: "not_due" | "late" | "overdue", icon: typeof Clock, tone: "primary" | "warning" | "danger") => (
    <StatCard
      icon={icon}
      tone={tone}
      loading={loading && !s}
      label={debtStatusLabel(type)}
      value={money(s?.[`${type}_summa`] ?? 0)}
      hint={`${s?.[`${type}_count`] ?? 0} ${tt("ta shartnoma", "договоров")}`}
      onClick={() => setModal(type)}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[1rem] font-semibold text-foreground">
            {tt("Qarzdorlik tahlili", "Анализ задолженности")}
          </h1>
          {region && (
            <Button variant="outline" size="sm" onClick={() => setRegion(null)}>
              {region.region_name}
              <X />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <SpecialDatePicker defaultValue={from} onChange={setFrom} />
            <span className="text-muted-foreground">—</span>
            <SpecialDatePicker defaultValue={to} onChange={setTo} />
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RotateCcw />
            {tt("Yangilash", "Обновить")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          tone="brand"
          loading={loading && !s}
          label={tt("Jami qarz", "Общий долг")}
          value={money(s?.debt_summa ?? 0)}
          hint={tt(
            `${s?.debt_count ?? 0} ta shartnoma · undirilgan ${pct(s?.paid_summa ?? 0, s?.contract_summa ?? 0).toFixed(1)}%`,
            `${s?.debt_count ?? 0} договоров · собрано ${pct(s?.paid_summa ?? 0, s?.contract_summa ?? 0).toFixed(1)}%`
          )}
          onClick={() => setModal("debt")}
        />
        {statusCard("not_due", CalendarClock, "primary")}
        {statusCard("late", Clock, "warning")}
        {statusCard("overdue", AlertTriangle, "danger")}
      </div>

      {/* Holatlar izohi — ixcham legenda */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border border-border bg-card px-4 py-2.5 text-[0.75rem] text-muted-foreground">
        <span className="font-medium text-foreground">
          {tt(
            `To'lov muddati — tadbirdan ${PAYMENT_DUE_DAYS} kun oldin`,
            `Срок оплаты — за ${PAYMENT_DUE_DAYS} дня до мероприятия`
          )}
        </span>
        {(
          [
            ["not_due", "bg-primary", tt("muddat hali kelmagan", "срок ещё не наступил")],
            ["late", "bg-warning", tt("muddat o'tdi, tadbir hali oldinda", "срок прошёл, мероприятие впереди")],
            ["overdue", "bg-destructive", tt("tadbir boshlangan, pul tushmagan", "мероприятие началось, оплаты нет")],
          ] as const
        ).map(([t, dot, text]) => (
          <span key={t} className="inline-flex items-center gap-1.5" title={debtStatusHint(t)}>
            <span className={`size-2 shrink-0 ${dot}`} />
            <b className="font-medium text-foreground">{debtStatusLabel(t)}</b>
            <span>— {text}</span>
          </span>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{tt("Muddati o'tgan qarz yoshi", "Возраст просроченного долга")}</CardTitle>
            <p className="text-[0.75rem] text-muted-foreground">
              {tt("Tadbir boshlanganidan beri o'tgan kunlar", "Дней с начала мероприятия")}
            </p>
          </CardHeader>
          <CardContent>
            <AgingBars items={aging} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{tt("Oylar bo'yicha qolgan qarz", "Остаток долга по месяцам")}</CardTitle>
            <p className="text-[0.75rem] text-muted-foreground">
              {tt("Shartnoma oyi bo'yicha — hali to'lanmagan summa", "По месяцу договора — ещё не оплаченная сумма")}
            </p>
          </CardHeader>
          <CardContent>
            {data?.monthly.length ? (
              <MonthlyDebtChart data={data.monthly.slice(-24)} />
            ) : (
              <p className="text-[0.8125rem] text-muted-foreground">{tt("Ma'lumot yo'q", "Нет данных")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!region && !isRegion && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <div>
              <CardTitle>{tt("Viloyatlar kesimida", "По регионам")}</CardTitle>
              <p className="text-[0.75rem] text-muted-foreground">
                {tt("Qatorni bosing — sahifa shu viloyat bo'yicha", "Нажмите строку — страница по этому региону")}
              </p>
            </div>
            <ExportButtons
              title={tt("Qarzdorlik — viloyatlar", "Задолженность — регионы")}
              columns={regionExport()}
              fetchRows={async () => activeRegions}
            />
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={regionColumns}
              rows={activeRegions}
              keyOf={(r) => r.region_id}
              loading={loading && !data}
              onRowClick={(r) => setRegion(r)}
              empty={tt("Tanlangan davrda shartnoma yo'q", "За период договоров нет")}
            />
            {emptyRegions.length > 0 && (
              <p
                className="border-t border-border px-4 py-2.5 text-[0.75rem] text-muted-foreground"
                title={emptyRegions.map((r) => r.region_name).join(", ")}
              >
                {tt(
                  `Yana ${emptyRegions.length} ta viloyatda bu davrda shartnoma yo'q`,
                  `Ещё в ${emptyRegions.length} регионах за период договоров нет`
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              {tt("Qarzdor tashkilotlar", "Организации-должники")}
              {orgTotal > 0 && (
                <span className="text-[0.75rem] font-normal tabular-nums text-muted-foreground">
                  {orgTotal}
                </span>
              )}
            </CardTitle>
            <p className="text-[0.75rem] text-muted-foreground">
              {tt(
                "Qatorni yoki shartnoma sonini bosing — tashkilotning qarzdor shartnomalari",
                "Нажмите строку или число договоров — договоры организации с долгом"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[16rem] max-sm:w-[11rem]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                inputSize="sm"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder={tt("Nomi yoki STIR (INN)", "Название или ИНН")}
                className="pl-8 pr-7"
              />
              {orgSearch && (
                <button
                  type="button"
                  onClick={() => setOrgSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={tt("Tozalash", "Очистить")}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <ExportButtons
              title={tt("Qarzdor tashkilotlar", "Организации-должники")}
              columns={orgExport()}
              fetchRows={fetchAllOrgs}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={orgColumns}
            rows={orgs}
            keyOf={(r) => r.organization_id}
            onRowClick={(r) => setOrg(r)}
            loading={orgLoading && orgs.length === 0}
            empty={
              orgSearchText
                ? tt(`"${orgSearchText}" bo'yicha qarzdor topilmadi`, `По запросу "${orgSearchText}" должников нет`)
                : tt("Qarzdor yo'q", "Должников нет")
            }
            // Ro'yxat sahifa bo'ylab pastga o'sadi — ichki skroll yo'q
            stickyHeader={false}
          />
          {orgs.length < orgTotal && (
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border px-4 py-3">
              <span className="text-[0.75rem] tabular-nums text-muted-foreground">
                {tt(`${orgs.length} / ${orgTotal} ko'rsatilgan`, `Показано ${orgs.length} из ${orgTotal}`)}
              </span>
              <Button variant="outline" size="sm" onClick={() => fetchOrgs(orgPage + 1)} disabled={orgLoading}>
                {orgLoading ? <Loader2 className="animate-spin" /> : <ChevronDown />}
                {tt(`Yana ${Math.min(ORG_PAGE, orgTotal - orgs.length)} ta`, `Ещё ${Math.min(ORG_PAGE, orgTotal - orgs.length)}`)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tashkilotning qarzdor shartnomalari — ikkala rolda ham */}
      <OrgContractsModal
        open={Boolean(org)}
        onClose={() => setOrg(null)}
        to={to}
        endpoint={
          isRegion
            ? "region/dashboard/organization-debt-contracts"
            : "admin/dashboard/organization-debt-contracts"
        }
        organization={
          org
            ? ({
                organization_id: org.organization_id,
                organization_name: org.name,
                organization_str: org.str ?? undefined,
                contract_count: org.debt_count,
                total_summa: 0,
                paid_summa: 0,
                debt_summa: org.debt_summa,
              } as OrganizationDebtRow)
            : null
        }
      />

      {isRegion ? (
        <RegionContractsModal
          open={modal !== null}
          onClose={() => setModal(null)}
          type={modal ?? "debt"}
          from={from}
          to={to}
        />
      ) : (
        <ContractsModal
          isOpen={modal !== null}
          onClose={() => setModal(null)}
          type={modal ?? "debt"}
          regionId={region?.region_id ?? null}
          from={from}
          to={to}
        />
      )}
    </div>
  );
}
