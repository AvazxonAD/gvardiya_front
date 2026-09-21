import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  type LucideIcon,
} from "lucide-react";

import { IContractAnaliz } from "@/types/contract";
import { formatDate, formatSum, tt } from "@/utils";
import { DataTable, EmptyState, type TableColumn } from "@/ui";

type Props = {
  data: IContractAnaliz;
};

const sum = (v?: number | string) => formatSum(Number(v ?? 0)) || "0";

/** Chap ustunda yorliq, o'ngda qiymat — o'qish uchun mo'ljallangan qator */
function InfoRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  /** Yakuniy summalar uchun kuchaytirilgan ko'rinish */
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
      <span className="shrink-0 text-[13px] text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? "text-right text-[14px] font-semibold tabular-nums text-foreground"
            : "text-right text-[13px] font-medium tabular-nums text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

/** Sarlavha + jadval + o'ng tomonda yakuniy summa */
function Section<T>({
  title,
  icon: Icon,
  columns,
  rows,
  keyOf,
  total,
  totalLabel,
  emptyTitle,
}: {
  title: string;
  icon: LucideIcon;
  columns: TableColumn<T>[];
  rows: T[];
  keyOf: (row: T, index: number) => string | number;
  total: React.ReactNode;
  totalLabel: string;
  emptyTitle: string;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <h3 className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-foreground">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {title}
      </h3>

      <div className="overflow-hidden rounded-lg border border-border">
        <DataTable
          columns={columns}
          rows={rows}
          keyOf={keyOf}
          stickyHeader={false}
          empty={<EmptyState title={emptyTitle} className="py-8" />}
        />

        <div className="flex items-baseline justify-end gap-3 border-t border-border bg-muted/30 px-3 py-2.5">
          <span className="text-[12px] text-muted-foreground">{totalLabel}</span>
          <span className="text-[14px] font-semibold tabular-nums text-foreground">
            {total}
          </span>
        </div>
      </div>
    </section>
  );
}

