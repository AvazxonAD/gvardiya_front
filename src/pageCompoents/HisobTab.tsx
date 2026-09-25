import { useState } from "react";
import { Landmark, Pencil, Trash2 } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import DeleteModal from "../Components/DeleteModal";
import Modal from "../Components/Modal";
import { permBtn, usePermission } from "@/lib/permissions";
import { textNum, tt } from "../utils";
import { Button, EmptyState } from "@/ui";

/** Hisob raqamlari jadvali */
const HisobTab = ({
  data,
  children,
  setActive,
  setOpen,
  open,
  titleM,
  handleDelete,
  // Saralash ixtiyoriy
  sort,
  onSort,
}: any) => {
  const [delOpen, setDelOpen] = useState(false);
  const perm = usePermission("spravochnik");

  return (
    <>
      {data && data.length ? (
        <Table
          sort={sort}
          onSort={onSort}
          thead={[
            { text: "№", className: "w-[4.375rem]" },
            { sortKey: "account_number", text: tt("Hisob raqami", "Номер счета") },
            { text: tt("Amallar", "Действия"), className: "w-[6.875rem] text-center" },
          ]}
        >
          {data.map((person: any, index: number) => (
            <tr key={person.id}>
              <td className="text-muted-foreground tabular-nums">{index + 1}</td>
              <td className="font-medium tabular-nums">
                {textNum(person.account_number, 4)}
              </td>
              <td>
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"))}
                    aria-label={tt("Tahrirlash", "Редактировать")}
                    onClick={() => {
                      setActive(person.id);
                      setOpen(true);
                    }}
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
          icon={Landmark}
          title={tt("Ma'lumot yo'q", "Нет данных")}
        />
      )}

      <Modal closeModal={() => setOpen(false)} title={titleM} open={open}>
        {children}
      </Modal>

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => setDelOpen(false)}
      />
    </>
  );
};

export default HisobTab;
