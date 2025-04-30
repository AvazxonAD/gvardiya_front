export type IReport = {
    tashkilot_id: number;
    tashkilot_name: string;
    tashkilot_address: string;
    tashkilot_inn: string;
    tashkilot_account_number: string;
    id: number;
    doc_num: string;
    doc_date: string; 
    opisanie: string; 
    rasxod_sum: number; 
    prixod_sum: number; 
}

export type IReportAdmin = {
    user_id: number;
    doer_name: string;
    doer_address: string;
    doer_inn: string;
    doer_account_number: string;
    doer_boss: string;
    doer_bank_name: string;
    doer_bank_mfo: string;
    tashkilot_id: number;
    tashkilot_name: string;
    tashkilot_address: string;
    tashkilot_inn: string;
    tashkilot_account_number: string;
    id: number;
    doc_num: string;
    doc_date: string; 
    opisanie: string;
    rasxod_sum: number;
    prixod_sum: number;
  };
  