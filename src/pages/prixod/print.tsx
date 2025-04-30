import { IPrixod } from "@/types/prixod";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import React from "react";

type Props = {
    data: IPrixod[];
    fromDate: string;
    endDate: string;
};

const PrixodForPrint = React.forwardRef<HTMLDivElement, Props>(
    ({ data, fromDate, endDate }, ref) => {
        const totalSum = data?.reduce((a, b) => a + Number(b.prixod_summa), 0);

        return (
            <div className="text-black text-sm leading-5" ref={ref}>
                <h1 className="text-center font-bold text-lg mb-4">
                    {tt("Ommaviy tadbirlardan tushgan tushumlar", "Поступления от массовых мероприятий")}
                </h1>
                <h3 className="text-left font-bold text-sm mb-4 ms-4">
                    {formatDate(fromDate)} {tt("dan", "с")} {formatDate(endDate)}{" "}
                    {tt("gacha bo'lgan tushumlar, jami:", "до поступлений, всего:")} {formatSum(totalSum)}
                </h3>
                <table className="table-auto border-collapse border border-gray-400 w-full">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("№", "№")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Shartnoma №", "Номер договора")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Shartnoma sanasi", "Дата договора")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Xamkor tashkilot", "Организация партнера")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("Xamkor INN", "ИНН партнера")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2 text-right">
                                {tt("To'langan pul mablag'i", "Оплаченные средства")}
                            </th>
                            <th className="border border-gray-400 px-4 py-2">
                                {tt("To'langan pul sanasi", "Дата оплаты")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item, index) => (
                            <tr
                                key={item.id}
                                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                            >
                                <td className="border border-gray-400 px-4 py-2">
                                    {item.prixod_doc_num}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {item.contract_doc_num}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {formatDate(item.contract_doc_date)}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {item.organization_name}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {textNum(item.organization_str, 3)}
                                </td>
                                <td className="border border-gray-400 px-4 py-2 text-right">
                                    {formatSum(item.prixod_summa)}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {formatDate(item.prixod_date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
);

PrixodForPrint.displayName = "Tushumlar";

export default PrixodForPrint;