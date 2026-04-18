import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import useApi from "@/services/api";
import { AccountNumberOption, OrganizationDebtRow } from "../types";
import OrganizationsListModal from "./OrganizationsListModal";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = [
  "rgba(239, 68, 68, 0.85)",
  "rgba(245, 158, 11, 0.85)",
  "rgba(59, 130, 246, 0.85)",
  "rgba(34, 197, 94, 0.85)",
  "rgba(168, 85, 247, 0.85)",
  "rgba(14, 165, 233, 0.85)",
  "rgba(20, 184, 166, 0.85)",
  "rgba(236, 72, 153, 0.85)",
  "rgba(251, 146, 60, 0.85)",
  "rgba(99, 102, 241, 0.85)",
];

const formatAmount = (num: number): string => num.toLocaleString("ru-RU");

export default function OrganizationDebtChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const theme = useSelector((state: any) => state.theme);
  const { endDate } = useSelector((state: RootState) => state.defaultDate);
  const api = useApi();

  const [rows, setRows] = useState<OrganizationDebtRow[]>([]);
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [accounts, setAccounts] = useState<AccountNumberOption[]>([]);
  const [accountId, setAccountId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get<AccountNumberOption[]>("account");
      if (res?.success) setAccounts(res.data || []);
    })();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ to: endDate, page: "1", limit: "100" });
      if (accountId) qs.set("account_number_id", String(accountId));
      const res = await api.get<OrganizationDebtRow[]>(`region/dashboard/organization-debt?${qs.toString()}`);
      if (res?.success) {
        setRows(res.data || []);
        setTotalDebt((res as any).meta?.total_debt || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [endDate, accountId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const d = { total_debt: totalDebt, rows };

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const isLight = theme === "light";
    const textColor = isLight ? "#334155" : "#cbd5e1";
    const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

    const top = [...d.rows].slice(0, 10);
    const labels = top.map((r) => r.organization_name);
    const debts = top.map((r) => r.debt_summa);
    const bgColors = top.map((_, i) => COLORS[i % COLORS.length]);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Qarz summasi",
          data: debts,
          backgroundColor: bgColors,
          borderRadius: 6,
          barPercentage: 0.7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 10 },
              callback: (v) => formatAmount(Number(v)),
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 10 },
              callback: function (val) {
                const label = this.getLabelForValue(val as number);
                return label.length > 22 ? label.slice(0, 22) + "…" : label;
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => top[items[0].dataIndex]?.organization_name || "",
              label: (ctx) => {
                const row = top[ctx.dataIndex];
                const percent = d.total_debt > 0 ? Math.round((row.debt_summa / d.total_debt) * 100) : 0;
                return [
                  `Qarz: ${formatAmount(row.debt_summa)} (${percent}%)`,
                  `Jami: ${formatAmount(row.total_summa)}`,
                  `To'langan: ${formatAmount(row.paid_summa)}`,
                  `Shartnomalar: ${row.contract_count}`,
                ];
              },
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [theme, rows, totalDebt]);

  return (
    <>
      <div className="dash-glass p-[12px] flex flex-col min-h-[320px]">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="text-[14px] font-semibold text-[var(--dash-text)]">
            Tashkilotlar qarzdorligi
          </h2>
          <span className="text-[12px] font-bold text-rose-500">
            Jami qarz: {formatAmount(d.total_debt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <p className="text-[var(--dash-text-secondary)] text-[11px]">
            {endDate} sanasigacha tashkilotlar qarzdorligi
          </p>
          <div className="flex items-center gap-2">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : "")}
              className="dash-control"
            >
              <option value="">Barcha hisob raqamlar</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_number}</option>
              ))}
            </select>
            <button
              onClick={() => setModalOpen(true)}
              className="dash-btn dash-btn-primary"
            >
              Batafsil
            </button>
          </div>
        </div>

        <div className="relative flex-1 w-full min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : d.rows.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[var(--dash-text-muted)]">
              Qarzdorlik topilmadi
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>
      </div>

      <OrganizationsListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        to={endDate}
        accountId={accountId || null}
      />
    </>
  );
}
