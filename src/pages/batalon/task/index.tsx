/** @format */

import { useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useSelector } from "react-redux";
import { getTasks } from "../../../api";
import Input from "../../../Components/Input";
import Paginatsiya from "../../../Components/Paginatsiya";
import TaskTable from "./table";
import { tt } from "../../../utils";

import { useDebounce } from "use-debounce";
import { SpecialDatePicker } from "../../../Components/SpecialDatePicker";
import { RotateCcw } from "lucide-react";
import {
  Button as UIButton,
  ListCard,
  Select as UISelect,
  Toolbar,
} from "@/ui";

function BatalonTasks() {
  const now = new Date();
  const currentYear = now.getFullYear();

  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const startDate = formatLocalDate(startOfYear);
  const endDate = formatLocalDate(endOfYear);

  const [data, setData] = useState<any[]>([]);
  const JWT = useSelector((s: any) => s.auth.jwt);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalpage] = useState(10);
  const [setActive] = useState(1);
  const [search, setSearch] = useState("");
  const [limet, setLimet] = useState(15);
  const [all, setAll] = useState(10);
  const [status, setStatus] = useState("");

  const getInfo = async () => {
    const res = await getTasks(
      JWT,
      currentPage,
      limet,
      dates.date1,
      dates.date2,
      searchingText,
      status
    );

    setData(res.data);
    setTotalpage(res.meta.pageCount);
    setAll(res.meta.count);
  };

  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });

  const [searchingText] = useDebounce(search, 500);

  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, status, searchingText, dates.date1, dates.date2],
    fetch: getInfo,
  });

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt("Ismlar bo’yicha qidiruv", "Поиск по имени")}
                className="h-9 w-full"
              />
            </div>

            <div className="w-[190px]">
              <UISelect
                selectSize="sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder={tt("Barchasi", "Все")}
                options={[
                  { value: "done", label: tt("Bajarilgan", "Выполнено") },
                  { value: "progress", label: tt("Bajarilmoqda", "В работе") },
                  { value: "extended", label: tt("Muddati o'tgan", "Просрочено") },
                ]}
              />
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

            <UIButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setDates({ date1: startDate, date2: endDate });
                setSearch("");
                setStatus("");
              }}
            >
              <RotateCcw />
              {tt("Tozalash", "Очистить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          <Paginatsiya
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            limet={limet}
            setLimet={setLimet}
            count={all}
          />
        }
      >
        <TaskTable
          setActive={setActive}
          page={currentPage}
          itemsPerPage={10}
          data={data}
        />
      </ListCard>
    </div>
  );
}

export default BatalonTasks;
