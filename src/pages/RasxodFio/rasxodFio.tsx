import Paginatsiya from "@/Components/Paginatsiya";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { IRasxodFio, RasxodInterface } from "@/interface";
import { RasxodFIOTable } from "@/pageCompoents/rasxod/rasxodFioTable";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { formatSum, tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import RasxodFioForPrint from "./print";
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

export const RasxodFio = () => {
  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const [search, setSearch] = React.useState({
    fromDate: startDate,
    toDate: endDate,
  });

  useEffect(() => {
    setSearch({ fromDate: startDate, toDate: endDate });
  }, [startDate, endDate]);

  const [rasxoddata, setRasxodData] = React.useState<RasxodInterface[]>([]);
  const [rasxodmeta, setRasxodMeta] = React.useState<any>({});

  const [limet, setLimet] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [_, setTotalPages] = useState(1);
  // const [active, setactive] = useState(1);
  const [__, setAll] = useState(10);
  const request = useRequest();
  const dispatch = useDispatch();

  const { account_number_id } = useSelector((state: any) => state.account);

  const getRasxod = async () => {
    try {
      if (!search.fromDate && !search.toDate) return;
      const res = await request.get("/rasxod/fio", {
        params: {
          from: search.fromDate,
          to: search.toDate,
          account_number_id: account_number_id,
          limit: limet,
          page: currentPage,
        },
      });
      if (res.data.success) {
        let paginationmeta = res.data.meta;
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
      // url: "/rasxod/export",
      url: "/rasxod/fio/export",
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
    link.setAttribute("download", `rasxod-fio-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    // link.href = url;
    // link.setAttribute("download", "rasxod.xlsx");
    // document.body.appendChild(link);
    // link.click();
  };

  const handleUmumiyHisobot = async () => {
    const response = await request({
      url: "/rasxod/fio/umumiy-hisobot",
      method: "GET",
      params: {
        from: search.fromDate,
        to: search.toDate,
        account_number_id: account_number_id,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `umumiy-hisobot-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Sana oralig'i o'zgarganda ro'yxat yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, search.fromDate, search.toDate],
    fetch: getRasxod,
  });

  const api = useApi();
  const navigate = useNavigate();

  const [forPdf, setForPdf] = useState<{ data: IRasxodFio[] }>();
  const fioRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: fioRef,
  });

  const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const get = await api.get(`rasxod/fio/pdf/?from=${search.fromDate}&to=${search.toDate}&account_number_id=${account_number_id}`);
    if (get?.success) {
      setForPdf(get.data as any);
    }
  };

  useEffect(() => {
    if (forPdf) {
      reactToPrintFn();
    }
  }, [forPdf]);

  const TILES: { label: string; key: keyof typeof rasxodmeta; tone?: "primary" | "success" }[] = [
    { label: tt("Jami (100%)", "Всего (100%)"), key: "summa", tone: "primary" },
    { label: tt("Boshqarma uchun (10%)", "Для управления (10%)"), key: "summa_10" },
    { label: tt("Qolgan jami (90%)", "Остаток всего (90%)"), key: "summa_remaining" },
    { label: tt("Moddiy bazaga (65%)", "На материальную базу (65%)"), key: "summa_65" },
    { label: tt("I va II guruh xarajatlari (25%)", "Расходы I и II группы (25%)"), key: "summa_25" },
    { label: tt("Shaxsiy tarkibga taqsimlandi", "Распределено личному составу"), key: "summa_1_25" },
    { label: tt("Yagona ijtimoiy soliq (25%)", "Единый социальный налог (25%)"), key: "summa_25_2" },
    { label: tt("Daromad solig'i (12%)", "Налог на доходы (12%)"), key: "summa_12" },
    { label: tt("Plastik kartaga o'tkazildi", "Перечислено на пластиковую карту"), key: "worker_summa", tone: "success" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {forPdf?.data && (
        <div className="hidden">
          <RasxodFioForPrint
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
            <UIButton variant="secondary" size="sm" onClick={handleUmumiyHisobot}>
              <FileSpreadsheet />
              {tt("Umumiy hisobot", "Общий отчёт")}
            </UIButton>
            <UIButton size="sm" onClick={() => navigate("/rasxod-workers/create")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          rasxoddata && rasxodmeta ? (
            <>
              <SummaryRow className="lg:grid-cols-3 xl:grid-cols-5">
                {TILES.map((t) => (
                  <SummaryTile
                    key={String(t.key)}
                    label={t.label}
                    tone={t.tone}
                    value={formatSum((rasxodmeta as any)[t.key] ?? 0)}
                  />
                ))}
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
        <RasxodFIOTable data={rasxoddata} getAllFn={getRasxod} source="fio" />
      </ListCard>
    </div>
  );
};
