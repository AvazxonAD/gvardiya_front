import Input from "@/Components/Input";
import Select from "@/Components/Select";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { IContractForm } from "@/types/contract";
import { ITask } from "@/types/task";
import { formatNum, tt } from "@/utils";
import { TrashIcon } from "@heroicons/react/16/solid";
import * as dateFNS from "date-fns";
import { Dispatch, SetStateAction } from "react";

type Props = {
  e: ITask;
  bxm: any[];
  contract: IContractForm;
  setContract: Dispatch<SetStateAction<IContractForm>>;
  batalons: any[];
  dateBox: boolean;
  adressBox: boolean;
};

export const returnBxmSum = (id: number, bxm: any[]) => {
  try {
    const find: any = bxm.find((i: any) => i?.id == id);
    if (find) {
      return find.bxm_07;
    } else {
      return 1;
    }
  } catch (error) {
    return 1;
  }
};
const TaskColumn = ({
  e,
  bxm,
  contract,
  setContract,
  batalons,
  dateBox,
  adressBox,
}: Props) => {
  const summa =
    e?.worker_number && e?.task_time && e?.bxm_id
      ? Number(e?.worker_number) *
        Number(e?.task_time) *
        returnBxmSum(e.bxm_id, bxm)
      : 0;
  const summaStr = formatNum(summa, true);
  const chegirma = contract.discount ? summa * (contract.discount / 100) : 0;
  const chegirmaStr = formatNum(chegirma);

  const handleChangeTask = (keyname: string, id: any, value: any) => {
    setContract((prev) => {
      // Make sure we're working with the correct task by ID
      const updatedTasks = prev.tasks?.map((task) => {
        // Ensure strict comparison and log for debugging

        if (task.unique_id !== id) return task;

        return {
          ...task,
          [keyname]: value,
        };
      });

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });
  };

  return (
    <div className="mt-3 gap-2 flex items-start w-full">
      <Select
        up
        data={batalons}
        //@ts-ignore
        value={e?.batalon_id}
        label={tt("Batalon nomi", "Название батальона")}
        onChange={(value: any) =>
          handleChangeTask("batalon_id", e.unique_id, value)
        }
        w={200}
      />
      <Select
        up
        onChange={(id: any) => {
          handleChangeTask("bxm_id", e.unique_id, id);
        }}
        label={tt("BXM tanlang", "Выберите БХМ")}
        data={bxm}
        // error={rowError.b}
        value={e.bxm_id}
        w={200}
      />

      <div className="!w-[130px]">
        <Input
          className="!w-full"
          v={e.worker_number}
          label={tt("Hodimlar soni", "Кол-во сотрудников")}
          t="number"
          change={(event: any) =>
            handleChangeTask("worker_number", e.unique_id, event.target.value)
          }
        />
      </div>
      <div className="!w-[130px]">
        <Input
          className="!w-full"
          label={tt("Tadbir vaqti", "Время события")}
          v={e.task_time}
          t="number"
          change={(event: any) =>
            handleChangeTask("task_time", e.unique_id, event.target.value)
          }
        />
      </div>
      <div className="!w-[200px]">
        <Input
          className="!w-full"
          label={tt("Chegirma", "Скидка")}
          v={chegirmaStr}
          t="text"
          readonly
        />
      </div>
      <div className="!w-[200px]">
        <Input
          className="!w-full"
          label={tt("Summa", "Сумма")}
          v={summaStr}
          t="text"
          readonly
        />
      </div>
      {dateBox && (
        <SpecialDatePicker
          defaultValue={
            e.task_date != "0" ? e.task_date : new Date().toDateString()
          }
          // defaultValue={"2025-10-01"}
          label={tt("Tadbir sanasi", "Дата события")}
          onChange={(value) => {
            const task_date = dateFNS.format(value, "yyyy-MM-dd");
            handleChangeTask("task_date", e.unique_id, task_date);
          }}
        />
      )}
      {adressBox && (
        <div className="!w-[200px]">
          {/* <p className="text-[#636566] text-[12px]  leading-[14.52px] font-[600]">Tadbir manzili</p>
              <ReadingInput
                onChange={(txt: string) => handleChangeTask("address", e.id, txt)}
                val={e.address}
                className="mt-2"
              /> */}
          <Input
            className="!w-full"
            label={tt("Tadbir manzili", "Адрес события")}
            t="text"
            change={(event: any) =>
              handleChangeTask("address", e.unique_id, event.target.value)
            }
            v={e.address}
          />
        </div>
      )}
      <div className="!w-[200px]">
        {/* <p className="text-[#636566] text-[12px]  leading-[14.52px] font-[600]">Tadbir manzili</p>
              <ReadingInput
                onChange={(txt: string) => handleChangeTask("address", e.id, txt)}
                val={e.address}
                className="mt-2"
              /> */}
        <Input
          className="!w-full"
          label={tt("Izoh", "Комментарий")}
          t="text"
          change={(event: any) =>
            handleChangeTask("comment", e.unique_id, event.target.value)
          }
          v={e.comment}
        />
      </div>

      <div className="grid mt-7 ms-5 w-6">
        <span></span>
        <button
          type="button"
          className="w-6 h-6 text-red-500"
          onClick={() => {
            const filteredTasks = contract?.tasks?.filter(
              (task) => task.unique_id !== e.unique_id
            );
            if (filteredTasks?.length === 0) return;
            setContract((prev) => ({
              ...prev,
              tasks: filteredTasks,
            }));
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default TaskColumn;
