import { IRasxodFio } from "@/interface";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import React from "react";

type Props = {
    data: IRasxodFio[];
    fromDate: string;
    endDate: string;
};

const RasxodFioForPrint = React.forwardRef<HTMLDivElement, Props>(
    ({ data, fromDate, endDate }, ref) => {
        const totalSum = data?.reduce((a, b) => a + Number(b.summa), 0);

        return (
            <div className="text-black text-sm leading-5" ref={ref}>
                <h1 className="text-center font-bold text-lg mb-4">
                    {tt("Batalonlar uchun qilingan chiqimlar", "Расходы по батальонам")}
                </h1>
                <h3 className="text-left font-bold text-sm mb-4 ms-4">
                    {formatDate(fromDate)} {tt("dan", "с")} {formatDate(endDate)}{" "}
                    {tt(" gacha bo'lgan chiqimlar, jami:", "до расходов, всего:")} {formatSum(totalSum)}
                </h3>
                <table className="table-auto border-collapse border border-gray-400 w-full">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Hujjat №", "Номер документа")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Hujjat sanasi", "Дата документа")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Batalon nomi", "Название батальона")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Batalon INN", "ИНН батальона")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2 text-right">
                                {tt("To'langan pul mablag'i", "Оплаченные средства")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Tavsif", "Описание")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item, index) => (
                            <tr
                                key={item.id}
                                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                            >
                                <td className="border border-gray-400 px-4 py-2">{item.doc_num}</td>
                                <td className="border border-gray-400 px-4 py-2">{formatDate(item.doc_date)}</td>
                                <td className="border border-gray-400 px-4 py-2">{item.batalon_name}</td>
                                <td className="border border-gray-400 px-4 py-2">{textNum(item.batalon_str, 3)}</td>
                                <td className="border border-gray-400 px-4 py-2 text-right">{formatSum(item.summa)}</td>
                                <td className="border border-gray-400 px-4 py-2">{item.opisanie}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
);

RasxodFioForPrint.displayName = "Chiqimlar";

export default RasxodFioForPrint;