import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  Building2,
  Download,
  FileText,
  HandCoins,
  PieChart,
  Receipt,
  RotateCw,
  Search,
  Shield,
  TrendingDown,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { formatInn, formatSum, tt } from "@/utils";
import useApi, { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { RootState } from "@/Redux/store";
import type {
  BatalonStatRow,
  BatalonStatsResponse,
  ContractType,
  DashboardCountResponse,
  DistributionResponse,
  KpiData,
  OrganizationDebtRow,
  RedWorkersResponse,
  SoldierTaskRow,
  SoldierTasksResponse,
} from "@/pages/region/dashboard/types";
import ContractsModal from "./ContractsModal";
import OrgContractsModal from "./OrgContractsModal";
import RedWorkersModal from "./RedWorkersModal";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Donut,
  EmptyState,
  Input,
  Legend,
  Modal,
  Skeleton,
  StatCard,
  chartColor,
  type TableColumn,
} from "@/ui";

/* ── Formatlash ───────────────────────────────────────────────────── */

/** Katta summani qisqartiradi: 1 234 567 → 1,2 mln */
function compactSum(v?: number): string {
  const n = v ?? 0;
  if (Math.abs(n) >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(2).replace(".", ",")} ${tt("mlrd", "млрд")}`;
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(".", ",")} ${tt("mln", "млн")}`;
  if (Math.abs(n) >= 1_000)
    return `${(n / 1_000).toFixed(0)} ${tt("ming", "тыс")}`;
  return String(n);
}

const fullSum = (v?: number) => formatSum(v ?? 0) || "0";
const num = (v?: number) => (v ?? 0).toLocaleString("ru-RU");
const pct = (part?: number, total?: number) =>
  total && total > 0 ? ((part ?? 0) / total) * 100 : 0;

