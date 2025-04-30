import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { TrashIcon } from "@heroicons/react/16/solid";
import Input from "../Components/Input";
import Select from "../Components/Select";
import { formatNum, tt } from "../utils";

const ContractAddColumn = ({
  batalons,
  data,
  setDatas,
  index,
  errorInfo,
  dateBox,
  bxm,
}: any) => {
  const rowError = errorInfo.rows?.[index] || {};

  const handleChange = (key: string, value: any) => {
    setDatas((prev = []) => {
      return prev.map((batalon: any) => {
        if (batalon.id !== data.id) return batalon;
        return {
          ...batalon,
          [key]: value,
        };
      });
    });
  };
  const returnSum = (id: number) => {
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
  return (
    <div className="mt-3 gap-5 flex items-center w-full">
      <Select
        up
        onChange={(id: any) => {
          handleChange("batalon_id", id);
        }}
        label={tt("Batalon nomi", "Название батальона")}
        data={batalons}
        error={rowError.batalon}
        value={data.batalon_id}
        w={200}
      />
      <Select
        up
        onChange={(id: any) => {
          handleChange("bxm_id", id);
        }}
        label={tt("BXM tanlang", "Выберите БХМ")}
        data={bxm}
        // error={rowError.b}
        value={data.bxm_id}
        w={200}
      />

      <div className="!w-[130px]">
        <Input
          label={tt("Hodimlar soni", "Кол-во сотрудников")}
          t="number"
          change={(e: any) => handleChange("worker_number", e.target.value)}
          v={data.worker_number}
          error={rowError.xodim_num}
          className="!w-full"
        />
      </div>
      <div className="!w-[130px]">
        <Input
          className="!w-full"
          label={tt("Tadbir vaqti", "Время события")}
          t="number"
          change={(e: any) => handleChange("task_time", e.target.value)}
          v={data.task_time}
          error={rowError.task_time}
        />
      </div>
      <div className="!w-[200px]">
        <Input
          className="!w-full"
          label={tt("Summa", "Сумма")}
          v={
            data?.worker_number && data?.task_time && data?.bxm_id
              ? formatNum(
                  Number(data?.worker_number) *
                    Number(data?.task_time) *
                    returnSum(data.bxm_id),
                  true
                )
              : 0
          }
          t="text"
          readonly
        />
      </div>
      {dateBox && (
        <div className="w-[200px]">
          <SpecialDatePicker
            error={rowError.task_date}
            onChange={(datas: any) => {
              handleChange("task_date", datas);
            }}
            defaultValue={data.task_date}
            label={tt("Tadbir sanasi", "Дата события")}
          />
        </div>
      )}
      {dateBox && (
        <div className="!w-[200px]">
          <Input
            className="!w-full"
            label={tt("Tadbir manzili", "Адрес события")}
            t="text"
            change={(e: any) => handleChange("address", e.target.value)}
            v={data.address}
            error={rowError.address}
          />
        </div>
      )}

      <div className="ms-5 mt-5 w-6 h-6">
        <span></span>
        <button
          onClick={() =>
            setDatas((prev: any) => {
              const datas = prev.filter((_: any, i: number) => i !== index);
              if (datas.length > 0) return datas;
              return prev;
            })
          }
          type="button"
          className="text-red-500 w-6 h-6"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default ContractAddColumn;
