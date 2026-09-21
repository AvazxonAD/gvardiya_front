import { Users, Clock, Hourglass, UserPlus, Search, X, Save } from "lucide-react";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  type TableColumn,
} from "@/ui";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { ITask } from "@/types/task";
import { IWorker, IWorkerData } from "@/types/worker";
import { tt } from "@/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

const formatAccountNumber = (value: string) => {
  if (!value) return "";
  const newValue = value?.replace(/[^\d]/g, "");
  let formattedValue = "";
  for (let i = 0; i < newValue?.length; i++) {
    if (i > 0 && i % 4 === 0) formattedValue += " ";
    formattedValue += newValue[i];
  }
  return formattedValue?.trim();
};

interface EditFormProps {
  row: ITask;
  closeForm: Dispatch<SetStateAction<number | null>>;
  getTasks: Function;
  contract?: any;
}

type IWorkerState = {
  meta: {
    nextPage: number | null;
    backPage: number | null;
    pageCount: number;
    count: number;
  };
  data: IWorker[];
};

const EditForm: React.FC<EditFormProps> = ({
  row,
  closeForm,
  getTasks,
  contract,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [search] = useDebounce(searchTerm, 400);
  const [workers, setWorkers] = useState<IWorkerState>();
  const [workersList, setWorkersList] = useState<IWorker[]>([]);
  const [workersData, setWorkersData] = useState<IWorkerData[]>([]);
  const [page] = useState<number>(1);
  const [limit] = useState<number>(9999);
  const api = useApi();
  const [TaskTimeForAll, setTaskTimeForAll] = useState<number>(
    row?.task_time ?? undefined
  );
  const [taskDate, setTaskDate] = useState<string>(contract?.start_date ?? "");
  const [startTime, setStartTime] = useState<string>(contract?.start_time ?? "");
  const [endTime, setEndTime] = useState<string>(contract?.end_time ?? "");
  const [activeTab, setActiveTab] = useState<"all" | "selected">("all");
  const [addWorkerOpen, setAddWorkerOpen] = useState<boolean>(false);
  const [newWorker, setNewWorker] = useState<{
    fio: string;
    account_number: string;
    xisob_raqam: string;
  }>({ fio: "", account_number: "", xisob_raqam: "" });
  const dispatch = useDispatch();

  const fetchWorkers = async () => {
    // Debounce'dan O'TGAN qiymat ishlatiladi: effekt `search` ga
    // bog'langan, so'rov esa `searchTerm` ni yuborsa, `page`/`limit`
    // yozib turgan paytda o'zgarganda ikkalasi mos kelmay qolardi.
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";

    const getWorkers: any = await api.get(
      `worker?page=${page}&limit=${limit}&batalon_id=${row.batalon_id}${searchParam}`
    );

    if (getWorkers?.success && getWorkers.data) {
      setWorkers(getWorkers);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [search, page, limit]);

  useEffect(() => {
    if (workersData && workers?.data) {
      const enhancedWorkers = [...(workers?.data || [])];
      setWorkersList(enhancedWorkers as unknown as IWorker[]);
    }
  }, [workersData, workers]);


  const handleCheck = (id: number) => {
    const find = workersData.find((w) => w.worker_id === id);
    const currentInput = document.querySelector(
      `.taskinput_${id}`
    ) as HTMLInputElement;
    const taskTimeValue = Number(currentInput?.value ?? 0);
    if (find) {
      const filter = workersData.filter((w) => w.worker_id !== id);
      setWorkersData(filter);
    } else {
      setWorkersData((prev) => [
        ...prev,
        { worker_id: id, task_time: taskTimeValue },
      ]);
    }
  };

  const handleSave = async () => {
    if (!workersData.length) {
      dispatch(alertt({ text: tt("Xodim tanlanmagan", "Сотрудник не выбран"), success: false }));
      return;
    }

    const request: any = await api.post(`worker_task?task_id=${row.id}`, {
      workers: workersData,
      task_date: taskDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
    });
    dispatch(
      alertt({
        text: request?.success
          ? tt("Muvaffaqiyatli bajarildi", "Успешно выполнено")
          : request?.message || "error",
        success: !!request?.success,
      })
    );
    if (request.success) {
      getTasks();
      closeForm(null);
    }
  };

  const attachedWorkersCount = workersData?.filter((task) => task)?.length || 0;

  const assignedHours = workersData?.reduce((sum, w) => sum + (w.task_time || 0), 0) || 0;
  const remainingHours = (row?.remaining_task_time || 0) - assignedHours;

  const handleInputChange = (id: number, value: number) => {
    const update = workersData.map((w) => {
      if (w.worker_id === id) {
        const find = workersData.find((e) => e.worker_id === id);
        if (find) {
          return {
            ...w,
            task_time: value,
          };
        }
      }
      return w;
    });
    setWorkersData(update);
  };

  const setAllWorkersTaskTime = () => {
    const changedWorkersData = workersData.map((e: any) => {
      return { ...e, task_time: TaskTimeForAll };
    });

    setWorkersData(changedWorkersData);
  };

  const handleCreateWorker = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newWorker.fio?.trim()) {
      dispatch(
        alertt({
          text: tt("F.I.Sh. kiriting", "Введите Ф.И.О"),
          success: false,
        })
      );
      return;
    }
    const payload = {
      fio: newWorker.fio,
      account_number: (newWorker.account_number || "").replace(/ /g, ""),
      xisob_raqam: (newWorker.xisob_raqam || "").replace(/ /g, ""),
      batalon_id: row?.batalon_id || null,
    };
    const res: any = await api.post("worker", payload);
    dispatch(
      alertt({
        text: res?.success
          ? tt("Muvaffaqiyatli bajarildi", "Успешно выполнено")
          : res?.message || "error",
        success: !!res?.success,
      })
    );
    if (res?.success) {
      setAddWorkerOpen(false);
      setNewWorker({ fio: "", account_number: "", xisob_raqam: "" });
      fetchWorkers();
    }
  };

  useEffect(() => {}, [workersData]);

  /* -- Xodimlar jadvali ------------------------------------------- */
  const visibleWorkers = workersList
    .filter((w) =>
      activeTab === "selected"
        ? workersData.some((e) => e.worker_id === w.id)
        : true
    )
    .sort((a, b) => {
      const aChecked = workersData.some((e) => e.worker_id === a.id);
      const bChecked = workersData.some((e) => e.worker_id === b.id);
      return aChecked === bChecked ? 0 : aChecked ? -1 : 1;
    });

  const workerColumns: TableColumn<IWorker>[] = [
    {
      key: "check",
      header: "",
      align: "center",
      width: "44px",
      cell: (w) => (
        <input
          type="checkbox"
          checked={workersData.some((e) => e.worker_id === w.id)}
          onChange={() => handleCheck(w.id)}
          aria-label={w.fio}
          className="size-4 cursor-pointer accent-primary"
        />
      ),
    },
    {
      key: "fio",
      header: tt("F.I.Sh.", "Ф.И.О"),
      cell: (w) => {
        const checked = workersData.some((e) => e.worker_id === w.id);
        return (
          <span className={checked ? "font-medium text-primary" : ""}>
            {w.fio}
          </span>
        );
      },
    },
    {
      key: "time",
      header: tt("Topshiriq vaqti", "Время задачи"),
      width: "160px",
      cell: (w) => {
        const find = workersData.find((e) => e.worker_id === w.id);
        // Tanlangan xodimga soat kiritilmagan bo'lsa - xato holati
        const invalid = Boolean(find) && (!find!.task_time || find!.task_time <= 0);
        return (
          <Input
            type="number"
            inputSize="sm"
            aria-invalid={invalid}
            value={find && find.task_time >= 0 ? find.task_time : ""}
            onChange={(e) => handleInputChange(w.id, Number(e.target.value))}
            className={`taskinput_${w.id} tabular-nums`}
          />
        );
      },
    },
  ];

  return (
    <div className="w-full border-y border-border bg-card p-4 shadow-inner">
      {/* Izoh */}
      <div className="mb-3 rounded-md border border-warning/30 bg-warning/10 p-2.5">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-warning">
          {tt("Izoh", "Комментарий")}
        </div>
        <div className="whitespace-pre-wrap break-words text-[13px] text-foreground">
          {row?.comment || "—"}
        </div>
      </div>

      {/* Boshqaruv qatori */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-[140px]">
          <SpecialDatePicker
            label={tt("Sana", "Дата")}
            defaultValue={taskDate}
            onChange={(date) => setTaskDate(date)}
          />
        </div>
        <Field label={tt("Boshlanish", "Начало")} className="w-[92px]">
          <Input
            inputSize="sm"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="00:00"
          />
        </Field>
        <Field label={tt("Tugash", "Конец")} className="w-[92px]">
          <Input
            inputSize="sm"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="00:00"
          />
        </Field>
        <Field label={tt("Soat", "Часы")} className="w-[76px]">
          <Input
            type="number"
            inputSize="sm"
            value={TaskTimeForAll && TaskTimeForAll > 0 ? TaskTimeForAll : ""}
            onChange={(e) => setTaskTimeForAll(+e.target.value)}
            className="tabular-nums"
          />
        </Field>
        <Button size="sm" onClick={() => setAllWorkersTaskTime()}>
          {tt("Qo'llash", "Применить")}
        </Button>

        <Input
          inputSize="sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={tt("Qidiruv...", "Поиск...")}
          startIcon={<Search />}
          className="w-[240px]"
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

        {/* Hisoblagichlar */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Chip
            icon={Users}
            tone="primary"
            label={tt("Xodimlar", "Сотр.")}
            value={attachedWorkersCount}
          />
          <Chip
            icon={Clock}
            tone={remainingHours > 0 ? "warning" : "success"}
            label={tt("Biriktirilgan soat", "Прикр. часы")}
            value={assignedHours}
          />
          <Chip
            icon={Hourglass}
            tone={remainingHours > 0 ? "danger" : "success"}
            label={tt("Qoldi", "Ост.")}
            value={`${remainingHours} ${tt("soat", "ч")}`}
          />
        </div>

        <Button size="sm" onClick={handleSave}>
          <Save />
          {tt("Saqlash", "Сохранить")}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => closeForm(null)}>
          {tt("Bekor qilish", "Отмена")}
        </Button>
      </div>

      {/* Tablar */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={activeTab === "all" ? "primary" : "secondary"}
          onClick={() => setActiveTab("all")}
        >
          {tt("Barchasi", "Все")}
          <Badge tone={activeTab === "all" ? "solid" : "neutral"}>
            {workersList.length}
          </Badge>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "selected" ? "primary" : "secondary"}
          onClick={() => setActiveTab("selected")}
        >
          {tt("Tanlanganlar", "Выбранные")}
          <Badge tone={activeTab === "selected" ? "solid" : "primary"}>
            {attachedWorkersCount}
          </Badge>
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setAddWorkerOpen(true)}
          className="border-success/30 bg-success/10 text-success hover:bg-success/15"
        >
          <UserPlus />
          {tt("Xodim qo'shish", "Добавить сотрудника")}
        </Button>
      </div>

      {/* Xodimlar ro'yxati */}
      <div className="mt-2 overflow-hidden rounded-lg border border-border">
        <DataTable
          columns={workerColumns}
          rows={visibleWorkers}
          keyOf={(w) => w.id}
          maxHeight={600}
          empty={
            <EmptyState
              icon={Users}
              title={
                activeTab === "selected"
                  ? tt("Xodim tanlanmagan", "Сотрудники не выбраны")
                  : tt("Xodim topilmadi", "Сотрудники не найдены")
              }
            />
          }
        />
      </div>

      {/* Yangi xodim qo'shish */}
      <Modal
        open={addWorkerOpen}
        onClose={() => setAddWorkerOpen(false)}
        title={tt("Xodim qo'shish", "Добавить сотрудника")}
        dismissOnOverlay={false}
      >
        <form onSubmit={handleCreateWorker} className="flex flex-col gap-3">
          <Field
            label={tt("Familiya, ism, otasining ismi", "Фамилия, имя, отчество")}
            required
          >
            <Input
              value={newWorker.fio}
              onChange={(e) =>
                setNewWorker({ ...newWorker, fio: e.target.value })
              }
              placeholder={tt(
                "Familiya, ism, otasining ismini kiriting",
                "Введите фамилию, имя и отчество"
              )}
            />
          </Field>
          <Field label={tt("Karta raqam", "Номер карты")}>
            <Input
              value={newWorker.account_number}
              onChange={(e) =>
                setNewWorker({
                  ...newWorker,
                  account_number: formatAccountNumber(e.target.value),
                })
              }
              placeholder={tt("Karta raqamini kiriting", "Введите номер карты")}
              className="tabular-nums"
            />
          </Field>
          <Field label={tt("Hisob raqam", "Номер счета")}>
            <Input
              value={newWorker.xisob_raqam}
              onChange={(e) =>
                setNewWorker({
                  ...newWorker,
                  xisob_raqam: formatAccountNumber(e.target.value),
                })
              }
              placeholder={tt("Hisob raqamini kiriting", "Введите номер счета")}
              className="tabular-nums"
            />
          </Field>
          <div className="mt-1 flex justify-end">
            <Button type="submit">
              <Save />
              {tt("Saqlash", "Сохранить")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/** Boshqaruv qatoridagi kichik hisoblagich */
function Chip({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Users;
  tone: "primary" | "warning" | "danger" | "success";
  label: string;
  value: React.ReactNode;
}) {
  const TONES = {
    primary: "border-primary/25 bg-primary/10 text-primary",
    warning: "border-warning/30 bg-warning/10 text-warning",
    danger: "border-destructive/25 bg-destructive/10 text-destructive",
    success: "border-success/25 bg-success/10 text-success",
  } as const;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${TONES[tone]}`}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
        {label}:
      </span>
      <span className="whitespace-nowrap text-[13px] font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default EditForm;
