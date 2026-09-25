import React, { useState } from "react";
import { tt } from "@/utils";
import TableItem from "./table.item";
import Icon from "@/assets/icons";
import BackButton from "@/Components/reusable/BackButton";
import { useRequest } from "@/hooks/useRequest";
import ExportMenu, { reportItems } from "@/Components/ExportMenu";

const Table: React.FC<{ data: any[]; getTasks: Function }> = ({
  data,
  getTasks,
}) => {
  const request = useRequest();
  const task: any = data;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);

  return (
    <div className="my-5">
      <div className="m-0 p-1 flex items-center gap-2">
        <BackButton />
        {/* Bitta "⋮" menyu: backend Excel hisobot va aynan shu hisobotning PDF nusxasi */}
        <ExportMenu
          className="ml-auto"
          items={reportItems({
            key: "task-workers",
            fetchBlob: async () => {
              const response = await request({
                url: `/batalon/worker-tasks/?task_id=${task?.id}&excel=true`,
                method: "GET",
                responseType: "blob",
              });
              return new Blob([response.data], {
                type:
                  response.data?.type ||
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
            },
            fileName: `${task?.contract_number}.xlsx`,
          })}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-grid min-w-full">
          <thead>
            <tr className="bg-muted/60 border-b border-border text-foreground uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Shartnoma raqami</th>
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
                {tt("Manzil", "Адрес")}
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
