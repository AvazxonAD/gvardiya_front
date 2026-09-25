import Icon from "@/assets/icons";
import { RasxodTabelInterface } from "@/interface";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React from "react";
import "./rasxod.css";
const tablehead = [
  {
    name: tt("Shartnoma №", "№ договора"),
  },
  {
    name: tt("Shartnoma sanasi", "Дата договора"),
  },
  {
    name: tt("Tashkilot nomi", "Название организации"),
  },
  {
    name: tt("Topshiriq vaqti", "Время задания"),
  },
  {
    name: tt("Xodimlar soni", "Количество сотрудников"),
  },
  {
    name: tt("Summa", "Сумма"),
  },
  {
    name: tt("Chegirma summasi", "Сумма скидки"),
  },
  {
    name: tt("Natijaviy summa", "Итоговая сумма"),
  },
  // {
  //   name: tt("Amallar", "Действия"),
  // },
];

interface Props {
  data: RasxodTabelInterface[];
  setRasxodRequestData: React.Dispatch<
    React.SetStateAction<RasxodTabelInterface[]>
  >;
}

export const TableItem = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<"td">) => {
  return (
    <td
      {...props}
      className={`px-2 py-[0.375rem] h-[2.9375rem] text-left ${
        className ? className : ""
      }`}
    >
      {children}
    </td>
  );
};

export const RasxodcreateTable = ({ data, setRasxodRequestData }: Props) => {
  const handleRemove = (item: RasxodTabelInterface) => {
    setRasxodRequestData((prev) =>
      prev.filter((el) => el.task_id !== item.task_id)
    );
  };

  // Calculate totals for the required columns
  const calculateTotals = () => {
    let task_time = 0;
    let totalSumma = 0;
    let totalDiscount = 0;
    let wrokerNumber = 0;
    let resultSumma = 0;

    data?.forEach((item) => {
      task_time += item.task_time ? Number(item.task_time) : 0;
      totalSumma += item.summa ? Number(item.summa) : 0;
      totalDiscount += item.discount_money ? Number(item.discount_money) : 0;
      wrokerNumber += item.worker_number ? Number(item.worker_number) : 0;
      resultSumma += item.result_summa ? Number(item.result_summa) : 0;
    });

    return { task_time, totalSumma, totalDiscount, wrokerNumber, resultSumma };
  };

  const { task_time, totalSumma, totalDiscount, wrokerNumber, resultSumma } =
    calculateTotals();

  const renderTotalsRow = () => (
    <tr>
      <TableItem className="font-bold">{tt("Jami", "Итого")}</TableItem>
      <TableItem className="font-bold">{task_time}</TableItem>
      <TableItem className="font-bold">{wrokerNumber}</TableItem>
      <TableItem className="font-bold">{formatNum(totalSumma)}</TableItem>
      <TableItem className="font-bold">{formatNum(totalDiscount)}</TableItem>
      <TableItem className="font-bold">{formatNum(resultSumma)}</TableItem>
    </tr>
  );

  return (
    <div>
      {/* Jadval o'z qutisida ikki yo'nalishda aylanadi: gorizontal — kichik
          monitorda sahifa o'ngga surilmasin; vertikal — sarlavha (`sticky`)
          aylantirganda tepada qotib tursin. Sahifa aylansa sticky ishlamaydi. */}
      <div className="min-h-[18.75rem] max-h-[calc(100vh-14rem)] overflow-auto rounded-t-[6px] text-[0.875rem] leading-[1.05875rem] text-foreground">
        <table className="table-grid min-w-full">
          {/* Fon to'liq (shaffof emas) — aks holda ostidan qatorlar ko'rinadi */}
          <thead className="sticky top-0 z-20 bg-muted text-foreground border-b border-border text-[0.875rem] leading-[1.05875rem] rounded-t-[6px]">
            <tr className="h-[2.875rem] rounded-t-[6px]">
              {tablehead.map((item, index) => (
                // Qat'iy kenglik va `truncate` yo'q: 8 ta ustun × 12.5rem
                // hech bir kichik monitorga sig'masdi. Sarlavha so'zlar
                // orasidan o'raladi, kenglikni mazmun belgilaydi.
                <th
                  key={index}
                  className={`px-4 py-[0.4375rem] text-left ${
                    index === 2 ? "min-w-[14rem]" : "min-w-[6rem]"
                  }`}
                >
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-foreground text-[0.875rem] leading-[1.05875rem]">
            {data?.map((item, index) => (
              <tr
                key={index}
                className={`text-foreground ${
                  item.saved ? "bg-[#e5fedea9] dark:bg-muted/60border" : ""
                } relative`}
              >
                <TableItem>{item.doc_num}</TableItem>
                <TableItem>{formatDate(item.doc_date)}</TableItem>
                <TableItem className="rasxod-tooltip">
                  {item.organization_name}
                  <div className="absolute rasxod-tooltip-wrap w-[15.625rem] shadow-lg z-10 rounded-none p-3 bg-popover text-popover-foreground border border-border">
                    <ul className="space-y-1 text-left">
                      <li className="opacity-[0.7] text-[0.875rem]">
                        {item.organization_name}
                      </li>
                      <li className="opacity-[0.7] text-[0.75rem]">
                        {tt("Joriy hisob", "Текущий счет")}:{" "}
                        {textNum(item.organization_account_number, 4)}
                      </li>
                      <li className="opacity-[0.7] text-[0.75rem]">
                        {tt("INN", "ИНН")}: {item.organization_str}
                      </li>
                      <li className="opacity-[0.7] text-[0.75rem]">
                        {tt("MFO", "МФО")}: {item.organization_mfo}
                      </li>
                    </ul>
                  </div>
                </TableItem>
                <TableItem className="text-center">{item.task_time}</TableItem>
                <TableItem className="text-center">
                  {item.worker_number}
                </TableItem>

                <TableItem>{formatNum(item.summa)}</TableItem>
                <TableItem>
                  {item.discount_money ? formatNum(item.discount_money) : "-"}
                </TableItem>
                <TableItem>{formatNum(item.result_summa)}</TableItem>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="sticky bottom-0 z-10 bg-muted font-medium border-t border-border">
              <td colSpan={3} className="text-left"></td>
              <TableItem className="text-center">
                {formatNum(task_time)}
              </TableItem>
              <TableItem className="text-center">
                {formatNum(wrokerNumber)}
              </TableItem>
              <TableItem className="text-left">
                {formatNum(totalSumma)}
              </TableItem>
              <TableItem className="text-left">
                {formatNum(totalDiscount)}
              </TableItem>
              <TableItem className="text-left">
                {formatNum(resultSumma)}
              </TableItem>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
