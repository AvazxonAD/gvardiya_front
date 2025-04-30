import { formatDate, formatSum, textNum } from "@/utils";
import React from "react";

export type IContractPdf = {
    id: number;
    doc_num: string;
    organization_name: string;
    doc_date: string;
    period: string;
    adress: string;
    start_date: string;
    end_date: string;
    discount: number;
    discount_money: number;
    summa: number;
    result_summa: number;
    organization_id: number;
    account_number_id: number;
    account_number: string;
    start_time: string;
    end_time: string;
    all_worker_number: number;
    all_task_time: number;
    kridit: number;
    debit: number;
    remaining_summa: number;
};

type ContractForPrintProps = {
    data?: { total: number, data: IContractPdf[] }
};

const ContractForPrint = React.forwardRef<HTMLDivElement, ContractForPrintProps>(
    ({ data }, ref) => {
        return (
            <div ref={ref} className="text-sm text-black leading-5">
                <h1 className="text-center font-bold text-lg mb-4">Shartnomalar Ro'yxati</h1>
                <table className="table-auto border-collapse border border-gray-400 w-full">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 px-2 py-1">№</th>
                            <th className="border border-gray-400 px-2 py-1">Client</th>
                            <th className="border border-gray-400 px-2 py-1">Shartnoma sanasi</th>
                            <th className="border border-gray-400 px-2 py-1">Amal qilish muddati</th>
                            <th className="border border-gray-400 px-2 py-1">Manzil</th>
                            <th className="border border-gray-400 px-2 py-1">Boshlanish vaqti</th>
                            <th className="border border-gray-400 px-2 py-1">Tugallash vaqti</th>
                            <th className="border border-gray-400 px-2 py-1">Chegirma %</th>
                            <th className="border border-gray-400 px-2 py-1">Chegirma summa</th>
                            <th className="border border-gray-400 px-2 py-1">Summa</th>
                            <th className="border border-gray-400 px-2 py-1">Umumiy summa</th>
                            <th className="border border-gray-400 px-2 py-1">Kredit</th>
                            <th className="border border-gray-400 px-2 py-1">Debit</th>
                            <th className="border border-gray-400 px-2 py-1">Qolgan summa</th>
                            <th className="border border-gray-400 px-2 py-1">Hisob raqami</th>
                            <th className="border border-gray-400 px-2 py-1">Xodimlar soni</th>
                            <th className="border border-gray-400 px-2 py-1">Topshiriq vaqti</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((item, index) => (
                            <tr
                                key={item.id}
                                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                            >
                                <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                                <td className="border border-gray-400 px-2 py-1">{item.organization_name}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatDate(item.doc_date)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatDate(item.period)}</td>
                                <td className="border border-gray-400 px-2 py-1">{item.adress}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatDate(item.start_date)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatDate(item.end_date)}</td>
                                <td className="border border-gray-400 px-2 py-1">{item.discount}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatSum(item.discount_money)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatSum(item.summa)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatSum(item.result_summa)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatSum(item.kridit)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatSum(item.debit)}</td>
                                <td className="border border-gray-400 px-2 py-1">{formatSum(item.remaining_summa)}</td>
                                <td className="border border-gray-400 px-2 py-1">{textNum(item.account_number, 4)}</td>
                                <td className="border border-gray-400 px-2 py-1">{item.all_worker_number}</td>
                                <td className="border border-gray-400 px-2 py-1">{item.all_task_time}</td>
                            </tr>
                        ))}
                        <tr
                            className={"bg-white font-[700]"}
                        >
                            <td className="border border-gray-400 px-2 py-1">Barcha</td>
                            <td className="border border-gray-400 px-2 py-1">shartnomalar</td>
                            <td className="border border-gray-400 px-2 py-1">soni</td>
                            <td className="border border-gray-400 px-2 py-1">{data?.total}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
);

ContractForPrint.displayName = "ContractForPrint";

export default ContractForPrint;