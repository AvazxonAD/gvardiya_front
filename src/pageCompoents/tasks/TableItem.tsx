import Icon from "@/assets/icons";
import Modal from "@/Components/Modal";
import Table from "@/Components/reusable/table/Table";
import useApi from "@/services/api";
import { ITask, ITaskWorker } from "@/types/task";
import { formatDate, formatSum, tt } from "@/utils";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import EditForm from "./editForm";
import Input from "@/Components/Input";
import { useDebounce } from "use-debounce";
import { CheckCircle2, XCircle } from "lucide-react";
import { alertt } from "@/Redux/LanguageSlice";
import { useDispatch } from "react-redux";

type Props = {
  row: ITask;
  getTasks: Function;
  creatingId: number | null;
  setCreatingId: Dispatch<SetStateAction<number | null>>;
};

const TableItem = ({
  row,
  getTasks,
  creatingId,
  setCreatingId,
  contract,
  updateStats,
}: any) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [taskWorkers, setTaskWorkers] = useState<ITaskWorker[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [search] = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!updateStats) return;
    const count = row.birgada ? 0 : taskWorkers.length;
    const hours = row.birgada
      ? 0
      : taskWorkers.reduce(
          (acc, w: any) => acc + (Number(w.task_time) || 0),
          0
        );
    updateStats(row.id, count, hours);
  }, [taskWorkers, row.birgada, row.id, updateStats]);

  const api = useApi();

  const fetchTaskWorkers = async (withSearch: boolean = false) => {
    const searchParam = withSearch && searchTerm ? `&search=${searchTerm}` : "";
    const get = await api.get<ITaskWorker[]>(
      `worker_task/?task_id=${row.id}${searchParam}`
    );
    if (get?.success && get.data) {
      setTaskWorkers(get.data);
    }
  };

  useEffect(() => {
    fetchTaskWorkers(false);
  }, [row.id, row.remaining_task_time]);

  useEffect(() => {
    if (open) fetchTaskWorkers(true);
  }, [open, search]);


  const handleDelete = async (id: number, task_id: number) => {
    const remove = await api.remove(
      `worker_task?id=${id}&task_id=${task_id}`
    );
    if (remove?.success) {
      const filter = taskWorkers.filter((w: any) => w.id !== id);
      setTaskWorkers(filter);
      getTasks();
    } else {
      dispatch(
        alertt({
          text: remove.message,
          success: remove.success,
        })
      );
    }
  };

  return (
    <React.Fragment>
      <tr className="text-mytextcolor">
        <td className="py-3 px-6 text-left font-[500] text-[14px] border border-mytableheadborder">
          {row.batalon_name}
        </td>
        <td className="py-3 px-6 text-center font-[500] text-[14px] border border-mytableheadborder">
          {row.task_time}
        </td>
        <td className="py-3 px-6 text-center font-[500] text-[14px] border border-mytableheadborder">
          {row.worker_number}
        </td>
        <td className="py-3 px-6 text-center font-[500] text-[14px] border border-mytableheadborder">
          {row.worker_number * row.task_time}
        </td>
        <td className="py-3 px-6 text-left font-[500] text-[14px] border border-mytableheadborder">
          {formatSum(row.summa)}
        </td>
        <td
          style={{ color: row.remaining_task_time > 0 ? "red" : "green" }}
          className={`py-3 px-6 text-left font-[500] text-[14px] border border-mytableheadborder`}
        >
          <div className="flex items-center gap-2 justify-center">
            <p>{row.remaining_task_time}</p>
            {row.remaining_task_time === 0 && !row.birgada && (
              <div style={{ color: "green" }}>
                <CheckCircle2 />
              </div>
            )}
            {row.remaining_task_time > 0 && !row.birgada && (
              <div style={{ color: "red" }}>
                <XCircle />
              </div>
            )}
          </div>
        </td>
<td className="px-4 py-3 text-center font-semibold border border-mytableheadborder text-mytextcolor">
          {!row.birgada ? taskWorkers.length : ""}
        </td>
        <td className="px-4 py-3 text-center font-semibold border border-mytableheadborder text-mytextcolor">
          {!row.birgada
            ? taskWorkers.reduce(
                (acc, w: any) => acc + (Number(w.task_time) || 0),
                0
              )
            : ""}
        </td>
        <td className="py-3 px-6 border border-mytableheadborder">
          <div className="flex justify-center items-center gap-2 font-[500] text-[14px]">
          {!row.birgada && (
            <>
              <button
                onClick={() => {
                  if (row.remaining_task_time > 0) {
                    setCreatingId(creatingId === row.id ? null : row.id);
                  }
                }}
              >
                <Icon name="plus" />
              </button>
              <button
                onClick={() => setOpen(true)}
              >
                <Icon name="eye" />
              </button>
            </>
          )}
          </div>
        </td>
      </tr>
      {creatingId === row.id && (
        <tr className="w-full">
          <td colSpan={12}>
            <div className="transition duration-500 ease-in-out transform translate-y-0 bg-gray-100 dark:bg-mytablehead w-full">
              <EditForm
                row={row}
                closeForm={setCreatingId}
                getTasks={getTasks}
                contract={contract}
              />
            </div>
          </td>
        </tr>
      )}

      <Modal
        open={open}
        closeModal={() => setOpen(false)}
        title={tt("Xodimlarni ko’rish", "Просмотр сотрудников")}
        w={"80%"}
      >
        {/* Sticky input qismi */}
        <div className="sticky top-0 z-40 bg-mybackground pt-2 pb-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="w-[400px]">
              <Input
                p={tt("Ismlar bo'yicha qidiriuv", "Поиск по именам")}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                v={searchTerm}
                change={(e: any) => setSearchTerm(e.target.value)}
                removeValue={() => setSearchTerm("")}
                search
              />
            </div>
            <div className="flex items-center gap-3 text-mytextcolor text-[14px] font-[500] flex-wrap">
              <div className="px-3 py-2 border border-mytableheadborder rounded bg-mytablehead">
                {tt("Xodimlar soni", "Количество сотрудников")}:{" "}
                <span className="font-bold">{row.worker_number}</span>
              </div>
              <div className="px-3 py-2 border border-mytableheadborder rounded bg-mytablehead">
                {tt("Tadbir soati", "Часы мероприятия")}:{" "}
                <span className="font-bold">{row.task_time}</span>
              </div>
              <div className="px-3 py-2 border border-mytableheadborder rounded bg-mytablehead">
                {tt("Jami soat", "Всего часов")}:{" "}
                <span className="font-bold">
                  {row.worker_number * row.task_time}
                </span>
              </div>
              <div className="px-3 py-2 border border-mytableheadborder rounded bg-mytablehead">
                {tt("Biriktirilgan jami xodimlar soni", "Всего прикреплённых сотрудников")}:{" "}
                <span className="font-bold">{taskWorkers.length}</span>
              </div>
              <div className="px-3 py-2 border border-mytableheadborder rounded bg-mytablehead">
                {tt("Biriktirilgan jami soat", "Всего прикреплённых часов")}:{" "}
                <span className="font-bold">
                  {taskWorkers.reduce(
                    (acc, w) => acc + (Number(w.task_time) || 0),
                    0
                  )}
                </span>
              </div>
              <div
                className={`px-3 py-2 border rounded ${
                  row.remaining_task_time > 0
                    ? "border-red-300 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                    : "border-green-300 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                }`}
              >
                {tt("Qolgan vaqt", "Оставшееся время")}:{" "}
                <span className="font-bold">{row.remaining_task_time}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full border-collapse">
            <thead className="bg-mytablehead sticky top-[1px] z-30">
              <tr>
                <th className="border-2 border-mytableheadborder text-center w-[50px] py-2">№</th>
                <th className="border-2 border-mytableheadborder text-left py-2 px-3">
                  {tt("F.I.O", "Ф.И.О")}
                </th>
                <th className="border-2 border-mytableheadborder text-left py-2 px-3">
                  {tt("Topshiriq vaqti", "Время задачи")}
                </th>
                <th className="border-2 border-mytableheadborder text-left py-2 px-3">
                  {tt("Summa", "Сумма")}
                </th>
                <th className="border-2 border-mytableheadborder text-left py-2 px-3">
                  {tt("Foydalanuvchi", "Фойдаланувчи")}
                </th>
                <th className="border-2 border-mytableheadborder text-left py-2 px-3">
                  {tt("Sana / Vaqt", "Дата / Время")}
                </th>
                <th className="border-2 border-mytableheadborder text-center w-[100px] py-2">
                  {tt("Amallar", "Действия")}
                </th>
              </tr>
            </thead>
            <tbody>
              {taskWorkers.map((e: any, ind) => (
                <tr key={e.id ?? ind} className="hover:text-[#3B7FAF] text-mytextcolor">
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-center font-[500] text-[14px]">
                    {ind + 1}
                  </td>
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-left font-[500] text-[14px]">
                    {e.fio}
                  </td>
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-left font-[500] text-[14px]">
                    {e.task_time}
                  </td>
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-left font-[500] text-[14px]">
                    {formatSum(e.summa)}
                  </td>
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-left font-[500] text-[14px]">
                    {e.user}
                  </td>
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-left font-[500] text-[13px] whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {e.task_date && (
                        <span className="font-semibold">
                          📅 {formatDate(e.task_date)}
                        </span>
                      )}
                      {(e.start_time || e.end_time) && (
                        <span className="text-[12px] text-gray-500 dark:text-gray-400">
                          🕒{" "}
                          {e.start_time && e.end_time
                            ? `${e.start_time} - ${e.end_time}`
                            : e.start_time || e.end_time}
                        </span>
                      )}
                      {e.task_time ? (
                        <span className="text-[12px] inline-block w-fit px-2 py-[1px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {e.task_time} {tt("soat", "ч")}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="border-2 border-mytableheadborder py-3 px-6 text-center font-[500] text-[14px]">
                    <button onClick={() => handleDelete(e.id, row.id)}>
                      <Icon name="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

    </React.Fragment>
  );
};

export default TableItem;
