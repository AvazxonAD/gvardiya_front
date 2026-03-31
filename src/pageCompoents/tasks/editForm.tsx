import Input from "@/Components/Input";
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
  const remainingHours = totalRequiredHours - assignedHours;

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

  useEffect(() => {}, [workersData]);

  return (
    <div className="p-4 bg-mybackground shadow-lg w-full border-[2px]">
      <div className="flex items-end gap-3 w-full">
        <div className="w-[13%]">
          <SpecialDatePicker
            label={tt("Sana", "Дата")}
            defaultValue={taskDate}
            onChange={(date) => setTaskDate(date)}
          />
        </div>
        <div className="w-[8%]">
          <Input
            label={tt("Boshlanish", "Начало")}
            v={startTime}
            change={(e: any) => setStartTime(e.target.value)}
            t="text"
            p="00:00"
          />
        </div>
        <div className="w-[8%]">
          <Input
            label={tt("Tugash", "Конец")}
            v={endTime}
            change={(e: any) => setEndTime(e.target.value)}
            t="text"
            p="00:00"
          />
        </div>
        <div className="w-[5%]">
          <Input
            label={tt("Soat", "Часы")}
            t="number"
            defaultValue={row?.task_time}
            value={TaskTimeForAll && TaskTimeForAll > 0 ? TaskTimeForAll : ""}
            change={(e: any) => setTaskTimeForAll(+e.target.value)}
          />
        </div>
        <Button text={tt("Qo'llash", "Применить")} onClick={() => setAllWorkersTaskTime()} />
        <div className="w-[15%]">
          <Input
            p={tt("Qidiruv...", "Поиск...")}
            v={searchTerm}
            change={(e: any) => setSearchTerm(e.target.value)}
            removeValue={() => setSearchTerm("")}
            search
          />
        </div>
        <Button mode="cancel" onClick={() => closeForm(null)} />
        <Button mode="add" onClick={handleSave} />
        <div className="text-[12px] leading-snug whitespace-nowrap ml-auto text-mytextcolor">
          <p>
            {tt("Jami", "Всего")} {workers?.meta.count} {tt("ta xodimdan", "сотр. из них")}{" "}
            <span className="text-blue-400 font-semibold">{attachedWorkersCount}</span>
            {" "}{tt("ta biriktirilgan", "прикреплено")}
          </p>
          <p>
            {tt("Soat", "Часы")}:{" "}
            <span className={`font-semibold ${remainingHours > 0 ? "text-amber-400" : "text-green-400"}`}>{assignedHours}</span>
            {" "}/ {totalRequiredHours} ({tt("qoldi", "осталось")}:{" "}
            <span className={`font-semibold ${remainingHours > 0 ? "text-amber-400" : "text-green-400"}`}>{remainingHours}</span>)
          </p>
        </div>
      </div>
      <div className="mt-3 max-h-[600px] overflow-y-auto border border-mytableheadborder">
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
                          className={`taskinput_${worker.id} border bg-mybackground border-mytableheadborder text-mytextcolor w-full rounded px-2 py-0.5`}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default EditForm;
