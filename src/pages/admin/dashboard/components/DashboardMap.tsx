import { useState, useRef } from "react";
import { mapRegions, RegionApiData } from "../types";

const labels = [
  { text: "Qoraqalpog'iston", x: 162, y: 173, size: 13 },
  { text: "Xorazm", x: 251, y: 255, size: 11 },
  { text: "Navoiy", x: 400, y: 280, size: 13 },
  { text: "Buxoro", x: 365, y: 340, size: 12 },
  { text: "Samarqand", x: 475, y: 345, size: 12 },
  { text: "Qashqadaryo", x: 475, y: 400, size: 12 },
  { text: "Surxondaryo", x: 520, y: 440, size: 12 },
  { text: "Jizzax", x: 530, y: 320, size: 11 },
  { text: "Sirdaryo", x: 565, y: 298, size: 10 },
  { text: "Toshkent v.", x: 622, y: 248, size: 11 },
  { text: "Toshkent sh.", x: 592, y: 272, size: 9 },
  { text: "Namangan", x: 670, y: 270, size: 11 },
  { text: "Farg'ona", x: 675, y: 312, size: 11 },
  { text: "Andijon", x: 725, y: 293, size: 11 },
];

const formatNum = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

interface DashboardMapProps {
  selectedId: string | null;
  regionsData: RegionApiData[];
  onSelect: (id: string | null) => void;
}

export default function DashboardMap({ selectedId, regionsData, onSelect }: DashboardMapProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean; x: number; y: number; data: RegionApiData | null;
  }>({ visible: false, x: 0, y: 0, data: null });

  const containerRef = useRef<HTMLDivElement>(null);

  const getRegionApiData = (mapId: string): RegionApiData | undefined => {
    const mapRegion = mapRegions.find((r) => r.id === mapId);
    if (!mapRegion) return undefined;
    return regionsData.find((r) => Number(r.region_id) === mapRegion.regionId);
  };

  const handleMouseMove = (e: React.MouseEvent, mapId: string) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 15,
      data: getRegionApiData(mapId) || null,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const getRegionStyle = (regionId: string) => {
    if (!selectedId) return {};
    if (regionId === selectedId) {
      return { fill: "rgba(56, 189, 248, 0.6)", stroke: "#38bdf8", strokeWidth: 2.5, filter: "drop-shadow(0 0 10px rgba(56,189,248,0.8))" };
    }
    return { opacity: 0.4 };
  };

  const selectedName = selectedId ? mapRegions.find((r) => r.id === selectedId)?.name : null;

  return (
    <div className="dash-glass p-[12px] lg:col-span-2 flex flex-col relative z-10 min-h-0" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[16px] font-semibold flex items-center text-[var(--dash-text)]">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 animate-pulse" />
          Markazlashgan Tizim Monitoring
        </h2>
        {selectedId && (
          <button onClick={() => onSelect(null)} className="flex items-center gap-2 bg-[#38bdf8] hover:bg-[#22d3ee] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg shadow-lg shadow-[#38bdf8]/40 transition-all">
            {selectedName}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-[var(--dash-text-secondary)] text-[12px] mb-1">Real vaqt rejimida viloyatlar kesimida mablag'lar harakati</p>

      <div className="flex-1 relative w-full flex items-center justify-center p-0 min-h-0 min-w-0 overflow-hidden">
        <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
          <defs>
            <linearGradient id="regionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--dash-region-fill-start)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "var(--dash-region-fill-end)", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <g>
            {mapRegions.map((region) => (
              <path key={region.id} className="uz-region" d={region.d} style={getRegionStyle(region.id)}
                onClick={() => onSelect(region.id)} onMouseMove={(e) => handleMouseMove(e, region.id)} onMouseLeave={handleMouseLeave} />
            ))}
          </g>
          <g>
            {labels.map((label, i) => (
              <text key={i} className="region-label" x={label.x} y={label.y} textAnchor="middle" dominantBaseline="central" fontSize={label.size}>{label.text}</text>
            ))}
          </g>
        </svg>
      </div>

      {tooltip.data && (() => {
        const r = tooltip.data;
        return (
          <div className={`map-tooltip absolute z-50 w-[220px] rounded-xl shadow-2xl border backdrop-blur-md overflow-hidden ${tooltip.visible ? "opacity-100" : "opacity-0"}`}
            style={{ left: tooltip.x, top: tooltip.y, transform: "translateY(-100%)", background: "var(--dash-tooltip-bg)", borderColor: "var(--dash-tooltip-border)", color: "var(--dash-tooltip-text)" }}>
            <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--dash-tooltip-border)" }}>
              <h4 className="font-bold text-[#38bdf8] text-[13px]">{r.region_name}</h4>
            </div>
            <div className="px-3 py-2 border-l-[3px] border-l-emerald-500 mx-2 mt-2 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider font-semibold">Jami shartnomalar</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[9px] text-[var(--dash-text-muted)]">Soni:</span>
                <span className="text-[14px] font-bold text-[var(--dash-text)]">{r.data.all_contract.count}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] text-[var(--dash-text-muted)]">Summasi:</span>
                <span className="text-[12px] font-semibold text-[var(--dash-text-secondary)]">{formatNum(r.data.all_contract.summa)}</span>
              </div>
            </div>
            <div className="px-3 py-2 border-l-[3px] border-l-emerald-500 mx-2 mt-1.5 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider font-semibold">Puli to'lab berilgan</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[9px] text-[var(--dash-text-muted)]">Soni:</span>
                <span className="text-[14px] font-bold text-[var(--dash-text)]">{r.data.prixod_contract.count}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] text-[var(--dash-text-muted)]">Summasi:</span>
                <span className="text-[12px] font-semibold text-emerald-500">{formatNum(r.data.prixod_contract.summa)}</span>
              </div>
            </div>
            <div className="px-3 py-2 border-l-[3px] border-l-rose-500 mx-2 mt-1.5 mb-2 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[9px] text-[var(--dash-text-muted)] uppercase tracking-wider font-semibold">Qarzdorligi bor</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[9px] text-[var(--dash-text-muted)]">Soni:</span>
                <span className="text-[14px] font-bold text-rose-500">{r.data.rasxod_contract.count}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] text-[var(--dash-text-muted)]">Summasi:</span>
                <span className="text-[12px] font-semibold text-rose-500">{formatNum(r.data.rasxod_contract.summa)}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
