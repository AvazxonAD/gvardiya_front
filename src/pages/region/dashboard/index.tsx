import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import KpiCards from "./components/KpiCards";
import RegionMap from "./components/RegionMap";
import { UserModal } from "./components/UsersTable";
import StatusChart from "./components/StatusChart";
import AlertCard from "./components/AlertCard";
import ContractsModal from "./components/ContractsModal";
import { DashboardCountResponse, UserApiData, DistributionResponse, RedWorkersResponse, KpiData, ContractType } from "./types";
import "./dashboard.css";

export default function RegionDashboard() {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [contractsModalOpen, setContractsModalOpen] = useState(false);
  const [contractsType, setContractsType] = useState<ContractType>("all");
  const [countData, setCountData] = useState<DashboardCountResponse | null>(null);
  const [usersData, setUsersData] = useState<UserApiData[]>([]);
  const [distData, setDistData] = useState<DistributionResponse | null>(null);
  const [redData, setRedData] = useState<RedWorkersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const api = useApi();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [countRes, usersRes, distRes, redRes] = await Promise.all([
        api.get<DashboardCountResponse>(`region/dashboard/count?from=${startDate}&to=${endDate}`),
        api.get<UserApiData[]>(`region/dashboard/by-user?from=${startDate}&to=${endDate}`),
        api.get<DistributionResponse>(`region/dashboard/distribution?from=${startDate}&to=${endDate}`),
        api.get<RedWorkersResponse>(`region/dashboard/red-border?from=${startDate}&to=${endDate}`),
      ]);

      if (countRes?.success) setCountData(countRes.data);
      if (usersRes?.success) setUsersData(usersRes.data);
      if (distRes?.success) setDistData(distRes.data);
      if (redRes?.success) setRedData(redRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div className="dashboard-content flex flex-col gap-[10px]">
      {loading && !countData ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          <KpiCards data={kpiData} onDetail={(type) => { setContractsType(type); setContractsModalOpen(true); }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] h-[calc(100vh-230px)]">
            <RegionMap
              usersData={usersData}
              onDetail={() => setUserModalOpen(true)}
            />
            <div className="flex flex-col gap-[8px]">
              <StatusChart distData={distData} />
              <AlertCard redData={redData} from={startDate} to={endDate} />
            </div>
          </div>

          <UserModal
            isOpen={userModalOpen}
            onClose={() => setUserModalOpen(false)}
            usersData={usersData}
          />

          <ContractsModal
            isOpen={contractsModalOpen}
            onClose={() => setContractsModalOpen(false)}
            type={contractsType}
          />
        </>
      )}
    </div>
  );
}
