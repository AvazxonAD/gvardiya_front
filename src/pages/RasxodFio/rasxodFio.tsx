import Paginatsiya from "@/Components/Paginatsiya";
import ExportButtons from "@/Components/ExportButtons";
import { reportItems } from "@/Components/ExportMenu";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import FilterActions from "@/Components/FilterActions";
import Input from "@/Components/Input";
import { sortParamsObject, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { RasxodFIOTable } from "@/pageCompoents/rasxod/rasxodFioTable";
import { alertt } from "@/Redux/LanguageSlice";
import { permBtn, usePermission } from "@/lib/permissions";
import { RootState } from "@/Redux/store";
import { formatDate, formatNum, formatSum, toNumber, tt } from "@/utils";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
} from "lucide-react";
import {
  Button as UIButton,
  ListCard,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

// Pul ustuni: PDF da formatlangan matn, Excelda esa yig'ish uchun son
const moneyCol = (
  header: string,
  key: keyof RasxodInterface
): ExportColumn<RasxodInterface> => ({
  header,
  value: (r) => formatNum(r[key] as any),
  excelValue: (r) => toNumber(r[key] as any) || 0,
  align: "right",
});

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<RasxodInterface>[] => [
  { header: "№", value: (r) => r.doc_num, width: 8, align: "center" },
  { header: tt("Sana", "Дата"), value: (r) => formatDate(r.doc_date), align: "center" },
  { header: tt("Qabul qiluvchi", "Получатель"), value: (r) => r.batalon_name },
  moneyCol(tt("Jami (100%)", "Всего (100%)"), "summa"),
  moneyCol(tt("Boshqarma (10%)", "Управление (10%)"), "summa_10"),
  moneyCol(tt("Qolgan (90%)", "Остаток (90%)"), "summa_remaining"),
  moneyCol(tt("Moddiy baza (75%)", "Материальная база (75%)"), "summa_65"),
  moneyCol(tt("I-II guruh (25%)", "I-II группы (25%)"), "summa_25"),
  moneyCol(tt("Shaxsiy tarkib", "Личный состав"), "summa_1_25"),
  moneyCol(tt("Ijtimoiy soliq (25%)", "Социальный налог (25%)"), "summa_25_2"),
  moneyCol(tt("Daromad solig'i (12%)", "Налог на доходы (12%)"), "summa_12"),
  moneyCol(tt("Kartaga o'tkazildi", "Перечислено на карту"), "worker_summa"),
];

export const RasxodFio = () => {
  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const [search, setSearch] = React.useState({
    fromDate: startDate,
    toDate: endDate,
  });

  useEffect(() => {
    setSearch({ fromDate: startDate, toDate: endDate });
  }, [startDate, endDate]);

  const [rasxoddata, setRasxodData] = React.useState<RasxodInterface[]>([]);
  const [rasxodmeta, setRasxodMeta] = React.useState<any>({});

  const [limet, setLimet] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [_, setTotalPages] = useState(1);
  // const [active, setactive] = useState(1);
  const [__, setAll] = useState(10);
  const request = useRequest();
  const dispatch = useDispatch();

  const { account_number_id } = useSelector((state: any) => state.account);

  // Qidiruv matni (`search` — sana oralig'i uchun band) va saralash
  const [q, setQ] = useState("");
  const [searchText] = useDebounce(q.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listParams = (page: number, limit: number) => ({
    from: search.fromDate,
    to: search.toDate,
    account_number_id: account_number_id,
    limit,
    page,
    ...(searchText ? { search: searchText } : {}),
    ...sortParamsObject(sort),
  });

  const clearFilters = () => {
    setQ("");
    resetSort();
    setSearch({ fromDate: startDate, toDate: endDate });
  };

  const getRasxod = async () => {
    try {
      if (!search.fromDate && !search.toDate) return;
      const res = await request.get("/rasxod/fio", {
        params: listParams(currentPage, limet),
      });
      if (res.data.success) {
        let paginationmeta = res.data.meta;
        setRasxodData(res.data.data);
        setTotalPages(paginationmeta.pageCount);
        setAll(paginationmeta.count);
        setRasxodMeta(res.data.meta);
      }
    } catch (error) {
      dispatch(
        alertt({
          //@ts-ignore
          text: error.response?.data?.message || error.message,
        })
      );
    }
  };

  // Backend hisobotlari (Excel) — ⋮ menyuda Excel va xuddi o'sha hisobotning PDF varianti
  const fetchRasxodFioReport = async (): Promise<Blob> => {
    const response = await request({
      url: "/rasxod/fio/export",
      method: "GET",
      params: listParams(currentPage, limet),
      responseType: "blob",
    });
    return response.data;
  };

  const fetchUmumiyHisobot = async (): Promise<Blob> => {
    const response = await request({
      url: "/rasxod/fio/umumiy-hisobot",
      method: "GET",
      params: {
        from: search.fromDate,
        to: search.toDate,
        account_number_id: account_number_id,
      },
      responseType: "blob",
    });
    return response.data;
  };

  // Sana oralig'i o'zgarganda ro'yxat yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, search.fromDate, search.toDate, searchText, sort],
    fetch: getRasxod,
  });

  const navigate = useNavigate();
  const perm = usePermission("rasxod_workers");

  const TILES: { label: string; key: keyof typeof rasxodmeta; tone?: "primary" | "success" }[] = [
    { label: tt("Jami (100%)", "Всего (100%)"), key: "summa", tone: "primary" },
    { label: tt("Boshqarma uchun (10%)", "Для управления (10%)"), key: "summa_10" },
    { label: tt("Qolgan jami (90%)", "Остаток всего (90%)"), key: "summa_remaining" },
    { label: tt("Moddiy bazaga (75%)", "На материальную базу (75%)"), key: "summa_65" },
    { label: tt("I va II guruh xarajatlari (25%)", "Расходы I и II группы (25%)"), key: "summa_25" },
    { label: tt("Shaxsiy tarkibga taqsimlandi", "Распределено личному составу"), key: "summa_1_25" },
    { label: tt("Yagona ijtimoiy soliq (25%)", "Единый социальный налог (25%)"), key: "summa_25_2" },
    { label: tt("Daromad solig'i (12%)", "Налог на доходы (12%)"), key: "summa_12" },
    { label: tt("Plastik kartaga o'tkazildi", "Перечислено на пластиковую карту"), key: "worker_summa", tone: "success" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker
                defaultValue={search.fromDate}
                onChange={(val) => setSearch({ ...search, fromDate: val })}
              />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker
                defaultValue={search.toDate}
                onChange={(val) => setSearch({ ...search, toDate: val })}
              />
            </div>

            <div className="w-full sm:w-64">
              <Input
                v={q}
                change={(e: any) => setQ(e.target.value)}
                removeValue={() => setQ("")}
                search={true}
                p={tt("№ yoki qabul qiluvchi", "№ или получатель")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={getRasxod} onClear={clearFilters} />

            <ToolbarSpacer />

            {/* Backend hisobotlari filtrlarni hisobga oladi — Excel ham, PDF ham o'sha hisobot */}
            <ExportButtons
              kinds={[]}
              extraItems={[
                ...reportItems({
                  key: "rasxod-fio",
                  name: tt("Batalonlar uchun chiqimlar", "Расходы для батальонов"),
                  fetchBlob: fetchRasxodFioReport,
                  fileName: `rasxod-fio-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`,
                }),
                ...reportItems({
                  key: "umumiy-hisobot",
                  name: tt("Umumiy hisobot", "Общий отчёт"),
                  fetchBlob: fetchUmumiyHisobot,
                  fileName: `umumiy-hisobot-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`,
                }),
              ]}
              title={tt("Chiqim F.I.Sh.", "Расход Ф.И.О")}
              columns={exportColumns()}
              fetchRows={async () => {
                const res = await request.get("/rasxod/fio", {
                  params: listParams(1, EXPORT_ALL_LIMIT),
                });
                return res?.data?.data ?? [];
              }}
            />
            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => navigate("/rasxod-workers/create")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          rasxoddata && rasxodmeta ? (
            <>
              <SummaryRow className="lg:grid-cols-3 xl:grid-cols-5">
                {TILES.map((t) => (
                  <SummaryTile
                    key={String(t.key)}
                    label={t.label}
                    tone={t.tone}
                    value={formatSum((rasxodmeta as any)[t.key] ?? 0)}
                  />
                ))}
              </SummaryRow>

              <Paginatsiya
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={rasxodmeta?.pageCount}
                limet={limet}
                setLimet={setLimet}
                count={rasxodmeta?.count}
              />
            </>
          ) : null
        }
      >
        <RasxodFIOTable data={rasxoddata} getAllFn={getRasxod} source="fio" sort={sort} onSort={toggleSort} />
      </ListCard>
    </div>
  );
};
