import { ITask } from "@/types/task";
import { formatSum, tt } from "@/utils";
import React, { useCallback, useState } from "react";
import TableItem from "./TableItem";
import Icon from "@/assets/icons";
import Modal from "@/Components/Modal";
import { Info } from "lucide-react";

const Table: React.FC<{ data: ITask[]; getTasks: Function; contract?: any }> = ({
  data,
  getTasks,
  contract,
}) => {
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
            <th className="py-3 px-6 text-left min-w-[200px] border border-mytableheadborder">
              {tt("Izoh", "Комментарий")}
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
              <td className="py-3 px-6 border border-mytableheadborder">
                <div className="flex justify-center items-center">
                  <button
                    type="button"
                    onClick={() => setBatalonModalOpen(true)}
                    title={tt("Batalonlar kesimida", "По батальонам")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Info size={20} />
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
      <Modal
        open={batalonModalOpen}
        closeModal={() => setBatalonModalOpen(false)}
        title={tt("Batalonlar kesimida", "По батальонам")}
        w="900px"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-mytableheadborder">
            <thead>
              <tr className="bg-mytablehead text-mytextcolor uppercase text-[12px]">
                <th className="py-2 px-3 text-left border border-mytableheadborder">
                  {tt("Batalon / Boshqarma nomi", "Название батальона / организации")}
                </th>
                <th className="py-2 px-3 text-center border border-mytableheadborder">
                  {tt("Xodimlar soni", "Кол-во сотр.")}
                </th>
                <th className="py-2 px-3 text-center border border-mytableheadborder">
                  {tt("Jami soat", "Всего часов")}
                </th>
                <th className="py-2 px-3 text-left border border-mytableheadborder">
                  {tt("Summa", "Сумма")}
                </th>
                <th className="py-2 px-3 text-center border border-mytableheadborder">
                  {tt("Qolgan vaqt", "Остаток")}
                </th>
                <th className="py-2 px-3 text-center border border-mytableheadborder">
                  {tt("Birik. xodimlar", "Прикр. сотр.")}
                </th>
                <th className="py-2 px-3 text-center border border-mytableheadborder">
                  {tt("Birik. soat", "Прикр. часы")}
                </th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-mytextcolor">
              {batalonGroups.map((g) => (
                <tr key={g.batalon_name}>
                  <td className="py-2 px-3 text-left border border-mytableheadborder font-[500]">
                    {g.batalon_name}
                  </td>
                  <td className="py-2 px-3 text-center border border-mytableheadborder">
                    {g.workerNumber}
                  </td>
                  <td className="py-2 px-3 text-center border border-mytableheadborder">
                    {g.totalHours}
                  </td>
                  <td className="py-2 px-3 text-left border border-mytableheadborder">
                    {formatSum(g.summa)}
                  </td>
                  <td
                    style={{ color: g.remaining > 0 ? "red" : "green" }}
                    className="py-2 px-3 text-center border border-mytableheadborder"
                  >
                    {g.remaining}
                  </td>
                  <td className="py-2 px-3 text-center border border-mytableheadborder">
                    {g.attachedWorkers}
                  </td>
                  <td className="py-2 px-3 text-center border border-mytableheadborder">
                    {g.attachedHours}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-mytablehead text-mytextcolor font-bold text-[13px]">
                <td className="py-2 px-3 text-left border border-mytableheadborder uppercase">
                  {tt("Jami", "Итого")}
                </td>
                <td className="py-2 px-3 text-center border border-mytableheadborder">
                  {totals.workerNumber}
                </td>
                <td className="py-2 px-3 text-center border border-mytableheadborder">
                  {totals.totalHours}
                </td>
                <td className="py-2 px-3 text-left border border-mytableheadborder">
                  {formatSum(totals.summa)}
                </td>
                <td
                  style={{ color: totals.remaining > 0 ? "red" : "green" }}
                  className="py-2 px-3 text-center border border-mytableheadborder"
                >
                  {totals.remaining}
                </td>
                <td className="py-2 px-3 text-center border border-mytableheadborder">
                  {totals.attachedWorkers}
                </td>
                <td className="py-2 px-3 text-center border border-mytableheadborder">
                  {totals.attachedHours}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default Table;
