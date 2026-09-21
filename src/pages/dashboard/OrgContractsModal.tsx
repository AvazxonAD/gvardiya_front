import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";

import { formatSum, tt } from "@/utils";
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
}: {
  open: boolean;
  onClose: () => void;
  to: string;
  organization: OrganizationDebtRow | null;
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
        `region/dashboard/organization-debt-contracts?${qs.toString()}`
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

  const downloadExcel = () => {
    if (!orgId) return;
    const url = `${baseUri}/region/dashboard/organization-debt-contracts?${buildQs(
      { excel: "true" }
    ).toString()}`;

    authFetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `qarzdorlik_${orgId}.xlsx`;
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Excel yuklashda xatolik:", err));
  };

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
      width: "110px",
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
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title={organization?.organization_name || tt("Tashkilot", "Организация")}
      description={
        <>
          {tt("Qarzdorlik", "Задолженность")}:{" "}
          <span className="font-medium text-destructive">
            {formatSum(organization?.debt_summa ?? 0)}
          </span>{" "}
          · {tt("shartnomalar", "договоров")}: {meta?.count ?? organization?.contract_count ?? 0}
        </>
      }
      className="max-h-[85vh]"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={downloadExcel}>
            <Download />
            Excel
          </Button>

          {meta && meta.pageCount > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] tabular-nums text-muted-foreground">
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
