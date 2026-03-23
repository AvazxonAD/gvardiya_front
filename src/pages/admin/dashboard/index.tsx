import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import KpiCards from "./components/KpiCards";
import DashboardMap from "./components/DashboardMap";
import StatusChart from "./components/StatusChart";
import AlertCard from "./components/AlertCard";
import RegionModal from "./components/RegionModal";
import ContractsModal from "./components/ContractsModal";
import { DashboardCountResponse, RegionApiData, DistributionResponse, RedWorkersResponse, KpiData, ContractType, mapRegions } from "./types";
import "./dashboard.css";

export default function AdminDashboard() {
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [contractsModalOpen, setContractsModalOpen] = useState(false);
  const [contractsType, setContractsType] = useState<ContractType>("all");
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [countData, setCountData] = useState<DashboardCountResponse | null>(null);
  const [regionsData, setRegionsData] = useState<RegionApiData[]>([]);
  const [distData, setDistData] = useState<DistributionResponse | null>(null);
  const [redData, setRedData] = useState<RedWorkersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const api = useApi();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const regionParam = selectedRegionId ? `&region_id=${selectedRegionId}` : "";

      const [countRes, regionsRes, distRes, redRes] = await Promise.all([
        api.get<DashboardCountResponse>(`admin/dashboard/count?from=${startDate}&to=${endDate}${regionParam}`),
        api.get<RegionApiData[]>(`admin/dashboard/by-region?from=${startDate}&to=${endDate}`),
        api.get<DistributionResponse>(`admin/dashboard/distribution?from=${startDate}&to=${endDate}${regionParam}`),
        api.get<RedWorkersResponse>(`admin/dashboard/red-border?from=${startDate}&to=${endDate}${regionParam}`),
      ]);

      if (countRes?.success) setCountData(countRes.data);
      if (regionsRes?.success) setRegionsData(regionsRes.data);
      if (distRes?.success) setDistData(distRes.data);
      if (redRes?.success) setRedData(redRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedRegionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectRegion = (mapRegionId: string | null) => {
    if (mapRegionId === null) {
      setSelectedRegionId(null);
      return;
    }
    const mapRegion = mapRegions.find((r) => r.id === mapRegionId);
    if (!mapRegion) return;

    if (selectedRegionId === mapRegion.regionId) {
      setSelectedRegionId(null);
    } else {
      setSelectedRegionId(mapRegion.regionId);
    }
  };

  const kpiData: KpiData = countData
    ? {
        all: countData.all_contract,
        paid: countData.prixod_contract,
        debt: countData.rasxod_contract,
      }
    : {
        all: { count: 0, summa: 0 },
        paid: { count: 0, summa: 0 },
        debt: { count: 0, summa: 0 },
      };

  const selectedMapId = selectedRegionId
    ? mapRegions.find((r) => r.regionId === selectedRegionId)?.id || null
    : null;

  return (
    <div className="dashboard-content flex flex-col gap-[10px] pb-5">
      {loading && !countData ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          <KpiCards data={kpiData} onDetail={(type) => { setContractsType(type); setContractsModalOpen(true); }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] min-h-[500px]">
            <DashboardMap
              selectedId={selectedMapId}
              regionsData={regionsData}
              onSelect={handleSelectRegion}
            />
            <div className="flex flex-col gap-[8px]">
              <StatusChart distData={distData} />
              <AlertCard redData={redData} from={startDate} to={endDate} regionId={selectedRegionId} />
            </div>
          </div>

          <RegionModal
            isOpen={regionModalOpen}
            onClose={() => setRegionModalOpen(false)}
            regionsData={regionsData}
            selectedRegionId={selectedRegionId}
          />

          <ContractsModal
            isOpen={contractsModalOpen}
            onClose={() => setContractsModalOpen(false)}
            type={contractsType}
            regionId={selectedRegionId}
          />
        </>
      )}
    </div>
  );
}
