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
}: any) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [taskWorkers, setTaskWorkers] = useState<ITaskWorker[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [search] = useDebounce(searchTerm, 400);

  const api = useApi();

  useEffect(() => {
    (async () => {
      if (open) {
        const searchParam = searchTerm ? `&search=${searchTerm}` : "";

        const get = await api.get<ITaskWorker[]>(
          `worker_task/?task_id=${row.id}${searchParam}`
        );
        if (get?.success && get.data) {
          setTaskWorkers(get.data);
        }
      }
    })();
  }, [open, search]);


  const handleDelete = async (worker_id: number, task_id: number) => {
    const remove = await api.remove(
      `worker_task?worker_id=${worker_id}&task_id=${task_id}`
    );
    if (remove?.success) {
      const filter = taskWorkers.filter((w) => w.worker_id !== worker_id);
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
  console.log("--------------------------");

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
<td
          className={`px-4 py-3 text-center font-semibold border border-mytableheadborder ${
            row.status === "Muddati o'tgan"
              ? "text-red-600"
              : row.status === "Bajarilgan"
              ? "text-green-600"
              : row.status === "Bajarilmoqda"
              ? "text-yellow-600"
              : ""
          }`}
        >
          {!row.birgada ? row.status : ""}
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
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full border-collapse">
            <thead className="bg-mytablehead sticky top-[1px] z-30">
              <tr>
                <th className="border text-center w-[50px] py-2">№</th>
                <th className="border text-left py-2">
                  {tt("F.I.O", "Ф.И.О")}
                </th>
                <th className="border text-left py-2">
                  {tt("Topshiriq vaqti", "Время задачи")}
                </th>
                <th className="border text-left py-2">
                  {tt("Summa", "Сумма")}
                </th>
                <th className="border text-left py-2">
                  {tt("Foydalanuvchi", "Фойдаланувчи")}
                </th>
                <th className="border text-left py-2">
                  {tt("Sana / Vaqt", "Дата / Время")}
                </th>
                <th className="border text-center w-[100px] py-2">
                  {tt("Amallar", "Действия")}
                </th>
              </tr>
            </thead>
            <tbody>
              {taskWorkers.map((e, ind) => (
                <tr key={ind} className="hover:text-[#3B7FAF] text-mytextcolor">
                  <td className="border py-3 px-6 text-center font-[500] text-[14px]">
                    {ind + 1}
                  </td>
                  <td className="border py-3 px-6 text-left font-[500] text-[14px]">
                    {e.fio}
                  </td>
                  <td className="border py-3 px-6 text-left font-[500] text-[14px]">
                    {e.task_time}
                  </td>
                  <td className="border py-3 px-6 text-left font-[500] text-[14px]">
                    {e.summa}
                  </td>
                  <td className="border py-3 px-6 text-left font-[500] text-[14px]">
                    {e.user}
                  </td>
                  <td className="border py-3 px-6 text-left font-[500] text-[12px]">
                    {(e as any).dates?.map((d: any, i: number) => (
                      <div key={i} className="whitespace-nowrap">
                        {d.task_date ? formatDate(d.task_date) : ""}{" "}
                        {d.start_time && d.end_time ? `${d.start_time}-${d.end_time}` : d.start_time || ""}
                        {d.task_time ? ` (${d.task_time} ${tt("soat", "ч")})` : ""}
                      </div>
                    ))}
                  </td>
                  <td className="border py-3 px-6 text-center font-[500] text-[14px]">
                    <button onClick={() => handleDelete(e.worker_id, row.id)}>
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
