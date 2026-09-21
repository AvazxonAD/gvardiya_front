import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Download,
  FileText,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import Table from "@/Components/reusable/table/Table";
import DeleteModal from "../Components/DeleteModal";
import { URL as API_URL } from "@/api";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatInn,
  formatSum,
  textNum,
  tt,
  viewAndDownloadPdf,
} from "../utils";
import { Button, EmptyState } from "@/ui";

interface ContTabProps {
  data: any[];
  handleDelete?: (id: string) => void;
  setActive?: Dispatch<SetStateAction<any>>;
  hideActions?: boolean;
  isLawyer?: boolean;
}

/* ── Tasdiq holatlari ─────────────────────────────────────────────── */

/** Jadvaldagi ✓ / ✕ / ✎ belgilari — endi mavzu ranglari bilan */
function Mark({
  state,
  title,
}: {
  state: "ok" | "no" | "edited" | "rejected";
  title?: string;
}) {
  const Icon =
    state === "ok"
      ? Check
      : state === "edited"
      ? Pencil
      : state === "rejected"
      ? AlertTriangle
      : X;

  return (
    <span
      title={title}
      className={cn(
        "mx-auto flex size-6 items-center justify-center rounded-none",
        state === "ok"
          ? "bg-success/10 text-success"
          : state === "edited"
          ? "bg-warning/15 text-warning"
          : "bg-destructive/10 text-destructive"
      )}
    >
      <Icon className="size-3.5" />
    </span>
  );
}

/* ── Jadval ───────────────────────────────────────────────────────── */

