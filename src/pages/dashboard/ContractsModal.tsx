import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { formatDate, formatSum, tt } from "@/utils";
import { DebtStatusBadge } from "@/lib/debtStatus";
import ExportMenu, { reportItems } from "@/Components/ExportMenu";
import useApi, { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { RootState } from "@/Redux/store";
import type {
  ContractItem,
  ContractsMeta,
  ContractType,
} from "@/pages/region/dashboard/types";
import {
  Button,
  DataTable,
  EmptyState,
  Modal,
  type TableColumn,
} from "@/ui";

const LIMIT = 15;

const TITLES: Record<ContractType, [string, string]> = {
  all: ["Jami shartnomalar", "Все договоры"],
  paid: ["To'lab berilgan shartnomalar", "Оплаченные договоры"],
  debt: ["Qarzdorligi bor shartnomalar", "Договоры с задолженностью"],
  not_due: ["Qarz — to'lov muddati kelmagan", "Долг — срок оплаты не наступил"],
  late: ["Qarz — to'lov kechiktirilgan", "Долг — оплата просрочена"],
  overdue: ["Qarz — muddati o'tgan", "Долг — просрочено"],
};

export default function ContractsModal({
  open,
  onClose,
  type,
  from,
  to,
}: {
  open: boolean;
  onClose: () => void;
  type: ContractType;
  /** Davr — berilmasa umumiy (redux) sana oralig'i */
  from?: string;
  to?: string;
}) {
  const api = useApi();
  const def = useSelector((s: RootState) => s.defaultDate);
  const startDate = from ?? def.startDate;
  const endDate = to ?? def.endDate;

  const [rows, setRows] = useState<ContractItem[]>([]);
  const [meta, setMeta] = useState<ContractsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Turi o'zgarsa yoki oyna qayta ochilsa — birinchi sahifadan
  useEffect(() => {
    if (open) setPage(1);
  }, [open, type]);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ContractItem[]>(
        `region/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=${page}&limit=${LIMIT}`
      );
      if (res?.success) {
        setRows(res.data || []);
        setMeta((res as any).meta || null);
      }
    } catch (e) {
      console.error("Contracts fetch error:", e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, type, page]);

  useEffect(() => {
    if (open) fetchContracts();
  }, [open, fetchContracts]);

  // Backend hisobot: joriy tur va davr bo'yicha BARCHA shartnomalar (Excel + xuddi o'sha PDF)
  const fetchExcel = () =>
    authFetch(
      `${baseUri}/region/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=1&limit=99999&excel=true`
    ).then((res) => res.blob());

  const columns: TableColumn<ContractItem>[] = [
    {
      key: "n",
      header: "№",
      width: "52px",
      align: "center",
      cell: (_r, i) => (
        <span className="text-muted-foreground tabular-nums">
          {(page - 1) * LIMIT + i + 1}
        </span>
      ),
    },
    {
      key: "doc",
      header: tt("Hujjat №", "№ документа"),
      width: "110px",
      cell: (r) => <span className="font-medium">{r.doc_num}</span>,
    },
    {
      key: "date",
      header: tt("Sana", "Дата"),
      width: "110px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {r.doc_date?.slice(0, 10)}
        </span>
      ),
    },
    {
      key: "org",
      header: tt("Tashkilot", "Организация"),
      cell: (r) => r.organization_name || "—",
    },
    {
      key: "user",
      header: tt("Foydalanuvchi", "Пользователь"),
      width: "170px",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.user_name}</span>,
    },
    {
      key: "summa",
      header: tt("Summasi", "Сумма"),
      align: "right",
      width: "150px",
      cell: (r) => (
        <span className="tabular-nums">{formatSum(r.result_summa) || "0"}</span>
      ),
    },
    {
      key: "paid",
      header: tt("To'langan", "Оплачено"),
      align: "right",
      width: "140px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-success">
          {formatSum(r.paid_summa) || "0"}
        </span>
      ),
    },
    {
      key: "debt",
      header: tt("Qarz", "Долг"),
      align: "right",
      width: "140px",
      cell: (r) => (
        <span className="font-medium tabular-nums text-destructive">
          {formatSum(r.debt_summa) || "0"}
        </span>
      ),
    },
    {
      key: "debt_status",
      header: tt("To'lov muddati", "Срок оплаты"),
      width: "150px",
      hideOnMobile: true,
      cell: (r) =>
        r.debt_status && r.debt_status !== "paid" ? (
          <div className="flex flex-col gap-0.5">
            <DebtStatusBadge status={r.debt_status} dueDate={r.payment_due_date} />
            {r.event_date && (
              <span className="text-[0.6875rem] tabular-nums text-muted-foreground">
                {tt("Tadbir", "Мероприятие")}: {formatDate(r.event_date)}
              </span>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title={tt(...TITLES[type])}
      description={
        meta ? (
          <>
            {tt("Jami", "Всего")}: {meta.count} · {startDate} — {endDate}
          </>
        ) : (
          `${startDate} — ${endDate}`
        )
      }
      className="max-h-[88vh]"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <ExportMenu
            items={reportItems({
              key: "contracts",
              fetchBlob: fetchExcel,
              fileName: `shartnomalar_${type}.xlsx`,
            })}
          />

          {meta && meta.pageCount > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[0.75rem] tabular-nums text-muted-foreground">
                {meta.currentPage} / {meta.pageCount}
              </span>
              <Button
                variant="secondary"
                size="icon-sm"
                disabled={!meta.backPage}
                onClick={() => setPage((p) => p - 1)}
                aria-label={tt("Oldingi", "Предыдущая")}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                disabled={!meta.nextPage}
                onClick={() => setPage((p) => p + 1)}
                aria-label={tt("Keyingi", "Следующая")}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="-mx-5 -my-4">
        <DataTable
          columns={columns}
          rows={rows}
          keyOf={(r) => r.id}
          loading={loading}
          loadingRows={8}
          empty={
            <EmptyState
              icon={FileText}
              title={tt("Shartnoma topilmadi", "Договоры не найдены")}
              description={tt(
                "Tanlangan davr uchun bu turdagi shartnomalar yo'q",
                "За выбранный период договоров такого типа нет"
              )}
            />
          }
        />
      </div>
    </Modal>
  );
}
