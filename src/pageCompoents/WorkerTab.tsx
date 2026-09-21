import { useState } from "react";
import { Pencil, Trash2, Users } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import DeleteModal from "../Components/DeleteModal";
import { textNum, tt } from "../utils";
import { Badge, Button, EmptyState } from "@/ui";

interface IWorker {
  id: string | number;
  fio: string;
  account_number: string;
  xisob_raqam: string;
  batalon_name: string;
  is_muddatli_harbiy?: boolean;
}

/**
 * Xodimlar jadvali — umumiy `Table` komponentiga o'tkazildi.
 *
 * Ilgari bu yerda o'z `<table>` si, o'z sarlavha uslublari va
 * `useFullHeight` bilan hisoblangan balandligi bor edi; natijada har bir
 * jadval boshqacha ko'rinardi.
 */
const WorkerTab = ({
  data,
  handleDelete,
  setActive,
  page,
  itemsPerPage,
  edit,
}: any) => {
  const [delOpen, setDelOpen] = useState(false);

  const rowNumber = (index: number) => (page - 1) * itemsPerPage + index + 1;

  return (
    <>
      {data && data.length ? (
        <Table
          thead={[
            { text: "№", className: "w-[70px]" },
            { text: tt("F.I.Sh.", "Ф.И.О"), className: "min-w-[220px]" },
            { text: tt("Karta raqam", "Номер карты"), className: "text-center" },
            { text: tt("Hisob raqam", "Номер счета"), className: "text-center" },
            { text: tt("Batalon", "Батальон"), className: "text-center" },
            {
              text: tt("Muddatli harbiy", "Срочная служба"),
              className: "text-center",
            },
            {
              text: tt("Amallar", "Действия"),
              className: "w-[110px] text-center",
            },
          ]}
        >
          {data.map((person: IWorker, index: number) => (
            <tr key={person.id}>
              <td className="text-muted-foreground tabular-nums">
                {rowNumber(index)}
              </td>
              <td className="font-medium">{person.fio}</td>
              <td className="text-center tabular-nums">
                {textNum(person.account_number, 4)}
              </td>
              <td className="text-center tabular-nums">
                {textNum(person.xisob_raqam, 4)}
              </td>
              <td className="text-center text-muted-foreground">
                {person.batalon_name}
              </td>
              <td className="text-center">
                {person.is_muddatli_harbiy ? (
                  <Badge tone="primary">{tt("Ha", "Да")}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td>
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("Tahrirlash", "Редактировать")}
                    aria-label={tt("Tahrirlash", "Редактировать")}
                    onClick={() => edit(person.id)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("O'chirish", "Удалить")}
                    aria-label={tt("O'chirish", "Удалить")}
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setDelOpen(true);
                      setActive(person.id);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState
          icon={Users}
          title={tt("Ma'lumot yo'q", "Нет данных")}
          description={tt(
            "Qidiruv shartlariga mos xodim topilmadi",
            "Сотрудников по условиям поиска не найдено"
          )}
        />
      )}

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => setDelOpen(false)}
      />
    </>
  );
};

export default WorkerTab;
