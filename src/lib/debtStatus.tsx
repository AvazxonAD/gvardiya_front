import { Badge } from "@/ui";
import { cn } from "@/lib/utils";
import { formatSum, tt } from "@/utils";

/**
 * Qarzdorlikning to'lov muddati bo'yicha holati (backend: helper/debt.status.js).
 *
 * To'lov tadbir boshlanishidan 3 kun oldin bo'lishi kerak:
 *   not_due — muddat hali kelmagan
 *   late    — muddat o'tdi, tadbir hali boshlanmagan (kechiktirilgan)
 *   overdue — tadbir boshlangan, pul hali tushmagan (muddati o'tgan)
 */
export type DebtStatus = "paid" | "not_due" | "late" | "overdue";

export const DEBT_STATUSES = ["not_due", "late", "overdue"] as const;
export type DebtOnlyStatus = (typeof DEBT_STATUSES)[number];

export type DebtBreakdown = Record<
  DebtOnlyStatus,
  { count: number; summa: number; debt?: number }
>;

export const PAYMENT_DUE_DAYS = 3;

export const debtStatusLabel = (s?: string | null) =>
  s === "paid"
    ? tt("To'langan", "Оплачено")
    : s === "not_due"
    ? tt("Muddati kelmagan", "Срок не наступил")
    : s === "late"
    ? tt("Kechiktirilgan", "Просрочен платёж")
    : s === "overdue"
    ? tt("Muddati o'tgan", "Просрочено")
    : "";

/** Qisqa izoh — tooltip va sarlavhalar uchun */
export const debtStatusHint = (s?: string | null) =>
  s === "not_due"
    ? tt(
        `To'lov muddati (tadbirdan ${PAYMENT_DUE_DAYS} kun oldin) hali kelmagan`,
        `Срок оплаты (за ${PAYMENT_DUE_DAYS} дня до мероприятия) ещё не наступил`
      )
    : s === "late"
    ? tt(
        "To'lov muddati o'tdi, tadbir hali boshlanmagan",
        "Срок оплаты прошёл, мероприятие ещё не началось"
      )
    : s === "overdue"
    ? tt(
        "Tadbir boshlangan, to'lov hali tushmagan",
        "Мероприятие началось, оплата не поступила"
      )
    : "";

export const debtStatusTone = (s?: string | null) =>
  s === "overdue"
    ? ("danger" as const)
    : s === "late"
    ? ("warning" as const)
    : s === "not_due"
    ? ("primary" as const)
    : ("success" as const);

/** Matn rangi (summalar uchun) */
export const debtStatusText = (s?: string | null) =>
  s === "overdue"
    ? "text-destructive"
    : s === "late"
    ? "text-warning"
    : s === "not_due"
    ? "text-primary"
    : "text-success";

export function DebtStatusBadge({
  status,
  dueDate,
  className,
}: {
  status?: string | null;
  /** To'lov muddati (YYYY-MM-DD) — tooltip ichida ko'rsatiladi */
  dueDate?: string | null;
  className?: string;
}) {
  if (!status) return null;
  const hint = debtStatusHint(status);
  const title = dueDate
    ? `${hint}${hint ? ". " : ""}${tt("To'lov muddati", "Срок оплаты")}: ${dueDate
        .split("-")
        .reverse()
        .join(".")}`
    : hint;
  return (
    <Badge tone={debtStatusTone(status)} dot title={title} className={className}>
      {debtStatusLabel(status)}
    </Badge>
  );
}

const STRIP_ACCENT: Record<DebtOnlyStatus, string> = {
  not_due: "before:bg-primary",
  late: "before:bg-warning",
  overdue: "before:bg-destructive",
};

/**
 * Qarzdorlikning muddat bo'yicha taqsimoti: 3 ta bosiladigan katakcha.
 * `onSelect` berilsa — bosilganda shu holat bo'yicha filtr/ro'yxat ochiladi.
 */
export function DebtBreakdownStrip({
  data,
  active,
  onSelect,
  amount = "debt",
  className,
}: {
  data?: Partial<DebtBreakdown> | null;
  active?: string;
  onSelect?: (s: DebtOnlyStatus) => void;
  /** Qaysi summani ko'rsatish: qarz (debt) yoki shartnoma summasi (summa) */
  amount?: "debt" | "summa";
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-3", className)}>
      {DEBT_STATUSES.map((s) => {
        const item = data?.[s];
        const value = amount === "debt" ? item?.debt ?? item?.summa : item?.summa;
        const Tag = onSelect ? "button" : "div";
        return (
          <Tag
            key={s}
            type={onSelect ? "button" : undefined}
            title={debtStatusHint(s)}
            onClick={onSelect ? () => onSelect(s) : undefined}
            className={cn(
              "relative min-w-0 overflow-hidden rounded-md border border-border bg-card py-2 pl-4 pr-3 text-left",
              "before:absolute before:inset-y-0 before:left-0 before:w-1",
              STRIP_ACCENT[s],
              onSelect && "transition-colors hover:bg-muted/60",
              active === s && "border-foreground/30 bg-muted/60"
            )}
          >
            <p className="flex items-center justify-between gap-2 truncate text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
              <span className="truncate">{debtStatusLabel(s)}</span>
              <span className="tabular-nums normal-case">
                {item?.count ?? 0} {tt("ta", "шт")}
              </span>
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-[0.875rem] font-semibold tabular-nums",
                debtStatusText(s)
              )}
            >
              {formatSum(value ?? 0) || "0"}
            </p>
          </Tag>
        );
      })}
    </div>
  );
}

/** Select variantlari: "Muddat: ..." */
export const debtStatusOptions = () =>
  DEBT_STATUSES.map((s) => ({
    value: s,
    label: `${tt("Muddat", "Срок")}: ${debtStatusLabel(s).toLowerCase()}`,
  }));
