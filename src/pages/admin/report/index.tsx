import Input from "@/Components/Input";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import useApi from "@/services/api";
import { IReportAdmin } from "@/types/report";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import React, { useEffect, useState } from "react";

type IReportState = {
  meta: {
    pageCount: number;
    count: number;
    currentPage: number;
    nextPage: number | null;
    backPage: number | null;
    from_balance: string;
    to_balance: string;
    prixod: string;
    rasxod: string;
  };
  data: IReportAdmin[];
};

const ReportAdmin: React.FC = () => {
  const [data, setData] = useState<IReportState>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const today = new Date();
  const firstDay = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-01`;
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  const [startDate, setStartDate] = useState<string>(firstDay);
  const [endDate, setEndDate] = useState<string>(lastDay);
  const api = useApi();

  // Fetch data when page, limit, or date range changes
  const fetchData = async () => {
    if (!startDate || !endDate) return;

    try {
      const response = await api.get(
        `admin/monitoring/prixod/rasxod/?from=${startDate}&to=${endDate}&page=${page}&limit=${limit}`
      );

      if (response?.success) {
        setData(response as any);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleDownload = () => {
    if (startDate && endDate) {
      fetchData();
    }
  };

  // Calculate full height for the component
  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  // Table headers with translations
  const tableHeaders = [
    { text: "№", className: "text-left py-3 px-[8px]" },
    { text: tt("Sana", "Дата"), className: "text-left py-3 px-[8px]" },
    {
      text: tt("Tashkilot", "Организация"),
      className: "text-left py-3 px-[8px]",
    },
    {
      text: tt("Ijrochi", "Исполнитель"),
      className: "text-left py-3 px-[8px]",
    },
    {
      text: tt("Kirim", "Приход"),
      className: "text-right py-3 px-[8px] w-[200px]",
    },
    {
      text: tt("Chiqim", "Расход"),
      className: "text-right py-3 px-[8px] w-[200px]",
    },
    {
      text: tt("Tavsif", "Описание"),
      className: "text-left py-3 px-[8px] w-[400px]",
    },
  ];

  // Render organization or executor tooltip
  const renderTooltip = (item: IReportAdmin, type: "tashkilot" | "doer") => {
    const isOrganization = type === "tashkilot";
    return (
      <td className="rasxod-tooltip relative px-[8px] py-3 border-b border-l border-r">
        {isOrganization ? item.tashkilot_name : item.doer_name}
        <div className="text-mytextcolor absolute rasxod-tooltip-wrap !top-[0] !left-[100px] w-[300px] z-10 bg-mybackground border border-mytableheadborder rounded-md shadow-lg p-3">
          <h2>
            {tt("Nomi", "Название")}:{" "}
            {isOrganization ? item.tashkilot_name : item.doer_name}
          </h2>
          <h2>
            {tt("Manzil", "Адрес")}:{" "}
            {isOrganization ? item.tashkilot_address : item.doer_address}
          </h2>
          <h2>
            {tt("INN", "ИНН")}:{" "}
            {textNum(isOrganization ? item.tashkilot_inn : item.doer_inn, 3)}
          </h2>
          <h2>
            {tt("Hisob raqam", "Номер счета")}:{" "}
            {textNum(
              isOrganization
                ? item.tashkilot_account_number
                : item.doer_account_number,
              4
            )}
          </h2>
        </div>
      </td>
    );
  };

  return (
    <div>
      <div style={{ minHeight: fullHeight }}>
        <div className="flex -mt-5 sticky py-5 -top-1 z-[30] bg-mybackground justify-between">
          <div>
            <Input readonly v={data?.meta.from_balance} />
          </div>
          <div className="flex items-center">
            <SpecialDatePicker
              defaultValue={startDate}
              onChange={setStartDate}
            />
            <h2 className="ms-4 me-8 font-[600]">{tt("dan", "с")}</h2>
            <SpecialDatePicker defaultValue={endDate} onChange={setEndDate} />
            <Button onClick={handleDownload} className="ms-8" mode="download" />
          </div>
        </div>

        <div className="">
          <Table
            thead={tableHeaders}
            theadClassName="bg-mytablehead sticky z-10 top-[80px] text-mytextcolor"
          >
            {data?.data.map((r, ind) => (
              <tr
                key={ind}
                className="cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-mytableheadborder"
              >
                <td className="px-[8px] py-3 border-b border-l border-r">
                  {r.doc_num}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r">
                  {formatDate(r.doc_date)}
                </td>
                {renderTooltip(r, "tashkilot")}
                {renderTooltip(r, "doer")}
                <td className="px-[8px] py-3 border-b border-l border-r text-right">
                  {formatSum(r.prixod_sum)}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r text-right">
                  {formatSum(r.rasxod_sum)}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r">
                  {r.opisanie}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      {data ? (
        <div className="sticky bottom-0 z-[30] bg-mybackground">
          {/* Total summary */}
          <div className="mt-3 pt-2 flex items-center justify-between">
            <Input readonly v={data?.meta.to_balance} />
            <div className="flex items-center gap-x-[4px] mr-[400px]">
              <h2 className="font-[700]">{tt("Jami", "Итого")}:</h2>
              <div className="flex items-center">
                {/* <h3 className="font-[600]">{tt("Kirim", "Приход")}</h3> */}
                <div className="w-[198px]">
                  <Input className="w-full" readonly v={data?.meta.prixod} />
                </div>
              </div>
              <div className="flex items-center">
                {/* <h3 className="font-[600]">{tt("Chiqim", "Расход")}</h3> */}
                <div className="w-[198px]">
                  <Input className="w-full" readonly v={data?.meta.rasxod} />
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <Paginatsiya
              currentPage={page}
              setCurrentPage={setPage}
              totalPages={data.meta.pageCount}
              limet={limit}
              setLimet={setLimit}
              count={data.meta.count}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ReportAdmin;
