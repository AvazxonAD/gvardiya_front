import { ITask } from "@/types/task";
import { tt } from "@/utils";
import React, { useState } from "react";
import TableItem from "./TableItem";
import Icon from "@/assets/icons";

const Table: React.FC<{ data: ITask[]; getTasks: Function; contract?: any }> = ({
  data,
  getTasks,
  contract,
}) => {
  const [creatingId, setCreatingId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto my-5">
      <table className="min-w-full border-collapse border border-mytableheadborder">
        <thead>
          <tr className="bg-mytablehead text-mytextcolor uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left border border-mytableheadborder">
              {tt(
                "Batalon / Boshqarma nomi",
                "Название батальона / организации"
              )}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Topshiriq vaqti", "Время задачи")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              <div className="flex items-center gap-2 justify-center">
                <Icon name="ava" />
                {tt("Xodimlar soni", "Количество сотрудников")}
              </div>
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Jami soat", "Всего часов")}
            </th>
            <th className="py-3 px-6 text-left min-w-[170px] border border-mytableheadborder">
              {tt("Summa", "Сумма")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Qolgan vaqt", "Оставшееся время")}
            </th>
<th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Biriktirilgan jami xodimlar", "Всего прикреплённых сотрудников")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Biriktirilgan jami soat", "Всего прикреплённых часов")}
            </th>
            <th className="py-3 px-6 text-center border border-mytableheadborder">
              {tt("Amallar", "Действия")}
            </th>
          </tr>
        </thead>
        <tbody className="text-sm font-light">
          {data.map((row) => (
            <TableItem
              row={row}
              key={row.id}
              getTasks={getTasks}
              creatingId={creatingId}
              setCreatingId={setCreatingId}
              contract={contract}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