export default function RegionDashboard() {
  const api = useApi();
  const { startDate, endDate } = useSelector((s: RootState) => s.defaultDate);

  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<DashboardCountResponse | null>(null);
  const [dist, setDist] = useState<DistributionResponse | null>(null);
  const [red, setRed] = useState<RedWorkersResponse | null>(null);
  const [soldier, setSoldier] = useState<SoldierTasksResponse | null>(null);
  const [batalon, setBatalon] = useState<BatalonStatsResponse | null>(null);

  // Qarzdorlik bloki o'z filtrlariga ega — alohida yuklanadi
  const [debtRows, setDebtRows] = useState<OrganizationDebtRow[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [debtLoading, setDebtLoading] = useState(true);
  const [debtSearch, setDebtSearch] = useState("");

  const [contractsType, setContractsType] = useState<ContractType>("all");
  const [contractsOpen, setContractsOpen] = useState(false);
  const [redOpen, setRedOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDebtRow | null>(null);
  const [selectedBatalon, setSelectedBatalon] = useState<BatalonStatRow | null>(null);
  const [selectedSoldier, setSelectedSoldier] = useState<SoldierTaskRow | null>(null);

  /* ── Asosiy ma'lumotlar ────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const range = `from=${startDate}&to=${endDate}`;

      const [countRes, distRes, redRes, soldierRes, batalonRes] =
        await Promise.all([
          api.get<DashboardCountResponse>(`region/dashboard/count?${range}`),
          api.get<DistributionResponse>(`region/dashboard/distribution?${range}`),
          api.get<RedWorkersResponse>(`region/dashboard/red-border?${range}`),
          api.get<SoldierTasksResponse>(`region/dashboard/soldier-tasks?${range}`),
          api.get<BatalonStatsResponse>(`region/dashboard/batalon-stats?${range}`),
        ]);

      if (countRes?.success) setCount(countRes.data);
      if (distRes?.success) setDist(distRes.data);
      if (redRes?.success) setRed(redRes.data);
      if (soldierRes?.success) setSoldier(soldierRes.data);
      if (batalonRes?.success) setBatalon(batalonRes.data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── Qarzdor tashkilotlar ──────────────────────────────────────── */
  const fetchDebt = useCallback(async () => {
    setDebtLoading(true);
    try {
      // To'liq ro'yxat olinadi — kesib qo'yilmaydi
      const qs = new URLSearchParams({ to: endDate, page: "1", limit: "1000" });

      const res = await api.get<OrganizationDebtRow[]>(
        `region/dashboard/organization-debt?${qs.toString()}`
      );
      if (res?.success) {
        setDebtRows(Array.isArray(res.data) ? res.data : []);
        setTotalDebt((res as any).meta?.total_debt || 0);
      }
    } catch (e) {
      console.error("Debt fetch error:", e);
    } finally {
      setDebtLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  useEffect(() => {
    fetchDebt();
  }, [fetchDebt]);

  /* ── Hosila ma'lumotlar ────────────────────────────────────────── */

  // Javob kutilgan shaklda bo'lmasa ham sahifa yiqilmasligi kerak —
  // ilgari `count` bo'sh massiv bo'lsa `kpi.all.summa` da istisno tashlanib,
  // butun ilova oq ekranga aylanardi.
  const EMPTY_GROUP = { count: 0, summa: 0 };
  const kpi: KpiData = {
    all: count?.all_contract ?? EMPTY_GROUP,
    paid: count?.prixod_contract ?? EMPTY_GROUP,
    debt: count?.rasxod_contract ?? EMPTY_GROUP,
  };

  const batalonRows = useMemo(
    () =>
      [...(Array.isArray(batalon?.rows) ? batalon!.rows : [])].sort(
        (a, b) => b.total_summa - a.total_summa
      ),
    [batalon]
  );

  const soldierRows = useMemo(
    () =>
      [...(Array.isArray(soldier?.rows) ? soldier!.rows : [])].sort(
        (a, b) => b.total_summa - a.total_summa
      ),
    [soldier]
  );

  /** Kirim bo'lgan pulning taqsimoti — sarflanmagan qoldiq bilan */
  const incomeSlices = useMemo(() => {
    const d = dist;
    const qolgan = Math.max((d?.prixod?.summa || 0) - (d?.all_rasxod || 0), 0);
    return [
      {
        id: "s65",
        label: `${tt("Moddiy bazaga", "На материальную базу")} (${d?.summa_65_percent ?? 0}%)`,
        value: d?.summa_65 ?? 0,
        color: chartColor(0),
      },
      {
        id: "rasxod",
        label: `${tt("Hamkor tashkilotlar", "Партнёрские организации")} (${d?.rasxod_summa_percent ?? 0}%)`,
        value: d?.rasxod_summa ?? 0,
        color: chartColor(1),
      },
      {
        id: "s25",
        label: `${tt("Xodimlar uchun premiya", "Премия сотрудникам")} (${d?.summa_25_percent ?? 0}%)`,
        value: d?.summa_25 ?? 0,
        color: chartColor(2),
      },
      {
        id: "qolgan",
        label: tt("Qolgan", "Остаток"),
        value: qolgan,
        color: chartColor(9),
      },
    ].filter((s) => s.value > 0);
  }, [dist]);

  const incomeTotal = dist?.prixod?.summa ?? 0;

  const filteredDebt = useMemo(() => {
    const q = debtSearch.trim().toLowerCase();
    if (!q) return debtRows;
    // Jadvalda ko'rinadigan HAR BIR ustun bo'yicha qidiriladi.
    // Ilgari faqat nom solishtirilardi va INN kiritilganda natija
    // bo'sh chiqib, qidiruv ishlamayotgandek tuyulardi.
    // INN bo'shliq bilan guruhlanib ko'rsatiladi ("123 456 789"),
    // shuning uchun bo'shliqlar olib tashlanib ham taqqoslanadi.
    const qDigits = q.replace(/\s/g, "");
    return debtRows.filter((r) => {
      const inn = String(r.organization_str || "").replace(/\s/g, "");
      return (
        (r.organization_name || "").toLowerCase().includes(q) ||
        (r.organization_address || "").toLowerCase().includes(q) ||
        (qDigits.length > 0 && inn.includes(qDigits))
      );
    });
  }, [debtRows, debtSearch]);

  /* ── Yuklab olishlar ───────────────────────────────────────────── */

  const download = (url: string, filename: string) =>
    authFetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Excel yuklashda xatolik:", err));

  const downloadRedExcel = () =>
    download(
      `${baseUri}/region/dashboard/red-border?from=${startDate}&to=${endDate}&excel=true`,
      "qizil_chegara_xodimlar.xlsx"
    );

  const downloadDebtExcel = () => {
    const qs = new URLSearchParams({ to: endDate, excel: "true" });
    download(
      `${baseUri}/region/dashboard/organization-debt?${qs.toString()}`,
      "qarzdor_tashkilotlar.xlsx"
    );
  };

  /* ── Qarzdorlik jadvali ustunlari ──────────────────────────────── */

  // Jadval `fixedLayout` bilan chiziladi — quyidagi kengliklar aynan
  // bajariladi. `Tashkilot` da kenglik yo'q: u qolgan bo'sh joyni oladi.
  const debtColumns: TableColumn<OrganizationDebtRow>[] = [
    {
      key: "n",
      header: "№",
      width: "52px",
      align: "center",
      cell: (_r, i) => (
        <span className="tabular-nums text-muted-foreground">{i + 1}</span>
      ),
    },
    {
      key: "org",
      header: tt("Tashkilot", "Организация"),
      cell: (r) => (
        <span className="font-medium">{r.organization_name || "—"}</span>
      ),
      sortValue: (r) => r.organization_name || "",
    },
    {
      key: "inn",
      header: tt("INN", "ИНН"),
      align: "center",
      width: "110px",
      hideOnMobile: true,
      // Ba'zi yozuvlarda `str` maydoniga INN o'rniga JSHSHIR yoki matn
      // kiritilgan — uzun qiymat kesiladi, to'lig'i tooltipda qoladi.
      cell: (r) =>
        r.organization_str ? (
          <span
            className="block truncate tabular-nums text-muted-foreground"
            title={r.organization_str}
          >
            {formatInn(r.organization_str)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortValue: (r) => r.organization_str || "",
    },
    {
      key: "address",
      header: tt("Manzil", "Адрес"),
      width: "230px",
      hideOnMobile: true,
      cell: (r) =>
        r.organization_address ? (
          <span
            className="block truncate text-muted-foreground"
            title={r.organization_address}
          >
            {r.organization_address}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortValue: (r) => r.organization_address || "",
    },
    {
      key: "total",
      header: tt("Kelishilgan summa", "Согласованная сумма"),
      align: "right",
      width: "165px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {fullSum(r.total_summa)}
        </span>
      ),
      sortValue: (r) => r.total_summa,
    },
    {
      key: "paid",
      header: tt("To'langan", "Оплачено"),
      align: "right",
      width: "150px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="whitespace-nowrap tabular-nums text-success">
          {fullSum(r.paid_summa)}
        </span>
      ),
      sortValue: (r) => r.paid_summa,
    },
    {
      key: "debt",
      header: tt("Qarzdorlik", "Задолженность"),
      align: "right",
      width: "155px",
      cell: (r) => (
        <span className="whitespace-nowrap font-semibold tabular-nums text-destructive">
          {fullSum(r.debt_summa)}
        </span>
      ),
      sortValue: (r) => r.debt_summa,
    },
  ];

  const redCount = red?.red_count ?? 0;
  const paidPercent = pct(kpi.paid.summa, kpi.all.summa);
  const debtPercent = pct(kpi.debt.summa, kpi.all.summa);

  return (
    <div className="flex flex-col gap-4">
      {/* Sahifa nomi navbar'da turadi. Davr navbar'dagi sana
          tanlagichlaridan ko'rinadi — ular yashiringan kichik
          ekranlar uchun quyidagi qator. */}
      <p className="text-[13px] text-muted-foreground md:hidden">
        {tt("Davr", "Период")}: {startDate} — {endDate}
      </p>

      {/* ═══ 1. Shartnomalar + qizil chegara ═══════════════════════ */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={tt("Jami shartnomalar", "Всего договоров")}
          value={num(kpi.all.count)}
          hint={fullSum(kpi.all.summa)}
          icon={FileText}
          tone="primary"
          loading={loading}
          onClick={() => {
            setContractsType("all");
            setContractsOpen(true);
          }}
        />
        <StatCard
          label={tt("Puli to'lab berilgan", "Оплаченные")}
          value={num(kpi.paid.count)}
          badge={<Badge tone="success">{paidPercent.toFixed(0)}%</Badge>}
          hint={fullSum(kpi.paid.summa)}
          icon={Receipt}
          tone="success"
          loading={loading}
          onClick={() => {
            setContractsType("paid");
            setContractsOpen(true);
          }}
        />
        <StatCard
          label={tt("Qarzdorligi bor", "С задолженностью")}
          value={num(kpi.debt.count)}
          badge={<Badge tone="danger">{debtPercent.toFixed(0)}%</Badge>}
          hint={fullSum(kpi.debt.summa)}
          icon={TrendingDown}
          tone="danger"
          loading={loading}
          onClick={() => {
            setContractsType("debt");
            setContractsOpen(true);
          }}
        />
        <StatCard
          label={tt("Qizil chegaraga tushgan xodimlar", "Сотрудники в красной зоне")}
          value={num(redCount)}
          hint={
            redCount
              ? tt("ro'yxatni ko'rish uchun bosing", "нажмите, чтобы открыть список")
              : tt("chegaradan chiqish yo'q", "превышений нет")
          }
          icon={AlertTriangle}
          tone={redCount ? "warning" : "neutral"}
          loading={loading}
          onClick={redCount ? () => setRedOpen(true) : undefined}
        />
      </div>

      {/* ═══ 2. Kesimlar — uchta diagramma bitta qatorda ══════════ */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <DonutCard
          title={tt(
            "Umumiy batalon va birgadalar kesimida",
            "В разрезе батальонов и бригад"
          )}
          subtitle={tt(
            "Har bir batalon va birgada ulushi",
            "Доля каждого батальона и бригады"
          )}
          icon={Shield}
          loading={loading}
          slices={batalonRows.map((r) => ({
            id: r.batalon_id,
            label: r.batalon_name,
            value: r.total_summa,
          }))}
          centerValue={compactSum(batalon?.grand_summa)}
          centerLabel={tt("umumiy summa", "общая сумма")}
          onSelect={(id) =>
            setSelectedBatalon(
              batalonRows.find((r) => r.batalon_id === id) ?? null
            )
          }
          emptyTitle={tt("Batalon ma'lumoti yo'q", "Нет данных по батальонам")}
        />

        <DonutCard
          title={tt(
            "Muddatli harbiy xizmatchilar kesimida",
            "В разрезе военнослужащих срочной службы"
          )}
          subtitle={tt(
            "Muddatli xizmatchilar tadbirlardagi ulushi",
            "Доля срочнослужащих в мероприятиях"
          )}
          icon={Users}
          loading={loading}
          slices={soldierRows.map((r) => ({
            id: r.batalon_id,
            label: r.batalon_name,
            value: r.total_summa,
          }))}
          centerValue={compactSum(soldier?.total_summa)}
          centerLabel={tt("umumiy summa", "общая сумма")}
          onSelect={(id) =>
            setSelectedSoldier(
              soldierRows.find((r) => r.batalon_id === id) ?? null
            )
          }
          emptyTitle={tt("Topshiriq ma'lumoti yo'q", "Нет данных по задачам")}
        />

        <DonutCard
          title={tt(
            "Kirim bo'lgan pulning taqsimoti",
            "Распределение поступивших средств"
          )}
          subtitle={`${tt("Jami kirim", "Всего поступило")}: ${fullSum(
            incomeTotal
          )} · ${num(dist?.prixod?.count)} ${tt("ta hujjat", "документов")}`}
          icon={PieChart}
          loading={loading}
          slices={incomeSlices}
          centerValue={compactSum(incomeTotal)}
          centerLabel={tt("jami kirim", "всего поступило")}
          /* Ulush yorliqning o'zida ko'rsatilgan (65%, 25%) — hisoblangan
             foizni ham qo'shsak, ikkita raqam bir-biriga ziddek ko'rinadi */
          showPercent={false}
          emptyIcon={HandCoins}
          emptyTitle={tt("Taqsimot yo'q", "Нет распределения")}
        />
      </div>

      {/* ═══ 4. Qarzdor tashkilotlar — to'liq ro'yxat ══════════════ */}
      <Card>
        <CardHeader className="flex-col items-stretch gap-3 md:flex-row md:items-start">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              {tt("Qarzdor tashkilotlar", "Организации-должники")}
            </CardTitle>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {filteredDebt.length}
              {debtSearch && ` / ${debtRows.length}`}{" "}
              {tt("ta tashkilot", "организаций")} ·{" "}
              {tt("umumiy qarzdorlik", "общая задолженность")}:{" "}
              <span className="font-medium text-destructive">
                {fullSum(totalDebt)}
              </span>
            </p>
          </div>

          {/* Hamma kenglikda bitta qator: qidiruv maydoni bo'sh joyni
              egallaydi, tugmalar o'z kengligida qoladi. */}
          <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
            <Input
              inputSize="sm"
              value={debtSearch}
              onChange={(e) => setDebtSearch(e.target.value)}
              placeholder={tt("Tashkilot, INN yoki manzil", "Организация, ИНН или адрес")}
              startIcon={<Search />}
              className="min-w-0 flex-1 md:w-64 md:flex-none"
              endIcon={
                debtSearch ? (
                  <button
                    type="button"
                    onClick={() => setDebtSearch("")}
                    aria-label={tt("Tozalash", "Очистить")}
                    className="rounded p-0.5 transition-colors hover:text-foreground"
                  >
                    <X />
                  </button>
                ) : undefined
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={fetchDebt}
              aria-label={tt("Yangilash", "Обновить")}
              title={tt("Yangilash", "Обновить")}
            >
              <RotateCw />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={downloadDebtExcel}
              className="shrink-0"
            >
              <Download />
              Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <DataTable
            columns={debtColumns}
            rows={filteredDebt}
            keyOf={(r) => r.organization_id}
            loading={debtLoading}
            loadingRows={8}
            maxHeight={620}
            defaultSort={{ key: "debt", dir: "desc" }}
            fixedLayout
            onRowClick={(row) => setSelectedOrg(row)}
            empty={
              <EmptyState
                icon={Building2}
                title={
                  debtSearch
                    ? tt("Hech narsa topilmadi", "Ничего не найдено")
                    : tt("Qarzdorlik yo'q", "Задолженности нет")
                }
                description={
                  debtSearch
                    ? tt(
                        "Qidiruv so'zini o'zgartirib ko'ring",
                        "Попробуйте изменить поисковый запрос"
                      )
                    : tt(
                        "Tanlangan sanaga qarzdor tashkilotlar topilmadi",
                        "На выбранную дату должников не найдено"
                      )
                }
                action={
                  debtSearch ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDebtSearch("")}
                    >
                      {tt("Qidiruvni tozalash", "Сбросить поиск")}
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </CardContent>
      </Card>

      {/* ═══ Modallar ══════════════════════════════════════════════ */}
      <ContractsModal
        open={contractsOpen}
        onClose={() => setContractsOpen(false)}
        type={contractsType}
      />

      <RedWorkersModal
        open={redOpen}
        onClose={() => setRedOpen(false)}
        data={red}
        footer={
          <Button variant="secondary" onClick={downloadRedExcel}>
            <Download />
            {tt("Excel yuklab olish", "Скачать Excel")}
          </Button>
        }
      />

      <OrgContractsModal
        open={Boolean(selectedOrg)}
        onClose={() => setSelectedOrg(null)}
        to={endDate}
        organization={selectedOrg}
      />

      {/* Batalon tafsiloti */}
      <Modal
        open={Boolean(selectedBatalon)}
        onClose={() => setSelectedBatalon(null)}
        size="sm"
        title={selectedBatalon?.batalon_name}
        description={tt("Batalon ko'rsatkichlari", "Показатели батальона")}
      >
        {selectedBatalon && (
          <div className="flex flex-col gap-3">
            <DetailTile
              label={tt("Xodimlar soni", "Количество сотрудников")}
              value={num(selectedBatalon.worker_count)}
              wide
            />
            <div className="grid grid-cols-2 gap-3">
              <DetailTile
                label={tt("Umumiy summa", "Общая сумма")}
                value={fullSum(selectedBatalon.total_summa)}
              />
              <DetailTile
                label={tt("Summa ulushi", "Доля суммы")}
                value={`${selectedBatalon.summa_percent ?? 0}%`}
              />
              <DetailTile
                label={tt("Umumiy soat", "Всего часов")}
                value={num(selectedBatalon.total_time)}
              />
              <DetailTile
                label={tt("Soat ulushi", "Доля часов")}
                value={`${selectedBatalon.time_percent ?? 0}%`}
              />
              <DetailTile
                label={tt("Tadbirlar soni", "Количество мероприятий")}
                value={num(selectedBatalon.task_count)}
              />
              <DetailTile
                label={tt("Tadbirlar ulushi", "Доля мероприятий")}
                value={`${selectedBatalon.task_percent ?? 0}%`}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Muddatli xizmatchilar tafsiloti */}
      <Modal
        open={Boolean(selectedSoldier)}
        onClose={() => setSelectedSoldier(null)}
        size="sm"
        title={selectedSoldier?.batalon_name}
        description={tt(
          "Muddatli xizmatchilar ko'rsatkichlari",
          "Показатели срочнослужащих"
        )}
      >
        {selectedSoldier && (
          <div className="grid grid-cols-2 gap-3">
            <DetailTile
              label={tt("Xizmatchilar soni", "Количество военнослужащих")}
              value={num(selectedSoldier.worker_count)}
              wide
            />
            <DetailTile
              label={tt("Qatnashishlar", "Участия")}
              value={num(selectedSoldier.task_count)}
            />
            <DetailTile
              label={tt("Qatnashish ulushi", "Доля участий")}
              value={`${pct(
                selectedSoldier.task_count,
                soldier?.total_task_count
              ).toFixed(0)}%`}
            />
            <DetailTile
              label={tt("Soat", "Часы")}
              value={num(selectedSoldier.total_time)}
            />
            <DetailTile
              label={tt("Soat ulushi", "Доля часов")}
              value={`${pct(
                selectedSoldier.total_time,
                soldier?.total_time
              ).toFixed(0)}%`}
            />
            <DetailTile
              label={tt("Summa", "Сумма")}
              value={fullSum(selectedSoldier.total_summa)}
            />
            <DetailTile
              label={tt("Summa ulushi", "Доля суммы")}
              value={`${pct(
                selectedSoldier.total_summa,
                soldier?.total_summa
              ).toFixed(0)}%`}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Donut + bosiladigan legenda saqlangan karta
   ═══════════════════════════════════════════════════════════════════ */

type DonutCardSlice = {
  id: string | number;
  label: string;
  value: number;
  /** Ohangni majburan belgilash — aks holda tartib raqami bo'yicha */
  color?: string;
};

function DonutCard({
  title,
  subtitle,
  icon: Icon,
  slices,
  centerValue,
  centerLabel,
  onSelect,
  loading,
  emptyIcon,
  emptyTitle,
  showPercent = true,
}: {
  title: string;
  subtitle: ReactNode;
  icon: LucideIcon;
  slices: DonutCardSlice[];
  centerValue: string;
  centerLabel: string;
  onSelect?: (id: string | number) => void;
  loading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle: string;
  /** Legendada hisoblangan ulush ko'rsatilsinmi */
  showPercent?: boolean;
}) {
  const total = slices.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
      </CardHeader>

      {/* Uchta karta yonma-yon turadi, ustun tor — shu sabab diagramma
          bilan legenda yonma-yon emas, ustma-ust joylashadi. Legenda
          kesilmaydi: ro'yxat uzun bo'lsa karta ichida aylanadi. */}
      <CardContent className="flex min-h-0 flex-1 flex-col items-center gap-4">
        {loading ? (
          <>
            <Skeleton className="size-[170px] shrink-0 rounded-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : slices.length ? (
          <>
            <Donut
              data={slices}
              size={170}
              thickness={24}
              centerValue={centerValue}
              centerLabel={centerLabel}
              onSelect={onSelect ? (s) => onSelect(s.id) : undefined}
              formatValue={(v) => fullSum(v)}
            />
            <Legend
              className="min-h-0 w-full flex-1 overflow-y-auto"
              onSelect={onSelect ? (item) => onSelect(item.id!) : undefined}
              items={slices.map((s) => ({
                id: s.id,
                label: s.label,
                color: s.color,
                percent: showPercent ? pct(s.value, total) : undefined,
                value: compactSum(s.value),
              }))}
            />
          </>
        ) : (
          <EmptyState
            className="flex-1 py-8"
            icon={emptyIcon ?? Icon}
            title={emptyTitle}
            description={tt(
              "Tanlangan davr uchun ma'lumot topilmadi",
              "За выбранный период данных не найдено"
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

/** Tafsilot oynasidagi bitta ko'rsatkich katakchasi */
function DetailTile({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-border bg-muted/40 px-3 py-2.5 text-center ${
        wide ? "col-span-2" : ""
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

export { compactSum, fullSum };
