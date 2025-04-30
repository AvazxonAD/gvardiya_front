import { IWorker } from "@/types/worker"; // Assuming you have defined IWorker correctly
import { textNum } from "@/utils";
import React from "react";

interface FIOForPrintProps {
    data?: { total: number, data: IWorker[] }
}

const FIOForPrint = React.forwardRef<HTMLDivElement, FIOForPrintProps>(
    ({ data }, ref) => {
        return (
            <div className="h-full text-[#000000] text-[14px] leading-[19.2px]">
                <div className="text-[16px] bg-[#FFFFFF] font-baltic" ref={ref}>
                    <h1 className="text-center font-bold text-lg mb-4">FIO Ro'yxati</h1>

                    <table className="table-auto border-collapse border border-gray-400 w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-400 px-4 py-2">Batalon</th>
                                <th className="border border-gray-400 px-4 py-2">FIO</th>
                                <th className="border border-gray-400 px-4 py-2">Karta raqam</th>
                                <th className="border border-gray-400 px-4 py-2">Hisob raqam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.map((item, index) => (
                                <tr
                                    key={index}
                                    className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                                >
                                    <td className="border border-gray-400 px-4 py-2">
                                        {item.batalon_name}
                                    </td>
                                    <td className="border border-gray-400 px-4 py-2">
                                        {item.fio}
                                    </td>
                                    <td className="border border-gray-400 px-4 py-2">
                                        {textNum(item.account_number, 4)}
                                    </td>
                                    <td className="border border-gray-400 px-4 py-2">
                                        {textNum(item.xisob_raqam, 4)}
                                    </td>
                                </tr>
                            ))}
                            <tr

                                className={"bg-white font-[700]"}
                            >
                                <td className="border border-gray-400 px-4 py-2">
                                    Barcha hodimlar soni
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    {data?.total}ta
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
);

FIOForPrint.displayName = "Hodimlar jadvali"; // Adding a display name for better debugging

export default FIOForPrint;
