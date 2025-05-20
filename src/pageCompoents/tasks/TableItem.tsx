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
import { FiClock } from "react-icons/fi";
import DateModal from "./update.deadline";
import { alertt } from "@/Redux/LanguageSlice";
import { useDispatch } from "react-redux";

type Props = {
  row: ITask;
  getTasks: Function;
  editingId: number | null;
  creatingId: number | null;
  setEditingId: Dispatch<SetStateAction<number | null>>;
  setCreatingId: Dispatch<SetStateAction<number | null>>;
};

const TableItem = ({
  row,
  getTasks,
  editingId,
  creatingId,
  setEditingId,
  setCreatingId,
}: any) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [taskWorkers, setTaskWorkers] = useState<ITaskWorker[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [search] = useDebounce(searchTerm, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [clockId, setclockId] = useState<number | null>(null);

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
  }, [open, search, clockId, modalOpen]);

  const handleSaveDeadline = async (date: string) => {
    try {
      const response: any = await api.update(`task/${clockId}`, {
        deadline: date,
      });

      if (response.success) {
        dispatch(
          alertt({
            text: tt("Muvaffaqiyatli bajarildi", "Успешно выполнено"),
            success: true,
          })
        );
        setModalOpen(false);
        setclockId(null);

        window.location.reload();
      } else {
        dispatch(
          alertt({
            text: response.message,
            success: response.success,
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleclockClick = (id: number) => {
    setclockId(id);
    setModalOpen(true);
  };

  const handleEditClick = (id: number) => {
    setCreatingId(null);
    setEditingId(editingId === id ? null : id);
  };

  const handleDelete = async (worker_id: number, task_id: number) => {
    const remove = await api.remove(
      `worker_task?worker_id=${worker_id}&task_id=${task_id}`
    );
    if (remove?.success) {
      const filter = taskWorkers.filter((w) => w.worker_id !== worker_id);
      setTaskWorkers(filter);
      getTasks();
    }
  };

  return (
    <React.Fragment>
      <tr className="border-b border-mytableheadborder text-mytextcolor">
        <td className="py-3 px-6 text-left font-[500] text-[14px]">
          {row?.contract_number ?? ""}
        </td>
        <td className="py-3 px-6 text-left font-[500] text-[14px]">
          {row.batalon_name}
        </td>
        <td className="py-3 px-6 text-center font-[500] text-[14px]">
          {row.task_time}
        </td>
        <td className="py-3 px-6 text-center font-[500] text-[14px]">
          {row.worker_number}
        </td>
        <td className="py-3 px-6 text-left font-[500] text-[14px]">
          {formatSum(row.summa)}
        </td>
        <td className="py-3 px-6 text-left font-[500] text-[14px]">
          {formatDate(row.task_date)}
        </td>
        <td
          style={{ color: row.remaining_task_time > 0 ? "red" : "green" }}
          className={`py-3 px-6 text-left font-[500] text-[14px]`}
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
        <td className="py-3 px-6 text-center font-[500] text-[14px]">
          {!row.birgada ? formatDate(row.deadline) : ""}
        </td>
        <td
          className={`px-4 py-3 text-center font-semibold ${
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
        <td className="py-3 px-6 flex justify-center items-center gap-2 font-[500] text-[14px]">
          {!row.birgada && (
            <>
              <button
                onClick={() => {
                  if (row.remaining_task_time > 0) {
                    setEditingId(null);
                    setCreatingId(creatingId === row.id ? null : row.id);
                  }
                }}
              >
                <Icon name="plus" />
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setOpen(true);
                }}
              >
                <Icon name="eye" />
              </button>
              <button
                onClick={() => handleEditClick(row.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Icon name="pencil" />
              </button>
              <button
                onClick={() => handleclockClick(row.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FiClock size={20} />
              </button>
            </>
          )}
        </td>
      </tr>
      {editingId === row.id && (
        <tr className="w-full">
          <td colSpan={12}>
            <div className="transition duration-500 ease-in-out transform translate-y-0 bg-gray-100 w-full">
              <EditForm
                type="edit"
                row={row}
                closeForm={setEditingId}
                getTasks={getTasks}
              />
            </div>
          </td>
        </tr>
      )}

      {creatingId === row.id && (
        <tr className="w-full">
          <td colSpan={12}>
            <div className="transition duration-500 ease-in-out transform translate-y-0 bg-gray-100 w-full">
              <EditForm
                type="create"
                row={row}
                closeForm={setCreatingId}
                getTasks={getTasks}
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
        <div>
          <div className="w-[400px] mb-4">
            <Input
              p={tt("Ismlar bo'yicha qidiriuv", "Поиск по именам")}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              v={searchTerm}
              change={(e: any) => setSearchTerm(e.target.value)}
              removeValue={() => setSearchTerm("")}
              search
            />
          </div>
          <Table
            thead={[
              { text: "№", className: "border text-center w-[50px]" },
              { text: tt("F.I.O", "Ф.И.О"), className: "border text-left" },
              {
                text: tt("Topshiriq vaqti", "Время задачи"),
                className: "border text-left",
              },
              { text: tt("Summa", "Сумма"), className: "border text-left" },
              {
                text: tt("Amallar", "Действия"),
                className: "border text-center w-[100px]",
              },
            ]}
          >
            {taskWorkers.map((e, ind) => {
              return (
                <tr key={ind} className="hover:text-[#3B7FAF] text-mytextcolor">
                  <td className="border py-3 px-6 text-center font-[500] text-[14px]">
                    {ind + 1}
                  </td>
                  <td className="border py-3 px-6 text-left font-[500] text-[14px]">
                    {e.fio}
                  </td>
                  <td className="border py-3 px-6 text-left  font-[500] text-[14px]">
                    {e.task_time}
                  </td>
                  <td className="border py-3 px-6 text-left  font-[500] text-[14px]">
                    {e.summa}
                  </td>
                  <td className="border py-3 px-6 text-center  font-[500] text-[14px]">
                    <button onClick={() => handleDelete(e.worker_id, row.id)}>
                      <Icon name="delete" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      </Modal>

      <DateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (date) => {
          await handleSaveDeadline(date);
        }}
      />
    </React.Fragment>
  );
};

export default TableItem;
