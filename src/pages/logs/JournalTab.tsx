import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { SortLabel } from "@/Components/reusable/table/Table";
import { sortParamsObject, useTableSort } from "@/hooks/useTableSort";
import Paginatsiya from "@/Components/Paginatsiya";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import useApi from "@/services/api";
import type { IActionLog, IActionLogMeta, IActionLogUser } from "@/types/actionLog";
import {
  Badge,
  DataTable,
  EmptyState,
  Input,
  ListCard,
  Select,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
  type TableColumn,
} from "@/ui";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { formatDateTime, tt } from "@/utils";
import { History, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import LogDetails from "./LogDetails";
import {
  actionLabel,
  actionOptions,
  actionTone,
  describeLog,
  formatDuration,
  moduleLabel,
  moduleOptions,
  roleLabel,
} from "./labels";

export type JournalFilters = {
  userId: string;
  module: string;
  action: string;
  status: string;
  search: string;
};

export const DEFAULT_JOURNAL_FILTERS: JournalFilters = {
  userId: "",
  module: "",
  action: "",
  status: "",
  search: "",
};

/** Backend `logs` uchun limitni 100 bilan cheklaydi — eksportda sahifalab yig'iladi */
const LOGS_MAX_LIMIT = 100;

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (isSuper: boolean): ExportColumn<IActionLog>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Vaqt", "Время"), value: (r) => formatDateTime(r.created_at), align: "center" },
  {
    header: tt("Foydalanuvchi", "Пользователь"),
    value: (r) => {
      const name = r.user_fio || r.user_login || "—";
      const details = [
        r.user_login,
        roleLabel(r.user_role),
        r.batalon_name || (isSuper ? r.region_name : null),
      ]
        .filter(Boolean)
        .join(" · ");
      return details ? `${name} (${details})` : name;
    },
  },
  { header: tt("Amal", "Действие"), value: (r) => actionLabel(r.action), align: "center" },
  {
    header: tt("Nima qildi", "Что сделал"),
    value: (r) => {
      const what = `${moduleLabel(r.module)}${r.entity_id ? ` #${r.entity_id}` : ""}`;
      const description = describeLog(r);
      return description ? `${what} — ${description}` : what;
    },
  },
  {
    header: tt("Natija", "Результат"),
    value: (r) => (r.success ? tt("Bajarildi", "Успешно") : `${tt("Xato", "Ошибка")} ${r.status}`),
    align: "center",
  },
  {
    header: tt("Davomiyligi", "Длительность"),
    value: (r) => formatDuration(r.duration_ms),
    align: "center",
  },
  { header: "IP", value: (r) => r.ip || "—", align: "center" },
];

