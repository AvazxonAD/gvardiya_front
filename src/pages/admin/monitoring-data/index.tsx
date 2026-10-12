import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { NavbarPortal } from "@/layout/navbarSlot";
import type { ExportColumn } from "@/lib/tableExport";
import useApi from "@/services/api";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  ListCard,
  Select,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
  type TableColumn,
} from "@/ui";
import { formatSum, tt } from "@/utils";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Row = {
  region_id: number;
  region_name: string;
  contract_count: number;
  contract_summa: number;
  organization_count: number;
  worker_count: number;
  prixod_count: number;
  prixod_summa: number;
  /** Viloyatning eng oxirgi yozuvi (butun davr), mahalliy vaqt */
  last_at: string | null;
};

// Tizimdagi eng birinchi yozuvlar 2025-yil boshida
const FIRST_YEAR = 2025;

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const monthNames = () => [
  tt("Yanvar", "Январь"),
  tt("Fevral", "Февраль"),
  tt("Mart", "Март"),
  tt("Aprel", "Апрель"),
  tt("May", "Май"),
  tt("Iyun", "Июнь"),
  tt("Iyul", "Июль"),
  tt("Avgust", "Август"),
  tt("Sentabr", "Сентябрь"),
  tt("Oktyabr", "Октябрь"),
  tt("Noyabr", "Ноябрь"),
  tt("Dekabr", "Декабрь"),
];

type Month = { year: number; month: number }; // month: 1..12

const thisMonth = (): Month => {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

const shiftMonth = ({ year, month }: Month, delta: number): Month => {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

const monthKey = ({ year, month }: Month) => `${year}-${String(month).padStart(2, "0")}`;
const monthLabel = (m: Month) => `${monthNames()[m.month - 1]} ${m.year}`;

/** Shu oyda hech narsa kiritmagan viloyat */
const isIdle = (r: Row) =>
  r.contract_count + r.organization_count + r.worker_count + r.prixod_count === 0;

const statusLabel = (r: Row) =>
  isIdle(r) ? tt("Kiritilmagan", "Нет данных") : tt("Kiritgan", "Внесены");

const daysSince = (value: string) => {
  const d = new Date(value);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - d.getTime()) / 86400000);
};

const formatDay = (value: string) => {
  const d = new Date(value);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
};

const agoLabel = (days: number) =>
  days <= 0 ? tt("bugun", "сегодня") : days === 1 ? tt("kecha", "вчера") : tt(`${days} kun oldin`, `${days} дн. назад`);

/** 0 xira — ko'zga faqat kiritilgan ma'lumot tashlansin */
const Count = ({ value }: { value: number }) => (
  <span className={value === 0 ? "tabular-nums text-muted-foreground/50" : "tabular-nums text-foreground"}>
    {value}
  </span>
);

const Money = ({ value }: { value: number }) =>
  value === 0 ? (
    <span className="tabular-nums text-muted-foreground/50">0</span>
  ) : (
    <span className="whitespace-nowrap tabular-nums text-foreground">{formatSum(value)}</span>
  );

const exportColumns = (): ExportColumn<Row>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Viloyat", "Регион"), value: (r) => r.region_name },
  { header: tt("Holat", "Статус"), value: statusLabel, align: "center" },
  { header: tt("Shartnoma", "Договоры"), value: (r) => r.contract_count, align: "right" },
  {
    header: tt("Shartnoma summasi", "Сумма договоров"),
    value: (r) => formatSum(r.contract_summa),
    excelValue: (r) => r.contract_summa,
    align: "right",
  },
  { header: tt("Tashkilot", "Организации"), value: (r) => r.organization_count, align: "right" },
  { header: tt("Xodim", "Сотрудники"), value: (r) => r.worker_count, align: "right" },
  { header: tt("To'lov", "Оплаты"), value: (r) => r.prixod_count, align: "right" },
  {
    header: tt("To'langan summa", "Оплаченная сумма"),
    value: (r) => formatSum(r.prixod_summa),
    excelValue: (r) => r.prixod_summa,
    align: "right",
  },
  {
    header: tt("Oxirgi kiritish", "Последний ввод"),
    value: (r) => (r.last_at ? formatDay(r.last_at) : tt("Hech qachon", "Никогда")),
    align: "center",
  },
];

