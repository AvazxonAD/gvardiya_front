import Paginatsiya from "@/Components/Paginatsiya";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useApi from "@/services/api";
import { IReportAdmin } from "@/types/report";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import React, { useEffect, useState } from "react";
import {
  ListCard,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

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

  // Sana oralig'i o'zgarganda hisobot o'zi yangilanadi
  useEffect(() => {
    fetchData();
  }, [page, limit, startDate, endDate]);

  // Calculate full height for the component

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
      <td className="rasxod-tooltip relative px-[8px] py-3 border-b border-border">
        {isOrganization ? item.tashkilot_name : item.doer_name}
        <div className="text-foreground absolute rasxod-tooltip-wrap !top-[0] !left-[100px] w-[300px] z-10 bg-card border-b border-border rounded-md shadow-lg p-3">
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
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker defaultValue={startDate} onChange={setStartDate} />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker defaultValue={endDate} onChange={setEndDate} />
            </div>

            <ToolbarSpacer />

          </Toolbar>
        }
        footer={
          data ? (
            <>
              <SummaryRow>
                <SummaryTile
                  label={tt("Boshlang'ich qoldiq", "Начальный остаток")}
                  value={formatSum(data?.meta.from_balance ?? 0)}
                />
                <SummaryTile
                  label={tt("Kirim", "Приход")}
                  value={formatSum(data?.meta.prixod ?? 0)}
                  tone="success"
                />
                <SummaryTile
                  label={tt("Chiqim", "Расход")}
                  value={formatSum(data?.meta.rasxod ?? 0)}
                  tone="danger"
                />
                <SummaryTile
                  label={tt("Yakuniy qoldiq", "Конечный остаток")}
                  value={formatSum(data?.meta.to_balance ?? 0)}
                />
              </SummaryRow>

              <Paginatsiya
                currentPage={page}
                setCurrentPage={setPage}
                totalPages={data.meta.pageCount}
                limet={limit}
                setLimet={setLimit}
                count={data.meta.count}
              />
            </>
          ) : null
        }
      >
          <Table thead={tableHeaders}>
            {(Array.isArray(data?.data) ? data.data : []).map((r, ind) => (
              <tr
                key={ind}
                className="cursor-pointer font-[500] hover:text-primary transition-colors duration-300 border-b border-border"
              >
                <td className="px-[8px] py-3 border-b border-border">
                  {r.doc_num}
                </td>
                <td className="px-[8px] py-3 border-b border-border">
                  {formatDate(r.doc_date)}
                </td>
                {renderTooltip(r, "tashkilot")}
                {renderTooltip(r, "doer")}
                <td className="px-[8px] py-3 border-b border-border text-right">
                  {formatSum(r.prixod_sum)}
                </td>
                <td className="px-[8px] py-3 border-b border-border text-right">
                  {formatSum(r.rasxod_sum)}
                </td>
                <td className="px-[8px] py-3 border-b border-border">
                  {r.opisanie}
                </td>
              </tr>
            ))}
          </Table>
      </ListCard>
    </div>
  );
};

export default ReportAdmin;
