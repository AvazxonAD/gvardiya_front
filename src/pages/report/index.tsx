import Input from "@/Components/Input";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IReport } from "@/types/report";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
  data: IReport[];
};

function ReportUser() {
  console.log('find index')
  const [data, setData] = useState<IReportState>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const defDate = useSelector((state: RootState) => state.defaultDate);
  const [startDate, setStartDate] = useState<string>(defDate.startDate);
  const [endDate, setEndDate] = useState<string>(defDate.endDate);
  const account_id = useSelector(
    (state: any) => state.account.account_number_id
  );
  const api = useApi();

  useEffect(() => {
    setStartDate(defDate.startDate);
    setEndDate(defDate.endDate);
  }, [defDate]);

  const getData = async () => {
    const response = await api.get(
      `monitoring/prixod/rasxod/?from=${startDate}&to=${endDate}&account_number_id=${account_id}&page=${page}&limit=${limit}`
    );
    if (response?.success) {
      setData(response as any);
    }
  };

  // Faqat birinchi renderda `startDate` va `endDate` uchun request yuboradi

  // Faqat `page` va `limit` o'zgarganda request yuboradi
  useEffect(() => {
    if (!startDate || !endDate) return;
    getData();
  }, [page, limit]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    if (data) return;
    getData();
  }, [startDate, endDate]);

  const onDownload = () => {
    if (startDate && endDate) {
      getData();
    }
  };

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  return (
    <div>
      <div style={{ minHeight: fullHeight }} className="">
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
            <h2 className="ms-4 me-8 font-[600]">{tt("gacha", "до")}</h2>
            <Button onClick={onDownload} className="ms-8" mode="download" />
          </div>
        </div>
        <div className="">
          <Table
            theadClassName="bg-mytablehead sticky z-10 top-[80px] text-mytextcolor"
            thead={[
              { text: "№", className: "text-left py-3 px-[8px]" },
              {
                text: tt("Sana", "Дата"),
                className: "text-left py-3 px-[8px]",
              },
              {
                text: tt("Tashkilot", "Организация"),
                className: "text-left px-[8px]",
              },
              {
                text: tt("Debit", "Дебет"),
                className: "text-right py-3 px-[8px] w-[200px]",
              },
              {
                text: tt("Kredit", "Кредит"),
                className: "text-right py-3 px-[8px] w-[200px]",
              },
              {
                text: tt("Tavsif", "Описание"),
                className: "text-left py-3 px-[8px] w-[400px]",
              },
            ]}
          >
            {data?.data?.map((r, ind) => (
              <tr
                key={ind}
                className="my-[25px] cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-mytableheadborder"
              >
                <td className="px-[8px] py-3 border-b border-l border-r">
                  {r.doc_num}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r">
                  {formatDate(r.doc_date)}
                </td>
                <td className="rasxod-tooltip relative px-[8px] border-b border-l border-r">
                  {r.tashkilot_name}
                  <div className="text-mytextcolor absolute rasxod-tooltip-wrap !top-[0] !left-[100px] w-[300px] z-10 bg-mybackground border border-mytableheadborder rounded-md shadow-lg p-3">
                    <h2>
                      {tt("Nomi", "Название")}: {r.tashkilot_name}
                    </h2>
                    <h2>
                      {tt("Manzil", "Адрес")}: {r.tashkilot_address}
                    </h2>
                    <h2>
                      {tt("INN", "ИНН")}: {textNum(r.tashkilot_inn, 3)}
                    </h2>
                    <h2>
                      {tt("Hisob raqam", "Номер счета")}:{" "}
                      {textNum(r.tashkilot_account_number, 4)}
                    </h2>
                  </div>
                </td>
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
              <div className="flex items-center">
                {/* <h3 className="font-[600]">{tt("Kirim", "Приход")}</h3> */}
                <div className="w-[198px]">
                  <Input
                    className="w-full border-gray-600"
                    readonly
                    v={data?.meta.prixod}
                  />
                </div>
              </div>
              <div className="flex items-center">
                {/* <h3 className="font-[600]">{tt("Chiqim", "Расход")}</h3> */}
                <div className="w-[198px]">
                  <Input
                    className="w-full border-gray-600"
                    readonly
                    v={data?.meta.rasxod}
                  />
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
}

export default ReportUser;
