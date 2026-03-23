// === API Response Types ===

export interface ContractGroup {
  count: number;
  summa: number;
}

// GET /region/dashboard/count
export interface DashboardCountResponse {
  all_contract: ContractGroup;
  prixod_contract: ContractGroup;
  rasxod_contract: ContractGroup;
}

// GET /region/dashboard/by-user
export interface UserApiData {
  user_id: string | number;
  user_name: string;
  data: {
    all_contract: ContractGroup;
    prixod_contract: ContractGroup;
    rasxod_contract: ContractGroup;
  };
}

// GET /region/dashboard/distribution
export interface DistributionResponse {
  fio_summa: number;
  fio_summa_percent: number;
  summa_75: number;
  summa_75_percent: number;
  summa_25: number;
  summa_25_percent: number;
  rasxod_summa: number;
  rasxod_summa_percent: number;
  all_rasxod: number;
  prixod: { count: number; summa: number };
}

// GET /region/dashboard/red-border
export interface RedWorker {
  worker_id: number;
  worker_name: string;
  batalon_id: number;
  batalon_name: string;
  batalon_workers_count: number;
  batalon_summa: number;
  region_name: string;
  summa: number;
  average: number;
  threshold: number;
  times_average: number;
}

export interface RedWorkersResponse {
  red_count: number;
  red_workers: RedWorker[];
}

// GET /region/dashboard/contracts
export type ContractType = "all" | "paid" | "debt";

export interface ContractItem {
  id: number;
  doc_num: string;
  doc_date: string;
  result_summa: number;
  organization_name: string;
  user_name: string;
  region_name: string;
  paid_summa: number;
  debt_summa: number;
}

export interface ContractsMeta {
  pageCount: number;
  count: number;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
}

// === Frontend KPI data ===
export interface KpiData {
  all: ContractGroup;
  paid: ContractGroup;
  debt: ContractGroup;
}
