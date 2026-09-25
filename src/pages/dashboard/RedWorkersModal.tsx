import { ShieldCheck } from "lucide-react";

import { formatSum, tt } from "@/utils";
import ExportButtons from "@/Components/ExportButtons";
import ExportMenu, { type ExportMenuItem } from "@/Components/ExportMenu";
import type { ExportColumn } from "@/lib/tableExport";
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
  reportItems,
}: {
  open: boolean;
  onClose: () => void;
  data: RedWorkersResponse | null;
  /** Backend hisobot bandlari (Excel + xuddi o'sha PDF). Berilmasa — ro'yxatning PDF eksporti */
  reportItems?: ExportMenuItem[];
}) {
  const rows = data?.red_workers ?? [];

  const title = tt("Qizil chegaradagi xodimlar", "Сотрудники в красной зоне");

  // Ro'yxat to'liq (sahifalashsiz) yuklangan — shu ma'lumot eksport qilinadi
  const exportColumns = (): ExportColumn<RedWorker>[] => [
    { header: "№", value: (_r, i) => i + 1, width: 6, align: "center" },
    { header: tt("Xodim", "Сотрудник"), value: (r) => r.worker_name, width: 32 },
    { header: tt("Batalon", "Батальон"), value: (r) => r.batalon_name, width: 28 },
    { header: tt("Summa", "Сумма"), value: (r) => formatSum(r.summa) || "0", align: "right", width: 16 },
    { header: tt("O'rtacha", "Среднее"), value: (r) => formatSum(r.average) || "0", align: "right", width: 16 },
    {
      header: tt("Nisbat", "Отношение"),
      value: (r) => `×${Number(r.times_average ?? 0).toFixed(1)}`,
      align: "center",
      width: 10,
    },
  ];

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
      title={title}
      description={tt(
        "Summasi batalon o'rtachasidan sezilarli oshgan xodimlar",
        "Сотрудники, чья сумма заметно превышает среднюю по батальону"
      )}
      className="max-h-[85vh]"
      footer={
        reportItems?.length ? (
          <ExportMenu items={reportItems} />
        ) : (
          <ExportButtons
            kinds={["pdf"]}
            title={title}
            columns={exportColumns()}
            fetchRows={async () => rows}
          />
        )
      }
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
