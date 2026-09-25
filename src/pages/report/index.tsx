import Paginatsiya from "@/Components/Paginatsiya";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IReport } from "@/types/report";
import { formatDate, formatSum, textNum, toNumber, tt } from "@/utils";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import Input from "@/Components/Input";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
  data: IReport[];
};

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<IReport>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Hujjat raqami", "Номер документа"), value: (r) => r.doc_num, align: "center" },
  { header: tt("Sana", "Дата"), value: (r) => formatDate(r.doc_date), align: "center" },
  { header: tt("Tashkilot", "Организация"), value: (r) => r.tashkilot_name },
  {
    header: tt("Debet", "Дебет"),
    value: (r) => formatSum(r.prixod_sum),
    excelValue: (r) => toNumber(r.prixod_sum) || 0,
    align: "right",
  },
  {
    header: tt("Kredit", "Кредит"),
    value: (r) => formatSum(r.rasxod_sum),
    excelValue: (r) => toNumber(r.rasxod_sum) || 0,
    align: "right",
  },
  { header: tt("Tavsif", "Описание"), value: (r) => r.opisanie },
];

function ReportUser() {
  const [data, setData] = useState<IReportState>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const defDate = useSelector((state: RootState) => state.defaultDate);
  const [startDate, setStartDate] = useState<string>(defDate.startDate);
  const [endDate, setEndDate] = useState<string>(defDate.endDate);
  const account_id = useSelector(
    (state: any) => state.account.account_number_id
  );
  const api = useApi();
  const [search, setSearch] = useState("");
  const [searchText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listQuery = (p: number, l: number) =>
    `monitoring/prixod/rasxod/?from=${startDate}&to=${endDate}&account_number_id=${account_id}&page=${p}&limit=${l}` +
    (searchText ? `&search=${encodeURIComponent(searchText)}` : "") +
    sortParams(sort);

  const clearFilters = () => {
    setSearch("");
    resetSort();
    setStartDate(defDate.startDate);
    setEndDate(defDate.endDate);
  };

  useEffect(() => {
    setStartDate(defDate.startDate);
    setEndDate(defDate.endDate);
  }, [defDate]);

  const getData = async () => {
    const response = await api.get(listQuery(page, limit));
    if (response?.success) {
      setData(response as any);
    }
  };

  // Sana, limit yoki sahifa o'zgarganda hisobot yangilanadi.
  //
  // Ilgari sana uchun alohida effekt bor edi va unda `if (data) return;`
  // turardi — ya'ni birinchi yuklashdan keyin sana oralig'i o'zgartirilsa
  // hisobot UMUMAN yangilanmasdi. Endi bitta joyda boshqariladi va filtr
  // o'zgarganda 1-sahifaga qaytadi.
  usePagedFetch({
    page,
    setPage,
    filters: [limit, startDate, endDate, searchText, sort],
    fetch: () => {
      if (!startDate || !endDate) return;
      getData();
    },
  });


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
                p={tt("Tashkilot, № yoki tavsif bo'yicha", "По организации, № или описанию")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={getData} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              title={tt("Hisobot", "Отчетность")}
              columns={exportColumns()}
              fetchRows={async () => {
                const res = await api.get<IReport[]>(listQuery(1, EXPORT_ALL_LIMIT));
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
          <Table
            sort={sort}
            onSort={toggleSort}
            thead={[
              {
                sortKey: "doc_num",
                text: "№",
                className: "text-left py-3 px-[0.5rem]",
              },
              {
                sortKey: "doc_date",
                text: tt("Sana", "Дата"),
                className: "text-left py-3 px-[0.5rem]",
              },
              {
                sortKey: "tashkilot_name",
                text: tt("Tashkilot", "Организация"),
                className: "text-left px-[0.5rem]",
              },
              {
                sortKey: "prixod_sum",
                text: tt("Debet", "Дебет"),
                className: "text-right py-3 px-[0.5rem] w-[12.5rem]",
              },
              {
                sortKey: "rasxod_sum",
                text: tt("Kredit", "Кредит"),
                className: "text-right py-3 px-[0.5rem] w-[12.5rem]",
              },
              {
                sortKey: "opisanie",
                text: tt("Tavsif", "Описание"),
                className: "text-left py-3 px-[0.5rem] w-[25rem]",
              },
            ]}
          >
            {(Array.isArray(data?.data) ? data.data : []).map((r, ind) => (
              <tr
                key={ind}
                className="my-[1.5625rem] cursor-pointer font-[500] hover:text-primary transition-colors duration-300 border-b border-border"
              >
                <td className="px-[0.5rem] py-3 border-b border-border">
                  {r.doc_num}
                </td>
                <td className="px-[0.5rem] py-3 border-b border-border">
                  {formatDate(r.doc_date)}
                </td>
                <td className="rasxod-tooltip relative px-[0.5rem] border-b border-border">
                  {r.tashkilot_name}
                  <div className="text-foreground absolute rasxod-tooltip-wrap !top-[0] !left-[6.25rem] w-[18.75rem] z-10 bg-card border-b border-border rounded-md shadow-lg p-3">
                    <h2>
                      {tt("Nomi", "Название")}: {r.tashkilot_name}
                    </h2>
                    <h2>
                      {tt("Manzil", "Адрес")}: {r.tashkilot_address}
                    </h2>
                    <h2>
                      {tt("INN", "ИНН")}: {textNum(r.tashkilot_inn, 3)}
                    </h2>
                    <h2>
                      {tt("Hisob raqam", "Номер счета")}:{" "}
                      {textNum(r.tashkilot_account_number, 4)}
                    </h2>
                  </div>
                </td>
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
}

export default ReportUser;
