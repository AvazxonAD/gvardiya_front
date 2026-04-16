import { ITask } from "@/types/task";
import { formatSum, tt } from "@/utils";
import React, { useCallback, useState } from "react";
import TableItem from "./TableItem";
import Icon from "@/assets/icons";

const Table: React.FC<{ data: ITask[]; getTasks: Function; contract?: any }> = ({
  data,
  getTasks,
  contract,
}) => {
  const [creatingId, setCreatingId] = useState<number | null>(null);
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

  return (
    <div className="overflow-x-auto my-5">
      <table className="min-w-full border-collapse border border-mytableheadborder">
        <thead>
          <tr className="bg-mytablehead text-mytextcolor uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left border border-mytableheadborder">
              {tt(
                "Batalon / Boshqarma nomi",
                "Название батальона / организации"
              )}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Topshiriq vaqti", "Время задачи")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              <div className="flex items-center gap-2 justify-center">
                <Icon name="ava" />
                {tt("Xodimlar soni", "Количество сотрудников")}
              </div>
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Jami soat", "Всего часов")}
            </th>
            <th className="py-3 px-6 text-left min-w-[170px] border border-mytableheadborder">
              {tt("Summa", "Сумма")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Qolgan vaqt", "Оставшееся время")}
            </th>
<th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Biriktirilgan jami xodimlar", "Всего прикреплённых сотрудников")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Biriktirilgan jami soat", "Всего прикреплённых часов")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
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
            <tr className="bg-mytablehead text-mytextcolor font-bold text-sm">
              <td className="py-3 px-6 text-left border border-mytableheadborder uppercase">
                {tt("Jami", "Итого")}
              </td>
              <td className="py-3 px-6 text-center border border-mytableheadborder"></td>
              <td className="py-3 px-6 text-center border border-mytableheadborder">
                {totals.workerNumber}
              </td>
              <td className="py-3 px-6 text-center border border-mytableheadborder">
                {totals.totalHours}
              </td>
              <td className="py-3 px-6 text-left border border-mytableheadborder">
                {formatSum(totals.summa)}
              </td>
              <td
                style={{ color: totals.remaining > 0 ? "red" : "green" }}
                className="py-3 px-6 text-center border border-mytableheadborder"
              >
                {totals.remaining}
              </td>
              <td className="py-3 px-6 text-center border border-mytableheadborder">
                {totals.attachedWorkers}
              </td>
              <td className="py-3 px-6 text-center border border-mytableheadborder">
                {totals.attachedHours}
              </td>
              <td className="py-3 px-6 border border-mytableheadborder"></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default Table;