/** Qaydlar jadvali: filtrlar, sahifalash, bosilganda tafsilotlar */
export default function JournalTab({
  from,
  to,
  regionId,
  isSuper,
  sharedFilters,
  users,
  filters,
  onFilters,
  onResetShared,
}: {
  from: string;
  to: string;
  regionId: string;
  isSuper: boolean;
  /** Sahifadagi umumiy filtrlar (sana oralig'i, viloyat) */
  sharedFilters: ReactNode;
  users: IActionLogUser[];
  filters: JournalFilters;
  onFilters: (patch: Partial<JournalFilters>) => void;
  /** Umumiy filtrlarni (sana, viloyat) boshlang'ich holatga qaytaradi */
  onResetShared: () => void;
}) {
  const api = useApi();
  const [rows, setRows] = useState<IActionLog[]>([]);
  const [meta, setMeta] = useState<IActionLogMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<IActionLog | null>(null);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // Qidiruv har harfda emas, yozish to'xtagach yuboriladi
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => setSearchInput(filters.search), [filters.search]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== filters.search) onFilters({ search: searchInput });
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const buildParams = (p: number, l: number) => {
    const params = new URLSearchParams({ page: String(p), limit: String(l) });
    const set = (key: string, value: string) => value && params.set(key, value);
    set("from", from);
    set("to", to);
    set("region_id", regionId);
    set("user_id", filters.userId);
    set("module", filters.module);
    set("action", filters.action);
    set("status", filters.status);
    set("search", filters.search.trim());
    // Saralash backendda — eksport ham ekrandagi tartibda chiqadi
    Object.entries(sortParamsObject(sort)).forEach(([key, value]) => params.set(key, value));
    return params;
  };

  const fetchLogs = (isStale: () => boolean = () => false) => {
    setLoading(true);

    return api.get<IActionLog[]>(`logs?${buildParams(page, limit)}`).then((res) => {
      if (isStale()) return;
      if (res?.success) {
        setRows(Array.isArray(res.data) ? res.data : []);
        setMeta((res as unknown as { meta: IActionLogMeta }).meta);
      }
      setLoading(false);
    });
  };

  const load = () => {
    let stale = false;
    fetchLogs(() => stale);

    return () => {
      stale = true;
    };
  };

  const clearFilters = () => {
    setSearchInput("");
    onFilters(DEFAULT_JOURNAL_FILTERS);
    resetSort();
    onResetShared();
  };

  // DataTable o'zi faqat brauzerda saralaydi — sarlavhani o'zimiz chizamiz
  const sortHeader = (text: string, key: string) => (
    <button type="button" onClick={() => toggleSort(key)} className="uppercase">
      <SortLabel text={text} sortKey={key} sort={sort} />
    </button>
  );

  usePagedFetch({
    page,
    setPage,
    filters: [
      limit,
      from,
      to,
      regionId,
      filters.userId,
      filters.module,
      filters.action,
      filters.status,
      filters.search,
      sort,
    ],
    fetch: load,
  });

  const userOptions = users.map((u) => ({
    value: u.id,
    label: [u.fio || u.login, isSuper ? u.batalon_name || u.region_name : u.batalon_name]
      .filter(Boolean)
      .join(" — "),
  }));

  const columns: TableColumn<IActionLog>[] = [
    {
      key: "time",
      header: sortHeader(tt("Vaqt", "Время"), "time"),
      width: "165px",
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {formatDateTime(row.created_at)}
        </span>
      ),
    },
    {
      key: "user",
      header: sortHeader(tt("Foydalanuvchi", "Пользователь"), "user"),
      width: "22%",
      cell: (row) => {
        const name = row.user_fio || row.user_login || "—";
        const details = [
          row.user_login,
          roleLabel(row.user_role),
          row.batalon_name || (isSuper ? row.region_name : null),
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <div className="min-w-0">
            <span className="block truncate font-medium text-foreground" title={name}>
              {name}
            </span>
            <span className="block truncate text-[0.75rem] text-muted-foreground" title={details}>
              {details}
            </span>
          </div>
        );
      },
    },
    {
      key: "action",
      header: sortHeader(tt("Amal", "Действие"), "action"),
      width: "125px",
      cell: (row) => <Badge tone={actionTone(row.action)}>{actionLabel(row.action)}</Badge>,
    },
    {
      key: "what",
      header: sortHeader(tt("Nima qildi", "Что сделал"), "what"),
      cell: (row) => {
        const description = describeLog(row);
        return (
          <div className="min-w-0">
            <span className="block truncate text-foreground">
              {moduleLabel(row.module)}
              {row.entity_id && (
                <span className="tabular-nums text-muted-foreground"> #{row.entity_id}</span>
              )}
            </span>
            {description && (
              <span
                className="block truncate text-[0.75rem] text-muted-foreground"
                title={description}
              >
                {description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "result",
      header: sortHeader(tt("Natija", "Результат"), "result"),
      width: "115px",
      cell: (row) =>
        row.success ? (
          <Badge tone="success" dot>
            {tt("Bajarildi", "Успешно")}
          </Badge>
        ) : (
          <Badge tone="danger" dot title={row.error ?? undefined}>
            {tt("Xato", "Ошибка")} {row.status}
          </Badge>
        ),
    },
    {
      key: "duration",
      header: sortHeader(tt("Davomiyligi", "Длительность"), "duration"),
      width: "120px",
      align: "right",
      // 3 soniyadan uzoq so'rovlar ko'zga tashlansin
      cell: (row) => (
        <span
          className={
            (row.duration_ms ?? 0) >= 3000
              ? "whitespace-nowrap font-medium tabular-nums text-warning"
              : "whitespace-nowrap tabular-nums text-muted-foreground"
          }
        >
          {formatDuration(row.duration_ms)}
        </span>
      ),
    },
    {
      key: "ip",
      header: sortHeader("IP", "ip"),
      width: "130px",
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-[0.75rem] text-muted-foreground">{row.ip || "—"}</span>
      ),
    },
  ];

  return (
    <>
      <ListCard
        toolbar={
          <div className="flex flex-col gap-2">
            <Toolbar>
              {sharedFilters}
              <FilterActions onRefresh={() => fetchLogs()} onClear={clearFilters} />
              <ToolbarSpacer />
              <ExportButtons
                title={tt("Qaydlar", "Журнал действий")}
                columns={exportColumns(isSuper)}
                fetchRows={async () => {
                  const all: IActionLog[] = [];
                  for (let p = 1; all.length < EXPORT_ALL_LIMIT; p++) {
                    const res = await api.get<IActionLog[]>(
                      `logs?${buildParams(p, LOGS_MAX_LIMIT)}`
                    );
                    if (!res?.success) throw new Error(res?.message);
                    const chunk = Array.isArray(res.data) ? res.data : [];
                    all.push(...chunk);
                    const pageCount = (res as unknown as { meta: IActionLogMeta }).meta?.pageCount ?? 0;
                    if (!chunk.length || p >= pageCount) break;
                  }
                  return all;
                }}
              />
            </Toolbar>
            <Toolbar>
              <div className="w-full sm:w-56">
                <Select
                  selectSize="sm"
                  aria-label={tt("Foydalanuvchi", "Пользователь")}
                  placeholder={tt("Barcha foydalanuvchilar", "Все пользователи")}
                  options={userOptions}
                  value={filters.userId}
                  onChange={(e) => onFilters({ userId: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  selectSize="sm"
                  aria-label={tt("Bo'lim", "Раздел")}
                  placeholder={tt("Barcha bo'limlar", "Все разделы")}
                  options={moduleOptions(isSuper)}
                  value={filters.module}
                  onChange={(e) => onFilters({ module: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  selectSize="sm"
                  aria-label={tt("Amal", "Действие")}
                  placeholder={tt("Barcha amallar", "Все действия")}
                  options={actionOptions()}
                  value={filters.action}
                  onChange={(e) => onFilters({ action: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  selectSize="sm"
                  aria-label={tt("Natija", "Результат")}
                  placeholder={tt("Har qanday natija", "Любой результат")}
                  options={[
                    { value: "success", label: tt("Bajarildi", "Успешно") },
                    { value: "error", label: tt("Xato", "Ошибка") },
                  ]}
                  value={filters.status}
                  onChange={(e) => onFilters({ status: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-64">
                <Input
                  inputSize="sm"
                  startIcon={<Search />}
                  placeholder={tt("Login, F.I.Sh., IP yoki yo'l", "Логин, ФИО, IP или путь")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </Toolbar>
          </div>
        }
        footer={
          meta && (
            <>
              <SummaryRow>
                <SummaryTile label={tt("Jami qaydlar", "Всего записей")} value={meta.stats.count} />
                <SummaryTile
                  label={tt("O'zgarishlar", "Изменения")}
                  value={meta.stats.changes}
                  tone="primary"
                />
                <SummaryTile
                  label={tt("Xatolar", "Ошибки")}
                  value={meta.stats.errors}
                  tone={meta.stats.errors ? "danger" : "neutral"}
                />
                <SummaryTile label={tt("Foydalanuvchilar", "Пользователи")} value={meta.stats.users} />
              </SummaryRow>
              <Paginatsiya
                currentPage={page}
                setCurrentPage={setPage}
                totalPages={meta.pageCount}
                limet={limit}
                setLimet={setLimit}
                count={meta.count}
              />
            </>
          )
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          keyOf={(row) => row.id}
          loading={loading}
          loadingRows={8}
          fixedLayout
          onRowClick={setSelected}
          empty={
            <EmptyState
              icon={History}
              title={tt("Qaydlar topilmadi", "Записи не найдены")}
              description={tt(
                "Tanlangan davr va filtrlar bo'yicha amal bajarilmagan.",
                "За выбранный период и фильтры действий нет."
              )}
            />
          }
        />
      </ListCard>

      <LogDetails log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
