import useApi from "@/services/api";
import { ITaskWorker } from "@/types/task";
import { formatDate, formatSum, tt } from "@/utils";
import React, { useEffect, useState } from "react";
import EditForm from "./editForm";
import { useDebounce } from "use-debounce";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { alertt } from "@/Redux/LanguageSlice";
import { useDispatch } from "react-redux";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Input,
  Modal,
  SummaryRow,
  SummaryTile,
  type TableColumn,
} from "@/ui";

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
    const remove = await api.remove(`worker_task?id=${id}&task_id=${task_id}`);
    if (remove?.success) {
      const filter = taskWorkers.filter((w: any) => w.id !== id);
      setTaskWorkers(filter);
      getTasks();
    } else {
      dispatch(
        alertt({
          text: remove?.message,
          success: remove?.success,
        })
      );
    }
  };

  const attachedHours = taskWorkers.reduce(
    (acc, w: any) => acc + (Number(w.task_time) || 0),
    0
  );
  const totalHours =
    (Number(row.worker_number) || 0) * (Number(row.task_time) || 0);
  const overdue = Number(row.remaining_task_time) > 0;

  /* ── Modal ichidagi xodimlar jadvali ─────────────────────────────── */
  const workerColumns: TableColumn<any>[] = [
    {
      key: "n",
      header: "№",
      align: "center",
      width: "56px",
      cell: (_w, i) => (
        <span className="tabular-nums text-muted-foreground">{i + 1}</span>
      ),
    },
    {
      key: "fio",
      header: tt("F.I.O", "Ф.И.О"),
      cell: (w) => <span className="font-medium">{w.fio || "—"}</span>,
      sortValue: (w) => w.fio || "",
    },
    {
      key: "time",
      header: tt("Topshiriq vaqti", "Время задачи"),
      align: "center",
      width: "130px",
      cell: (w) => <span className="tabular-nums">{w.task_time ?? 0}</span>,
      sortValue: (w) => Number(w.task_time) || 0,
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "150px",
      cell: (w) => (
        <span className="font-medium tabular-nums">{formatSum(w.summa)}</span>
      ),
      sortValue: (w) => Number(w.summa) || 0,
    },
    {
      key: "user",
      header: tt("Foydalanuvchi", "Пользователь"),
      width: "160px",
      hideOnMobile: true,
      cell: (w) => (
        <span className="text-muted-foreground">{w.user || "—"}</span>
      ),
      sortValue: (w) => w.user || "",
    },
    {
      key: "when",
      header: tt("Sana / Vaqt", "Дата / Время"),
      width: "190px",
      hideOnMobile: true,
      cell: (w) => (
        <div className="flex flex-col items-start gap-1">
          {w.task_date && (
            <span className="flex items-center gap-1.5 text-[13px] font-medium tabular-nums">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              {formatDate(w.task_date)}
            </span>
          )}
          {(w.start_time || w.end_time) && (
            <span className="flex items-center gap-1.5 text-[12px] tabular-nums text-muted-foreground">
              <Clock className="size-3.5" />
              {w.start_time && w.end_time
                ? `${w.start_time} — ${w.end_time}`
                : w.start_time || w.end_time}
            </span>
          )}
          {w.task_time ? (
            <Badge tone="primary">
              {w.task_time} {tt("soat", "ч")}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: tt("Amallar", "Действия"),
      align: "center",
      width: "90px",
      cell: (w) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleDelete(w.id, row.id)}
          aria-label={tt("O'chirish", "Удалить")}
          title={tt("O'chirish", "Удалить")}
          className="hover:text-destructive"
        >
          <Trash2 />
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <tr className="text-foreground">
        <td className="border-b border-border px-6 py-3 text-left text-[14px] font-medium">
          {row.batalon_name}
        </td>
        <td className="border-b border-border px-6 py-3 text-center text-[14px] font-medium tabular-nums">
          {row.task_time}
        </td>
        <td className="border-b border-border px-6 py-3 text-center text-[14px] font-medium tabular-nums">
          {row.worker_number}
        </td>
        <td className="border-b border-border px-6 py-3 text-center text-[14px] font-medium tabular-nums">
          {totalHours}
        </td>
        <td className="border-b border-border px-6 py-3 text-left text-[14px] font-medium tabular-nums">
          {formatSum(row.summa)}
        </td>
        <td
          className={`border-b border-border px-6 py-3 text-[14px] font-medium ${
            overdue ? "text-destructive" : "text-success"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <p className="tabular-nums">{row.remaining_task_time}</p>
            {!row.birgada &&
              (overdue ? (
                <XCircle className="size-4" />
              ) : (
                <CheckCircle2 className="size-4" />
              ))}
          </div>
        </td>
        <td className="border-b border-border px-4 py-3 text-center font-semibold tabular-nums text-foreground">
          {!row.birgada ? taskWorkers.length : ""}
        </td>
        <td className="border-b border-border px-4 py-3 text-center font-semibold tabular-nums text-foreground">
          {!row.birgada ? attachedHours : ""}
        </td>
        <td
          className="max-w-[280px] border-b border-border px-6 py-3 text-left text-[13px] text-foreground"
          title={row.comment || ""}
        >
          <div className="line-clamp-2 whitespace-pre-wrap break-words">
            {row.comment || ""}
          </div>
        </td>
        <td className="border-b border-border px-6 py-3">
          <div className="flex items-center justify-center gap-1">
            {!row.birgada && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!(row.remaining_task_time > 0)}
                  onClick={() =>
                    setCreatingId(creatingId === row.id ? null : row.id)
                  }
                  aria-label={tt("Xodim biriktirish", "Прикрепить сотрудника")}
                  title={tt("Xodim biriktirish", "Прикрепить сотрудника")}
                >
                  <Plus />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(true)}
                  aria-label={tt("Xodimlarni ko'rish", "Просмотр сотрудников")}
                  title={tt("Xodimlarni ko'rish", "Просмотр сотрудников")}
                >
                  <Eye />
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {creatingId === row.id && (
        <tr className="w-full">
          <td colSpan={12}>
            <div className="w-full bg-muted/40">
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
        onClose={() => setOpen(false)}
        title={tt("Xodimlarni ko'rish", "Просмотр сотрудников")}
        description={row.batalon_name}
        size="full"
      >
        <div className="flex flex-col gap-3">
          <SummaryRow className="px-0 pt-0 lg:grid-cols-3 xl:grid-cols-6">
            <SummaryTile
              label={tt("Xodimlar soni", "Кол-во сотрудников")}
              value={row.worker_number}
            />
            <SummaryTile
              label={tt("Tadbir soati", "Часы мероприятия")}
              value={row.task_time}
            />
            <SummaryTile label={tt("Jami soat", "Всего часов")} value={totalHours} />
            <SummaryTile
              label={tt("Biriktirilgan xodim", "Прикреплено сотр.")}
              value={taskWorkers.length}
            />
            <SummaryTile
              label={tt("Biriktirilgan soat", "Прикреплено часов")}
              value={attachedHours}
            />
            <SummaryTile
              label={tt("Qolgan vaqt", "Оставшееся время")}
              value={row.remaining_task_time}
              tone={overdue ? "danger" : "success"}
            />
          </SummaryRow>

          <Input
            inputSize="sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tt("Ismlar bo'yicha qidiruv", "Поиск по именам")}
            startIcon={<Search />}
            className="md:w-80"
            endIcon={
              searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label={tt("Tozalash", "Очистить")}
                  className="rounded p-0.5 transition-colors hover:text-foreground"
                >
                  <X />
                </button>
              ) : undefined
            }
          />

          <div className="overflow-hidden rounded-lg border border-border">
            <DataTable
              columns={workerColumns}
              rows={taskWorkers}
              keyOf={(w: any, i) => w.id ?? i}
              maxHeight="60vh"
              empty={
                <EmptyState
                  icon={Users}
                  title={tt("Xodim biriktirilmagan", "Сотрудники не прикреплены")}
                  description={
                    searchTerm
                      ? tt(
                          "Qidiruv so'zini o'zgartirib ko'ring",
                          "Попробуйте изменить запрос"
                        )
                      : undefined
                  }
                />
              }
            />
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default TableItem;
