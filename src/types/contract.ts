export type IFormTask = {
  batalon_id: number;
  id: number;
  unique_id: number;
  comment: string;
  remaining_task_time: number;
  summa: number;
  task_date: string;
  task_time: string;
  worker_number: string;
  bxm_id: number;
  address: string;
};

export type IContractForm = {
  organ_account_number_id: number;
  adress: string;
  all_task_time: number;
  all_worker_number: number;
  discount: number;
  doc_date: string;
  doc_num: string;
  end_date: string;
  end_time: string;
  id: number;
  gazna_number_id: number;
  organization_id: number;
  payment: boolean;
  period: string;
  remaining_balance: number;
  start_date: string;
  start_time: string;
  summa: number;
  dist: boolean;
  date: boolean;
  tasks: IFormTask[];
};

export type IContract = {
  id: number;
  doc_num: string;
  doc_date: string;
  result_summa: number;
  adress: string;
  organization_id: number;
  organization_name: string;
  organization_address: string;
  organization_str: string;
  organization_bank_name: string;
  organization_mfo: string;
  organization_account_number: string;
  organization_treasury1: string;
  organization_treasury2: string;
  remaining_balance: number;
  remaining_summa: number;
};

export type IContractAnaliz = {
  contract: {
    id: number;
    doc_num: string;
    doc_date: string;
    discount: number;
    discount_money: number;
    summa: number;
    result_summa: number;
    all_worker_number: number;
    all_task_time: number;
    organization_id: number;
    organization_name: string;
    organization_str: string;
    organization_account_number: string;
    organization_bank_name: string;
    organization_mfo: string;
    doer: string;
    str: string;
    account_number: string;
    bank: string;
    mfo: string;
    kridit: number;
    debit: number;
    remaining_summa: number;
  };
  prixods: {
    id: number;
    prixod_doc_num: string;
    prixod_date: string;
    prixod_summa: number;
    organization_name: string;
    organization_str: string;
    organization_account_number: string;
  }[];
  rasxod_fios: {
    id: 26;
    doc_num: string;
    rasxod_date: string;
    summa: string;
    batalon_name: string;
    batalon_account_number: number;
  }[];
  rasxods: {
    id: number;
    doc_num: string;
    rasxod_date: string;
    result_summa: string;
    batalon_name: string;
    batalon_str: string;
    batalon_account_number: string;
  }[];
};
