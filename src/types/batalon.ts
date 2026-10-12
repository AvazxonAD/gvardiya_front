import type { BatalonType } from "@/lib/batalonType";

export type IBatalon = {
  id: number;
  name: string;
  address: string;
  str: string;
  bank_name: string;
  mfo: string;
  birgada: boolean;
  /** Hisobot uchun tegishliligi (@/lib/batalonType) */
  type?: BatalonType;
  account_number: string;
};
