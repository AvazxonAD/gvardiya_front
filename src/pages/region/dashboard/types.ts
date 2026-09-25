// === API Response Types ===

import type { DebtBreakdown, DebtStatus } from "@/lib/debtStatus";

export interface ContractGroup {
  count: number;
  summa: number;
}

// GET /region/dashboard/count
export interface DashboardCountResponse {
  all_contract: ContractGroup;
  prixod_contract: ContractGroup;
  rasxod_contract: ContractGroup;
  /** Qarzdorlar to'lov muddati bo'yicha (summa — shartnoma, debt — qarz) */
  debt_by_status?: DebtBreakdown;
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
  summa_65: number;
  summa_65_percent: number;
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
export type ContractType = "all" | "paid" | "debt" | "not_due" | "late" | "overdue";

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
  debt_status?: DebtStatus;
  event_date?: string;
  payment_due_date?: string;
}

export interface ContractsMeta {
  pageCount: number;
  count: number;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
}

// GET /region/dashboard/soldier-tasks
export interface SoldierTaskRow {
  batalon_id: number;
  batalon_name: string;
  task_count: number;
  worker_count: number;
  total_time: number;
  total_summa: number;
}

export interface SoldierTasksResponse {
  total_task_count: number;
  total_time: number;
  total_summa: number;
  total_worker_count: number;
  count: number;
  rows: SoldierTaskRow[];
}

// GET /region/dashboard/batalon-stats
export interface BatalonStatRow {
  batalon_id: number;
  batalon_name: string;
  task_count: number;
  worker_count: number;
  total_summa: number;
  total_time: number;
  summa_percent: number;
  time_percent: number;
  task_percent: number;
}

export interface BatalonStatsResponse {
  grand_summa: number;
  grand_time: number;
  grand_task_count: number;
  count: number;
  rows: BatalonStatRow[];
}

// GET /region/dashboard/organization-debt
export interface OrganizationDebtRow {
  organization_id: number;
  organization_name: string;
  organization_str?: string;
  organization_address?: string;
  contract_count: number;
  total_summa: number;
  paid_summa: number;
  debt_summa: number;
  not_due_summa?: number;
  late_summa?: number;
  overdue_summa?: number;
}

export interface OrgDebtMeta {
  pageCount: number;
  count: number;
  total_debt: number;
  debt_by_status?: DebtBreakdown;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
}

// GET /region/dashboard/organization-debt-contracts
export interface OrgDebtContractItem {
  id: number;
  doc_num: string;
  doc_date: string;
  result_summa: number;
  organization_name: string;
  user_name: string;
  account_number: string | null;
  paid_summa: number;
  debt_summa: number;
  debt_status?: DebtStatus;
  event_date?: string;
  payment_due_date?: string;
}

export interface AccountNumberOption {
  id: number;
  account_number: string;
}

// === Frontend KPI data ===
export interface KpiData {
  all: ContractGroup;
  paid: ContractGroup;
  debt: ContractGroup;
}
