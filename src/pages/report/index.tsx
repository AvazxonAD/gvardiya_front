import Paginatsiya from "@/Components/Paginatsiya";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IReport } from "@/types/report";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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

  // Sana, limit yoki sahifa o'zgarganda hisobot yangilanadi.
  //
  // Ilgari sana uchun alohida effekt bor edi va unda `if (data) return;`
  // turardi — ya'ni birinchi yuklashdan keyin sana oralig'i o'zgartirilsa
  // hisobot UMUMAN yangilanmasdi. Endi bitta joyda boshqariladi va filtr
  // o'zgarganda 1-sahifaga qaytadi.
  usePagedFetch({
    page,
    setPage,
    filters: [limit, startDate, endDate],
    fetch: () => {
      if (!startDate || !endDate) return;
      getData();
    },
  });


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
          <Table
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
                text: tt("Debet", "Дебет"),
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
            {(Array.isArray(data?.data) ? data.data : []).map((r, ind) => (
              <tr
                key={ind}
                className="my-[25px] cursor-pointer font-[500] hover:text-primary transition-colors duration-300 border-b border-border"
              >
                <td className="px-[8px] py-3 border-b border-border">
                  {r.doc_num}
                </td>
                <td className="px-[8px] py-3 border-b border-border">
                  {formatDate(r.doc_date)}
                </td>
                <td className="rasxod-tooltip relative px-[8px] border-b border-border">
                  {r.tashkilot_name}
                  <div className="text-foreground absolute rasxod-tooltip-wrap !top-[0] !left-[100px] w-[300px] z-10 bg-card border-b border-border rounded-md shadow-lg p-3">
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
}

export default ReportUser;
