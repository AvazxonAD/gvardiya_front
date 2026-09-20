import { useState } from "react";
import { Pencil, Shield, Trash2 } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import DeleteModal from "../Components/DeleteModal";
import { IBatalon } from "@/types/batalon";
import { formatInn, tt } from "../utils";
import { cn } from "@/lib/utils";
import { Badge, Button, EmptyState } from "@/ui";

/** Batalonlar va brigadalar jadvali */
const BatTab = ({ data, setActive, edit, handleDelete }: any) => {
  const [delOpen, setDelOpen] = useState(false);

  return (
    <>
      {data && data.length ? (
        <Table
          thead={[
            { text: "№", className: "w-[44px]" },
            { text: tt("Nomi", "Название"), className: "whitespace-normal leading-[1.15]" },
            { text: tt("Turi", "Тип"), className: "w-[88px] whitespace-normal leading-[1.15]" },
            { text: tt("Manzil", "Адрес"), className: "whitespace-normal leading-[1.15]" },
            { text: "INN", className: "w-[92px]" },
            { text: tt("Bank nomi", "Название банка"), className: "whitespace-normal leading-[1.15]" },
            { text: "MFO", className: "w-[58px]" },
            { text: tt("Hisob raqami", "Номер счета"), className: "w-[124px] whitespace-normal leading-[1.15]" },
            { text: tt("Amallar", "Действия"), className: "w-[66px] text-center" },
          ]}
        >
          {data.map((person: IBatalon, index: number) => (
            <tr
              key={person.id}
              // Brigada qatorlari ohang bilan ajratiladi
              className={cn(person.birgada && "bg-primary/[0.04]")}
            >
              <td className="text-muted-foreground tabular-nums">{index + 1}</td>
              <td className="font-medium">{person.name}</td>
              <td>
                {person.birgada ? (
                  <Badge tone="brand">{tt("Brigada", "Бригада")}</Badge>
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
          icon={Shield}
          title={tt("Ma'lumot yo'q", "Нет данных")}
          description={tt(
            "Hozircha batalon yoki brigada qo'shilmagan",
            "Батальоны или бригады пока не добавлены"
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
