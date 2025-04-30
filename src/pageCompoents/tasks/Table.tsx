import { ITask } from "@/types/task";
import { tt } from "@/utils";
import React, { useState } from "react";
import TableItem from "./TableItem";
import Icon from "@/assets/icons";

const Table: React.FC<{ data: ITask[]; getTasks: Function }> = ({
  data,
  getTasks,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto my-5">
      <table className="min-w-full border-none">
        <thead>
          <tr className="bg-mytablehead border border-mytableheadborder text-mytextcolor uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">№</th>
            <th className="py-3 px-6 text-left">
              {tt(
                "Batalon / Boshqarma nomi",
                "Название батальона / организации"
              )}
            </th>
            <th className="py-3 px-6 text-center">
              {tt("Topshiriq vaqti", "Время задачи")}
            </th>
            <th className="py-3 px-6 text-center">
              <div className="flex items-center gap-2 justify-center">
                <Icon name="ava" />
                {tt("Xodimlar soni", "Количество сотрудников")}
              </div>
            </th>
            <th className="py-3 px-6 text-left">{tt("Summa", "Сумма")}</th>
            <th className="py-3 px-6 text-left">{tt("Sana", "Дата")}</th>
            <th className="py-3 px-6 text-center">
              {tt("Qolgan vaqt", "Оставшееся время")}
            </th>
            <th className="py-3 px-6 text-center">
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
              editingId={editingId}
              creatingId={creatingId}
              setCreatingId={setCreatingId}
              setEditingId={setEditingId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
