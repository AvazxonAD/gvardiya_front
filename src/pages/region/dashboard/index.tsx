import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import KpiCards from "./components/KpiCards";
import { UserModal } from "./components/UsersTable";
import StatusChart from "./components/StatusChart";
import AlertCard from "./components/AlertCard";
import ContractsModal from "./components/ContractsModal";
import SoldierTasksChart from "./components/SoldierTasksChart";
import BatalonStatsChart from "./components/BatalonStatsChart";
import OrganizationDebtChart from "./components/OrganizationDebtChart";
import { DashboardCountResponse, UserApiData, DistributionResponse, RedWorkersResponse, SoldierTasksResponse, BatalonStatsResponse, KpiData, ContractType } from "./types";
import "./dashboard.css";

export default function RegionDashboard() {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [contractsModalOpen, setContractsModalOpen] = useState(false);
  const [contractsType, setContractsType] = useState<ContractType>("all");
  const [countData, setCountData] = useState<DashboardCountResponse | null>(null);
  const [usersData, setUsersData] = useState<UserApiData[]>([]);
  const [distData, setDistData] = useState<DistributionResponse | null>(null);
  const [redData, setRedData] = useState<RedWorkersResponse | null>(null);
  const [soldierData, setSoldierData] = useState<SoldierTasksResponse | null>(null);
  const [batalonData, setBatalonData] = useState<BatalonStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const api = useApi();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [countRes, usersRes, distRes, redRes, soldierRes, batalonRes] = await Promise.all([
        api.get<DashboardCountResponse>(`region/dashboard/count?from=${startDate}&to=${endDate}`),
        api.get<UserApiData[]>(`region/dashboard/by-user?from=${startDate}&to=${endDate}`),
        api.get<DistributionResponse>(`region/dashboard/distribution?from=${startDate}&to=${endDate}`),
        api.get<RedWorkersResponse>(`region/dashboard/red-border?from=${startDate}&to=${endDate}`),
        api.get<SoldierTasksResponse>(`region/dashboard/soldier-tasks?from=${startDate}&to=${endDate}`),
        api.get<BatalonStatsResponse>(`region/dashboard/batalon-stats?from=${startDate}&to=${endDate}`),
      ]);

      if (countRes?.success) setCountData(countRes.data);
      if (usersRes?.success) setUsersData(usersRes.data);
      if (distRes?.success) setDistData(distRes.data);
      if (redRes?.success) setRedData(redRes.data);
      if (soldierRes?.success) setSoldierData(soldierRes.data);
      if (batalonRes?.success) setBatalonData(batalonRes.data);
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-[10px]">
            <KpiCards data={kpiData} onDetail={(type) => { setContractsType(type); setContractsModalOpen(true); }} />
            <AlertCard redData={redData} from={startDate} to={endDate} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
            <BatalonStatsChart data={batalonData} />
            <SoldierTasksChart data={soldierData} />
            <StatusChart distData={distData} />
            <OrganizationDebtChart />
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
