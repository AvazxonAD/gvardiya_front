import Icon from "@/assets/icons";
import { RasxodFioTaskInterface, UstamaInterFaceEdited } from "@/interface";
import "@/pages/rasxod/rasxod.css";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React from "react";
import { TableItem } from "../rasxod/rasxodcreateTable";

const tablehead = [
  { name: tt("Shartnoma №", "№ контракта"), className: "text-left" },
  { name: tt("Sana", "Дата"), className: "text-left" },
  { name: tt("Tashkilot", "Организация"), className: "text-left" },
  { name: tt("FIO", "ФИО"), className: "text-left" },
  { name: tt("Vaqt", "Время"), className: "text-center" },
  { name: tt("Jami (100%)", "Жами (100%)"), className: "text-right" },
  { name: tt("Boshqarma (10%)", "Бошқарма (10%)"), className: "text-right" },
  { name: tt("Qolgan (90%)", "Қолган (90%)"), className: "text-right" },
  { name: tt("Moddiy baza (65%)", "Моддий база (65%)"), className: "text-right" },
  { name: tt("I-II guruh (25%)", "I-II гурух (25%)"), className: "text-right" },
  { name: tt("Shaxsiy tarkib", "Шахсий таркиб"), className: "text-right" },
  { name: tt("Ijtimoiy soliq (25%)", "Ижтимоий солиқ (25%)"), className: "text-right" },
  { name: tt("Daromad solig’i (12%)", "Даромад солиғи (12%)"), className: "text-right" },
  { name: tt("Kartaga o’tkazildi", "Картага ўтказилди"), className: "text-right" },
];

interface Props {
  ustamaData: UstamaInterFaceEdited[];
  data: RasxodFioTaskInterface[];
  setRasxodRequestData: React.Dispatch<
    React.SetStateAction<RasxodFioTaskInterface[]>
  >;
  summa_10_percent?: number;
}

export const RasxodcreateTableFio = ({
  ustamaData,
  data,
  setRasxodRequestData,
  summa_10_percent = 0,
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
    let total_summa_10 = 0;
    let total_summa_remaining = 0;
    let task_time = 0;
    let summa_65 = 0
    let summa_25 = 0
    let summa_1_25 = 0
    let summa_25_2 = 0
    let summa_12 = 0
    let worker_summa = 0

    data?.forEach((task) => {
      const s10 = task.saved && task.summa_10 != null ? task.summa_10 : task.summa * summa_10_percent / 100;
      const rem = task.saved && task.summa_remaining != null ? task.summa_remaining : task.summa - s10;
      const s65 = task.saved && task.summa_65 != null ? task.summa_65 : task.summa * 0.65;
      const s25 = task.saved && task.summa_25 != null ? task.summa_25 : task.summa * 0.25;
      const s125 = task.saved && task.summa_1_25 != null ? task.summa_1_25 : s25 / 1.25;
      const s252 = task.saved && task.summa_25_2 != null ? task.summa_25_2 : s125 * 0.25;
      const s12 = task.saved && task.summa_12 != null ? task.summa_12 : s125 * 0.12;
      const ws = task.saved && task.worker_summa != null ? task.worker_summa : s125 - s12;
      task_time += task.task_time;
      totalSumma += task.summa;
      total_summa_10 += s10;
      total_summa_remaining += rem;
      summa_65 += s65;
      summa_25 += s25;
      summa_1_25 += s125;
      summa_25_2 += s252;
      summa_12 += s12;
      worker_summa += ws;
    });

    return {
      totalSumma,
      total_summa_10,
      total_summa_remaining,
      task_time,
      summa_65,
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
      <div className="rounded-t-[6px] max-h-[400px] overflow-y-auto overflow-x-auto text-[#323232] text-[11px] leading-[14px]">
        <table className="min-w-full table-auto relative border-collapse">
          <thead className="bg-mytablehead text-mytextcolor text-[11px] leading-[14px] rounded-t-[6px] sticky -top-1 z-[2]">
            <tr className="rounded-t-[6px]">
              {tablehead.map((item, index) => (
                <th
                  key={index}
                  className={`px-2 py-2 border border-mytableheadborder text-left ${item.className}`}
                >
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-mytextcolor bg-mybackground text-[11px] leading-[14px] relative z-[1]">
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
                  {(() => {
                    const r = (v: number) => Math.round(v * 100) / 100;
                    // Saved items use DB values, new items calculate with percent
                    const s10 = item.saved && item.summa_10 != null ? item.summa_10 : item.summa * summa_10_percent / 100;
                    const rem = item.saved && item.summa_remaining != null ? item.summa_remaining : item.summa - s10;
                    const s65 = item.saved && item.summa_65 != null ? item.summa_65 : item.summa * 0.65;
                    const s25 = item.saved && item.summa_25 != null ? item.summa_25 : item.summa * 0.25;
                    const s125 = item.saved && item.summa_1_25 != null ? item.summa_1_25 : s25 / 1.25;
                    const s252 = item.saved && item.summa_25_2 != null ? item.summa_25_2 : s125 * 0.25;
                    const s12 = item.saved && item.summa_12 != null ? item.summa_12 : s125 * 0.12;
                    const ws = item.saved && item.worker_summa != null ? item.worker_summa : s125 - s12;
                    const c = "px-2 py-1 border border-mytableheadborder";
                    return (<>
                      <td className={`${c} text-left`}>{item.contract_doc_num}</td>
                      <td className={`${c} text-left`}>{newdate(item.contract_doc_date)}</td>
                      <td className={`${c} text-left relative group cursor-pointer`}>
                        {item.organization_name}
                        <div className="hidden group-hover:block absolute left-[100px] -mt-4 w-[220px] shadow-lg z-10 rounded-md bg-mybackground border border-mytableheadborder text-mytextcolor p-2 text-[10px]">
                          <p>{item.organization_name}</p>
                          <p>{tt("Hisob", "Счет")}: {textNum(item.organization_account_number, 4)}</p>
                          <p>{tt("INN", "ИНН")}: {item.organization_str}</p>
                          <p>{tt("MFO", "МФО")}: {item.organization_mfo}</p>
                        </div>
                      </td>
                      <td className={`${c} text-left`}>{item.fio}</td>
                      <td className={`${c} text-center`}>{item.task_time}</td>
                      <td className={`${c} text-right`}>{formatNum(item.summa)}</td>
                      <td className={`${c} text-right`}>{formatNum(r(s10))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(rem))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(s65))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(s25))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(s125))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(s252))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(s12))}</td>
                      <td className={`${c} text-right`}>{formatNum(r(ws))}</td>
                    </>);
                  })()}
                </tr>
              );
            })}

            {/* Totals row */}
            {(() => {
              const c = "px-2 py-1 border border-mytableheadborder font-semibold";
              return (
                <tr className="bg-mytablehead">
                  <td colSpan={4} className={`${c} text-right`}>{tt("Jami", "Итого")}</td>
                  <td className={`${c} text-center`}>{formatNum(total.task_time)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.totalSumma)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.total_summa_10)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.total_summa_remaining)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.summa_65)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.summa_25)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.summa_1_25)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.summa_25_2)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.summa_12)}</td>
                  <td className={`${c} text-right`}>{formatNum(total.worker_summa)}</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};
