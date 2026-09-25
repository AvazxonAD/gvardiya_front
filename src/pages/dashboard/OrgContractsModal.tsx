import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { formatDate, formatSum, tt } from "@/utils";
import { DebtStatusBadge } from "@/lib/debtStatus";
import ExportMenu, { reportItems } from "@/Components/ExportMenu";
import useApi, { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import type {
  ContractsMeta,
  OrgDebtContractItem,
  OrganizationDebtRow,
} from "@/pages/region/dashboard/types";
import {
  Button,
  DataTable,
  EmptyState,
  Modal,
  type TableColumn,
} from "@/ui";

const LIMIT = 15;

/** Bitta tashkilotning qarzdorlik bo'yicha shartnomalari */
export default function OrgContractsModal({
  open,
  onClose,
  to,
  organization,
  endpoint = "region/dashboard/organization-debt-contracts",
}: {
  open: boolean;
  onClose: () => void;
  to: string;
  organization: OrganizationDebtRow | null;
  /** Super-admin: admin/dashboard/organization-debt-contracts */
  endpoint?: string;
}) {
  const api = useApi();
  const [rows, setRows] = useState<OrgDebtContractItem[]>([]);
  const [meta, setMeta] = useState<ContractsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const orgId = organization?.organization_id;

  const buildQs = useCallback(
    (extra: Record<string, string> = {}) => {
      const qs = new URLSearchParams({ to, ...extra });
      if (orgId) qs.set("organization_id", String(orgId));
      return qs;
    },
    [to, orgId]
  );

  useEffect(() => {
    if (open) setPage(1);
  }, [open, orgId]);

  const fetchContracts = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const qs = buildQs({ page: String(page), limit: String(LIMIT) });
      const res = await api.get<OrgDebtContractItem[]>(
        `${endpoint}?${qs.toString()}`
      );
      if (res?.success) {
        setRows(res.data || []);
        setMeta((res as any).meta || null);
      }
    } catch (e) {
      console.error("Org contracts fetch error:", e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildQs, page, orgId]);

  useEffect(() => {
    if (open) fetchContracts();
  }, [open, fetchContracts]);

  // Backend hisobot: tashkilotning BARCHA qarzdor shartnomalari (Excel + xuddi o'sha PDF)
  const fetchExcel = () =>
    authFetch(
      `${baseUri}/${endpoint}?${buildQs({ excel: "true" }).toString()}`
    ).then((r) => r.blob());

  const columns: TableColumn<OrgDebtContractItem>[] = [
    {
      key: "n",
      header: "№",
      width: "52px",
      align: "center",
      cell: (_r, i) => (
        <span className="tabular-nums text-muted-foreground">
          {(page - 1) * LIMIT + i + 1}
        </span>
      ),
    },
    {
      key: "doc",
      header: tt("Hujjat №", "№ документа"),
      width: "120px",
      cell: (r) => <span className="font-medium">{r.doc_num}</span>,
    },
    {
      key: "date",
      header: tt("Sana", "Дата"),
      width: "7rem",
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {r.doc_date?.slice(0, 10)}
        </span>
      ),
    },
    {
      key: "user",
      header: tt("Foydalanuvchi", "Пользователь"),
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
      width: "150px",
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
      width: "150px",
      cell: (r) => (
        <span className="font-semibold tabular-nums text-destructive">
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
      title={organization?.organization_name || tt("Tashkilot", "Организация")}
      description={
        <>
          {tt("Qarzdorlik", "Задолженность")}:{" "}
          <span className="font-medium text-destructive">
            {formatSum(organization?.debt_summa ?? 0)}
          </span>{" "}
          {!!organization?.overdue_summa && (
            <>
              {" "}
              · {tt("muddati o'tgan", "просрочено")}:{" "}
              <span className="font-medium text-destructive">
                {formatSum(organization.overdue_summa)}
              </span>
            </>
          )}
          · {tt("shartnomalar", "договоров")}: {meta?.count ?? organization?.contract_count ?? 0}
        </>
      }
      className="max-h-[85vh]"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {orgId ? (
            <ExportMenu
              items={reportItems({
                key: "org-debt-contracts",
                fetchBlob: fetchExcel,
                fileName: `qarzdorlik_${orgId}.xlsx`,
              })}
            />
          ) : (
            <span />
          )}

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
            />
          }
        />
      </div>
    </Modal>
  );
}
