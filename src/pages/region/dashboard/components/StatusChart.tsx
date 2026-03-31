import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";
import { DistributionResponse } from "../types";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface StatusChartProps {
  distData: DistributionResponse | null;
}

const formatNum = (num?: number): string => {
  if (!num && num !== 0) return "0";
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + " Mlrd";
  if (num >= 1000000) return (num / 1000000).toFixed(0) + " mln";
  return num.toLocaleString();
};

const formatFull = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

export default function StatusChart({ distData }: StatusChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const theme = useSelector((state: any) => state.theme);
  const [hoverInfo, setHoverInfo] = useState<{ label: string; value: number } | null>(null);

  const d = distData || {
    summa_75: 0, summa_75_percent: 0,
    summa_25: 0, summa_25_percent: 0,
    rasxod_summa: 0, rasxod_summa_percent: 0,
    fio_summa: 0, fio_summa_percent: 0,
    all_rasxod: 0,
    prixod: { count: 0, summa: 0 },
  };

  const qolgan = Math.max((d.prixod?.summa || 0) - (d.all_rasxod || 0), 0);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const isLight = theme === "light";
    const legendColor = isLight ? "#334155" : "#cbd5e1";
    const borderColor = isLight ? "rgba(255,255,255,1)" : "rgba(30, 41, 59, 1)";

    const insideLabelsPlugin = {
      id: "insideLabels",
      afterDraw(chart: Chart) {
        const { ctx: c } = chart;
        if (!c) return;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((arc: any, i: number) => {
          const value = chart.data.datasets[0].data[i] as number;
          if (!value) return;
          const { x, y } = arc.tooltipPosition();
          c.save();
          c.fillStyle = "#ffffff";
          c.font = "bold 13px Inter, sans-serif";
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(formatNum(value), x, y);
          c.restore();
        });
      },
    };

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          `Moddiy bazani rivojlantirish (${d.summa_75_percent}%)`,
          `Hamkor tashkilotlar (${d.rasxod_summa_percent}%)`,
          `Xodimlar uchun premiya (${d.summa_25_percent}%)`,
          `Qolgan`,
        ],
        datasets: [{
          data: [d.summa_75, d.rasxod_summa, d.summa_25, qolgan],
          backgroundColor: [
            "rgba(59, 130, 246, 0.85)",
            "rgba(34, 197, 94, 0.85)",
            "rgba(202, 138, 4, 0.85)",
            "rgba(239, 68, 68, 0.85)",
          ],
          borderColor,
          borderWidth: 2,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        layout: { padding: 10 },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: legendColor,
              padding: 12,
              font: { size: 11, family: "'Inter', sans-serif" },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            enabled: false,
            external: (context) => {
              const { tooltip } = context;
              if (tooltip.opacity === 0) {
                setHoverInfo(null);
                return;
              }
              const dp = tooltip.dataPoints?.[0];
              if (dp) {
                setHoverInfo({ label: dp.label, value: dp.raw as number });
              }
            },
          },
        },
      },
      plugins: [insideLabelsPlugin],
    });

    return () => { chartRef.current?.destroy(); };
  }, [theme, distData]);

  return (
    <div className="dash-glass p-[12px] flex flex-col flex-1 min-h-0">
      <h2 className="text-[14px] font-semibold text-[var(--dash-text)] mb-2">
        Kirim bolgan pulning taqsimoti
      </h2>
      <div className="relative flex-1 w-full h-full flex justify-center items-center min-h-0">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          {hoverInfo ? (
            <>
              <span className="text-[var(--dash-text-muted)] text-[9px] text-center leading-tight max-w-[140px]">{hoverInfo.label}</span>
              <span className="text-[16px] font-bold text-[var(--dash-text)]">{formatFull(hoverInfo.value)}</span>
            </>
          ) : (
            <>
              <span className="text-[var(--dash-text-muted)] text-[10px]">Jami kirim</span>
              <span className="text-[18px] font-bold text-[var(--dash-text)]">{formatFull(d.prixod?.summa)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
