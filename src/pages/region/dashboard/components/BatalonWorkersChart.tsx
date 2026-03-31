import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { BatalonWorkersResponse } from "../types";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  data: BatalonWorkersResponse | null;
}

const COLORS = [
  "rgba(59, 130, 246, 0.8)",
  "rgba(34, 197, 94, 0.8)",
  "rgba(245, 158, 11, 0.8)",
  "rgba(239, 68, 68, 0.8)",
  "rgba(168, 85, 247, 0.8)",
  "rgba(14, 165, 233, 0.8)",
  "rgba(20, 184, 166, 0.8)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(251, 146, 60, 0.8)",
  "rgba(99, 102, 241, 0.8)",
];

export default function BatalonWorkersChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const theme = useSelector((state: any) => state.theme);

  const d = data || { total_workers: 0, count: 0, rows: [] };

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const isLight = theme === "light";
    const textColor = isLight ? "#334155" : "#cbd5e1";
    const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

    const sorted = [...d.rows].sort((a, b) => b.worker_count - a.worker_count);
    const labels = sorted.map((r) => r.batalon_name);
    const counts = sorted.map((r) => r.worker_count);
    const bgColors = sorted.map((_, i) => COLORS[i % COLORS.length]);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Xodimlar soni",
          data: counts,
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
            ticks: { color: textColor, font: { size: 10 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 10 } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const percent = d.total_workers > 0 ? Math.round(((ctx.raw as number) / d.total_workers) * 100) : 0;
                return `Xodimlar: ${ctx.raw} (${percent}%)`;
              },
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [theme, data]);

  return (
    <div className="dash-glass p-[12px] flex flex-col min-h-[320px]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[14px] font-semibold text-[var(--dash-text)]">
          Batalon bo'yicha xodimlar soni
        </h2>
        <span className="text-[12px] font-bold text-blue-500">Jami: {d.total_workers.toLocaleString()}</span>
      </div>
      <p className="text-[var(--dash-text-secondary)] text-[11px] mb-2">
        Har bir batalondagi faol xodimlar
      </p>

      <div className="relative flex-1 w-full min-h-0">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
