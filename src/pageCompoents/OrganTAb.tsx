/** @format */

import { useState } from "react";
import { Building2, Pencil, Trash2 } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import DeleteModal from "../Components/DeleteModal";
import { IOrganization } from "@/types/organization";
import { formatInn, textNum, tt } from "../utils";
import { Button, EmptyState } from "@/ui";

/** Tashkilotlar jadvali */
const OrganTAb = ({
  data,
  handleDelete,
  setActive,
  page,
  itemsPerPage,
  openEdit,
  variant,
}: any) => {
  const [delOpen, setDelOpen] = useState(false);

  const rowNumber = (index: number) => (page - 1) * itemsPerPage + index + 1;

  if (!data || data.length === 0) {
    return (
      <>
        <EmptyState
          icon={Building2}
          title={tt("Ma'lumot yo'q", "Нет данных")}
          description={tt(
            "Qidiruv shartlariga mos tashkilot topilmadi",
            "Организаций по условиям поиска не найдено"
          )}
        />
        <DeleteModal
          open={delOpen}
          deletee={handleDelete}
          closeModal={() => setDelOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Table
        // Jadvalda 9-10 ta ustun bor. `w-full` bilan ular tor oynada
        // qisilib, har bir katak bir necha qatorga o'ralib ketardi
        // (o'qib bo'lmasdi). Eng kam kenglik berilgach, tor ekranda
        // jadval gorizontal aylanadi, kengida esa bo'sh joyni egallaydi.
        // Kenglik ichki `<table>` ga beriladi — tashqi quti aylanish
        // maydoni bo'lib qolishi kerak.
        tableClassName="[&_table]:min-w-[1260px]"
        thead={[
          { text: "№", className: "w-[44px]" },
          { text: tt("Nomi", "Название"), className: "whitespace-normal leading-[1.15]" },
          { text: tt("Manzil", "Адрес"), className: "whitespace-normal leading-[1.15]" },
          { text: "INN", className: "w-[92px]" },
          { text: tt("Bank nomi", "Название банка"), className: "whitespace-normal leading-[1.15]" },
          { text: "MFO", className: "w-[58px]" },
          { text: tt("Rahbar", "Руководитель"), className: "whitespace-normal leading-[1.15]" },
          { text: tt("Hisob raqami", "Номер счета"), className: "w-[124px] whitespace-normal leading-[1.15]" },
          {
            text: tt("Hisob raqami (g'azna)", "Номер счета (казна)"),
            className: "w-[124px] whitespace-normal leading-[1.15]",
          },
          ...(!variant
            ? [{ text: tt("Amallar", "Действия"), className: "w-[66px] text-center" }]
            : []),
        ]}
      >
        {data.map((person: IOrganization, index: number) => (
          <tr
            key={person.id}
            onClick={variant ? () => setActive(person.id) : undefined}
            className={variant ? "cursor-pointer" : undefined}
          >
            <td className="text-muted-foreground tabular-nums">
              {rowNumber(index)}
            </td>
            <td className="font-medium">{person.name}</td>
            <td className="text-muted-foreground">
              {person.address}
            </td>
            <td className="tabular-nums">{formatInn(person.str)}</td>
            <td className="text-muted-foreground">{person.bank_name}</td>
            <td className="tabular-nums">{person.mfo}</td>
            <td className="text-muted-foreground">{person.boss}</td>
            <td className="tabular-nums">
              {person.account_numbers?.map((n) => (
                <div key={n.account_number}>{textNum(n.account_number, 4)}</div>
              ))}
            </td>
            <td className="tabular-nums">
              {person.gazna_numbers?.map((n) => (
                <div key={n.gazna_number}>{textNum(n.gazna_number, 4)}</div>
              ))}
            </td>

            {!variant && (
              <td>
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("Tahrirlash", "Редактировать")}
                    aria-label={tt("Tahrirlash", "Редактировать")}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(person.id);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("O'chirish", "Удалить")}
                    aria-label={tt("O'chirish", "Удалить")}
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDelOpen(true);
                      setActive(person.id);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </Table>

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => setDelOpen(false)}
      />
    </>
  );
};

export default OrganTAb;
