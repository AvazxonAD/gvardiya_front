import { IOrganization } from "@/types/organization";
import { textNum } from "@/utils";
import React from "react";

type OrganizationForPrintProps = {
    data?: { total: number, data: IOrganization[] }
};

const OrganizationForPrint = React.forwardRef<HTMLDivElement, OrganizationForPrintProps>(
    ({ data }, ref) => {
        return (
            <div className="text-black text-sm leading-5" ref={ref}>
                <h1 className="text-center font-bold text-lg mb-4">Tashkilotlar Ro'yxati</h1>
                <table className="table-auto border-collapse border border-gray-400 w-full">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-400 px-4 py-2">Tashkilot nomi</th>
                            <th className="border border-gray-400 px-4 py-2">Manzil</th>
                            <th className="border border-gray-400 px-4 py-2">INN</th>
                            <th className="border border-gray-400 px-4 py-2">Bank nomi</th>
                            <th className="border border-gray-400 px-4 py-2">MFO</th>
                            <th className="border border-gray-400 px-4 py-2">Hisob raqami</th>
                            <th className="border border-gray-400 px-4 py-2">G'azna1</th>
                            <th className="border border-gray-400 px-4 py-2">G'azna2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((item, index) => (
                            <tr
                                key={item.id}
                                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                            >
                                <td className="border border-gray-400 px-4 py-2">{item.name}</td>
                                <td className="border border-gray-400 px-4 py-2">{item.address}</td>
                                <td className="border border-gray-400 px-4 py-2">{textNum(item.str, 3)}</td>
                                <td className="border border-gray-400 px-4 py-2">{item.bank_name}</td>
                                <td className="border border-gray-400 px-4 py-2">{item.mfo}</td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {textNum(item.account_number, 4)}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">{item.treasury1}</td>
                                <td className="border border-gray-400 px-4 py-2">{item.treasury2}</td>
                            </tr>
                        ))}
                        <tr
                            className={"bg-white font-[700]"}
                        >
                            <td className="border border-gray-400 px-4 py-2">Tashkiloatlar soni</td>
                            <td className="border border-gray-400 px-4 py-2">{data?.total} ta</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
);

OrganizationForPrint.displayName = "Tashkilotlar";

export default OrganizationForPrint;