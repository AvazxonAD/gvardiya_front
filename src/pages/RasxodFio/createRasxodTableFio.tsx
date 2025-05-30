import Icon from "@/assets/icons";
import { RasxodFioTaskInterface, UstamaInterFaceEdited } from "@/interface";
import "@/pages/rasxod/rasxod.css";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React from "react";
import { TableItem } from "../rasxod/rasxodcreateTable";

const tablehead = [
  {
    name: tt("Shartnoma №", "Номер контракта"),
    className: "text-left",
  },
  {
    name: tt("Shartnoma sanasi", "Дата контракта"),
    className: "text-left",
  },
  {
    name: tt("Tashkilot nomi", "Название организации"),
    className: "text-left",
  },
  {
    name: tt("FIO", "ФИО"),
    className: "text-left",
  },
  {
    name: tt("Topshiriq vaqti", "Время назначения"),
    className: "text-left",
  },
  {
    name: tt("Summa", "Сумма"),
    className: "text-right",
  },
  // {
  //   name: tt("Chegirma summa", "Сумма скидки"),
  //   className: "text-right",
  // },
  // {
  //   name: tt("Natijaviy summa", "Полученная сумма"),
  //   className: "text-right",
  // },
  // {
  //   name: tt("Amallar", "Действия"),
  // },
];

interface Props {
  ustamaData: UstamaInterFaceEdited[];
  data: RasxodFioTaskInterface[];
  setRasxodRequestData: React.Dispatch<
    React.SetStateAction<RasxodFioTaskInterface[]>
  >;
}

export const RasxodcreateTableFio = ({
  ustamaData,
  data,
  setRasxodRequestData,
}: Props) => {
  const handleRemove = (item: RasxodFioTaskInterface) => {
    setRasxodRequestData((prev) =>
      prev?.filter((el) => el.worker_task_id !== item.worker_task_id)
    );
  };

  const newdate = (date: string) => {
    const currentDate = new Date(date);
    const formattedDate = currentDate.toISOString().split("T")[0];
    return formatDate(formattedDate);
  };

  // Calculate totals for the required columns
  const calculateTotals = () => {
    let totalSumma = 0;
    let totalDiscount = 0;
    let totalFinalAmount = 0;
    let task_time = 0;

    data?.forEach((item) => {
      const activeUstama = ustamaData.filter((el) => el.active === true);
      const calculate = activeUstama.reduce((currentSum, ustama) => {
        return currentSum - (currentSum * ustama.percent) / 100;
      }, item.summa);

      task_time += item.task_time;
      totalSumma += item.summa;
      totalDiscount += item.summa - calculate;
      totalFinalAmount += calculate;
    });

    return { totalSumma, totalDiscount, totalFinalAmount, task_time };
  };

  const { totalSumma, totalDiscount, totalFinalAmount, task_time } =
    calculateTotals();

  return (
    <div>
      <div className="rounded-t-[6px] max-h-[400px] overflow-y-auto text-[#323232] text-[14px] leading-[16.94px]">
        <table className="min-w-full table-fixed relative">
          <thead className="bg-mytablehead text-mytextcolor border border-mytableheadborder text-[14px] leading-[16.94px] rounded-t-[6px] sticky -top-1 z-[2]">
            <tr className="h-[46px] rounded-t-[6px]">
              {tablehead.map((item, index) => (
                <th
                  key={index}
                  style={{ width: "200px" }}
                  className={`px-4 py-[7px] text-left truncate ${item.className}`}
                >
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-mytextcolor bg-mybackground text-[14px] leading-[16.94px] relative z-[1]">
            {data?.map((item, index) => {
              const activeUstama = ustamaData.filter(
                (el) => el.active === true
              );
              const calculate = activeUstama.reduce((currentSum, ustama) => {
                return currentSum - (currentSum * ustama.percent) / 100;
              }, item.summa);

              return (
                <tr
                  key={index}
                  className={`text-mytextcolor ${
                    item.saved ? "bg-[#e5fedea9] dark:bg-mytableheadborder" : ""
                  } relative`}
                >
                  <TableItem>{item.contract_doc_num}</TableItem>
                  <TableItem>{newdate(item.contract_doc_date)}</TableItem>
                  <TableItem className="rasxod-tooltip">
                    {item.organization_name}
                    <div className="absolute rasxod-tooltip-wrap w-[250px] shadow-lg z-10 rounded-[6px] bg-mybackground border border-mytableheadborder text-mytextcolor p-3">
                      <ul className="space-y-1 text-left">
                        <li className="opacity-[0.7] text-[14px]">
                          {item.organization_name}
                        </li>
                        <li className="opacity-[0.7] text-[12px]">
                          {tt("Joriy hisob", "Текущий счет")}:{" "}
                          {textNum(item.organization_account_number, 4)}
                        </li>
                        <li className="opacity-[0.7] text-[12px]">
                          {tt("INN", "ИНН")}: {item.organization_str}
                        </li>
                        <li className="opacity-[0.7] text-[12px]">
                          {tt("MFO", "МФО")}: {item.organization_mfo}
                        </li>
                      </ul>
                    </div>
                  </TableItem>
                  <TableItem>{item.fio}</TableItem>
                  <TableItem>{item.task_time}</TableItem>
                  <TableItem className="!text-right">
                    {formatNum(item.summa)}
                  </TableItem>
                  {/* <TableItem className="!text-right">
                    {formatNum(item.summa - calculate)}
                  </TableItem>
                  <TableItem className="!text-right">
                    {formatNum(calculate)}
                  </TableItem> */}
                  {/* <TableItem>
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleRemove(item)}>
                        <Icon name="delete" />
                      </button>
                    </div>
                  </TableItem> */}
                </tr>
              );
            })}

            {/* Totals row */}
            <tr className="bg-mytablehead font-medium border-t border-mytableheadborder">
              <td colSpan={4} className="text-right"></td>
              <TableItem className="text-left">
                {formatNum(task_time)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(totalSumma)}
              </TableItem>
              {/* <TableItem className="text-right">
                {formatNum(totalDiscount)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(totalFinalAmount)}
              </TableItem> */}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
