import { useEffect, useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useSelector } from "react-redux";
import Input from "../../Components/Input";
import Paginatsiya from "../../Components/Paginatsiya";
import { getCont } from "../../api";
import ContTab, { contExportColumns } from "../../pageCompoents/ContTab";
import { tt } from "../../utils";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { EXPORT_ALL_LIMIT } from "@/lib/tableExport";
import { RootState } from "@/Redux/store";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import {
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

function LawyerContract() {
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );
  const [data, setData] = useState([]);
  const JWT = useSelector((s: any) => s.auth.jwt);

  const [value, setValue] = useState("");
  const [searchText] = useDebounce(value.trim(), 500);
  const [limet, setLimet] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [all, setAll] = useState(10);
  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  useEffect(() => {
    setDates({ date1: startDate, date2: endDate });
  }, [startDate, endDate]);

  //@ts-ignore
  const account_id = useSelector((state) => state.account.account_number_id);

  // Tasdiq filtri backendda — butun ro'yxat bo'yicha, faqat joriy sahifada emas
  // lawyer_view — bu sahifada faqat yuristga yuborilgan shartnomalar
  // (yuristga "Shartnomalar" bo'limi ham berilgan bo'lsa ham)
  const extraParams = () =>
    "&lawyer_view=true" +
    sortParams(sort) +
    (filter !== "all" ? `&lawyer_status=${filter}` : "");

  const getInfo = async (dates?: any) => {
    const res = await getCont(
      JWT,
      dates,
      currentPage,
      limet,
      searchText,
      account_id,
      0,
      "",
      "",
      "",
      extraParams()
    );
    setData(res.data || []);
    setTotalPages(res.meta.pageCount);
    setAll(res.meta?.count ?? (res.data || []).length);
  };

  // Filtrlar o'zgarishi bilan ro'yxat o'zi yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, searchText, account_id, dates.date1, dates.date2, sort, filter],
    fetch: () => getInfo(dates),
  });

  const clearFilters = () => {
    setDates({ date1: startDate, date2: endDate });
    setValue("");
    setFilter("all");
    resetSort();
  };


  const FILTERS: { id: "all" | "verified" | "pending"; label: string }[] = [
    { id: "all", label: tt("Barchasi", "Все") },
    { id: "verified", label: tt("Tasdiqlangan", "Утверждено") },
    { id: "pending", label: tt("Tasdiqlanmagan", "Не утверждено") },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                v={value}
                change={(e: any) => setValue(e.target.value)}
                search={true}
                p={tt("№, tashkilot, INN, manzil yoki batalon", "№, организация, ИНН, адрес или батальон")}
                className="h-9 w-full"
              />
            </div>

            {/* Segmentli filtr — bosilgan band ta'kidlanadi */}
            <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={cn(
                    "rounded-none px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                    filter === f.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <SpecialDatePicker
                defaultValue={dates.date1}
                onChange={(e) => setDates({ ...dates, date1: e })}
              />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker
                defaultValue={dates.date2}
                onChange={(e) => setDates({ ...dates, date2: e })}
              />
            </div>

            <FilterActions onRefresh={() => getInfo(dates)} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              title={tt("Yurist shartnoma", "Договор юриста")}
              columns={contExportColumns()}
              fetchRows={async () => {
                const res = await getCont(
                  JWT,
                  dates,
                  1,
                  EXPORT_ALL_LIMIT,
                  searchText,
                  account_id,
                  0,
                  "",
                  "",
                  "",
                  extraParams()
                );
                return res?.data ?? [];
              }}
            />
          </Toolbar>
        }
        footer={
          data ? (
            <Paginatsiya
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              limet={limet}
              setLimet={setLimet}
              count={all}
            />
          ) : null
        }
      >
        <ContTab
          data={data}
          hideActions
          isLawyer
          sort={sort}
          onSort={toggleSort}
        />
      </ListCard>
    </div>
  );
}

export default LawyerContract;
