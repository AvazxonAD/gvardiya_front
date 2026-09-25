import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { SortLabel } from "@/Components/reusable/table/Table";
import { sortParamsObject, useTableSort } from "@/hooks/useTableSort";
import type { ExportColumn } from "@/lib/tableExport";
import useApi from "@/services/api";
import type { IActionLogSummary } from "@/types/actionLog";
import {
  Badge,
  DataTable,
  EmptyState,
  Input,
  ListCard,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
  type TableColumn,
} from "@/ui";
import { formatDateTime, tt } from "@/utils";
import { Search, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { roleLabel } from "./labels";

/** 0 xira ko'rinsin — ko'zga faqat bajarilgan ishlar tashlansin */
const Count = ({ value, danger }: { value: number; danger?: boolean }) => (
  <span
    className={
      value === 0
        ? "tabular-nums text-muted-foreground/50"
        : danger
        ? "font-semibold tabular-nums text-destructive"
        : "tabular-nums text-foreground"
    }
  >
    {value}
  </span>
);

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (isSuper: boolean): ExportColumn<IActionLogSummary>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  {
    header: tt("Foydalanuvchi", "Пользователь"),
    value: (r) => {
      const name = `${r.fio || r.login}${r.isdeleted ? ` (${tt("O'chirilgan", "Удалён")})` : ""}`;
      const details = [r.login, roleLabel(r.role), r.batalon_name || (isSuper ? r.region_name : null)]
        .filter(Boolean)
        .join(" · ");
      return details ? `${name} — ${details}` : name;
    },
  },
  { header: tt("Jami", "Всего"), value: (r) => r.total, align: "right" },
  { header: tt("Qo'shdi", "Создал"), value: (r) => r.creates, align: "right" },
  { header: tt("Tahrirladi", "Изменил"), value: (r) => r.updates, align: "right" },
  { header: tt("O'chirdi", "Удалил"), value: (r) => r.deletes, align: "right" },
  { header: tt("Fayllar", "Файлы"), value: (r) => r.files, align: "right" },
  { header: tt("Ko'rdi", "Просмотры"), value: (r) => r.views, align: "right" },
  { header: tt("Xatolar", "Ошибки"), value: (r) => r.errors, align: "right" },
  {
    header: tt("Oxirgi kirish", "Последний вход"),
    value: (r) => (r.last_login_at ? formatDateTime(r.last_login_at) : "—"),
    align: "center",
  },
  {
    header: tt("Oxirgi faollik", "Последняя активность"),
    value: (r) =>
      r.last_at
        ? `${formatDateTime(r.last_at)}${r.last_ip ? ` (${r.last_ip})` : ""}`
        : tt("Faollik yo'q", "Нет активности"),
    align: "center",
  },
];

/**
 * Foydalanuvchi kesimida: har bir foydalanuvchi tanlangan davrda nima
 * qilgani. Faol bo'lmaganlar ham 0 bilan chiqadi. Qator bosilsa — shu
 * foydalanuvchining barcha qaydlari ochiladi.
 */