const AnalizView = React.forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  // Javob to'liq bo'lmasligi mumkin — bo'sh obyekt bilan himoyalanamiz
  const contract: any = (data as any)?.contract ?? {};
  const prixods = Array.isArray(data?.prixods) ? data.prixods : [];
  const rasxods = Array.isArray(data?.rasxods) ? data.rasxods : [];
  const rasxodFios = Array.isArray(data?.rasxod_fios) ? data.rasxod_fios : [];

  const numCol = {
    key: "n",
    header: "№",
    align: "center" as const,
    width: "72px",
  };

  const prixodColumns: TableColumn<(typeof prixods)[number]>[] = [
    { ...numCol, cell: (r) => <span className="tabular-nums">{r.prixod_doc_num}</span> },
    {
      key: "date",
      header: tt("Sanasi", "Дата"),
      width: "110px",
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(r.prixod_date)}
        </span>
      ),
    },
    {
      key: "org",
      header: tt("Tashkilot", "Организация"),
      cell: (r) => <span className="font-medium">{r.organization_name || "—"}</span>,
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "140px",
      cell: (r) => (
        <span className="tabular-nums font-medium">{sum(r.prixod_summa)}</span>
      ),
    },
  ];

  const rasxodColumns: TableColumn<(typeof rasxods)[number]>[] = [
    { ...numCol, cell: (r) => <span className="tabular-nums">{r.doc_num}</span> },
    {
      key: "date",
      header: tt("Sanasi", "Дата"),
      width: "110px",
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(r.rasxod_date)}
        </span>
      ),
    },
    {
      key: "brigade",
      header: tt("Birgada №", "Бригада №"),
      cell: (r) => (
        <span className="font-medium tabular-nums">
          {r.batalon_account_number || "—"}
        </span>
      ),
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "140px",
      cell: (r) => (
        <span className="tabular-nums font-medium">{sum(r.result_summa)}</span>
      ),
    },
  ];

  const fioColumns: TableColumn<(typeof rasxodFios)[number]>[] = [
    { ...numCol, cell: (r) => <span className="tabular-nums">{r.doc_num}</span> },
    {
      key: "date",
      header: tt("Sanasi", "Дата"),
      width: "110px",
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(r.rasxod_date)}
        </span>
      ),
    },
    {
      key: "batalon",
      header: tt("Batalon", "Батальон"),
      align: "center",
      width: "130px",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums">{r.batalon || "—"}</span>,
    },
    {
      key: "fio",
      header: tt("F.I.Sh.", "ФИО"),
      cell: (r) => <span className="font-medium">{r.fio || "—"}</span>,
    },
    {
      key: "time",
      header: tt("Tadbir vaqti", "Время мероприятия"),
      align: "center",
      width: "130px",
      hideOnMobile: true,
      cell: (r) => <span className="tabular-nums">{r.task_time ?? 0}</span>,
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "140px",
      cell: (r) => <span className="tabular-nums font-medium">{sum(r.summa)}</span>,
    },
  ];

  return (
    <div ref={ref} className="flex flex-col gap-6 p-4 sm:p-5">
      {/* ═══ Shartnoma ko'rsatkichlari ═══════════════════════════════ */}
      <div className="grid gap-x-10 md:grid-cols-2">
        <div>
          <InfoRow
            label={tt("Shartnoma raqam", "Номер договора")}
            value={contract.doc_num || "—"}
          />
          <InfoRow
            label={tt("Shartnoma sanasi", "Дата договора")}
            value={contract.doc_date ? formatDate(contract.doc_date) : "—"}
          />
          <InfoRow
            label={tt("Tadbir manzili", "Адрес мероприятия")}
            value={contract.adress || "—"}
          />
          <InfoRow
            label={tt("Xodimlar soni", "Количество сотрудников")}
            value={`${contract.all_worker_number ?? 0} ${tt("ta", "шт.")}`}
          />
          <InfoRow
            label={tt("Umumiy tadbir vaqti", "Общее время мероприятия")}
            value={`${contract.all_task_time ?? 0} ${tt("soat", "часов")}`}
          />
          <InfoRow
            label={tt("Umumiy xizmat vaqti", "Общее время обслуживания")}
            value={`${
              (contract.all_task_time ?? 0) * (contract.all_worker_number ?? 0)
            } ${tt("soat", "часов")}`}
          />
        </div>

        <div>
          <InfoRow
            label={tt("Umumiy", "Общая")}
            value={sum(contract.result_summa)}
            strong
          />
          <InfoRow
            label={tt("Chegirma", "Скидка")}
            value={sum(contract.discount_money)}
          />
          <InfoRow label={tt("Debet", "Дебет")} value={sum(contract.debit)} />
          <InfoRow label={tt("Kredit", "Кредит")} value={sum(contract.kridit)} />
          <InfoRow
            label={tt("Chiqim", "Расход")}
            value={sum(contract.rasxod_summa)}
          />
          <InfoRow
            label={tt("Qoldiq", "Сальдо")}
            value={sum(contract.remaining_summa)}
            strong
          />
        </div>
      </div>

      {/* ═══ Kirim va Chiqim — yonma-yon ═════════════════════════════ */}
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <Section
          title={tt("Kirim", "Приход")}
          icon={ArrowDownLeft}
          columns={prixodColumns}
          rows={prixods}
          keyOf={(_r, i) => i}
          total={sum(contract.debit)}
          totalLabel={tt("Jami", "Итого")}
          emptyTitle={tt("Kirim yo'q", "Приходов нет")}
        />

        <Section
          title={tt("Chiqim", "Расход")}
          icon={ArrowUpRight}
          columns={rasxodColumns}
          rows={rasxods}
          keyOf={(_r, i) => i}
          total={sum(contract.rasxod)}
          totalLabel={tt("Jami", "Итого")}
          emptyTitle={tt("Chiqim yo'q", "Расходов нет")}
        />
      </div>

      {/* ═══ Chiqim FIO ══════════════════════════════════════════════ */}
      <Section
        title={tt("Chiqim F.I.Sh.", "Расход ФИО")}
        icon={Users}
        columns={fioColumns}
        rows={rasxodFios}
        keyOf={(_r, i) => i}
        total={sum(contract.rasxod_fio)}
        totalLabel={tt("Jami", "Итого")}
        emptyTitle={tt("Xodimlar bo'yicha chiqim yo'q", "Расходов по сотрудникам нет")}
      />
    </div>
  );
});

AnalizView.displayName = "AnalizView";
export default AnalizView;
