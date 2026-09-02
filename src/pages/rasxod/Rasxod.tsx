import Paginatsiya from "@/Components/Paginatsiya";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface, RasxodPaginationMetaInterface } from "@/interface";
import { RasxodTable } from "@/pageCompoents/rasxod/rasxodTable";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { formatSum, tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import RasxodForPrint from "./print";
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

export const Rasxod = () => {
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );

  const [search, setSearch] = React.useState({
    fromDate: startDate,
    toDate: endDate,
  });

  useEffect(() => {
    setSearch({ fromDate: startDate, toDate: endDate });
  }, [startDate, endDate]);

  const [rasxoddata, setRasxodData] = React.useState<RasxodInterface[]>([]);
  const [rasxodmeta, setRasxodMeta] =
    React.useState<RasxodPaginationMetaInterface>({
      pageCount: 0,
      count: 0,
      currentPage: 0,
      nextPage: null,
      backPage: null,
      summa_from: "",
      summa_to: "",
      summa: "",
    });

  const [limet, setLimet] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [__, setTotalPages] = useState(1);
  // const [active, setactive] = useState(1);
  const [_, setAll] = useState(10);
  const request = useRequest();
  const dispatch = useDispatch();

  const { account_number_id } = useSelector((state: any) => state.account);
  const getRasxod = async () => {
    try {
      if (!search.fromDate && !search.toDate) return;
      const res = await request.get("/rasxod", {
        params: {
          from: search.fromDate,
          to: search.toDate,
          account_number_id: account_number_id,
          limit: limet,
          page: currentPage,
        },
      });
      if (res.data.success) {
        let paginationmeta = res.data.meta as RasxodPaginationMetaInterface;
        setRasxodData(res.data.data);
        setTotalPages(paginationmeta.pageCount);
        setAll(paginationmeta.count);
        setRasxodMeta(res.data.meta);
      }
    } catch (error) {
      dispatch(
        alertt({
          //@ts-ignore
          text: error.response.data.message || error.message,
        })
      );
    }
  };
  const handleDownloadExel = async () => {
    const response = await request({
      url: "/rasxod/export",
      method: "GET",
      params: {
        from: search.fromDate,
        to: search.toDate,
        account_number_id: account_number_id,
        limit: limet,
        page: currentPage,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `rasxod-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    // link.href = url;
    // link.setAttribute("download", "rasxod.xlsx");
    // document.body.appendChild(link);
    // link.click();
  };
  // Sana oralig'i o'zgarganda ro'yxat o'zi yangilanadi
  React.useEffect(() => {
    getRasxod();
  }, [limet, currentPage, search.fromDate, search.toDate]);

  const navigate = useNavigate();
  const api = useApi();

  const [forPdf, setForPdf] = useState<{ data: RasxodInterface[] }>();
  const fioRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: fioRef,
  });
  const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const get = await api.get(
      `rasxod/pdf/?from=${search.fromDate}&to=${search.toDate}&account_number_id=${account_number_id}`
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

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {forPdf?.data && (
        <div className="hidden">
          <RasxodForPrint
            ref={fioRef}
            data={forPdf.data}
            fromDate={search.fromDate}
            endDate={search.toDate}
          />
        </div>
      )}

      <ListCard
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker
                defaultValue={search.fromDate}
                onChange={(val) => setSearch({ ...search, fromDate: val })}
              />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker
                defaultValue={search.toDate}
                onChange={(val) => setSearch({ ...search, toDate: val })}
              />
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
            <UIButton size="sm" onClick={() => navigate("/rasxod/create")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          rasxoddata && rasxodmeta ? (
            <>
              {/* Faqat tanlangan sana oralig'idagi yig'indi kerak —
                  boshlang'ich va yakuniy qoldiq bu yerda ko'rsatilmaydi */}
              <SummaryRow className="sm:grid-cols-1 lg:grid-cols-1">
                <SummaryTile
                  label={tt("Davr bo'yicha chiqim", "Расход за период")}
                  value={formatSum(rasxodmeta.summa ?? 0)}
                  tone="primary"
                />
              </SummaryRow>

              <Paginatsiya
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={rasxodmeta?.pageCount}
                limet={limet}
                setLimet={setLimet}
                count={rasxodmeta?.count}
              />
            </>
          ) : null
        }
      >
        <RasxodTable data={rasxoddata} getAllFn={getRasxod} />
      </ListCard>
    </div>
  );
};