export default function UsersTab({
  from,
  to,
  regionId,
  isSuper,
  sharedFilters,
  onOpenUser,
  onResetShared,
}: {
  from: string;
  to: string;
  regionId: string;
  isSuper: boolean;
  sharedFilters: ReactNode;
  onOpenUser: (userId: number) => void;
  /** Umumiy filtrlarni (sana, viloyat) boshlang'ich holatga qaytaradi */
  onResetShared: () => void;
}) {
  const api = useApi();
  const [rows, setRows] = useState<IActionLogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Ro'yxat sahifalanmaydi, lekin saralash va qidiruv backendda
  const fetchRows = (isStale: () => boolean = () => false) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (regionId) params.set("region_id", regionId);
    if (query) params.set("search", query);
    Object.entries(sortParamsObject(sort)).forEach(([key, value]) => params.set(key, value));

    return api.get<IActionLogSummary[]>(`logs/summary?${params}`).then((res) => {
      if (isStale()) return;
      if (res?.success) setRows(Array.isArray(res.data) ? res.data : []);
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
  }, [from, to, regionId, query, sort]);

  const clearFilters = () => {
    setSearch("");
    setQuery("");
    resetSort();
    onResetShared();
  };

  // DataTable o'zi faqat brauzerda saralaydi — sarlavhani o'zimiz chizamiz
  const sortHeader = (text: string, key: string) => (
    <button type="button" onClick={() => toggleSort(key)} className="uppercase">
      <SortLabel text={text} sortKey={key} sort={sort} />
    </button>
  );

  const active = rows.filter((r) => r.total > 0);
  const sum = (key: "total" | "errors") => rows.reduce((acc, r) => acc + r[key], 0);

  const columns: TableColumn<IActionLogSummary>[] = [
    {
      key: "user",
      header: sortHeader(tt("Foydalanuvchi", "Пользователь"), "user"),
      width: "24%",
      cell: (row) => {
        const details = [
          row.login,
          roleLabel(row.role),
          row.batalon_name || (isSuper ? row.region_name : null),
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <div className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-medium text-foreground" title={row.fio || row.login}>
                {row.fio || row.login}
              </span>
              {row.isdeleted && <Badge tone="danger">{tt("O'chirilgan", "Удалён")}</Badge>}
            </span>
            <span className="block truncate text-[0.75rem] text-muted-foreground" title={details}>
              {details}
            </span>
          </div>
        );
      },
    },
    {
      key: "total",
      header: sortHeader(tt("Jami", "Всего"), "total"),
      width: "80px",
      align: "right",
      cell: (row) => <span className="font-semibold tabular-nums">{row.total}</span>,
    },
    {
      key: "creates",
      header: sortHeader(tt("Qo'shdi", "Создал"), "creates"),
      width: "85px",
      align: "right",
      cell: (row) => <Count value={row.creates} />,
    },
    {
      key: "updates",
      header: sortHeader(tt("Tahrirladi", "Изменил"), "updates"),
      width: "95px",
      align: "right",
      cell: (row) => <Count value={row.updates} />,
    },
    {
      key: "deletes",
      header: sortHeader(tt("O'chirdi", "Удалил"), "deletes"),
      width: "85px",
      align: "right",
      cell: (row) => <Count value={row.deletes} />,
    },
    {
      key: "files",
      header: sortHeader(tt("Fayllar", "Файлы"), "files"),
      width: "80px",
      align: "right",
      hideOnMobile: true,
      cell: (row) => <Count value={row.files} />,
    },
    {
      key: "views",
      header: sortHeader(tt("Ko'rdi", "Просмотры"), "views"),
      width: "90px",
      align: "right",
      hideOnMobile: true,
      cell: (row) => <Count value={row.views} />,
    },
    {
      key: "errors",
      header: sortHeader(tt("Xatolar", "Ошибки"), "errors"),
      width: "80px",
      align: "right",
      cell: (row) => <Count value={row.errors} danger />,
    },
    {
      key: "last_login",
      header: sortHeader(tt("Oxirgi kirish", "Последний вход"), "last_login"),
      width: "150px",
      hideOnMobile: true,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {row.last_login_at ? formatDateTime(row.last_login_at) : "—"}
        </span>
      ),
    },
    {
      key: "last_at",
      header: sortHeader(tt("Oxirgi faollik", "Последняя активность"), "last_at"),
      width: "160px",
      cell: (row) =>
        row.last_at ? (
          <div className="min-w-0">
            <span className="block whitespace-nowrap tabular-nums text-foreground">
              {formatDateTime(row.last_at)}
            </span>
            {row.last_ip && (
              <span className="block truncate font-mono text-[0.6875rem] text-muted-foreground">
                {row.last_ip}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{tt("Faollik yo'q", "Нет активности")}</span>
        ),
    },
  ];

  return (
    <ListCard
      toolbar={
        <Toolbar>
          {sharedFilters}
          <div className="w-full sm:w-64">
            <Input
              inputSize="sm"
              startIcon={<Search />}
              placeholder={tt("F.I.Sh. yoki login", "ФИО или логин")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterActions onRefresh={() => fetchRows()} onClear={clearFilters} />
          <ToolbarSpacer />
          {/* Ro'yxat sahifalanmaydi — yuklangan qatorlar to'liq */}
          <ExportButtons
            title={tt("Foydalanuvchilar kesimida", "По пользователям")}
            columns={exportColumns(isSuper)}
            fetchRows={async () => rows}
          />
        </Toolbar>
      }
      footer={
        <SummaryRow className="pb-3">
          <SummaryTile label={tt("Foydalanuvchilar", "Пользователи")} value={rows.length} />
          <SummaryTile
            label={tt("Davr ichida faol", "Активны за период")}
            value={active.length}
            tone="primary"
          />
          <SummaryTile label={tt("Jami amallar", "Всего действий")} value={sum("total")} />
          <SummaryTile
            label={tt("Xatolar", "Ошибки")}
            value={sum("errors")}
            tone={sum("errors") ? "danger" : "neutral"}
          />
        </SummaryRow>
      }
    >
      <DataTable
        columns={columns}
        rows={rows}
        keyOf={(row) => row.id}
        loading={loading}
        fixedLayout
        onRowClick={(row) => onOpenUser(row.id)}
        empty={
          <EmptyState
            icon={Users}
            title={tt("Foydalanuvchilar topilmadi", "Пользователи не найдены")}
          />
        }
      />
    </ListCard>
  );
}
