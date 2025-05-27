import Input from "@/Components/Input";
// import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { ITask, ITaskWorker } from "@/types/task";
import { IWorker, IWorkerData } from "@/types/worker";
import { tt } from "@/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

interface EditFormProps {
  row: ITask;
  type: "edit" | "create";
  closeForm: Dispatch<SetStateAction<number | null>>;
  getTasks: Function;
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
  type,
  closeForm,
  getTasks,
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

  useEffect(() => {
    (async () => {
      const get = await api.get<ITaskWorker[]>(
        `worker_task/?task_id=${row.id}`
      );
      if (get?.success && get.data) {
        if (type === "edit") {
          const data: IWorkerData[] = get.data.map((w) => {
            return {
              ...w,
              id: w.worker_id,
              worker_id: w.worker_id,
              task_time: w.task_time,
            };
          });
          setWorkersData(data);
        }
      }
    })();
  }, []);

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
    const method = type === "edit" ? api.update : api.post;
    const request: any = await method(`worker_task?task_id=${row.id}`, {
      workers: workersData,
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
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center w-1/2">
          <div className="w-full me-5">
            <Input
              p={tt("Ismlar bo'yicha qidiriuv", "Поиск по именам")}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              v={searchTerm}
              change={(e: any) => setSearchTerm(e.target.value)}
              removeValue={() => setSearchTerm("")}
              search
            />
          </div>
          <div className="w-[150px]">
            <Button
              mode={type === "edit" ? "edit" : "add"}
              onClick={handleSave}
            />
          </div>
        </div>
        <div className="w-1/2 flex justify-between items-center">
          <p className="block ms-5 text-[#636566] text-[16px]">
            {tt(
              `Jami ${workers?.meta.count} ta xodimdan ${attachedWorkersCount} ta biriktirilgan`,
              `Всего из ${workers?.meta.count} сотрудников назначено ${attachedWorkersCount}`
            )}
          </p>

          <div className="flex gap-3 items-center">
            <Input
              p={tt("Topshiriq vaqti", "Время задачи")}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              t="number"
              defaultValue={row?.task_time}
              value={TaskTimeForAll && TaskTimeForAll > 0 ? TaskTimeForAll : ""}
              change={(e: any) => setTaskTimeForAll(+e.target.value)}
            />

            <Button text={"Qo'llash"} onClick={() => setAllWorkersTaskTime()} />
          </div>

          <div>
            <Button mode="cancel" onClick={() => closeForm(null)} />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-5 max-h-[600px] overflow-y-auto">
        {workersList
          .sort((a, b) => {
            const isAChecked = workersData.some((e) => e.worker_id === a.id);
            const isBChecked = workersData.some((e) => e.worker_id === b.id);
            return isAChecked === isBChecked ? 0 : isAChecked ? -1 : 1;
          })
          .map((worker, ind) => {
            const find = workersData.find((e) => e.worker_id === worker.id);
            return (
              <div
                key={ind}
                className="flex items-center justify-between w-1/2 gap-2"
              >
                <div className="flex items-center w-full">
                  <input
                    type="checkbox"
                    checked={Boolean(find)}
                    onChange={() => handleCheck(worker.id)}
                    className="mr-2 w-4 h-4" // height kamaytirildi
                  />
                  <span
                    style={{
                      color: Boolean(find) ? "#3B7FAF" : "",
                    }}
                    className="font-[400] text-mytextcolor"
                  >
                    {worker.fio}
                  </span>
                </div>

                <div className="ms-2 flex items-center gap-2 w-[300px]">
                  <h3 className="text-mytextcolor w-full">
                    {tt("Topshiriq vaqti", "Время задачи")}:
                  </h3>
                  <input
                    type="number"
                    value={find && find.task_time >= 0 ? find.task_time : ""}
                    onChange={(e) =>
                      handleInputChange(worker.id, Number(e.target.value))
                    }
                    className={`taskinput_${worker.id} border bg-mybackground border-gray-300 text-mytextcolor w-[100px] rounded px-2 py-0.5`}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default EditForm;
