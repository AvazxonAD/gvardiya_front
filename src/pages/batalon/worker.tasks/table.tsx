import React, { useState } from "react";
import { tt } from "@/utils";
import TableItem from "./table.item";
import Icon from "@/assets/icons";
import BackButton from "@/Components/reusable/BackButton";

const Table: React.FC<{ data: any[]; getTasks: Function }> = ({
  data,
  getTasks,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);

  return (
    <div className="my-5">
      <div className="m-0 p-1">
        <BackButton />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-none">
          <thead>
            <tr className="bg-mytablehead border border-mytableheadborder text-mytextcolor uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">№</th>
              <th className="py-3 px-6 text-left">
                {tt("Batalon", "Название батальона")}
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
              <th className="py-3 px-6 text-center">
                {tt("Umumiy vaqt", "Общее время")}
              </th>
              <th className="py-3 px-6 text-center">
                {tt("Qolgan vaqt", "Оставшееся время")}
              </th>
              <th className="py-3 px-6 text-center">
                {tt("Manzil", "Адресс")}
              </th>
              <th className="py-3 px-6 text-center">
                {tt("Tadbir sanasi", "Дата события")}
              </th>
              <th className="py-3 px-6 text-center w-64">
                {tt("Izoh", "Примечание")}
              </th>
              <th className="py-3 px-6 text-center">
                {tt("Amallar", "Действия")}
              </th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {
              <TableItem
                row={data}
                key={data.id}
                getTasks={getTasks}
                editingId={editingId}
                creatingId={creatingId}
                setCreatingId={setCreatingId}
                setEditingId={setEditingId}
              />
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
