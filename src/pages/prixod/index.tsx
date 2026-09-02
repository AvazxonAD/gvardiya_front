import Icon from "@/assets/icons";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IPrixod } from "@/types/prixod";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PrixodForPrint from "./print";
import {
  FileSpreadsheet,
  Plus,
  Printer,
} from "lucide-react";
import {
  Button as UIButton,
  ListCard,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

export const RenderPrixod = () => {
  return (
    <div className="min-w-0">
      <Outlet />
    </div>
  );
};

type IPrixodState = {
  meta?: {
    from_balance: string;
    to_balance: string;
    summa: string;
    count: number;
    pageCount: number;
  };
  data?: IPrixod[];
};

const Prixod = () => {
  const [data, setData] = useState<IPrixodState>();
  const defDate = useSelector((state: RootState) => state.defaultDate);
  const [startDate, setStartDate] = useState<string>(defDate.startDate);
  const [endDate, setEndDate] = useState<string>(defDate.endDate);
  const [open, setOpen] = useState<number>(0);
  const [showTooltipId, setShowTooltipId] = useState<number>(0);
  const [limet, setLimet] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const { account_number_id } = useSelector((state: any) => state.account);
  const api = useApi();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setStartDate(defDate.startDate);
    setEndDate(defDate.endDate);
  }, [defDate]);

  const navigate = useNavigate();
  const getData = async () => {
    const get = await api.get<IPrixodState>(
      `prixod?from=${startDate}&to=${endDate}&account_number_id=${account_number_id}&limit=${limet}&page=${currentPage}&search=${searchTerm}`
    );
    if (get?.success) {
      setData(get as any);
    }
  };

  // Sana yoki qidiruv o'zgarganda ro'yxat o'zi yangilanadi
  useEffect(() => {
    if ((startDate && endDate) || searchTerm) {
      getData();
    }
  }, [currentPage, limet, searchTerm, startDate, endDate]);

  const handleDelete = async () => {
    const remove: any = await api.remove(
      `prixod/${open}?account_number_id=${account_number_id}`
    );
    if (remove?.success) {
      setOpen(0);
      alertt({
        text: tt("Muvaffaqiyatli bajarildi", "Успешно выполнено"),
        success: true,
      });
      getData();
    } else {
      dispatch(
        alertt({
          text: remove?.error || "Error",
          success: false,
        })
      );
    }
  };

  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (event: React.MouseEvent, id: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setShowTooltipId(id);
  };

  const [forPdf, setForPdf] = useState<{ data: IPrixod[] }>();
  const fioRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: fioRef,
  });
  const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const get = await api.get(
      `prixod/pdf/?from=${startDate}&to=${endDate}&account_number_id=${account_number_id}`
    );
    if (get?.success) {
      setForPdf(get.data as any);
    }
  };
  useEffect(() => {
    if (forPdf) {
      reactToPrintFn();
    }
  }, [forPdf]);

  const request = useRequest();
  const handleDownloadExel = async () => {
    const response = await request({
      url: "/prixod/export",
      method: "GET",
      params: {
        from: startDate,
        to: endDate,
        account_number_id: account_number_id,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `prixod-${startDate}-dan-${endDate}-gacha.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {forPdf?.data && (
        <div className="hidden">
          <PrixodForPrint
            ref={fioRef}
            data={forPdf.data}
            fromDate={startDate}
            endDate={endDate}
          />
        </div>
      )}

      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                p={tt("Qidirish", "Поиск")}
                className="h-9 w-full"
                v={searchTerm}
                change={(e: any) => setSearchTerm(e.target.value)}
                removeValue={() => setSearchTerm("")}
                search
              />
            </div>

            <div className="flex items-center gap-1.5">
              <SpecialDatePicker defaultValue={startDate} onChange={setStartDate} />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker defaultValue={endDate} onChange={setEndDate} />
            </div>

            <ToolbarSpacer />

            <UIButton variant="secondary" size="sm" onClick={onPrintClick}>
              <Printer />
              {tt("Chop etish", "Печать")}
            </UIButton>
            <UIButton variant="secondary" size="sm" onClick={handleDownloadExel}>
              <FileSpreadsheet />
              Excel
            </UIButton>
            <UIButton size="sm" onClick={() => navigate("/prixod/create")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          data ? (
            <>
              {/* Faqat tanlangan sana oralig'idagi yig'indi kerak —
                  boshlang'ich va yakuniy qoldiq bu yerda ko'rsatilmaydi */}
              <SummaryRow className="sm:grid-cols-1 lg:grid-cols-1">
                <SummaryTile
                  label={tt("Davr bo'yicha kirim", "Приход за период")}
                  value={formatSum(data?.meta?.summa ?? 0)}
                  tone="success"
                />
              </SummaryRow>

              <Paginatsiya
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={data.meta?.pageCount}
                limet={limet}
                setLimet={setLimet}
                count={data.meta?.count}
              />
            </>
          ) : null
        }
      >
          <Table
            thead={[
              {
                className: "w-[50px]",
                text: tt("№", "№"),
              },
              {
                className: "w-[200px]",
                text: tt("Shartnoma №", "Договор №"),
              },
              {
                text: tt("O‘tkazma sanasi", "Дата проводки"),
                className: "w-[200px]",
              },
              {
                text: tt("To'lovchi haqida", "О плательщике"),
                className: "w-[400px]",
              },
              {
                text: tt("summa", "Сумма"),
                className: "w-[200px]",
              },
              { text: tt("Tavsiflar", "Описания") },
              {
                text: tt("Amallar", "Действие"),
                className: "w-[50px]",
              },
            ]}
          >
            {data?.data?.map((p, ind) => {
              return (
                <tr key={p.id ?? ind} className="font-[600]">
                    <td className="border-b border-border px-1 py-3 text-center">
                      {p.prixod_doc_num}
                    </td>
                    <td className="border-b border-border px-1 py-3 text-center">
                      {p.contract_doc_num}
                    </td>
                    <td className="border-b border-border px-1 py-3 text-center">
                      {formatDate(p.prixod_date)}
                    </td>
                    <td
                      className="border-b border-border px-1 py-3 text-center cursor-pointer"
                      onMouseEnter={(e) => handleMouseEnter(e, p.id)}
                      onMouseLeave={() => setShowTooltipId(0)}
                    >
                      <h3>{p.organization_name}</h3>
                      {showTooltipId === p.id && (
                        <div
                          className="absolute bg-card bottom-full mb-0 w-[250px] shadow-lg z-10 rounded-none"
                          style={{
                            top: tooltipPosition.y,
                            left: tooltipPosition.x,
                          }}
                        >
                          <div className="text-[13px] space-y-1 p-3 text-left bg-card border-b border-border shadow-xl">
                            <h2>
                              {tt("Nomi", "Название")}: {p.organization_name}
                            </h2>
                            <h2>
                              {tt("Manzil", "Адрес")}: {p.organization_address}
                            </h2>
                            <h2>
                              {tt("INN", "ИНН")}:{" "}
                              {textNum(p.organization_str, 3)}
                            </h2>
                            <h2>
                              {tt("Hisob raqam", "Номер счета")}:{" "}
                              {textNum(p.organization_account_number, 4)}
                            </h2>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border-b border-border px-1 py-3 text-right">
                      {formatSum(p.prixod_summa)}
                    </td>
                    <td className="border-b border-border px-1 py-3">
                      {p.opisanie}
                    </td>
                    <td className="border-b border-border px-1 py-3">
                      <div className="flex justify-center items-center gap-x-2">
                        <button onClick={() => setOpen(p.id)}>
                          <Icon name="delete" />
                        </button>
                        <button onClick={() => navigate(`/prixod/${p.id}`)}>
                          <Icon name="pencil" />
                        </button>
                      </div>
                    </td>
                </tr>
              );
            })}
          </Table>
      </ListCard>

      <Modal
        open={Boolean(open)}
        closeModal={() => setOpen(0)}
        title={tt("Sizning ishonchingiz komilmi?", "Вы уверены?")}
      >
        <div className="flex items-center gap-x-2 justify-center">
          <Button mode="cancel" onClick={() => setOpen(0)} />
          <Button mode="delete" onClick={handleDelete} />
        </div>
      </Modal>
    </div>
  );
};

export default Prixod;
