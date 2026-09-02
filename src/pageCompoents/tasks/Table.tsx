import { ITask } from "@/types/task";
import { formatSum, tt } from "@/utils";
import React, { useCallback, useState } from "react";
import TableItem from "./TableItem";
import Icon from "@/assets/icons";
import { Info } from "lucide-react";
import {
  Button,
  DataTable,
  EmptyState,
  Modal,
  SummaryRow,
  SummaryTile,
  type TableColumn,
} from "@/ui";

const Table: React.FC<{ data: ITask[]; getTasks: Function; contract?: any }> = ({
  data: rawData,
  getTasks,
  contract,
}) => {
  // Javob kutilgan shaklda bo'lmasligi mumkin — `.reduce`/`.map` yiqilmasin
  const data: ITask[] = Array.isArray(rawData) ? rawData : [];
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [batalonModalOpen, setBatalonModalOpen] = useState<boolean>(false);
  const [workerStats, setWorkerStats] = useState<
    Record<number, { count: number; hours: number }>
  >({});

  const updateStats = useCallback(
    (taskId: number, count: number, hours: number) => {
      setWorkerStats((prev) => {
        const cur = prev[taskId];
        if (cur && cur.count === count && cur.hours === hours) return prev;
        return { ...prev, [taskId]: { count, hours } };
      });
    },
    []
  );

  const totals = data.reduce(
    (acc, row) => {
      const stats = workerStats[row.id];
      acc.workerNumber += Number(row.worker_number) || 0;
      acc.totalHours += (Number(row.worker_number) || 0) * (Number(row.task_time) || 0);
      acc.summa += Number(row.summa) || 0;
      acc.remaining += Number(row.remaining_task_time) || 0;
      if (!row.birgada && stats) {
        acc.attachedWorkers += stats.count;
        acc.attachedHours += stats.hours;
      }
      return acc;
    },
    {
      workerNumber: 0,
      totalHours: 0,
      summa: 0,
      remaining: 0,
      attachedWorkers: 0,
      attachedHours: 0,
    }
  );

  type BatalonGroup = {
    batalon_name: string;
    workerNumber: number;
    totalHours: number;
    summa: number;
    remaining: number;
    attachedWorkers: number;
    attachedHours: number;
  };

  const batalonGroups: BatalonGroup[] = Object.values(
    data.reduce((acc: Record<string, BatalonGroup>, row) => {
      const key = row.batalon_name || "-";
      if (!acc[key]) {
        acc[key] = {
          batalon_name: key,
          workerNumber: 0,
          totalHours: 0,
          summa: 0,
          remaining: 0,
          attachedWorkers: 0,
          attachedHours: 0,
        };
      }
      const g = acc[key];
      const stats = workerStats[row.id];
      g.workerNumber += Number(row.worker_number) || 0;
      g.totalHours += (Number(row.worker_number) || 0) * (Number(row.task_time) || 0);
      g.summa += Number(row.summa) || 0;
      g.remaining += Number(row.remaining_task_time) || 0;
      if (!row.birgada && stats) {
        g.attachedWorkers += stats.count;
        g.attachedHours += stats.hours;
      }
      return acc;
    }, {})
  ).sort((a, b) => a.batalon_name.localeCompare(b.batalon_name));

  const batalonColumns: TableColumn<BatalonGroup>[] = [
    {
      key: "name",
      header: tt("Batalon / Boshqarma nomi", "Название батальона / организации"),
      cell: (g) => <span className="font-medium">{g.batalon_name}</span>,
      sortValue: (g) => g.batalon_name,
    },
    {
      key: "workers",
      header: tt("Xodimlar soni", "Кол-во сотр."),
      align: "center",
      width: "120px",
      cell: (g) => <span className="tabular-nums">{g.workerNumber}</span>,
      sortValue: (g) => g.workerNumber,
    },
    {
      key: "hours",
      header: tt("Jami soat", "Всего часов"),
      align: "center",
      width: "110px",
      cell: (g) => <span className="tabular-nums">{g.totalHours}</span>,
      sortValue: (g) => g.totalHours,
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "150px",
      cell: (g) => (
        <span className="font-medium tabular-nums">{formatSum(g.summa)}</span>
      ),
      sortValue: (g) => g.summa,
    },
    {
      key: "remaining",
      header: tt("Qolgan vaqt", "Остаток"),
      align: "center",
      width: "110px",
      cell: (g) => (
        <span
          className={`font-medium tabular-nums ${
            g.remaining > 0 ? "text-destructive" : "text-success"
          }`}
        >
          {g.remaining}
        </span>
      ),
      sortValue: (g) => g.remaining,
    },
    {
      key: "attWorkers",
      header: tt("Birik. xodimlar", "Прикр. сотр."),
      align: "center",
      width: "130px",
      hideOnMobile: true,
      cell: (g) => <span className="tabular-nums">{g.attachedWorkers}</span>,
      sortValue: (g) => g.attachedWorkers,
    },
    {
      key: "attHours",
      header: tt("Birik. soat", "Прикр. часы"),
      align: "center",
      width: "120px",
      hideOnMobile: true,
      cell: (g) => <span className="tabular-nums">{g.attachedHours}</span>,
      sortValue: (g) => g.attachedHours,
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="table-grid w-full">
        <thead>
          <tr className="bg-muted/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="py-3 px-6 text-left border-b border-border">
              {tt(
                "Batalon / Boshqarma nomi",
                "Название батальона / организации"
              )}
            </th>
            <th className="py-3 px-6 text-center border-b border-border">
              {tt("Topshiriq vaqti", "Время задачи")}
            </th>
            <th className="py-3 px-6 text-center border-b border-border">
              <div className="flex items-center gap-2 justify-center">
                <Icon name="ava" />
                {tt("Xodimlar soni", "Количество сотрудников")}
              </div>
            </th>
            <th className="py-3 px-6 text-center border-b border-border">
              {tt("Jami soat", "Всего часов")}
            </th>
            <th className="py-3 px-6 text-left min-w-[170px] border-b border-border">
              {tt("Summa", "Сумма")}
            </th>
            <th className="py-3 px-6 text-center border-b border-border">
              {tt("Qolgan vaqt", "Оставшееся время")}
            </th>
<th className="py-3 px-6 text-center border-b border-border">
              {tt("Biriktirilgan jami xodimlar", "Всего прикреплённых сотрудников")}
            </th>
            <th className="py-3 px-6 text-center border-b border-border">
              {tt("Biriktirilgan jami soat", "Всего прикреплённых часов")}
            </th>
            <th className="py-3 px-6 text-left min-w-[200px] border-b border-border">
              {tt("Izoh", "Комментарий")}
            </th>
            <th className="py-3 px-6 text-center border-b border-border">
              {tt("Amallar", "Действия")}
            </th>
          </tr>
        </thead>
        <tbody className="text-sm font-light">
          {[...data]
            .sort((a, b) => Number(a.birgada) - Number(b.birgada))
            .map((row) => (
              <TableItem
                row={row}
                key={row.id}
                getTasks={getTasks}
                creatingId={creatingId}
                setCreatingId={setCreatingId}
                contract={contract}
                updateStats={updateStats}
              />
            ))}
        </tbody>
        {data.length > 0 && (
          <tfoot>
            <tr className="bg-muted/60 text-[13px] font-semibold text-foreground">
              <td className="py-3 px-6 text-left border-b border-border uppercase">
                {tt("Jami", "Итого")}
              </td>
              <td className="py-3 px-6 text-center border-b border-border"></td>
              <td className="py-3 px-6 text-center border-b border-border">
                {totals.workerNumber}
              </td>
              <td className="py-3 px-6 text-center border-b border-border">
                {totals.totalHours}
              </td>
              <td className="py-3 px-6 text-left border-b border-border">
                {formatSum(totals.summa)}
              </td>
              <td
                className={`py-3 px-6 text-center border-b border-border tabular-nums ${
                  totals.remaining > 0 ? "text-destructive" : "text-success"
                }`}
              >
                {totals.remaining}
              </td>
              <td className="py-3 px-6 text-center border-b border-border">
                {totals.attachedWorkers}
              </td>
              <td className="py-3 px-6 text-center border-b border-border">
                {totals.attachedHours}
              </td>
              <td className="py-3 px-6 border-b border-border"></td>
              <td className="py-3 px-6 border-b border-border">
                <div className="flex justify-center items-center">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setBatalonModalOpen(true)}
                    aria-label={tt("Batalonlar kesimida", "По батальонам")}
                    title={tt("Batalonlar kesimida", "По батальонам")}
                  >
                    <Info />
                  </Button>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
      <Modal
        open={batalonModalOpen}
        onClose={() => setBatalonModalOpen(false)}
        title={tt("Batalonlar kesimida", "По батальонам")}
        size="2xl"
        footer={
          <SummaryRow className="w-full px-0 pt-0 lg:grid-cols-5">
            <SummaryTile
              label={tt("Xodimlar soni", "Кол-во сотр.")}
              value={totals.workerNumber}
            />
            <SummaryTile
              label={tt("Jami soat", "Всего часов")}
              value={totals.totalHours}
            />
            <SummaryTile
              label={tt("Summa", "Сумма")}
              value={formatSum(totals.summa)}
            />
            <SummaryTile
              label={tt("Qolgan vaqt", "Остаток")}
              value={totals.remaining}
              tone={totals.remaining > 0 ? "danger" : "success"}
            />
            <SummaryTile
              label={tt("Biriktirilgan", "Прикреплено")}
              value={`${totals.attachedWorkers} / ${totals.attachedHours}`}
            />
          </SummaryRow>
        }
      >
        <DataTable
          columns={batalonColumns}
          rows={batalonGroups}
          keyOf={(g) => g.batalon_name}
          maxHeight={460}
          empty={
            <EmptyState
              icon={Info}
              title={tt("Ma'lumot yo'q", "Нет данных")}
            />
          }
        />
      </Modal>
    </div>
  );
};

export default Table;
