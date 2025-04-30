export type IPrixod = {
  id: number;
  contract_id: number;
  contract_doc_num: string;
  contract_doc_date: string; // assuming it's in ISO date format
  contract_summa: number;
  organization_id: number;
  organization_name: string;
  organization_address: string;
  organization_str: string;
  organization_bank_name: string;
  organization_mfo: string;
  organization_account_number: string;
  organization_treasury1: string;
  organization_treasury2: string;
  prixod_summa: number;
  prixod_doc_num: number;
  opisanie: string;
  prixod_date: string; // assuming it's in ISO date format
  remaining_balance: number;
};
