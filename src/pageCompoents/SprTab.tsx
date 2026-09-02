import { useNavigate } from "react-router-dom";
import { BookMarked, Eye, Pencil } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import Modal from "../Components/Modal";
import { formatNum, textNum, tt } from "../utils";
import { Button, EmptyState } from "@/ui";

interface SprTabProps {
  data: any[];
  bank?: boolean;
  title: string;
  path: string;
  children: React.ReactNode;
  setActive: (id: number) => void;
  setOpen: (open: boolean) => void;
  open: boolean;
  titleM: string;
  number?: number;
  format?: boolean;
  deduction?: boolean;
  template?: boolean;
}

/** Spravochnik bo'limlarining umumiy jadvali */
const SprTab = ({
  data,
  bank,
  title,
  path,
  children,
  setActive,
  setOpen,
  open,
  titleM,
  number,
  format,
  deduction,
  template,
}: SprTabProps) => {
  const navigate = useNavigate();

  const handleRowAction = (person: any) => {
    if (template) {
      navigate(`/spravichnik/template/${person.id}`);
      return;
    }
    setActive(person.id);
    setOpen(true);
  };

  const twoCols = Boolean(bank || deduction);

  const thead = [
    { text: "№", className: "w-[70px]" },
    ...(bank
      ? [
          { text: tt("Bank nomi", "Название банка") },
          { text: "MFO", className: "w-[140px] text-center" },
        ]
      : deduction
      ? [
          { text: tt("Ushlanma nomi", "Название удержания") },
          { text: tt("Foiz", "Процент"), className: "w-[140px] text-center" },
        ]
      : [{ text: title }]),
    { text: tt("Amallar", "Действия"), className: "w-[110px] text-center" },
  ];

  return (
    <>
      {data && data.length ? (
        <Table thead={thead}>
          {data.map((person, index) => (
            <tr key={index}>
              <td className="text-muted-foreground tabular-nums">{index + 1}</td>

              {twoCols ? (
                <>
                  <td className="font-medium">{person.bank}</td>
                  <td className="text-center tabular-nums">{person?.mfo}</td>
                </>
              ) : (
                <td className="font-medium">
                  {number
                    ? textNum(person[path], number)
                    : format
                    ? formatNum(person[path])
                    : person[path]}
                </td>
              )}

              <td>
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("Tahrirlash", "Редактировать")}
                    aria-label={tt("Tahrirlash", "Редактировать")}
                    onClick={() => handleRowAction(person)}
                  >
                    <Pencil />
                  </Button>
                  {template && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title={tt("Ko'rish", "Просмотр")}
                      aria-label={tt("Ko'rish", "Просмотр")}
                      onClick={() =>
                        navigate(`/spravichnik/template/view/${person.id}`)
                      }
                    >
                      <Eye />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState icon={BookMarked} title={tt("Ma'lumot yo'q", "Нет данных")} />
      )}

      <Modal closeModal={() => setOpen(false)} title={titleM} open={open}>
        {children}
      </Modal>
    </>
  );
};

export default SprTab;
