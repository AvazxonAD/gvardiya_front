import Paginatsiya from "@/Components/Paginatsiya";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useApi from "@/services/api";
import { IReportAdmin } from "@/types/report";
import { formatDate, formatInn, formatSum, textNum, toNumber, tt } from "@/utils";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import Input from "@/Components/Input";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import React, { useState } from "react";
import {
  ListCard,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

type IReportState = {
  meta: {
    pageCount: number;
    count: number;
    currentPage: number;
    nextPage: number | null;
    backPage: number | null;
    from_balance: string;
    to_balance: string;
    prixod: string;
    rasxod: string;
  };
  data: IReportAdmin[];
};

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<IReportAdmin>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Hujjat raqami", "Номер документа"), value: (r) => r.doc_num, align: "center" },
  { header: tt("Sana", "Дата"), value: (r) => formatDate(r.doc_date), align: "center" },
  { header: tt("Tashkilot", "Организация"), value: (r) => r.tashkilot_name },
  { header: tt("Ijrochi", "Исполнитель"), value: (r) => r.doer_name },
  {
    header: tt("Kirim", "Приход"),
    value: (r) => formatSum(r.prixod_sum),
    excelValue: (r) => toNumber(r.prixod_sum) || 0,
    align: "right",
  },
  {
    header: tt("Chiqim", "Расход"),
    value: (r) => formatSum(r.rasxod_sum),
    excelValue: (r) => toNumber(r.rasxod_sum) || 0,
    align: "right",
  },
  { header: tt("Tavsif", "Описание"), value: (r) => r.opisanie },
];

