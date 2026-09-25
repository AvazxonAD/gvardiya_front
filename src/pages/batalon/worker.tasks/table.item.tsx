import Modal from "@/Components/Modal";
import Table from "@/Components/reusable/table/Table";
import useApi from "@/services/api";
import { ITaskWorker } from "@/types/task";
import { formatDate, formatSum, tt } from "@/utils";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import EditForm from "./update";
import Input from "@/Components/Input";
import { useDebounce } from "use-debounce";
import { CheckCircle2, Eye, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { Button as UIButton } from "@/ui";
import ExportButtons from "@/Components/ExportButtons";
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
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";

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
          <div className="bg-card dark:bg-card p-6 rounded-2xl shadow-2xl w-[25rem] animate-scale-in">
            <h2 className="text-xl font-semibold text-center text-primary mb-6 border-b pb-3">
              Shartnoma tafsilotlari
            </h2>

            <div className="space-y-3 text-foreground text-[0.9375rem]">
              <div className="border-l-4 border-primary/30 pl-3">
                <strong className="font-bold">Shartnoma raqami:</strong>{" "}
                {selectedTask.contract_info?.doc_num}
              </div>
              <div className="border-l-4 border-primary/30 pl-3">
                <strong className="font-bold">Hamkor tashkilot:</strong>{" "}
                {selectedTask.contract_info?.organization}
              </div>
              <div className="border-l-4 border-primary/30 pl-3">
                <strong className="font-bold">Manzil:</strong>{" "}
                {selectedTask.contract_info?.adress}
              </div>
              <div className="border-l-4 border-success/30 pl-3">
                <strong className="font-bold">Tadbir boshlanish vaqti:</strong>{" "}
                {selectedTask.contract_info?.start_date}{" "}
                {selectedTask.contract_info?.start_time}
              </div>
              <div className="border-l-4 border-destructive/30 pl-3">
                <strong className="font-bold">Tadbir tugash vaqti:</strong>{" "}
                {selectedTask.contract_info?.end_date}{" "}
                {selectedTask.contract_info?.end_time}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="px-6 py-2 rounded-none bg-primary text-primary-foreground hover:bg-primary transition duration-200"
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
        <tr className="border-b border-border text-foreground">
          <td
            className="px-4 py-3 text-center text-primary cursor-pointer hover:font-semibold transition"
            onClick={() => {
              setSelectedTask(row);
              setShowModal(true);
            }}
          >
            {row.contract_info?.doc_num}
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[0.875rem]">
            {row.task_time}
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[0.875rem]">
            {row.worker_number}
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[0.875rem]">
            {/* Maydonlar matn yoki bo'sh bo'lishi mumkin — NaN chiqmasin */}
            {Math.round(
              (Number(row.worker_number) || 0) * (Number(row.task_time) || 0) * 100
            ) / 100}
          </td>
          <td
            style={{ color: Number(row.remaining_task_time) > 0 ? "hsl(var(--destructive))" : "hsl(var(--success))" }}
            className={`py-3 px-6 text-left font-[500] text-[0.875rem]`}
          >
            <div className="flex items-center gap-2 justify-center">
              <p>{row.remaining_task_time}</p>
              {row.remaining_task_time === 0 && !row.birgada && (
                <div style={{ color: "hsl(var(--success))" }}>
                  <CheckCircle2 />
                </div>
              )}
              {row.remaining_task_time > 0 && !row.birgada && (
                <div style={{ color: "hsl(var(--destructive))" }}>
                  <XCircle />
                </div>
              )}
            </div>
          </td>
          <td className="py-3 px-6 text-center font-[500] text-[0.875rem]">
            {row.address}
          </td>
          <td className="py-3 px-6 text-left font-[500] text-[0.875rem]">
            {row.comment}
          </td>
          <td className="py-3 px-6 font-[500] text-[0.875rem]">
            {!row.birgada && (
              <div className="flex items-center justify-center gap-0.5">
                <UIButton
                  variant="ghost"
                  size="icon-xs"
                  title={tt("Xodim qo'shish", "Добавить сотрудника")}
                  aria-label={tt("Xodim qo'shish", "Добавить сотрудника")}
                  disabled={!(row.remaining_task_time > 0)}
                  onClick={() => {
                    setEditingId(null);
                    setCreatingId(creatingId === row.id ? null : row.id);
                  }}
                >
                  <Plus />
                </UIButton>
                <UIButton
                  variant="ghost"
                  size="icon-xs"
                  title={tt("Ko'rish", "Просмотр")}
                  aria-label={tt("Ko'rish", "Просмотр")}
                  onClick={() => {
                    setEditingId(null);
                    setOpen(true);
                  }}
                >
                  <Eye />
                </UIButton>
                <UIButton
                  variant="ghost"
                  size="icon-xs"
                  title={tt("Tahrirlash", "Редактировать")}
                  aria-label={tt("Tahrirlash", "Редактировать")}
                  onClick={() => handleEditClick(row.id)}
                >
                  <Pencil />
                </UIButton>
              </div>
            )}
          </td>
        </tr>
        {editingId === row.id && (
          <tr className="w-full">
            <td colSpan={12}>
              <div className="transition duration-500 ease-in-out transform translate-y-0 bg-muted dark:bg-muted/60 w-full">
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
              <div className="transition duration-500 ease-in-out transform translate-y-0 bg-muted dark:bg-muted/60 w-full">
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="w-[25rem]">
              <Input
                p={tt("Ismlar bo'yicha qidiruv", "Поиск по именам")}
                className="border border-border rounded px-3 py-2 w-full"
                v={searchTerm}
                change={(e: any) => setSearchTerm(e.target.value)}
                removeValue={() => setSearchTerm("")}
                search
              />
            </div>
              {/* Ko'rinib turgan (qidiruvga mos) xodimlar ro'yxati */}
              <div className="flex gap-2">
                <ExportButtons
                  title={`${tt("Topshiriq xodimlari", "Сотрудники задачи")} — ${row?.contract_number ?? ""}`}
                  columns={[
                    { header: "№", value: (_: ITaskWorker, i: number) => i + 1, align: "center" },
                    { header: tt("F.I.Sh.", "Ф.И.О"), value: (r: ITaskWorker) => r.fio },
                    { header: tt("Topshiriq vaqti", "Время задачи"), value: (r: ITaskWorker) => r.task_time },
                    { header: tt("Foydalanuvchi", "Пользователь"), value: (r: ITaskWorker) => r.user },
                  ]}
                  fetchRows={async () => taskWorkers}
                />
              </div>
            </div>
            <Table
              thead={[
                { text: "№", className: "text-center w-[3.125rem]" },
                { text: tt("F.I.Sh.", "Ф.И.О"), className: "text-left" },
                {
                  text: tt("Topshiriq vaqti", "Время задачи"),
                  className: "text-left",
                },
                {
                  text: tt("Foydalanuvchi", "Пользователь"),
                  className: "text-left",
                },
                {
                  text: tt("Amallar", "Действия"),
                  className: "text-center w-[6.25rem]",
                },
              ]}
            >
              {taskWorkers.map((e, ind) => {
                return (
                  <tr
                    key={ind}
                    className="hover:text-primary text-foreground"
                  >
                    <td className="border py-3 px-6 text-center font-[500] text-[0.875rem]">
                      {ind + 1}
                    </td>
                    <td className="border py-3 px-6 text-left font-[500] text-[0.875rem]">
                      {e.fio}
                    </td>
                    <td className="border py-3 px-6 text-left font-[500] text-[0.875rem]">
                      {e.task_time}
                    </td>
                    <td className="border py-3 px-6 text-left font-[500] text-[0.875rem]">
                      {e.user}
                    </td>
                    <td className="border py-3 px-6 text-center font-[500] text-[0.875rem]">
                      <UIButton
                        variant="ghost"
                        size="icon-xs"
                        title={tt("O'chirish", "Удалить")}
                        aria-label={tt("O'chirish", "Удалить")}
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(e.worker_id, row.id)}
                      >
                        <Trash2 />
                      </UIButton>
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
