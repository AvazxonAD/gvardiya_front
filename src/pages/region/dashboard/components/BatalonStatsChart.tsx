import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";
import { BatalonStatsResponse, BatalonStatRow } from "../types";

Chart.register(PieController, ArcElement, Tooltip, Legend);

interface Props {
  data: BatalonStatsResponse | null;
}

const formatNum = (num: number): string => {
  return num.toLocaleString("ru-RU");
};

const COLORS = [
  "rgba(99, 102, 241, 0.85)",
  "rgba(14, 165, 233, 0.85)",
  "rgba(34, 197, 94, 0.85)",
  "rgba(245, 158, 11, 0.85)",
  "rgba(239, 68, 68, 0.85)",
  "rgba(168, 85, 247, 0.85)",
  "rgba(20, 184, 166, 0.85)",
  "rgba(236, 72, 153, 0.85)",
  "rgba(251, 146, 60, 0.85)",
  "rgba(56, 189, 248, 0.85)",
];

export default function BatalonStatsChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const sortedRef = useRef<BatalonStatRow[]>([]);
  const theme = useSelector((state: any) => state.theme);
  const [selectedRow, setSelectedRow] = useState<BatalonStatRow | null>(null);

  const d = data || { grand_summa: 0, grand_time: 0, grand_task_count: 0, count: 0, rows: [] };
  const sorted = [...d.rows].sort((a, b) => b.total_summa - a.total_summa);
  sortedRef.current = sorted;

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(e, "nearest", { intersect: true }, false);
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedRow(sortedRef.current[index]);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLight = theme === "light";
    const legendColor = isLight ? "#334155" : "#cbd5e1";
    const borderColor = isLight ? "rgba(255,255,255,1)" : "rgba(30, 41, 59, 1)";

    const labels = sorted.map((r) => `${r.batalon_name} — ${formatNum(r.total_summa)} (${r.summa_percent}%)`);
    const summas = sorted.map((r) => r.total_summa);
    const bgColors = sorted.map((_, i) => COLORS[i % COLORS.length]);

    const insideLabelsPlugin = {
      id: "batalonInsideLabels",
      afterDraw(chart: Chart) {
        const { ctx: c } = chart;
        if (!c) return;
        const meta = chart.getDatasetMeta(0);
        const total = (chart.data.datasets[0].data as number[]).reduce((s, v) => s + (v || 0), 0);
        meta.data.forEach((arc: any, i: number) => {
          const value = chart.data.datasets[0].data[i] as number;
          if (!value || !total) return;
          const percent = (value / total) * 100;
          if (percent < 3) return;
          const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
          const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
          const { x: tipX, y: tipY } = arc.tooltipPosition();
          const dx = tipX - centerX;
          const dy = tipY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const push = percent < 5 ? 0.65 : 0.55;
          const x = tipX + (dx / dist) * dist * push;
          const y = tipY + (dy / dist) * dist * push;
          c.save();
          c.fillStyle = "#ffffff";
          const label = percent < 1 ? `${percent.toFixed(1)}%` : `${Math.round(percent)}%`;
          c.font = percent < 3 ? "bold 9px Inter, sans-serif" : "bold 12px Inter, sans-serif";
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(label, x, y);
          c.restore();
        });
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: summas,
          backgroundColor: bgColors,
          borderColor,
          borderWidth: 3,
          offset: 5,
          hoverOffset: 0,
          hoverBorderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 5 },
        animation: { animateRotate: true, animateScale: false },
        onHover: (event, elements) => {
          const target = event.native?.target as HTMLCanvasElement | undefined;
          if (target) target.style.cursor = elements.length > 0 ? "pointer" : "default";
        },
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: legendColor,
              padding: 10,
              font: { size: 11, family: "'Inter', sans-serif" },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: { enabled: false },
        },
      },
      plugins: [insideLabelsPlugin],
    });

    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      chartRef.current?.destroy();
    };
  }, [theme, data, handleCanvasClick]);

  return (
    <div className="dash-glass p-[12px] flex flex-col min-h-[320px] relative overflow-hidden">
      <h2 className="text-[14px] font-semibold text-[var(--dash-text)] mb-1">
        Umumiy batalon va birgadalar kesimida
      </h2>
      <p className="text-[var(--dash-text-secondary)] text-[11px] mb-2">
        Har bir batalon va birgada ulushi
      </p>

      <div className="relative flex-1 w-full min-h-0 flex justify-center items-center">
        <canvas ref={canvasRef} />
      </div>

      {selectedRow && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedRow(null)}>
          <div
            className="w-[90%] max-w-[340px] rounded-2xl border shadow-2xl"
            style={{
              background: "var(--dash-modal-bg)",
              borderColor: "var(--dash-modal-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-t-2xl border-b"
              style={{ borderColor: "var(--dash-modal-border)", background: "var(--dash-modal-header-bg)" }}
            >
              <h3 className="text-[13px] font-bold text-[var(--dash-text)]">{selectedRow.batalon_name}</h3>
              <button onClick={() => setSelectedRow(null)} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] text-[18px] leading-none transition">&times;</button>
            </div>

            <div className="p-2.5 space-y-2">
              <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Xodimlar soni</p>
                <p className="text-[16px] font-bold text-amber-500">{selectedRow.worker_count.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                  <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Umumiy summa</p>
                  <p className="text-[13px] font-bold text-indigo-500">{formatNum(selectedRow.total_summa)}</p>
                </div>
                <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                  <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Summa ulushi</p>
                  <p className="text-[13px] font-bold text-indigo-400">{selectedRow.summa_percent}%</p>
                </div>
                <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                  <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Umumiy soat</p>
                  <p className="text-[13px] font-bold text-sky-500">{selectedRow.total_time.toLocaleString()}</p>
                </div>
                <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                  <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Soat ulushi</p>
                  <p className="text-[13px] font-bold text-sky-400">{selectedRow.time_percent}%</p>
                </div>
                <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                  <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Tadbirlar soni</p>
                  <p className="text-[13px] font-bold text-emerald-500">{selectedRow.task_count.toLocaleString()}</p>
                </div>
                <div className="rounded-lg p-1.5 text-center" style={{ background: "var(--dash-card-bg)" }}>
                  <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider mb-0.5">Tadbirlar ulushi</p>
                  <p className="text-[13px] font-bold text-emerald-400">{selectedRow.task_percent}%</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRow(null)}
                className="w-full py-2 rounded-lg text-[12px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
