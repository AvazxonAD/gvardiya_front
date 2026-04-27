import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";
import { DistributionResponse, DistributionByRegion } from "../types";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{ label: string; value: number } | null>(null);

  const d = distData || {
    summa_65: 0, summa_65_percent: 0,
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
          `Moddiy bazaga (${d.summa_65_percent}%)`,
          `Hamkor tashkilotlar (${d.rasxod_summa_percent}%)`,
          `Xodimlar uchun premiya (${d.summa_25_percent}%)`,
          `Qolgan`,
        ],
        datasets: [{
          data: [d.summa_65, d.rasxod_summa, d.summa_25, qolgan],
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
    <>
      <div className="dash-glass p-[12px] flex flex-col flex-1 min-h-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[14px] font-semibold text-[var(--dash-text)]">
            Kirim bolgan pulning taqsimoti
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 border border-blue-400/40 hover:border-blue-300/60 rounded-md px-2.5 py-1 transition"
          >
            Batafsil
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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

      <DistributionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function DistributionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DistributionByRegion[]>([]);
  const [loading, setLoading] = useState(false);
  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const api = useApi();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await api.get<DistributionByRegion[]>(`admin/dashboard/distribution/by-region?from=${startDate}&to=${endDate}`);
    if (res?.success) setData(res.data);
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, fetchData]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totals = data.reduce((acc, r) => ({
    jami_kirim: acc.jami_kirim + (r.jami_kirim || 0),
    summa_65: acc.summa_65 + (r.summa_65 || 0),
    summa_25: acc.summa_25 + (r.summa_25 || 0),
    rasxod_summa: acc.rasxod_summa + (r.rasxod_summa || 0),
    all_rasxod: acc.all_rasxod + (r.all_rasxod || 0),
  }), { jami_kirim: 0, summa_65: 0, summa_25: 0, rasxod_summa: 0, all_rasxod: 0 });

  return (
    <div ref={overlayRef} className="dash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="shadow-2xl rounded-2xl w-[95vw] max-w-[1400px] max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

        <div className="px-5 py-4 flex justify-between items-center rounded-t-2xl shrink-0"
          style={{ background: "var(--dash-modal-header-bg)", borderBottom: "1px solid var(--dash-modal-border)" }}>
          <h3 className="text-lg font-bold text-[var(--dash-text)]">Kirim bolgan pulning taqsimoti — viloyatlar bo'yicha</h3>
          <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-3 px-5 py-3 shrink-0" style={{ borderBottom: "1px solid var(--dash-modal-border)" }}>
          {[
            { label: "Jami kirim", value: totals.jami_kirim, color: "" },
            { label: "Moddiy baza (65%)", value: totals.summa_65, color: "text-blue-400" },
            { label: "Hamkor tashkilotlar", value: totals.rasxod_summa, color: "text-emerald-500" },
            { label: "Xodimlar premiyasi (25%)", value: totals.summa_25, color: "text-amber-500" },
            { label: "Qolgan", value: totals.jami_kirim - totals.all_rasxod, color: "text-red-500" },
          ].map((c, i) => (
            <div key={i} className="rounded-lg p-2.5" style={{ background: "var(--dash-table-row-alt)" }}>
              <p className="text-[10px] text-[var(--dash-text-muted)] uppercase tracking-wider">{c.label}</p>
              <p className={`text-[18px] font-bold leading-none mt-1 ${c.color || "text-[var(--dash-text)]"}`}>{formatFull(c.value)}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="overflow-auto rounded-xl max-h-[50vh]" style={{ border: "1px solid var(--dash-table-border)" }}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 z-10" style={{ background: "var(--dash-table-header-bg)", borderBottom: "1px solid var(--dash-table-border)" }}>
                  <tr className="text-[var(--dash-text-secondary)] uppercase text-[11px]">
                    <th className="px-4 py-3 font-semibold">№</th>
                    <th className="px-4 py-3 font-semibold min-w-[180px]">Viloyat</th>
                    <th className="px-4 py-3 font-semibold text-right min-w-[120px]">Jami kirim</th>
                    <th className="px-4 py-3 font-semibold text-right min-w-[140px]">Moddiy baza (65%)</th>
                    <th className="px-4 py-3 font-semibold text-right min-w-[140px]">Hamkor tashkilotlar</th>
                    <th className="px-4 py-3 font-semibold text-right min-w-[150px]">Xodimlar premiyasi (25%)</th>
                    <th className="px-4 py-3 font-semibold text-right min-w-[120px]">Jami tarqatilgan</th>
                    <th className="px-4 py-3 font-semibold text-right min-w-[120px]">Qolgan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={r.region_id} className="transition hover:opacity-80"
                      style={{ background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent", borderBottom: "1px solid var(--dash-table-border)" }}>
                      <td className="px-4 py-3 text-[var(--dash-text-muted)]">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-[var(--dash-text)]">{r.region_name}</td>
                      <td className="px-4 py-3 text-right text-[var(--dash-text)]">{formatFull(r.jami_kirim)}</td>
                      <td className="px-4 py-3 text-right text-blue-400">{formatFull(r.summa_65)}</td>
                      <td className="px-4 py-3 text-right text-emerald-500">{formatFull(r.rasxod_summa)}</td>
                      <td className="px-4 py-3 text-right text-amber-500">{formatFull(r.summa_25)}</td>
                      <td className="px-4 py-3 text-right text-[var(--dash-text-secondary)]">{formatFull(r.all_rasxod)}</td>
                      <td className="px-4 py-3 text-right text-red-500">{formatFull((r.jami_kirim || 0) - (r.all_rasxod || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex justify-end shrink-0" style={{ borderTop: "1px solid var(--dash-modal-border)" }}>
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-medium rounded-lg transition">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
