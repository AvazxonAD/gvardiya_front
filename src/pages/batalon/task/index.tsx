/** @format */

import { useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useSelector } from "react-redux";
import { getTasks } from "../../../api";
import Input from "../../../Components/Input";
import Paginatsiya from "../../../Components/Paginatsiya";
import TaskTable from "./table";
import { tt } from "../../../utils";

import ExportButtons from "@/Components/ExportButtons";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { useDebounce } from "use-debounce";
import { SpecialDatePicker } from "../../../Components/SpecialDatePicker";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import {
  ListCard,
  Select as UISelect,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

const round2 = (n: any) => Math.round((Number(n) || 0) * 100) / 100;

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<any>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Shartnoma raqami", "Номер договора"), value: (t) => t.contract_info?.doc_num ?? "", align: "center" },
  { header: tt("Xodimlar soni", "Количество сотрудников"), value: (t) => t.worker_number, align: "center" },
  { header: tt("Tadbir vaqti", "Время мероприятия"), value: (t) => t.task_time, align: "center" },
  {
    header: tt("Umumiy vaqt", "Общее время"),
    value: (t) => round2((Number(t.task_time) || 0) * (Number(t.worker_number) || 0)),
    align: "center",
  },
  { header: tt("Qolgan", "Остаток"), value: (t) => round2(t.remaining_task_time), align: "center" },
  { header: tt("Topshiriq muddati", "Крайний срок выполнения задания"), value: (t) => t.deadline ?? "", align: "center" },
  { header: tt("Manzil", "Адрес"), value: (t) => t.address ?? "" },
  { header: tt("Izoh", "Примечание"), value: (t) => t.comment ?? "" },
  { header: tt("Topshiriq holati", "Статус задания"), value: (t) => t.status ?? "", align: "center" },
];

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
      status,
      sortParams(sort)
    );

    setData(res.data);
    setTotalpage(res.meta.pageCount);
    setAll(res.meta.count);
  };

  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });

  const [searchingText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const clearFilters = () => {
    setDates({ date1: startDate, date2: endDate });
    setSearch("");
    setStatus("");
    resetSort();
  };

  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, status, searchingText, dates.date1, dates.date2, sort],
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
                p={tt("Shartnoma №, manzil yoki izoh bo'yicha", "По № договора, адресу или примечанию")}
                className="h-9 w-full"
              />
            </div>

            <div className="w-[11.875rem]">
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

            <FilterActions onRefresh={getInfo} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              title={tt("Topshiriqlar", "Задания")}
              columns={exportColumns()}
              fetchRows={async () => {
                const res = await getTasks(
                  JWT,
                  1,
                  EXPORT_ALL_LIMIT,
                  dates.date1,
                  dates.date2,
                  searchingText,
                  status,
                  sortParams(sort)
                );
                return res?.data ?? [];
              }}
            />
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
          sort={sort}
          onSort={toggleSort}
        />
      </ListCard>
    </div>
  );
}

export default BatalonTasks;
