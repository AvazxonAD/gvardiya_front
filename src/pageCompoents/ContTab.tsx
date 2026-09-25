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
  toNumber,
  tt,
  viewAndDownloadPdf,
} from "../utils";
import { Button, EmptyState } from "@/ui";
import { DebtStatusBadge, debtStatusLabel } from "@/lib/debtStatus";
import type { ExportColumn } from "@/lib/tableExport";
import type { SortState } from "@/hooks/useTableSort";
import { permBtn, usePermission } from "@/lib/permissions";

interface ContTabProps {
  data: any[];
  handleDelete?: (id: string) => void;
  setActive?: Dispatch<SetStateAction<any>>;
  hideActions?: boolean;
  isLawyer?: boolean;
  /** Backend saralash (ixtiyoriy) — `useTableSort` dan */
  sort?: SortState;
  onSort?: (key: string) => void;
}

/* ── Eksport ustunlari (ContractHome va LawyerContract uchun) ─────── */

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
export const contExportColumns = (): ExportColumn<any>[] => {
  const yes = tt("Ha", "Да");
  const no = tt("Yo'q", "Нет");
  const edited = tt("O'zgartirilgan", "Изменено");
  return [
    { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
    { header: tt("Shartnoma raqami", "Номер договора"), value: (c) => c.doc_num, align: "center" },
    { header: tt("Sana", "Дата"), value: (c) => formatDate(c.doc_date), align: "center" },
    { header: tt("Buyurtmachi", "Заказчик"), value: (c) => c.organization_name },
    { header: tt("Tadbir manzili", "Место проведения"), value: (c) => c.adress },
    { header: tt("Hisoblangan", "Начислено"), value: (c) => formatSum(c.result_summa), excelValue: (c) => toNumber(c.result_summa), align: "right" },
    { header: tt("Kelib tushgan", "Поступило"), value: (c) => formatSum(c.remaining_summa), excelValue: (c) => toNumber(c.remaining_summa), align: "right" },
    { header: tt("Qarzdorlik", "Задолженность"), value: (c) => formatSum(c.remaining_balance), excelValue: (c) => toNumber(c.remaining_balance), align: "right" },
    {
      header: tt("To'lov muddati", "Срок оплаты"),
      value: (c) => (Number(c.remaining_balance) > 0 ? debtStatusLabel(c.debt_status) : ""),
      align: "center",
    },
    { header: tt("Chiqim", "Расход"), value: (c) => formatSum(c.rasxod_summa), excelValue: (c) => toNumber(c.rasxod_summa), align: "right" },
    {
      header: tt("Xodim", "Сотрудник"),
      value: (c) => (c.worker_task_status === "Bajarilmagan" ? no : yes),
      align: "center",
    },
    {
      header: tt("Boshliq T", "Утв. рук."),
      value: (c) =>
        c.verification_boss === "success" ? yes : c.verification_boss === "update" ? edited : no,
      align: "center",
    },
    {
      header: tt("Yurist T", "Утв. юр."),
      value: (c) =>
        c.verification_lawyer === "success"
          ? yes
          : c.verification_lawyer === "update"
          ? edited
          : c.verification_lawyer === "rejected"
          ? tt("Rad qilingan", "Отклонено")
          : no,
      align: "center",
    },
    { header: tt("Yuristga", "Юристу"), value: (c) => (c.send_lawyer ? yes : no), align: "center" },
  ];
};

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
  sort,
  onSort,
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
        sort={sort}
        onSort={onSort}
        // Mayda shrift faqat tor ekranda (13 ustun sig'sin). Keng ekranda
        // joy yetarli — matn oddiy jadval o'lchamiga qaytadi.
        theadClassName="[&>tr>th]:px-2 [&>tr>th]:py-1.5 [&>tr>th]:text-[0.5625rem] [&>tr>th]:leading-[1.15] min-[1700px]:[&>tr>th]:text-[0.6875rem]"
        tbodyClassName="text-[0.625rem] min-[1360px]:text-[0.6875rem] min-[1700px]:text-[0.8125rem] [&>tr>td]:px-2 [&>tr>td]:py-1.5"
        thead={[
          { sortKey: "doc_num", text: "№", className: "w-[2.75rem]" },
          { sortKey: "doc_date", text: tt("Sana", "Дата"), className: "w-[4.375rem]" },
          { sortKey: "organization_name", text: tt("Buyurtmachi", "Заказчик"), className: "whitespace-normal leading-[1.15]" },
          { sortKey: "adress", text: tt("Tadbir manzili", "Место проведения"), className: "whitespace-normal leading-[1.15]" },
          { sortKey: "result_summa", text: tt("Hisoblangan", "Начислено"), className: "text-right whitespace-normal leading-[1.15]" },
          { sortKey: "remaining_summa", text: tt("Kelib tushgan", "Поступило"), className: "text-right whitespace-normal leading-[1.15]" },
          { sortKey: "remaining_balance", text: tt("Qarzdorlik", "Задолженность"), className: "text-right whitespace-normal leading-[1.15]" },
          { sortKey: "rasxod_summa", text: tt("Chiqim", "Расход"), className: "text-right whitespace-normal leading-[1.15]" },
          { sortKey: "worker_task_status", text: tt("Xodim", "Сотрудник"), className: "text-center whitespace-normal leading-[1.15]" },
          { sortKey: "verification_boss", text: tt("Boshliq T", "Утв. рук."), className: "text-center whitespace-normal leading-[1.15]" },
          { sortKey: "verification_lawyer", text: tt("Yurist T", "Утв. юр."), className: "text-center whitespace-normal leading-[1.15]" },
          { sortKey: "send_lawyer", text: tt("Yuristga", "Юристу"), className: "text-center whitespace-normal leading-[1.15]" },
          ...(isLawyer ? [{ text: "PDF", className: "text-center" }] : []),
          ...(!hideActions
            ? [{ text: tt("Amallar", "Действия"), className: "w-[7rem] text-center" }]
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
                  "pointer-events-none absolute left-3 top-full z-20 w-[16.25rem] -translate-y-1 rounded-md border border-border",
                  // `opacity-0` emas `hidden`: shaffof bo'lsa ham joy egallab,
                  // jadval ostida bo'sh aylanadigan joy qoldirardi
                  "hidden bg-popover p-3 text-[0.75rem] text-popover-foreground shadow-lg",
                  "peer-hover:pointer-events-auto peer-hover:block"
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
              {Number(item.remaining_balance) > 0 && item.debt_status && (
                <DebtStatusBadge
                  status={item.debt_status}
                  dueDate={item.payment_due_date}
                  className="ml-auto mt-0.5 flex px-1 py-0 text-[0.5625rem] min-[1700px]:text-[0.6875rem]"
                />
              )}
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
  const perm = usePermission("contract");

  return (
    <div className="flex items-center justify-center">
      <Button
        variant="ghost"
        size="icon-xs"
        {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"), "h-6 w-6 [&_svg]:size-3")}
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
        {...permBtn(perm.delete, tt("O'chirish", "Удалить"), "h-6 w-6 [&_svg]:size-3 hover:bg-destructive/10 hover:text-destructive")}
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
