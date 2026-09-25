import Table from "@/pageCompoents/tasks/Table";
import useApi from "@/services/api";
import { ITask, ITaskWorker } from "@/types/task";
import { IContractForm } from "@/types/contract";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { formatDate, formatSum, toNumber, tt } from "@/utils";
import { Card } from "@/ui";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import type { ExportColumn } from "@/lib/tableExport";

type ExportTask = ITask & { attached_workers: number; attached_hours: number };

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<ExportTask>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Batalon / Boshqarma nomi", "Название батальона / организации"), value: (t) => t.batalon_name },
  { header: tt("Topshiriq vaqti", "Время задачи"), value: (t) => t.task_time, align: "center" },
  { header: tt("Xodimlar soni", "Количество сотрудников"), value: (t) => t.worker_number, align: "center" },
  {
    header: tt("Jami soat", "Всего часов"),
    value: (t) => (Number(t.worker_number) || 0) * (Number(t.task_time) || 0),
    align: "center",
  },
  { header: tt("Summa", "Сумма"), value: (t) => formatSum(t.summa), excelValue: (t) => toNumber(t.summa), align: "right" },
  { header: tt("Qolgan vaqt", "Оставшееся время"), value: (t) => t.remaining_task_time, align: "center" },
  {
    header: tt("Biriktirilgan jami xodimlar", "Всего прикреплённых сотрудников"),
    value: (t) => (!t.birgada ? t.attached_workers : ""),
    align: "center",
  },
  {
    header: tt("Biriktirilgan jami soat", "Всего прикреплённых часов"),
    value: (t) => (!t.birgada ? t.attached_hours : ""),
    align: "center",
  },
  { header: tt("Izoh", "Комментарий"), value: (t) => t.comment || "" },
];

function Tasks() {
  const [data, setData] = useState<ITask[]>([]);
  const [contract, setContract] = useState<IContractForm | null>(null);
  const { account_number_id } = useSelector((state: any) => state.account);
  const api = useApi();

  const { id } = useParams();
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // Ro'yxat ham, eksport ham shu so'rov bilan (saralash backendda)
  const listUrl = () =>
    `task/contract/${id}?account_number_id=${account_number_id}` + sortParams(sort);

  const getInfo = async () => {
    const get = await api.get<ITask[]>(listUrl());
    if (get?.success && get.data) {
      setData(get.data);
    }
  };

  const getContract = async () => {
    const get = await api.get<IContractForm>(`contract/${id}?account_number_id=${account_number_id}`);
    if (get?.success && get.data) {
      setContract(get.data);
    }
  };

  // Eksport: topshiriqlar + har biriga biriktirilgan xodimlar (jadvaldagidek)
  const fetchExportRows = async (): Promise<ExportTask[]> => {
    const get = await api.get<ITask[]>(listUrl());
    const tasks = Array.isArray(get?.data) ? get.data : [];
    const rows = await Promise.all(
      tasks.map(async (t) => {
        if (t.birgada) return { ...t, attached_workers: 0, attached_hours: 0 };
        const w = await api.get<ITaskWorker[]>(`worker_task/?task_id=${t.id}`);
        const workers = Array.isArray(w?.data) ? w.data : [];
        return {
          ...t,
          attached_workers: workers.length,
          attached_hours: workers.reduce((acc, x) => acc + (Number(x.task_time) || 0), 0),
        };
      })
    );
    return rows;
  };

  useEffect(() => {
    getContract();
  }, []);

  // Saralash o'zgarganda ro'yxat backenddan qayta olinadi
  useEffect(() => {
    getInfo();
  }, [sort]);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {contract && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-lg border border-border bg-card px-4 py-3 text-[0.8125rem] text-foreground">
          <div>
            <span className="text-muted-foreground">{tt("Shartnoma raqami", "Номер договора")}: </span>
            <span className="font-semibold">{contract.doc_num}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Shartnoma sanasi", "Дата договора")}: </span>
            <span className="font-semibold">{formatDate(contract.doc_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Boshlanish sanasi", "Дата начала")}: </span>
            <span className="font-semibold">{formatDate(contract.start_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Tugallash sanasi", "Дата окончания")}: </span>
            <span className="font-semibold">{formatDate(contract.end_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Boshlanish vaqti", "Время начала")}: </span>
            <span className="font-semibold">{contract.start_time}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Tugallash vaqti", "Время окончания")}: </span>
            <span className="font-semibold">{contract.end_time}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <FilterActions onRefresh={getInfo} onClear={resetSort} />
            <ExportButtons
              title={tt("Topshiriqlar", "Задачи")}
              columns={exportColumns()}
              fetchRows={fetchExportRows}
            />
          </div>
        </div>
      )}
      <Card className="overflow-hidden">
        <Table
          getTasks={getInfo}
          data={data}
          contract={contract}
          sort={sort}
          onSort={toggleSort}
        />
      </Card>
    </div>
  );
}

export default Tasks;