/**
 * Super-admin "Monitoring": qaysi viloyat tizimga ma'lumot kiritayapti,
 * qaysi biri yo'q. Tanlangan oyda kiritilgan (yaratilgan sana bo'yicha)
 * shartnoma, tashkilot, xodim va to'lovlar viloyatlar kesimida.
 */
export default function AdminMonitoringData() {
  const api = useApi();
  const [period, setPeriod] = useState<Month>(thisMonth);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const current = thisMonth();
  const isCurrent = monthKey(period) === monthKey(current);
  const isFirst = period.year === FIRST_YEAR && period.month === 1;

  const fetchRows = (isStale: () => boolean = () => false) => {
    setLoading(true);
    return api.get<Row[]>(`admin/monitoring/data?month=${monthKey(period)}`).then((res) => {
      if (isStale()) return;
      setRows(res?.success && Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    let stale = false;
    fetchRows(() => stale);
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.year, period.month]);

  const years = Array.from({ length: current.year - FIRST_YEAR + 1 }, (_, i) => current.year - i);
  // Kelajakdagi oylar tanlanmaydi
  const months = monthNames()
    .map((label, i) => ({ value: i + 1, label }))
    .filter((m) => period.year < current.year || m.value <= current.month);

  const setYear = (year: number) =>
    setPeriod((p) => ({ year, month: year === current.year ? Math.min(p.month, current.month) : p.month }));

  const idle = rows.filter(isIdle);
  const sum = (key: keyof Row) => rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

  const columns: TableColumn<Row>[] = [
    {
      key: "index",
      header: "№",
      width: "48px",
      align: "center",
      cell: (_, i) => <span className="tabular-nums text-muted-foreground">{i + 1}</span>,
    },
    {
      key: "region",
      header: tt("Viloyat", "Регион"),
      sortValue: (r) => r.region_name,
      // Kesilmaydi: tor ekranda uzun nom ikki qatorga o'tadi — jadval shu
      // ustun hisobiga sig'adi (qolgan ustunlar raqam, ular siqilmaydi)
      cell: (r) => <span className="font-medium text-foreground">{r.region_name}</span>,
    },
    {
      key: "status",
      header: tt("Holat", "Статус"),
      align: "center",
      // Kiritmaganlar birinchi chiqsin
      sortValue: (r) => (isIdle(r) ? 0 : 1),
      cell: (r) =>
        isIdle(r) ? (
          <Badge tone="danger" dot>
            {statusLabel(r)}
          </Badge>
        ) : (
          <Badge tone="success" dot>
            {statusLabel(r)}
          </Badge>
        ),
    },
    {
      key: "contract_count",
      header: tt("Shartnoma", "Договоры"),
      align: "right",
      sortValue: (r) => r.contract_count,
      // Summa alohida ustun emas, ikkinchi qatorda: aks holda 1366 px
      // ekranda "Oxirgi kiritish" ko'rinmay qolardi (Excel'da alohida ustun)
      cell: (r) => (
        <div>
          <Count value={r.contract_count} />
          {r.contract_summa > 0 && (
            <span className="block whitespace-nowrap text-[0.6875rem] tabular-nums text-muted-foreground">
              {formatSum(r.contract_summa)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "organization_count",
      header: tt("Tashkilot", "Организации"),
      align: "right",
      sortValue: (r) => r.organization_count,
      cell: (r) => <Count value={r.organization_count} />,
    },
    {
      key: "worker_count",
      header: tt("Xodim", "Сотрудники"),
      align: "right",
      sortValue: (r) => r.worker_count,
      cell: (r) => <Count value={r.worker_count} />,
    },
    {
      key: "prixod_count",
      header: tt("To'lov", "Оплаты"),
      align: "right",
      hideOnMobile: true,
      sortValue: (r) => r.prixod_count,
      cell: (r) => <Count value={r.prixod_count} />,
    },
    {
      key: "prixod_summa",
      header: tt("To'langan summa", "Оплаченная сумма"),
      align: "right",
      sortValue: (r) => r.prixod_summa,
      cell: (r) => <Money value={r.prixod_summa} />,
    },
    {
      key: "last_at",
      header: tt("Oxirgi kiritish", "Последний ввод"),
      // Hech kiritmaganlar eng "eski" hisoblanadi
      sortValue: (r) => (r.last_at ? new Date(r.last_at).getTime() : 0),
      cell: (r) => {
        if (!r.last_at) {
          return <span className="text-destructive">{tt("Hech qachon", "Никогда")}</span>;
        }
        const days = daysSince(r.last_at);
        return (
          <div className="min-w-0">
            <span className="block whitespace-nowrap tabular-nums text-foreground">{formatDay(r.last_at)}</span>
            <span
              className={
                days > 30 ? "block text-[0.6875rem] text-destructive" : "block text-[0.6875rem] text-muted-foreground"
              }
            >
              {agoLabel(days)}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <NavbarPortal>
        <p className="hidden min-w-0 truncate text-[0.75rem] text-muted-foreground xl:block">
          {tt(
            "Viloyatlar tanlangan oyda tizimga nima kiritgani (kiritilgan sana bo'yicha)",
            "Что области внесли в систему за выбранный месяц (по дате ввода)"
          )}
        </p>
      </NavbarPortal>

      <ListCard
        flush
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="icon-sm"
                disabled={isFirst}
                onClick={() => setPeriod((p) => shiftMonth(p, -1))}
                title={tt("Oldingi oy", "Предыдущий месяц")}
                aria-label={tt("Oldingi oy", "Предыдущий месяц")}
              >
                <ChevronLeft />
              </Button>
              <Select
                selectSize="sm"
                className="w-32"
                aria-label={tt("Oy", "Месяц")}
                options={months}
                value={period.month}
                onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
              />
              <Select
                selectSize="sm"
                className="w-24"
                aria-label={tt("Yil", "Год")}
                options={years.map((y) => ({ value: y, label: String(y) }))}
                value={period.year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
              <Button
                variant="secondary"
                size="icon-sm"
                disabled={isCurrent}
                onClick={() => setPeriod((p) => shiftMonth(p, 1))}
                title={tt("Keyingi oy", "Следующий месяц")}
                aria-label={tt("Keyingi oy", "Следующий месяц")}
              >
                <ChevronRight />
              </Button>
            </div>
            <FilterActions onRefresh={() => fetchRows()} onClear={isCurrent ? undefined : () => setPeriod(thisMonth())} />
            <ToolbarSpacer />
            <ExportButtons
              title={`${tt("Monitoring", "Мониторинг")}: ${monthLabel(period)}`}
              columns={exportColumns()}
              fetchRows={async () => rows}
            />
          </Toolbar>
        }
        footer={
          // 6 ta katakcha — katta ekranda bitta qatorda
          <SummaryRow className="pb-3 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryTile
              label={tt("Kiritgan", "Внесли")}
              value={`${rows.length - idle.length} / ${rows.length}`}
              tone="primary"
            />
            <SummaryTile
              label={tt("Kiritmagan", "Не внесли")}
              value={idle.length}
              tone={idle.length ? "danger" : "neutral"}
            />
            <SummaryTile label={tt("Shartnomalar", "Договоры")} value={sum("contract_count")} />
            <SummaryTile label={tt("Tashkilotlar", "Организации")} value={sum("organization_count")} />
            <SummaryTile label={tt("Xodimlar", "Сотрудники")} value={sum("worker_count")} />
            <SummaryTile
              label={tt("To'langan summa", "Оплаченная сумма")}
              value={formatSum(sum("prixod_summa"))}
              tone="success"
            />
          </SummaryRow>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          keyOf={(r) => r.region_id}
          loading={loading}
          loadingRows={14}
          // `fixedLayout` yo'q: raqamli ustunlar sarlavhasi (ayniqsa ruscha)
          // tor ekranda bir-birining ustiga chiqardi. Odatiy rejimda ustun
          // mazmunicha kengayadi, sig'masa — jadval o'zi gorizontal aylanadi
          empty={<EmptyState icon={Activity} title={tt("Viloyatlar topilmadi", "Регионы не найдены")} />}
        />
      </ListCard>
    </div>
  );
}