const ReportAdmin: React.FC = () => {
  const [data, setData] = useState<IReportState>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const today = new Date();
  const firstDay = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-01`;
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  const [startDate, setStartDate] = useState<string>(firstDay);
  const [endDate, setEndDate] = useState<string>(lastDay);
  const api = useApi();
  const [search, setSearch] = useState("");
  const [searchText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listQuery = (p: number, l: number) =>
    `admin/monitoring/prixod/rasxod/?from=${startDate}&to=${endDate}&page=${p}&limit=${l}` +
    (searchText ? `&search=${encodeURIComponent(searchText)}` : "") +
    sortParams(sort);

  const clearFilters = () => {
    setSearch("");
    resetSort();
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  // Fetch data when page, limit, or date range changes
  const fetchData = async () => {
    if (!startDate || !endDate) return;

    try {
      const response = await api.get(listQuery(page, limit));

      if (response?.success) {
        setData(response as any);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  // Sana oralig'i o'zgarganda hisobot yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page,
    setPage,
    filters: [limit, startDate, endDate, searchText, sort],
    fetch: fetchData,
  });

  // Calculate full height for the component

  // Table headers with translations
  const tableHeaders = [
    { sortKey: "doc_num", text: "№", className: "text-left py-3 px-[0.5rem]" },
    { sortKey: "doc_date", text: tt("Sana", "Дата"), className: "text-left py-3 px-[0.5rem]" },
    {
      sortKey: "tashkilot_name",
      text: tt("Tashkilot", "Организация"),
      className: "text-left py-3 px-[0.5rem]",
    },
    {
      sortKey: "doer_name",
      text: tt("Ijrochi", "Исполнитель"),
      className: "text-left py-3 px-[0.5rem]",
    },
    {
      sortKey: "prixod_sum",
      text: tt("Kirim", "Приход"),
      className: "text-right py-3 px-[0.5rem] w-[12.5rem]",
    },
    {
      sortKey: "rasxod_sum",
      text: tt("Chiqim", "Расход"),
      className: "text-right py-3 px-[0.5rem] w-[12.5rem]",
    },
    {
      sortKey: "opisanie",
      text: tt("Tavsif", "Описание"),
      className: "text-left py-3 px-[0.5rem] w-[25rem]",
    },
  ];

  // Render organization or executor tooltip
  const renderTooltip = (item: IReportAdmin, type: "tashkilot" | "doer") => {
    const isOrganization = type === "tashkilot";
    return (
      <td className="rasxod-tooltip relative px-[0.5rem] py-3 border-b border-border">
        {isOrganization ? item.tashkilot_name : item.doer_name}
        <div className="text-foreground absolute rasxod-tooltip-wrap !top-[0] !left-[6.25rem] w-[18.75rem] z-10 bg-card border-b border-border rounded-md shadow-lg p-3">
          <h2>
            {tt("Nomi", "Название")}:{" "}
            {isOrganization ? item.tashkilot_name : item.doer_name}
          </h2>
          <h2>
            {tt("Manzil", "Адрес")}:{" "}
            {isOrganization ? item.tashkilot_address : item.doer_address}
          </h2>
          <h2>
            {tt("INN", "ИНН")}:{" "}
            {formatInn(isOrganization ? item.tashkilot_inn : item.doer_inn)}
          </h2>
          <h2>
            {tt("Hisob raqam", "Номер счета")}:{" "}
            {textNum(
              isOrganization
                ? item.tashkilot_account_number
                : item.doer_account_number,
              4
            )}
          </h2>
        </div>
      </td>
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker defaultValue={startDate} onChange={setStartDate} />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker defaultValue={endDate} onChange={setEndDate} />
            </div>

            <div className="w-full sm:w-72">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt(
                  "Tashkilot, №, ijrochi yoki tavsif bo'yicha",
                  "По организации, №, исполнителю или описанию"
                )}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={fetchData} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              title={tt("Hisobot", "Отчетность")}
              columns={exportColumns()}
              fetchRows={async () => {
                const res = await api.get<IReportAdmin[]>(listQuery(1, EXPORT_ALL_LIMIT));
                return Array.isArray(res?.data) ? res.data : [];
              }}
            />
          </Toolbar>
        }
        footer={
          data ? (
            <>
              <SummaryRow>
                <SummaryTile
                  label={tt("Boshlang'ich qoldiq", "Начальный остаток")}
                  value={formatSum(data?.meta.from_balance ?? 0)}
                />
                <SummaryTile
                  label={tt("Kirim", "Приход")}
                  value={formatSum(data?.meta.prixod ?? 0)}
                  tone="success"
                />
                <SummaryTile
                  label={tt("Chiqim", "Расход")}
                  value={formatSum(data?.meta.rasxod ?? 0)}
                  tone="danger"
                />
                <SummaryTile
                  label={tt("Yakuniy qoldiq", "Конечный остаток")}
                  value={formatSum(data?.meta.to_balance ?? 0)}
                />
              </SummaryRow>

              <Paginatsiya
                currentPage={page}
                setCurrentPage={setPage}
                totalPages={data.meta.pageCount}
                limet={limit}
                setLimet={setLimit}
                count={data.meta.count}
              />
            </>
          ) : null
        }
      >
          <Table sort={sort} onSort={toggleSort} thead={tableHeaders}>
            {(Array.isArray(data?.data) ? data.data : []).map((r, ind) => (
              <tr
                key={ind}
                className="cursor-pointer font-[500] hover:text-primary transition-colors duration-300 border-b border-border"
              >
                <td className="px-[0.5rem] py-3 border-b border-border">
                  {r.doc_num}
                </td>
                <td className="px-[0.5rem] py-3 border-b border-border">
                  {formatDate(r.doc_date)}
                </td>
                {renderTooltip(r, "tashkilot")}
                {renderTooltip(r, "doer")}
                <td className="px-[0.5rem] py-3 border-b border-border text-right">
                  {formatSum(r.prixod_sum)}
                </td>
                <td className="px-[0.5rem] py-3 border-b border-border text-right">
                  {formatSum(r.rasxod_sum)}
                </td>
                <td className="px-[0.5rem] py-3 border-b border-border">
                  {r.opisanie}
                </td>
              </tr>
            ))}
          </Table>
      </ListCard>
    </div>
  );
};

export default ReportAdmin;
