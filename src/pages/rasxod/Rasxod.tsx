import Paginatsiya from "@/Components/Paginatsiya";
import ExportButtons from "@/Components/ExportButtons";
import { reportItems } from "@/Components/ExportMenu";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import FilterActions from "@/Components/FilterActions";
import Input from "@/Components/Input";
import MassReportReconcile from "@/Components/MassReportReconcile";
import { sortParamsObject, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface, RasxodPaginationMetaInterface } from "@/interface";
import { RasxodTable } from "@/pageCompoents/rasxod/rasxodTable";
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
  Select,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

// "To'landi" holati filtri: "" — barchasi, aks holda backendga `is_paid`
type PaidFilter = "" | "true" | "false";

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<RasxodInterface>[] => [
  { header: "№", value: (r) => r.doc_num, width: 8, align: "center" },
  { header: tt(`Hujjat sanasi`, "Дата документа"), value: (r) => formatDate(r.doc_date), align: "center" },
  { header: tt("Qabul qiluvchi", "Получатель"), value: (r) => r.batalon_name },
  { header: tt("Izoh", "Примечание"), value: (r) => r.opisanie || "" },
  {
    header: tt("Summa", "Сумма"),
    value: (r) => formatNum(r.summa),
    excelValue: (r) => toNumber(r.summa) || 0,
    align: "right",
  },
];

