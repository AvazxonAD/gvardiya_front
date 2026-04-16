import { Users, Clock, Hourglass, UserPlus } from "lucide-react";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import Button from "@/Components/reusable/button";
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
    const searchParam = searchTerm ? `&search=${searchTerm}` : "";

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

  // Calculate total required hours and assigned hours
  const totalRequiredHours = (row?.task_time || 0) * (row?.worker_number || 0);
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
          text: tt("F.I.O kiriting", "Введите Ф.И.О"),
          success: false,
        })
      );
      return;
    }
    const payload = {
      fio: newWorker.fio,
      account_number: (newWorker.account_number || "").replaceAll(" ", ""),
      xisob_raqam: (newWorker.xisob_raqam || "").replaceAll(" ", ""),
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

  return (
    <div className="p-4 bg-mybackground shadow-lg w-full border-[2px]">
      <div className="flex items-end gap-2 w-full">
        <div className="w-[130px]">
          <SpecialDatePicker
            label={tt("Sana", "Дата")}
            defaultValue={taskDate}
            onChange={(date) => setTaskDate(date)}
          />
        </div>
        <div className="w-[90px] ml-16">
          <Input
            label={tt("Boshlanish", "Начало")}
            v={startTime}
            change={(e: any) => setStartTime(e.target.value)}
            t="text"
            p="00:00"
          />
        </div>
        <div className="w-[90px]">
          <Input
            label={tt("Tugash", "Конец")}
            v={endTime}
            change={(e: any) => setEndTime(e.target.value)}
            t="text"
            p="00:00"
          />
        </div>
        <div className="w-[65px]">
          <Input
            label={tt("Soat", "Часы")}
            t="number"
            defaultValue={row?.task_time}
            value={TaskTimeForAll && TaskTimeForAll > 0 ? TaskTimeForAll : ""}
            change={(e: any) => setTaskTimeForAll(+e.target.value)}
          />
        </div>
        <Button text={tt("Qo'llash", "Применить")} onClick={() => setAllWorkersTaskTime()} />
        <div className="w-[280px]">
          <Input
            p={tt("Qidiruv...", "Поиск...")}
            v={searchTerm}
            change={(e: any) => setSearchTerm(e.target.value)}
            removeValue={() => setSearchTerm("")}
            search
          />
        </div>
        <div className="ml-auto flex items-stretch gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 shadow-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Users size={12} />
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {tt("Xodimlar", "Сотр.")}:
            </span>
            <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400">
              {attachedWorkersCount}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border shadow-sm ${
              remainingHours > 0
                ? "border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20"
                : "border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20"
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                remainingHours > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-green-500/15 text-green-600 dark:text-green-400"
              }`}
            >
              <Clock size={12} />
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {tt("Biriktirilgan soat", "Прикр. часы")}:
            </span>
            <span
              className={`text-[13px] font-bold ${
                remainingHours > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {assignedHours}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border shadow-sm ${
              remainingHours > 0
                ? "border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20"
                : "border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20"
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                remainingHours > 0
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-green-500/15 text-green-600 dark:text-green-400"
              }`}
            >
              <Hourglass size={12} />
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {tt("Qoldi", "Ост.")}:
            </span>
            <span
              className={`text-[13px] font-bold whitespace-nowrap ${
                remainingHours > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {remainingHours} {tt("soat", "ч")}
            </span>
          </div>
        </div>
        <Button
          mode="add"
          onClick={handleSave}
          className="!h-[30px] !py-1 !px-3 !text-[11px] !whitespace-nowrap"
        />
        <Button
          mode="cancel"
          onClick={() => closeForm(null)}
          className="!h-[30px] !py-1 !px-3 !text-[11px] !whitespace-nowrap"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-1.5 text-[12px] font-semibold rounded-md border shadow-sm transition ${
            activeTab === "all"
              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              : "bg-mybackground text-mytextcolor border-mytableheadborder hover:border-blue-400 hover:text-blue-500"
          }`}
        >
          {tt("Barchasi", "Все")}
          <span
            className={`px-1.5 py-[1px] rounded text-[11px] font-bold ${
              activeTab === "all"
                ? "bg-white/25 text-white"
                : "bg-mytablehead text-mytextcolor"
            }`}
          >
            {workersList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("selected")}
          className={`flex items-center gap-2 px-4 py-1.5 text-[12px] font-semibold rounded-md border shadow-sm transition ${
            activeTab === "selected"
              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              : "bg-mybackground text-mytextcolor border-mytableheadborder hover:border-blue-400 hover:text-blue-500"
          }`}
        >
          {tt("Tanlanganlar", "Выбранные")}
          <span
            className={`px-1.5 py-[1px] rounded text-[11px] font-bold ${
              activeTab === "selected"
                ? "bg-white/25 text-white"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {attachedWorkersCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setAddWorkerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded-md border shadow-sm transition bg-green-500 text-white border-green-500 hover:bg-green-600"
        >
          <UserPlus size={14} />
          {tt("Xodim qo'shish", "Добавить сотрудника")}
        </button>
      </div>
      <div className="mt-2 max-h-[600px] overflow-y-auto border border-mytableheadborder">
          <table className="w-full border-collapse">
            <thead className="bg-mytablehead sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-left text-mytextcolor text-[13px] border border-mytableheadborder w-[40px]"></th>
                <th className="py-2 px-3 text-left text-mytextcolor text-[13px] border border-mytableheadborder">{tt("F.I.O", "Ф.И.О")}</th>
                <th className="py-2 px-3 text-left text-mytextcolor text-[13px] border border-mytableheadborder w-[150px]">{tt("Topshiriq vaqti", "Время задачи")}</th>
              </tr>
            </thead>
            <tbody>
              {workersList
                .filter((w) =>
                  activeTab === "selected"
                    ? workersData.some((e) => e.worker_id === w.id)
                    : true
                )
                .sort((a, b) => {
                  const isAChecked = workersData.some((e) => e.worker_id === a.id);
                  const isBChecked = workersData.some((e) => e.worker_id === b.id);
                  return isAChecked === isBChecked ? 0 : isAChecked ? -1 : 1;
                })
                .map((worker, ind) => {
                  const find = workersData.find((e) => e.worker_id === worker.id);
                  return (
                    <tr key={ind} className="text-mytextcolor">
                      <td className="py-1.5 px-3 border border-mytableheadborder text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(find)}
                          onChange={() => handleCheck(worker.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="py-1.5 px-3 border border-mytableheadborder text-[14px]">
                        <span style={{ color: Boolean(find) ? "#3B7FAF" : "" }}>
                          {worker.fio}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 border border-mytableheadborder">
                        <input
                          type="number"
                          value={find && find.task_time >= 0 ? find.task_time : ""}
                          onChange={(e) =>
                            handleInputChange(worker.id, Number(e.target.value))
                          }
                          className={`taskinput_${worker.id} border bg-mybackground text-mytextcolor w-full rounded px-2 py-0.5 ${
                            find && (!find.task_time || find.task_time <= 0)
                              ? "border-red-500 border-2 bg-red-50 dark:bg-red-950/40 text-red-600"
                              : "border-mytableheadborder"
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
      </div>
      <Modal
        open={addWorkerOpen}
        closeModal={() => setAddWorkerOpen(false)}
        title={tt("Xodim qo'shish", "Добавить сотрудника")}
      >
        <form onSubmit={handleCreateWorker}>
          <div className="flex gap-3 flex-col w-full">
            <Input
              v={newWorker.fio}
              change={(e: any) =>
                setNewWorker({ ...newWorker, fio: e.target.value })
              }
              label={tt(
                "Ism, familya, otasining ismi",
                "Имя, фамилия, отчество"
              )}
              p={tt(
                "Ism, familya, otasining ismini kiriting",
                "Введите имя, фамилия и отчество"
              )}
            />
            <Input
              v={newWorker.account_number}
              change={(e: any) =>
                setNewWorker({
                  ...newWorker,
                  account_number: formatAccountNumber(e.target.value),
                })
              }
              label={tt("Karta raqam", "Номер карты")}
              p={tt("Karta raqamini kiriting", "Введите номер карты")}
            />
            <Input
              v={newWorker.xisob_raqam}
              change={(e: any) =>
                setNewWorker({
                  ...newWorker,
                  xisob_raqam: formatAccountNumber(e.target.value),
                })
              }
              label={tt("Hisob raqam", "Номер счета")}
              p={tt("Hisob raqamini kiriting", "Введите номер счета")}
            />
            <div className="flex justify-end mt-4">
              <Button mode="save" type="submit" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EditForm;
