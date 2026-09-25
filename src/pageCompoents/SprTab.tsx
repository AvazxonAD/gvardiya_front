import { useNavigate } from "react-router-dom";
import { BookMarked, Eye, Pencil, Plus } from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import Modal from "../Components/Modal";
import { formatNum, textNum, tt } from "../utils";
import { Button, EmptyState } from "@/ui";

interface SprTabProps {
  data: any[];
  /** Ikkita maydonli bo'lim (Bank, Ijrochi) — ustunlar shundan quriladi */
  pairFields?: { key: string; label: string }[] | null;
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
  pairFields,
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

  const twoCols = Boolean(pairFields || deduction);

  const thead = [
    { text: "№", className: "w-[4.375rem]" },
    ...(pairFields
      ? pairFields.map((f) => ({ text: f.label }))
      : deduction
      ? [
          { text: tt("Ushlanma nomi", "Название удержания") },
          { text: tt("Foiz", "Процент"), className: "w-[8.75rem] text-center" },
        ]
      : [{ text: title }]),
    { text: tt("Amallar", "Действия"), className: "w-[6.875rem] text-center" },
  ];

  return (
    <>
      {data && data.length ? (
        <Table thead={thead}>
          {data.map((person, index) => (
            <tr key={index}>
              <td className="text-muted-foreground tabular-nums">{index + 1}</td>

              {pairFields ? (
                pairFields.map((f, i) => (
                  <td key={f.key} className={i === 0 ? "font-medium" : undefined}>
                    {person?.[f.key]}
                  </td>
                ))
              ) : twoCols ? (
                <>
                  <td className="font-medium">{person?.name}</td>
                  <td className="tabular-nums">{person?.percent}</td>
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
                  {/* Shablonlar kodda saqlanadi — faqat ko'rish */}
                  {!template && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title={tt("Tahrirlash", "Редактировать")}
                      aria-label={tt("Tahrirlash", "Редактировать")}
                      onClick={() => handleRowAction(person)}
                    >
                      <Pencil />
                    </Button>
                  )}
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
        <EmptyState
          icon={BookMarked}
          title={tt("Ma'lumot yo'q", "Нет данных")}
          description={tt(
            "Bu ma'lumot hali kiritilmagan.",
            "Эти данные ещё не заполнены."
          )}
          /* Bu bo'limlarda viloyatga BITTA qator to'g'ri keladi va uni
             tahrirlash oynasi faqat mavjud qatordagi qalamcha orqali
             ochilardi. Natijada qatori yo'q yangi viloyat ma'lumotni
             umuman kirita olmasdi. Endi bo'sh holatda ham shu oyna
             ochiladi — saqlashda server qatorni o'zi yaratadi.
             Shablonlarda kerak emas: u yerda alohida "yaratish"
             sahifasi va o'z tugmasi bor. */
          action={
            template ? undefined : (
              <Button size="sm" onClick={() => setOpen(true)}>
                <Plus />
                {tt("Qo'shish", "Добавить")}
              </Button>
            )
          }
        />
      )}

      <Modal closeModal={() => setOpen(false)} title={titleM} open={open}>
        {children}
      </Modal>
    </>
  );
};

export default SprTab;
