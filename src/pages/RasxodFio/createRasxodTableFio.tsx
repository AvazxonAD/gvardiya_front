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
    className: "text-center",
  },
  {
    name: tt("Premiya (100%)", "Премия (100%)"),
    className: "text-right",
  },
  {
    name: tt("Moddiy bazani rivojlantrish uchun (75%)", "Моддий базани ривожлантириш учун (75%)"),
    className: "text-right",
  },
  {
    name: tt("I va II gurux xarajatlari uchun (25%)", "I ва II гурух харажатлари учун (25%)"),
    className: "text-right",
  },
  {
    name: tt("Shaxsiy tarkibga taksimlandi", "Шахсий таркибга таксимланди"),
    className: "text-right",
  },
  {
    name: tt("Yagona ijtimoiy solik (25%)", "Ягона ижтимоий солик (25%)"),
    className: "text-right",
  },
  {
    name: tt("Daromad solig‘i (12%)", "Даромад солиғи (12%)"),
    className: "text-right",
  },
  {
    name: tt("Bank plastik kartasiga o‘tkazib berildi", "Банк пластик картасига ўтказиб берилди"),
    className: "text-right",
  },
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
    let task_time = 0;
    let summa_75 = 0
    let summa_25 = 0
    let summa_1_25 = 0
    let summa_25_2 = 0
    let summa_12 = 0
    let worker_summa = 0


    data?.forEach((task) => {
      task_time += task.task_time;
      totalSumma += task.summa;
      summa_75 += task.summa * 0.75
      summa_25 += task.summa * 0.25
      summa_1_25 += (task.summa * 0.25) / 1.25
      summa_25_2 += ((task.summa * 0.25) / 1.25) * 0.25
      summa_12 += ((task.summa * 0.25) / 1.25) * 0.12
      worker_summa += (task.summa * 0.25) / 1.25 - ((task.summa * 0.25) / 1.25) * 0.12
    });

    return {
      totalSumma,
      task_time,
      summa_75,
      summa_25,
      summa_1_25,
      summa_25_2,
      summa_12,
      worker_summa,
    };
  };

  const total = calculateTotals();

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
                  className={`text-mytextcolor ${item.saved ? "bg-[#e5fedea9] dark:bg-mytableheadborder" : ""
                    } relative`}
                >
                  <TableItem>{item.contract_doc_num}</TableItem>
                  <TableItem>{newdate(item.contract_doc_date)}</TableItem>
                  <TableItem className="rasxod-tooltip">
                    {item.organization_name}
                    <div
                      className="absolute rasxod-tooltip-wrap w-[250px] shadow-lg z-10 rounded-[6px] bg-mybackground border border-mytableheadborder text-mytextcolor p-3"
                      style={{ left: "400px" }} // Bu yerda tooltipni chapga surdik
                    >
                      <ul className="space-y-1 text-left">
                        <li className="opacity-[0.7] text-[14px]">
                          {item.organization_name}
                        </li>
                        <li className="opacity-[0.7] text-[12px]">
                          {tt("Joriy hisob", "Текущий счет")}: {textNum(item.organization_account_number, 4)}
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
                  <TableItem className="!text-center">{item.task_time}</TableItem>
                  <TableItem className="!text-right">
                    {formatNum(item.summa)}
                  </TableItem>
                  <TableItem className="!text-right">
                    {formatNum(Math.round(item.summa * 0.75))}
                  </TableItem>
                  <TableItem className="!text-right">
                    {formatNum(Math.round(item.summa * 0.25))}
                  </TableItem>
                  <TableItem className="!text-right">
                    {Math.round((item.summa * 0.25) / 1.25)}
                  </TableItem>
                  <TableItem className="!text-right">
                    {Math.round(((item.summa * 0.25) / 1.25) * 0.25)}
                  </TableItem>
                  <TableItem className="!text-right">
                    {Math.round(((item.summa * 0.25) / 1.25) * 0.12)}
                  </TableItem>
                  <TableItem className="!text-right">
                    {Math.round((item.summa * 0.25) / 1.25 - ((item.summa * 0.25) / 1.25) * 0.12)}
                  </TableItem>
                </tr>
              );
            })}

            {/* Totals row */}
            <tr className="bg-mytablehead font-medium border-t border-mytableheadborder">
              <td colSpan={4} className="text-right"></td>
              <TableItem className="text-center">
                {formatNum(total.task_time)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.totalSumma)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.summa_75)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.summa_25)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.summa_1_25)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.summa_25_2)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.summa_12)}
              </TableItem>
              <TableItem className="text-right">
                {formatNum(total.worker_summa)}
              </TableItem>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
