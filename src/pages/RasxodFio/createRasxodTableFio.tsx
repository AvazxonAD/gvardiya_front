import Icon from "@/assets/icons";
import { RasxodFioTaskInterface, UstamaInterFaceEdited } from "@/interface";
import "@/pages/rasxod/rasxod.css";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React from "react";
import { TableItem } from "../rasxod/rasxodcreateTable";
import { splitSumma } from "./splitSumma";

const tablehead = [
  { name: tt("Shartnoma №", "№ договора"), className: "text-left" },
  { name: tt("Sana", "Дата"), className: "text-left" },
  { name: tt("Tashkilot", "Организация"), className: "text-left w-[10.625rem] max-w-[10.625rem]" },
  { name: tt("F.I.Sh.", "ФИО"), className: "text-left" },
  { name: tt("Vaqt", "Время"), className: "text-center" },
  { name: tt("Jami (100%)", "Всего (100%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Boshqarma (10%)", "Управление (10%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Qolgan (90%)", "Остаток (90%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Moddiy baza (75%)", "Материальная база (75%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("I-II guruh (25%)", "I-II группы (25%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Shaxsiy tarkib", "Личный состав"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Ijtimoiy soliq (25%)", "Социальный налог (25%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Daromad solig'i (12%)", "Налог на доходы (12%)"), className: "text-right min-w-[6.875rem]" },
  { name: tt("Kartaga o'tkazildi", "Перечислено на карту"), className: "text-right min-w-[6.875rem]" },
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

  // Saqlangan qatorda bazadagi summalar, yangisida — joriy qoida bo'yicha
  const amountsOf = (task: RasxodFioTaskInterface) =>
    splitSumma(task.summa, summa_10_percent, task.saved ? task : undefined);

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
      const s = amountsOf(task);
      task_time += task.task_time;
      totalSumma += task.summa;
      total_summa_10 += s.summa_10;
      total_summa_remaining += s.summa_remaining;
      summa_65 += s.summa_65;
      summa_25 += s.summa_25;
      summa_1_25 += s.summa_1_25;
      summa_25_2 += s.summa_25_2;
      summa_12 += s.summa_12;
      worker_summa += s.worker_summa;
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
      <div className="rounded-t-[6px] max-h-[25rem] overflow-y-auto overflow-x-auto text-foreground text-[0.6875rem] leading-[0.875rem]">
        <table className="table-grid min-w-full table-auto relative">
          <thead className="bg-muted text-foreground text-[0.6875rem] leading-[0.875rem] rounded-t-[6px] sticky top-0 z-20">
            <tr className="rounded-t-[6px]">
              {tablehead.map((item, index) => (
                <th
                  key={index}
                  className={`px-2 py-2 border-b border-border text-left ${item.className}`}
                >
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-foreground bg-card text-[0.6875rem] leading-[0.875rem] relative z-[1]">
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
                  className={`text-foreground ${item.saved ? "bg-[#e5fedea9] dark:bg-muted/60border" : ""
                    } relative`}
                >
                  {(() => {
                    const r = (v: number) => Math.round(v * 100) / 100;
                    const s = amountsOf(item);
                    const c = "px-2 py-1 border-b border-border";
                    return (<>
                      <td className={`${c} text-left`}>{item.contract_doc_num}</td>
                      <td className={`${c} text-left`}>{newdate(item.contract_doc_date)}</td>
                      <td className={`${c} text-left relative group cursor-pointer max-w-[10.625rem]`}>
                        <p className="truncate">{item.organization_name}</p>
                        <div className="hidden group-hover:block absolute left-[6.25rem] -mt-4 w-[13.75rem] shadow-lg z-10 rounded-md bg-card border-b border-border text-foreground p-2 text-[0.625rem]">
                          <p>{item.organization_name}</p>
                          <p>{tt("Hisob", "Счет")}: {textNum(item.organization_account_number, 4)}</p>
                          <p>{tt("INN", "ИНН")}: {item.organization_str}</p>
                          <p>{tt("MFO", "МФО")}: {item.organization_mfo}</p>
                        </div>
                      </td>
                      <td className={`${c} text-left`}>{item.fio}</td>
                      <td className={`${c} text-center`}>{item.task_time}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(item.summa)}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_10))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_remaining))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_65))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_25))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_1_25))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_25_2))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.summa_12))}</td>
                      <td className={`${c} text-right whitespace-nowrap`}>{formatNum(r(s.worker_summa))}</td>
                    </>);
                  })()}
                </tr>
              );
            })}

            {/* Totals row */}
            {(() => {
              const c = "px-2 py-1 border-b border-border font-semibold";
              return (
                <tr className="bg-muted/60">
                  <td colSpan={4} className={`${c} text-right whitespace-nowrap`}>{tt("Jami", "Итого")}</td>
                  <td className={`${c} text-center`}>{formatNum(total.task_time)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.totalSumma)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.total_summa_10)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.total_summa_remaining)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.summa_65)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.summa_25)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.summa_1_25)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.summa_25_2)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.summa_12)}</td>
                  <td className={`${c} text-right whitespace-nowrap`}>{formatNum(total.worker_summa)}</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};
