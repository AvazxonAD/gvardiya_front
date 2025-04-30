import Icon from "@/assets/icons";
import { RasxodTabelInterface } from "@/interface";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React from "react";
import "./rasxod.css";
const tablehead = [
  {
    name: tt("Shartnoma №", "Номер контракта"),
  },
  {
    name: tt("Shartnoma sanasi", "Дата контракта"),
  },
  {
    name: tt("Tashkilot nomi", "Название организации"),
  },
  {
    name: tt("Topshiriq vaqti", "Время назначения"),
  },
  {
    name: tt("Xodimlar soni", "Время назначения"),
  },
  {
    name: tt("Summa", "Сумма"),
  },
  {
    name: tt("Chegirma summa", "Сумма скидки"),
  },
  {
    name: tt("Natijaviy summa", "Полученная сумма"),
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
      className={`px-2 py-[6px] h-[47px] text-left ${
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

  return (
    <div>
      <div className=" rounded-t-[6px] min-h-[300px]  text-[#323232] text-[14px] leading-[16.94px]">
        <table className="min-w-full">
          <thead
            style={
              {
                // position: "sticky",
                // top: 0,
              }
            }
            className="bg-mytablehead text-mytextcolor border border-mytableheadborder text-[14px] leading-[16.94px] rounded-t-[6px]"
          >
            <tr className=" h-[46px]   rounded-t-[6px]">
              {tablehead.map((item, index) => (
                <th
                  key={index}
                  style={{ width: "200px" }}
                  className="px-4 py-[7px] text-left truncate"
                >
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-mytextcolor  text-[14px] leading-[16.94px]">
            {data?.map((item, index) => (
              <tr
                key={index}
                className={`text-mytextcolor ${
                  item.saved ? "bg-[#e5fedea9] dark:bg-mytableheadborder" : ""
                } relative`}
              >
                <TableItem>{item.doc_num}</TableItem>
                <TableItem>{formatDate(item.doc_date)}</TableItem>
                <TableItem
                  // onMouseEnter={(event) =>
                  //   handleMouseEnter(event, item.task_id)
                  // }
                  className="rasxod-tooltip "
                  // onMouseLeave={() => setShowTooltipId(0)}
                >
                  {item.organization_name}
                  <div
                    className="absolute rasxod-tooltip-wrap  w-[250px] shadow-lg z-10 rounded-[6px] p-3 bg-mytablehead text-mytextcolor border border-mytableheadborder"
                    style={
                      {
                        // top: tooltipPosition.y,
                        // left: tooltipPosition.x,
                        // transform: "translate(-50%, -100%)", // Adjust position based on mouse
                      }
                    }
                  >
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
                <TableItem className="text-center">{item.task_time}</TableItem>
                <TableItem className="text-center">
                  {item.worker_number}
                </TableItem>

                <TableItem>{formatNum(item.summa)}</TableItem>
                <TableItem>
                  {item.discount_money ? formatNum(item.discount_money) : "-"}
                </TableItem>
                <TableItem>{formatNum(item.result_summa)}</TableItem>
                {/* <TableItem>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleRemove(item)}>
                      <Icon name="delete" />
                    </button>
                  </div>
                </TableItem> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
