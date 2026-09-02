import { ShieldCheck } from "lucide-react";

import { formatSum, tt } from "@/utils";
import type {
  RedWorker,
  RedWorkersResponse,
} from "@/pages/region/dashboard/types";
import {
  Badge,
  DataTable,
  EmptyState,
  Modal,
  type TableColumn,
} from "@/ui";

/**
 * "Qizil chegara" — o'rtachadan sezilarli darajada ko'p summa olgan
 * xodimlar. `times_average` o'rtachadan necha barobar oshganini bildiradi.
 */
export default function RedWorkersModal({
  open,
  onClose,
  data,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  data: RedWorkersResponse | null;
  footer?: React.ReactNode;
}) {
  const rows = data?.red_workers ?? [];

  const columns: TableColumn<RedWorker>[] = [
    {
      key: "n",
      header: "№",
      width: "52px",
      align: "center",
      cell: (_r, i) => (
        <span className="tabular-nums text-muted-foreground">{i + 1}</span>
      ),
    },
    {
      key: "worker",
      header: tt("Xodim", "Сотрудник"),
      cell: (r) => <span className="font-medium">{r.worker_name}</span>,
    },
    {
      key: "batalon",
      header: tt("Batalon", "Батальон"),
      hideOnMobile: true,
      cell: (r) => (
        <span className="text-muted-foreground">{r.batalon_name}</span>
      ),
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "150px",
      cell: (r) => (
        <span className="font-semibold tabular-nums">
          {formatSum(r.summa) || "0"}
        </span>
      ),
    },
    {
      key: "average",
      header: tt("O'rtacha", "Среднее"),
      align: "right",
      width: "150px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {formatSum(r.average) || "0"}
        </span>
      ),
    },
    {
      key: "times",
      header: tt("Nisbat", "Отношение"),
      align: "center",
      width: "110px",
      cell: (r) => (
        <Badge tone={r.times_average >= 3 ? "danger" : "warning"}>
          ×{Number(r.times_average ?? 0).toFixed(1)}
        </Badge>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title={tt("Qizil chegaradagi xodimlar", "Сотрудники в красной зоне")}
      description={tt(
        "Summasi batalon o'rtachasidan sezilarli oshgan xodimlar",
        "Сотрудники, чья сумма заметно превышает среднюю по батальону"
      )}
      className="max-h-[85vh]"
      footer={footer}
    >
      <div className="-mx-5 -my-4">
        <DataTable
          columns={columns}
          rows={rows}
          keyOf={(r) => r.worker_id}
          empty={
            <EmptyState
              icon={ShieldCheck}
              title={tt("Chegaradan chiqish yo'q", "Превышений нет")}
              description={tt(
                "Tanlangan davrda barcha xodimlar me'yor doirasida",
                "За выбранный период все сотрудники в пределах нормы"
              )}
            />
          }
        />
      </div>
    </Modal>
  );
}
