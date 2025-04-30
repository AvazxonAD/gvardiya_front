export type IOrganization = {
  id: number;
  name: string;
  address: string;
  str: string;
  bank_name: string;
  mfo: string;
  account_numbers: { account_number: string }[];
  gazna_numbers: { gazna_number: string }[];
};
