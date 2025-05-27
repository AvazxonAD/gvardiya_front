import Icon from "@/assets/icons";
import Modal from "@/Components/Modal";
import Table from "@/Components/reusable/table/Table";
import useApi from "@/services/api";
import { ITaskWorker } from "@/types/task";
import { formatDate, formatSum, tt } from "@/utils";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import EditForm from "./update";
import Input from "@/Components/Input";
import { useDebounce } from "use-debounce";
import { CheckCircle2, XCircle } from "lucide-react";
import { alertt } from "@/Redux/LanguageSlice";
import { useDispatch } from "react-redux";

type Props = {
  row: any;
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
}: Props) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [taskWorkers, setTaskWorkers] = useState<ITaskWorker[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [search] = useDebounce(searchTerm, 400);
  const api = useApi();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      if (open) {
        const searchParam = searchTerm ? `&search=${searchTerm}` : "";

        const get = await api.get<ITaskWorker[]>(
          `batalon/worker-tasks/?task_id=${row.id}${searchParam}`
        );
        if (get?.success && get.data) {
          setTaskWorkers(get.data);
        }
      }
    })();
  }, [open, search]);

  const handleEditClick = (id: number) => {
    setCreatingId(null);
    setEditingId(editingId === id ? null : id);
  };

  const handleDelete = async (worker_id: number, task_id: number) => {
    const remove = await api.remove(
      `batalon/worker-tasks?worker_id=${worker_id}&task_id=${task_id}`
    );
    if (remove?.success) {
      const filter = taskWorkers.filter((w) => w.worker_id !== worker_id);
      setTaskWorkers(filter);
      getTasks();
    } else {
      dispatch(
        alertt({
          text: remove?.message || "Xatolik yuz berdi",
          success: false,
        })
      );
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Oy 0-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const str = `${formatDate(row.start_date)} ${row.start_time} dan ${formatDate(
    row.end_date
  )} ${row.end_time} gacha`;

  return (
    <>
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[400px] animate-scale-in">
            <h2 className="text-xl font-semibold text-center text-blue-700 mb-6 border-b pb-3">
              📄 Shartnoma tafsilotlari
            </h2>

            <div className="space-y-3 text-gray-700 text-[15px]">
              <div className="border-l-4 border-blue-500 pl-3">
                <strong className="font-bold">Shartnoma raqami:</strong>{" "}
                {selectedTask.contract_info?.doc_num}
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <strong className="font-bold">Hamkor tashkilot:</strong>{" "}
                {selectedTask.contract_info?.organization}
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <strong className="font-bold">Manzil:</strong>{" "}
                {selectedTask.contract_info?.adress}
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <strong className="font-bold">Tadbir boshlanish vaqti:</strong>{" "}
                {selectedTask.contract_info?.start_date}{" "}
                {selectedTask.contract_info?.start_time}
              </div>
              <div className="border-l-4 border-red-500 pl-3">
                <strong className="font-bold">Tadbir tugash vaqti:</strong>{" "}
                {selectedTask.contract_info?.end_date}{" "}
                {selectedTask.contract_info?.end_time}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTask(null);
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      <React.Fragment>
        <tr className="border-b border-mytableheadborder text-mytextcolor">
          <td
            className="px-4 py-3 text-center text-blue-600 cursor-pointer hover:font-semibold transition"
            onClick={() => {
              setSelectedTask(row);
              setShowModal(true);
            }}
          >
            {row.contract_info?.doc_num}
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[14px]">
            {row.task_time}
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[14px]">
            {row.worker_number}
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[14px]">
            {Math.round(row.worker_number * row.task_time * 100) / 100}
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
            {row.address}
          </td>
          <td className="py-3 px-6 text-left font-[500] text-[14px]">
            {row.comment}
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
                {
                  text: tt("Foydalanuvchi", "Фойдаланувчи"),
                  className: "border text-left",
                },
                {
                  text: tt("Amallar", "Действия"),
                  className: "border text-center w-[100px]",
                },
              ]}
            >
              {taskWorkers.map((e, ind) => {
                return (
                  <tr
                    key={ind}
                    className="hover:text-[#3B7FAF] text-mytextcolor"
                  >
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
                      {e.user}
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
      </React.Fragment>
    </>
  );
};

export default TableItem;
