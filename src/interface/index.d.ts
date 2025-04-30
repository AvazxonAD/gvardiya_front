export interface SingleTemplateInterface {
  id: number;
  user_id: number;
  shablon_name: string;
  title: string;
  main_section: string;
  section_1: string[];
  section_1_title: string;
  section_2: string[];
  section_2_title: string;
  section_3: string[];
  section_3_title: string;
  section_4: string[];
  section_4_title: string;
  section_5: string[];
  section_5_title: string;
  section_6: string[];
  section_6_title: string;
  section_7: string[];
  section_7_title: string;
}
export interface SingleTemplateInterReplaced {
  id: number;
  user_id: number;
  shablon_name: string;
  title: string;
  main_section: string;
  section_1: string;
  section_1_title: string;
  section_2: string;
  section_2_title: string;
  section_3: string;
  section_3_title: string;
  section_4: string;
  section_4_title: string;
  section_5: string;
  section_5_title: string;
  section_6: string;
  section_6_title: string;
  section_7: string;
  section_7_title: string;
}

export interface Task {
  id: number;
  batalon_id: number;
  task_time: number;
  worker_number: number;
  summa: number;
  discount_money: number;
  result_summa: number;
  task_date: string; // or Date, if you prefer to work with Date objects
}

export interface Document {
  id: number;
  doc_num: string;
  doc_date: string; // or Date, if you prefer to work with Date objects
  period: string; // You can also use Date if it's a specific date range
  adress: string;
  start_date: string; // or Date
  end_date: string; // or Date
  discount: number;
  discount_money: number;
  summa: number;
  result_summa: number;
  organization_id: number;
  account_number_id: number;
  start_time: string; // or Date (e.g., 'HH:mm' or Date objects)
  end_time: string; // or Date
  all_worker_number: number;
  all_task_time: number;
  remaining_balance: number;
  tasks: Task[];
}

export interface InfoInterFace {
  doer: string;
  boss: string;
  account_number: string;
  bank: string;
  address: string;
  str: string;
  mfo: string;
}

export interface OrganizationInterface {}

export interface templateInterface {
  idx: number;
  active: boolean;
  id: number;
  shablon_name: string;
}

export interface RasxodInterface {
  id: number;
  doc_num: string;
  doc_date: string; // ISO date format as a string
  opisanie: string;
  batalon_id: number;
  batalon_name: string;
  batalon_address: string;
  batalon_str: string;
  batalon_bank_name: string;
  batalon_mfo: string;
  batalon_account_number: string;
  summa: number;
}

export interface RasxodPaginationMetaInterface {
  pageCount: number;
  count: number;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
  summa_from: string;
  summa_to: string;
  summa: string;
}

export interface RasxodTabelInterface {
  task_id: number;
  doc_num: string;
  doc_date: string;
  organization_name: string;
  organization_address: string;
  organization_str: string;
  organization_bank_name: string;
  organization_mfo: string;
  organization_account_number: string;
  task_time: number;
  worker_number: number;
  result_summa: number;
  discount_money: number;
  summa: number;
  saved?: boolean;
  batalon_id?: number;
}

interface SingleRasxodInterface {
  id: number;
  doc_num: string;
  doc_date: string;
  opisanie: string | null;
  batalon_id: number;
  batalon_name: string;
  batalon_address: string;
  batalon_str: string;
  batalon_bank_name: string;
  batalon_mfo: string;
  batalon_account_number: string;
  summa: number;
  tasks: RasxodTabelInterface[];
}

export interface UstamaInterFace {
  id: number;
  name: string;
  percent: number;
}

export interface UstamaInterFaceEdited {
  id: number;
  name: string;
  percent: number;
  active: boolean;
  deleted?: boolean;
}

export interface RasxodFioTaskInterface {
  worker_task_id: number;
  contract_doc_num: string;
  contract_doc_date: string; // Could also be `Date` if you're working with Date objects in TypeScript
  organization_name: string;
  organization_address: string;
  organization_str: string;
  organization_bank_name: string;
  organization_mfo: string;
  organization_account_number: string;
  fio: string;
  task_time: number;
  summa: number;
  saved?: boolean;
  batalon_id?: number;
}

export interface IRasxodFio {
  id: number;
  doc_num: string;
  doc_date: string;
  opisanie: string;
  batalon_id: number;
  batalon_name: string;
  batalon_address: string;
  batalon_str: string;
  batalon_bank_name: string;
  batalon_mfo: string;
  batalon_account_number: string;
  summa: number;
}