export const Rasxod = () => {
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );

  const [search, setSearch] = React.useState({
    fromDate: startDate,
    toDate: endDate,
  });

  useEffect(() => {
    setSearch({ fromDate: startDate, toDate: endDate });
  }, [startDate, endDate]);

  const [rasxoddata, setRasxodData] = React.useState<RasxodInterface[]>([]);
  const [rasxodmeta, setRasxodMeta] =
    React.useState<RasxodPaginationMetaInterface>({
      pageCount: 0,
      count: 0,
      currentPage: 0,
      nextPage: null,
      backPage: null,
      summa_from: "",
      summa_to: "",
      summa: "",
    });

  const [limet, setLimet] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [__, setTotalPages] = useState(1);
  // const [active, setactive] = useState(1);
  const [_, setAll] = useState(10);
  const request = useRequest();
  const dispatch = useDispatch();

  const { account_number_id } = useSelector((state: any) => state.account);

  // Qidiruv matni (`search` — sana oralig'i uchun band) va saralash
  const [q, setQ] = useState("");
  const [searchText] = useDebounce(q.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();
  // Holat filtri qidiruv kabi faqat ro'yxat (va jami soni) ga ta'sir qiladi —
  // pastdagi yig'indi va hisobot bilan solishtirish sana oralig'i bo'yicha qoladi
  const [paidFilter, setPaidFilter] = useState<PaidFilter>("");

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listParams = (page: number, limit: number) => ({
    from: search.fromDate,
    to: search.toDate,
    account_number_id: account_number_id,
    limit,
    page,
    ...(searchText ? { search: searchText } : {}),
    ...(paidFilter ? { is_paid: paidFilter } : {}),
    ...sortParamsObject(sort),
  });

  const clearFilters = () => {
    setQ("");
    setPaidFilter("");
    resetSort();
    setSearch({ fromDate: startDate, toDate: endDate });
  };
  const getRasxod = async () => {
    try {
      if (!search.fromDate && !search.toDate) return;
      const res = await request.get("/rasxod", {
        params: listParams(currentPage, limet),
      });
      if (res.data.success) {
        let paginationmeta = res.data.meta as RasxodPaginationMetaInterface;
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
  // Backend hisoboti (Excel) — ⋮ menyuda Excel va xuddi o'sha hisobotning PDF varianti
  const fetchRasxodReport = async (): Promise<Blob> => {
    const response = await request({
      url: "/rasxod/export",
      method: "GET",
      params: listParams(currentPage, limet),
      responseType: "blob",
    });
    return response.data;
  };
  // Sana oralig'i o'zgarganda ro'yxat yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, search.fromDate, search.toDate, searchText, paidFilter, sort],
    fetch: getRasxod,
  });

  const navigate = useNavigate();
  const perm = usePermission("rasxod");

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        flush
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
                p={tt("№, qabul qiluvchi yoki izoh", "№, получатель или примечание")}
                className="h-9 w-full"
              />
            </div>

            <div className="w-full sm:w-44">
              <Select
                aria-label={tt("Holati", "Статус")}
                placeholder={tt("Barcha holatlar", "Все статусы")}
                options={[
                  { value: "true", label: tt("To'langan", "Оплаченные") },
                  { value: "false", label: tt("To'lanmagan", "Неоплаченные") },
                ]}
                value={paidFilter}
                onChange={(e) => setPaidFilter(e.target.value as PaidFilter)}
              />
            </div>

            <FilterActions onRefresh={getRasxod} onClear={clearFilters} />

            <ToolbarSpacer />

            {/* Backend hisoboti filtrlarni hisobga oladi — Excel ham, PDF ham o'sha hisobot */}
            <ExportButtons
              kinds={[]}
              extraItems={reportItems({
                key: "rasxod",
                fetchBlob: fetchRasxodReport,
                fileName: `rasxod-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`,
              })}
              title={tt("Chiqim", "Расход")}
              columns={exportColumns()}
              fetchRows={async () => {
                const res = await request.get("/rasxod", {
                  params: listParams(1, EXPORT_ALL_LIMIT),
                });
                return res?.data?.data ?? [];
              }}
            />
            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => navigate("/rasxod/create")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          rasxoddata && rasxodmeta ? (
            <>
              {/* Faqat tanlangan sana oralig'idagi yig'indi kerak —
                  boshlang'ich va yakuniy qoldiq bu yerda ko'rsatilmaydi */}
              <SummaryRow className="sm:grid-cols-1 lg:grid-cols-1">
                <SummaryTile
                  label={tt("Davr bo'yicha chiqim", "Расход за период")}
                  value={formatSum(rasxodmeta.summa ?? 0)}
                  tone="primary"
                />
              </SummaryRow>

              {/* "Ommaviy tadbirlar hisoboti"dagi "O'tkazildi" bilan solishtirish
                  (sahifa Jami = hisobot − outside + duplicate + other +
                  cancelled + batalon) */}
              {rasxodmeta.period_contract && (
                <MassReportReconcile
                  caption={tt("O'tkazildi", "Перечислено")}
                  total={rasxodmeta.period_contract.summa}
                  parts={[
                    { label: tt("IIO", "ОВД"), value: rasxodmeta.period_contract.iiv },
                    { label: tt("FVV", "МЧС"), value: rasxodmeta.period_contract.fvv },
                    { label: tt("MG harbiy qismlari", "Воинские части НГ"), value: rasxodmeta.period_contract.mg_qism },
                  ]}
                  onlyPage={[
                    {
                      label: tt("boshqa davrda tuzilgan shartnomalar bo'yicha", "по договорам других периодов"),
                      value: rasxodmeta.period_contract.other,
                    },
                    {
                      label: tt("«Batalon» turidagi quyi tuzilmalarga", "подразделениям типа «Батальон»"),
                      value: rasxodmeta.period_contract.batalon,
                    },
                    {
                      label: tt("bekor qilingan shartnomalar bo'yicha", "по отменённым договорам"),
                      value: rasxodmeta.period_contract.cancelled,
                    },
                    {
                      label: tt("bir topshiriq qayta chiqim qilingan", "задание проведено повторно"),
                      value: rasxodmeta.period_contract.duplicate,
                    },
                  ]}
                  onlyReport={[
                    {
                      label: tt("boshqa sanadagi chiqimlarda", "в расходах с другой датой"),
                      value: rasxodmeta.period_contract.outside,
                    },
                  ]}
                />
              )}

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
        <RasxodTable data={rasxoddata} getAllFn={getRasxod} sort={sort} onSort={toggleSort} />
      </ListCard>
    </div>
  );
};
