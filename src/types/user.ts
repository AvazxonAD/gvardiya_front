export type IUser =  {
    id: number;
    login: string;
    fio: string;
    account_number: string;
    doer_name: string;
    boss_name: string;
    address: string;
    bank_name: string;
    mfo: string;
    str: string;
}

export type IUsers = {
    id: number;
    fio: string;
    login: string;
    image: string | null;
    region_id: number;
    created_at: string; // ISO date string
    name: string;
};
