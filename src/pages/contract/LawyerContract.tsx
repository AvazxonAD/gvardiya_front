import { useEffect, useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useSelector } from "react-redux";
import Input from "../../Components/Input";
import Paginatsiya from "../../Components/Paginatsiya";
import { getCont } from "../../api";
import ContTab from "../../pageCompoents/ContTab";
import { tt } from "../../utils";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { RootState } from "@/Redux/store";
import { useDebounce } from "use-debounce";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button as UIButton,
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
  const [searchText] = useDebounce(value, 500);
  const [limet, setLimet] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [all, setAll] = useState(10);
  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  useEffect(() => {
    setDates({ date1: startDate, date2: endDate });
  }, [startDate, endDate]);

  //@ts-ignore
  const account_id = useSelector((state) => state.account.account_number_id);

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
      ""
    );
    setData(res.data || []);
    setTotalPages(res.meta.pageCount);
    setAll(res.meta?.total || (res.data || []).length);
  };

  const filteredData = data.filter((item: any) => {
    if (filter === "verified") return item.verification_lawyer === "success";
    if (filter === "pending") return item.verification_lawyer !== "success";
    return true;
  });

  // Filtrlar o'zgarishi bilan ro'yxat o'zi yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, searchText, account_id, dates.date1, dates.date2],
    fetch: () => getInfo(dates),
  });


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
                p={tt("Ma'lumotlarni qidirish", "Поиск данных")}
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
                    "rounded-none px-3 py-1.5 text-[13px] font-medium transition-colors",
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

            <ToolbarSpacer />

            <UIButton
              variant="ghost"
              size="sm"
              onClick={async () => {
                setDates({ date1: startDate, date2: endDate });
                setValue("");
                getInfo({ date1: startDate, date2: endDate });
              }}
            >
              <RotateCcw />
              {tt("Tozalash", "Очистить")}
            </UIButton>
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
        <ContTab data={filteredData} hideActions isLawyer />
      </ListCard>
    </div>
  );
}

export default LawyerContract;
