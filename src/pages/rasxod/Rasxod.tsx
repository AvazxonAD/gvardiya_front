import Input from "@/Components/Input";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface, RasxodPaginationMetaInterface } from "@/interface";
import { RasxodTable } from "@/pageCompoents/rasxod/rasxodTable";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import RasxodForPrint from "./print";

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
  React.useEffect(() => {
    getRasxod();
  }, [limet, currentPage]);

  const handleDownload = () => {
    getRasxod();
  };

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 230px)` : height - 230;
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
    <div>
      <div>
        <div style={{ minHeight: fullHeight }}>
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
          <div className="flex -mt-5 sticky py-5 -top-1 z-[30] bg-mybackground items-center  justify-between">
            <Input disabled={true} v={rasxodmeta?.summa_from} />
            <div className="flex items-center gap-x-[40px]">
              <div className="flex items-center">
                <SpecialDatePicker
                  defaultValue={search.fromDate}
                  onChange={(val) =>
                    setSearch({
                      ...search,
                      fromDate: val,
                    })
                  }
                />
                <h2 className="ms-4 me-8 font-[600]">{tt("dan", "с")}</h2>
                <SpecialDatePicker
                  defaultValue={search.toDate}
                  onChange={(val) =>
                    setSearch({
                      ...search,
                      toDate: val,
                    })
                  }
                />
                <h2 className="ms-4 me-8 font-[600]">{tt("gacha", "до")}</h2>
              </div>
              <div className="">
                <Button mode="download" onClick={handleDownload} />
              </div>
              <div className="flex ms-5 gap-[10px]">
                <Button mode="print" onClick={onPrintClick} />
                <Button
                  mode="download"
                  onClick={handleDownloadExel}
                  text={tt("Excel", "Экcель")}
                />
                <Button mode="add" onClick={() => navigate("/rasxod/create")} />
              </div>
            </div>
          </div>
          <RasxodTable data={rasxoddata} getAllFn={getRasxod} />
        </div>
      </div>

      {rasxoddata && rasxodmeta ? (
        <div className="sticky bottom-0 z-[30] bg-mybackground">
          {/* Total summary */}
          <div className="mt-3 pt-2 flex items-center justify-between">
            <Input readonly v={rasxodmeta.summa_to} />
            <div className="flex items-center gap-x-3">
              <div className="flex items-center gap-x-1">
                <h2 className="font-[700]">
                  {tt("Jami summa", "Итого сумма")}:
                </h2>
                <Input readonly v={rasxodmeta.summa} />
              </div>
            </div>
          </div>
          <div className="">
            <Paginatsiya
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={rasxodmeta?.pageCount}
              limet={limet}
              setLimet={setLimet}
              count={rasxodmeta?.count}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