const ContTab: React.FC<ContTabProps> = ({
  data,
  handleDelete,
  setActive,
  hideActions,
  isLawyer,
}) => {
  const navigate = useNavigate();
  const [delOpen, setDelOpen] = useState(false);

  if (!data || data.length === 0) {
    return (
      <>
        <EmptyState
          icon={FileText}
          title={tt("Ma'lumot yo'q", "Нет данных")}
          description={tt(
            "Tanlangan shartlar bo'yicha shartnoma topilmadi",
            "По выбранным условиям договоров не найдено"
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

  const num = "text-right tabular-nums whitespace-nowrap";

  return (
    <>
      <Table
        theadClassName="[&>tr>th]:px-2 [&>tr>th]:py-1.5 [&>tr>th]:text-[9px] [&>tr>th]:leading-[1.15]"
        tbodyClassName="text-[10px] min-[1360px]:text-[11px] [&>tr>td]:px-2 [&>tr>td]:py-1.5"
        thead={[
          { text: "№", className: "w-[44px]" },
          { text: tt("Sana", "Дата"), className: "w-[70px]" },
          { text: tt("Buyurtmachi", "Заказчик"), className: "whitespace-normal leading-[1.15]" },
          { text: tt("Tadbir manzili", "Место проведения"), className: "whitespace-normal leading-[1.15]" },
          { text: tt("Hisoblangan", "Начислено"), className: "text-right whitespace-normal leading-[1.15]" },
          { text: tt("Kelib tushgan", "Поступило"), className: "text-right whitespace-normal leading-[1.15]" },
          { text: tt("Qarzdorlik", "Задолженность"), className: "text-right whitespace-normal leading-[1.15]" },
          { text: tt("Chiqim", "Расход"), className: "text-right whitespace-normal leading-[1.15]" },
          { text: tt("Xodim", "Сотрудник"), className: "text-center whitespace-normal leading-[1.15]" },
          { text: tt("Boshliq T", "Утв. рук."), className: "text-center whitespace-normal leading-[1.15]" },
          { text: tt("Yurist T", "Утв. юр."), className: "text-center whitespace-normal leading-[1.15]" },
          { text: tt("Yuristga", "Юристу"), className: "text-center whitespace-normal leading-[1.15]" },
          ...(isLawyer ? [{ text: "PDF", className: "text-center" }] : []),
          ...(!hideActions
            ? [{ text: tt("Amallar", "Действия"), className: "w-[112px] text-center" }]
            : []),
        ]}
      >
        {data.map((item: any, index: number) => (
          <tr key={index} className="group">
            <td>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    hideActions
                      ? `/lawyer-contract/view/${item.id}`
                      : `/contract/view/${item.id}`
                  )
                }
                className="font-medium text-primary transition-colors hover:underline"
              >
                {item.doc_num}
              </button>
            </td>

            <td className="whitespace-nowrap text-muted-foreground tabular-nums">
              {formatDate(item.doc_date)}
            </td>

            {/* Tashkilot tafsiloti hover'da ko'rinadi */}
            <td className="relative">
              <span className="peer cursor-help">{item.organization_name}</span>
              <div
                className={cn(
                  "pointer-events-none absolute left-3 top-full z-20 w-[260px] -translate-y-1 rounded-md border border-border",
                  "bg-popover p-3 text-[12px] text-popover-foreground opacity-0 shadow-lg transition-opacity",
                  "peer-hover:pointer-events-auto peer-hover:opacity-100"
                )}
              >
                <p>
                  <span className="text-muted-foreground">{tt("Nomi", "Название")}:</span>{" "}
                  {item.organization_name}
                </p>
                <p>
                  <span className="text-muted-foreground">{tt("Manzil", "Адрес")}:</span>{" "}
                  {item.organization_address}
                </p>
                <p>
                  <span className="text-muted-foreground">INN:</span>{" "}
                  {formatInn(item.organization_str)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {tt("Hisob raqam", "Номер счета")}:
                  </span>{" "}
                  {textNum(item.organization_account_number, 4)}
                </p>
              </div>
            </td>

            <td className="text-muted-foreground">{item.adress}</td>
            <td className={num}>{formatSum(item.result_summa)}</td>
            <td className={num}>{formatSum(item.remaining_summa)}</td>
            <td
              className={cn(
                num,
                "font-medium",
                Number(item.remaining_balance) === 0
                  ? "text-success"
                  : Number(item.remaining_balance) > 0
                  ? "text-primary"
                  : "text-destructive"
              )}
            >
              {formatSum(item.remaining_balance)}
            </td>
            <td className={num}>{formatSum(item.rasxod_summa)}</td>

            <td>
              <Mark
                state={item.worker_task_status === "Bajarilmagan" ? "no" : "ok"}
              />
            </td>

            <td>
              <Mark
                state={
                  item.verification_boss === "success"
                    ? "ok"
                    : item.verification_boss === "update"
                    ? "edited"
                    : "no"
                }
                title={
                  item.verification_boss === "update"
                    ? tt(
                        "O'zgartirilgan, qayta tasdiqlash kerak",
                        "Изменено, требуется повторное утверждение"
                      )
                    : undefined
                }
              />
            </td>

            <td>
              <Mark
                state={
                  item.verification_lawyer === "success"
                    ? "ok"
                    : item.verification_lawyer === "update"
                    ? "edited"
                    : item.verification_lawyer === "rejected"
                    ? "rejected"
                    : "no"
                }
                title={
                  item.verification_lawyer === "update"
                    ? tt(
                        "O'zgartirilgan, qayta tasdiqlash kerak",
                        "Изменено, требуется повторное утверждение"
                      )
                    : item.verification_lawyer === "rejected"
                    ? tt("Yurist rad qilgan", "Отклонено юристом")
                    : undefined
                }
              />
            </td>

            <td>
              <Mark state={item.send_lawyer ? "ok" : "no"} />
            </td>

            {isLawyer && (
              <td className="text-center">
                {item.file ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("PDF yuklab olish", "Скачать PDF")}
                    onClick={(e) => {
                      e.stopPropagation();
                      viewAndDownloadPdf(
                        API_URL + item.file,
                        `shartnoma_${item.doc_num || item.id}.pdf`
                      );
                    }}
                  >
                    <Download />
                  </Button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            )}

            {!hideActions && (
              <td className="text-center">
                <RowMenu
                  id={item.id as unknown as number}
                  setDelOpen={setDelOpen}
                  setActive={setActive!}
                />
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

export default ContTab;

/* ── Qator amallari ───────────────────────────────────────────────── */

type Props = {
  id: number;
  setDelOpen: Dispatch<SetStateAction<boolean>>;
  setActive: Dispatch<SetStateAction<number>>;
};

/**
 * Ilgari bu yerda uch nuqtali menyu bor edi: `mt-[110px] right-[80px]` kabi
 * qotirilgan siljishlar bilan joylashardi va oxirgi qatorlarda ko'rinmay
 * qolardi. Jadval gorizontal aylanadigan qutida turgani uchun har qanday
 * ochiluvchi qatlam kesiladi — shuning uchun amallar to'g'ridan-to'g'ri
 * tugmalar sifatida ko'rsatiladi.
 */
export const RowMenu = ({ id, setDelOpen, setActive }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center">
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-6 w-6 [&_svg]:size-3"
        title={tt("Tahrirlash", "Редактировать")}
        aria-label={tt("Tahrirlash", "Редактировать")}
        onClick={() => navigate("/contract/" + id)}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-6 w-6 [&_svg]:size-3"
        title={tt("Xodim biriktirish", "Прикрепить сотрудника")}
        aria-label={tt("Xodim biriktirish", "Прикрепить сотрудника")}
        onClick={() => navigate("/contract/tasks/" + id)}
      >
        <UserPlus />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-6 w-6 [&_svg]:size-3"
        title={tt("Analiz", "Анализ")}
        aria-label={tt("Analiz", "Анализ")}
        onClick={() => navigate("/contract/analiz/" + id)}
      >
        <BarChart3 />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-6 w-6 [&_svg]:size-3 hover:bg-destructive/10 hover:text-destructive"
        title={tt("O'chirish", "Удалить")}
        aria-label={tt("O'chirish", "Удалить")}
        onClick={() => {
          setDelOpen(true);
          setActive(id);
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
};
