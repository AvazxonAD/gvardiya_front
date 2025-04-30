import Input from "@/Components/Input";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import { useRequest } from "@/hooks/useRequest";
import { IRasxodFio, RasxodInterface } from "@/interface";
import { RasxodTable } from "@/pageCompoents/rasxod/rasxodTable";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import RasxodFioForPrint from "./print";

export const RasxodFio = () => {
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
    link.setAttribute(
      "download",
      `rasxod-fio-${search.fromDate}-dan-${search.toDate}-gacha.xlsx`
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
    typeof height === "string" ? `calc(${height} - 2303px)` : height - 230;
  const api = useApi();
  const navigate = useNavigate();

  const [forPdf, setForPdf] = useState<{ data: IRasxodFio[] }>();
  const fioRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: fioRef,
  });

  const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const get = await api.get(
      `rasxod/fio/pdf/?from=${search.fromDate}&to=${search.toDate}&account_number_id=${account_number_id}`
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
      <div style={{ minHeight: fullHeight }}>
        {forPdf?.data && (
          <div className=" hidden">
            <RasxodFioForPrint
              ref={fioRef}
              data={forPdf.data}
              fromDate={search.fromDate}
              endDate={search.toDate}
            />
          </div>
        )}
        <div>
          <div className="flex -mt-5 sticky py-5 -top-1 z-[30] bg-mybackground items-center  justify-between">
            <Input disabled={true} v={rasxodmeta?.from_balance} />
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
                <Button
                  mode="add"
                  onClick={() => navigate("/rasxod-workers/create")}
                />
              </div>
            </div>
          </div>
          <RasxodTable data={rasxoddata} getAllFn={getRasxod} source="fio" />
        </div>
      </div>

      {rasxoddata && rasxodmeta ? (
        <div className="sticky bottom-0 z-[30] bg-mybackground">
          {/* Total summary */}
          <div className="mt-3 pt-2 flex items-center justify-between">
            <Input readonly v={rasxodmeta?.to_balance} />
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
