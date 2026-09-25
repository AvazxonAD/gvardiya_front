import { useState } from "react";
import { Pencil, Shield, Trash2 } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import DeleteModal from "../Components/DeleteModal";
import { IBatalon } from "@/types/batalon";
import { permBtn, usePermission } from "@/lib/permissions";
import { formatInn, tt } from "../utils";
import { cn } from "@/lib/utils";
import { Badge, Button, EmptyState } from "@/ui";

/** Batalonlar va brigadalar jadvali */
// `sort`/`onSort` ixtiyoriy — berilmasa sarlavhalar bosilmaydi
const BatTab = ({ data, setActive, edit, handleDelete, sort, onSort }: any) => {
  const [delOpen, setDelOpen] = useState(false);
  const perm = usePermission("batalon");

  return (
    <>
      {data && data.length ? (
        <Table
          sort={sort}
          onSort={onSort}
          thead={[
            { text: "№", className: "w-[2.75rem]" },
            { sortKey: "name", text: tt("Nomi", "Название"), className: "whitespace-normal leading-[1.15]" },
            { sortKey: "birgada", text: tt("Turi", "Тип"), className: "w-[9.5rem] whitespace-normal leading-[1.15]" },
            { sortKey: "address", text: tt("Manzil", "Адрес"), className: "whitespace-normal leading-[1.15]" },
            { sortKey: "str", text: "INN", className: "w-[5.75rem]" },
            { sortKey: "bank_name", text: tt("Bank nomi", "Название банка"), className: "whitespace-normal leading-[1.15]" },
            { sortKey: "mfo", text: "MFO", className: "w-[3.625rem]" },
            { sortKey: "account_number", text: tt("Hisob raqami", "Номер счета"), className: "w-[7.75rem] whitespace-normal leading-[1.15]" },
            { text: tt("Amallar", "Действия"), className: "w-[4.125rem] text-center" },
          ]}
        >
          {data.map((person: IBatalon, index: number) => (
            <tr
              key={person.id}
              // Hamkor tashkilot (bazada `birgada`) qatorlari ohang bilan ajratiladi
              className={cn(person.birgada && "bg-primary/[0.04]")}
            >
              <td className="text-muted-foreground tabular-nums">{index + 1}</td>
              <td className="font-medium">{person.name}</td>
              <td>
                {person.birgada ? (
                  <Badge tone="brand" className="whitespace-nowrap">{tt("Hamkor tashkilot", "Партнёрская организация")}</Badge>
                ) : (
                  <Badge tone="neutral">{tt("Batalon", "Батальон")}</Badge>
                )}
              </td>
              <td className="text-muted-foreground">{person.address}</td>
              <td className="tabular-nums">{formatInn(person.str)}</td>
              <td className="text-muted-foreground">{person.bank_name}</td>
              <td className="tabular-nums">{person.mfo}</td>
              <td className="tabular-nums">{person.account_number}</td>
              <td>
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"))}
                    aria-label={tt("Tahrirlash", "Редактировать")}
                    onClick={() => edit(person.id)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    {...permBtn(perm.delete, tt("O'chirish", "Удалить"), "hover:bg-destructive/10 hover:text-destructive")}
                    aria-label={tt("O'chirish", "Удалить")}
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
          icon={Shield}
          title={tt("Ma'lumot yo'q", "Нет данных")}
          description={tt(
            "Hozircha batalon yoki hamkor tashkilot qo'shilmagan",
            "Батальоны или партнёрские организации пока не добавлены"
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

export default BatTab;
