/** @format */

import { useEffect, useRef, useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Input from "../../Components/Input";
import Paginatsiya from "../../Components/Paginatsiya";
import { alertt } from "../../Redux/LanguageSlice";
import { PayCont, deleteCont, getSpr, getCont } from "../../api";
import ContTab, { contExportColumns } from "../../pageCompoents/ContTab";
import { formatSum, tt } from "../../utils";
import Modal from "@/Components/Modal";
import ExportButtons from "@/Components/ExportButtons";
import { reportItems } from "@/Components/ExportMenu";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { EXPORT_ALL_LIMIT } from "@/lib/tableExport";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import Button from "@/Components/reusable/button";
import { RootState } from "@/Redux/store";
import { useRequest } from "@/hooks/useRequest";
import { useDebounce } from "use-debounce";
import Select from "../../Components/Select";
import {
  Loader2,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { permBtn, usePermission } from "@/lib/permissions";
import {
  DebtBreakdown,
  DebtBreakdownStrip,
  PAYMENT_DUE_DAYS,
  debtStatusOptions,
} from "@/lib/debtStatus";
import {
  Button as UIButton,
  Label,
  ListCard,
  Select as UISelect,
  Skeleton,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

function ContractHome() {
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );
  const navigate = useNavigate();
  const perm = usePermission("contract");
  const [data, setData] = useState([]);
  const JWT = useSelector((s: any) => s.auth.jwt);
  const [open, setOpen] = useState(false);

  const [batalonOpen, setBatalonOpen] = useState(false);
  const [batalons, setBatalons] = useState([]);
  const [selectedBatalon, setSelectedBatalon] = useState("");
  const [batalonKind, setBatalonKind] = useState<"excel" | "pdf">("excel");

  // const [searchId, setSearchID] = useState(0);
  const [value, setValue] = useState("");
  const [searchText] = useDebounce(value.trim(), 500);
  // const [value2, setValue2] = useState();
  const dispatch = useDispatch();
  const [limet, setLimet] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [active, setactive] = useState(1);
  const [all, setAll] = useState(10);
  const [status, setStatus] = useState("");
  const [statusSumma, setStatusSumma] = useState("");
  const [rasxodStatus, setRasxodStatus] = useState("");
  // To'lov muddati holati: not_due | late | overdue (lib/debtStatus)
  const [debtStatus, setDebtStatus] = useState("");
  const [debtBreakdown, setDebtBreakdown] = useState<Partial<DebtBreakdown>>({});
  const debtParam = debtStatus ? `&debt-status=${debtStatus}` : "";
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();
  const [balance, setBalance] = useState({
    internal_summa: 0,
    debet_summa: 0,
    kredit_summa: 0,
    rasxod_summa: 0,
  });
  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });

  useEffect(() => {
    setDates({ date1: startDate, date2: endDate });
  }, [startDate, endDate]);

  const [tushum, setTushum] = useState<any>({
    summa: "",
    date: dates.date2,
  });
  const [openSelect, setOpenSelect] = useState(false);
  //getAll
  //@ts-ignore
  const account_id = useSelector((state) => state.account.account_number_id);

  const [loading, setLoading] = useState(true);
  // Filtrlar tez-tez almashtirilsa, oldingi so'rov keyinroq qaytib yangi
  // natijani ustidan yozib yuborardi. Faqat eng oxirgi so'rov javobi olinadi.
  const requestId = useRef(0);

  const getInfo = async (dates?: any) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await getCont(
        JWT,
        dates,
        currentPage,
        limet,
        // value,
        searchText,
        account_id,
        0,
        status,
        statusSumma,
        rasxodStatus,
        sortParams(sort) + debtParam
      );
      if (id !== requestId.current || !res?.meta) return;
      setDebtBreakdown(res.meta.debt_by_status || {});
      setData(res.data);
      setTotalPages(res.meta.pageCount);
      setAll(res.meta.count);
      setBalance({
        debet_summa: res.meta.debet_summa,
        kredit_summa: res.meta.kredit_summa,
        internal_summa: res.meta.internal_summa,
        rasxod_summa: res.meta.rasxod_summa,
      });
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  // Filtrlar o'zgarishi bilan ro'yxat o'zi yangilanadi — alohida
  // "Yuklash" tugmasi kerak emas. Filtr o'zgarsa 1-sahifaga qaytadi:
  // aks holda 5-sahifada turib filtr qo'yilsa, natija kamayib, bo'sh
  // sahifa ko'rinardi.
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [
      limet,
      searchText,
      account_id,
      status,
      statusSumma,
      rasxodStatus,
      debtStatus,
      dates.date1,
      dates.date2,
      sort,
    ],
    fetch: () => getInfo(dates),
  });

  // Qidiruv, filtrlar, sana va saralash boshlang'ich holatga qaytadi —
  // ro'yxat `usePagedFetch` orqali o'zi qayta olinadi
  // Filtrlar paneli "Filtrlar" tugmasi bilan ochiladi; holati eslab qolinadi
  const [filtersOpen, setFiltersOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem("contract.filtersOpen") === "1";
    } catch {
      return false;
    }
  });
  const toggleFilters = () =>
    setFiltersOpen((prev) => {
      try {
        localStorage.setItem("contract.filtersOpen", prev ? "0" : "1");
      } catch {
        /* saqlab bo'lmasa ham ishlayveradi */
      }
      return !prev;
    });
  // Panel yopiq bo'lsa ham qancha filtr qo'yilgani ko'rinib tursin
  const activeFilterCount =
    [status, statusSumma, debtStatus, rasxodStatus].filter(Boolean).length +
    (dates.date1 !== startDate || dates.date2 !== endDate ? 1 : 0);

  const clearFilters = () => {
    setDates({ date1: startDate, date2: endDate });
    setValue("");
    setStatus("");
    setStatusSumma("");
    setRasxodStatus("");
    setDebtStatus("");
    resetSort();
  };

  const deleteInfo = async () => {
    const res = await deleteCont(JWT, active, account_id);

    if (res.success) {
      getInfo(dates);
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );
    } else {
      dispatch(
        alertt({
          text: res.message,
          success: false,
        })
      );
    }
  };

  const setInfoToTushum = async () => {
    const res = await PayCont(tushum, JWT, active);

    if (res.success) {
      getInfo(dates);
      setOpen(false);
      dispatch(
        alertt({
          success: true,
          text: res.message,
        })
      );
    } else {
      dispatch(
        alertt({
          success: false,
          text: res.message,
        })
      );
    }
  };
  const handleCreateTushum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setInfoToTushum();
  };

  const request = useRequest();
  const { account_number_id } = useSelector((state: any) => state.account);

  // Backend hisobotlari (Excel fayl) — ⋮ menyuda Excel va PDF (o'sha hisobot)
  const reportName = `contract-${dates.date1}-dan-${dates.date2}-gacha.xlsx`;

  const fetchContractReport = async (): Promise<Blob> => {
    const response = await request({
      url: "/contract/export",
      method: "GET",
      params: {
        from: dates.date1,
        to: dates.date2,
        account_number_id: account_number_id,
      },
      responseType: "blob",
    });
    return response.data;
  };

  const getBatalyons = async () => {
    const res = await getSpr(JWT, "batalon");

    if (res?.data && res?.success) {
      const prepareData = res.data.map((d: any) => ({
        ...d,
        value: d.id,
        label: d.name,
      }));

      setBatalons(prepareData);
    }
  };

  const fetchBatalonReport = async (): Promise<Blob> => {
    const response = await request({
      url: "/contract/export/batalon",
      method: "GET",
      params: {
        from: dates.date1,
        to: dates.date2,
        account_number_id: account_number_id,
        batalon_id: selectedBatalon,
      },
      responseType: "blob",
    });
    return response.data;
  };

  const batalonReportItems = () =>
    reportItems({
      key: "contract-batalon",
      name: tt("Batalon bo'yicha shartnomalar", "Договоры по батальону"),
      fetchBlob: fetchBatalonReport,
      fileName: reportName,
    });

  return (
    <div className="flex flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                v={value}
                change={(e: any) => setValue(e.target.value)}
                search={true}
                p={tt("№, tashkilot, INN, manzil yoki batalon", "№, организация, ИНН, адрес или батальон")}
                className="h-9 w-full"
              />
            </div>

            <UIButton
              variant={filtersOpen ? "secondary" : "outline"}
              size="sm"
              onClick={toggleFilters}
              aria-expanded={filtersOpen}
              aria-controls="contract-filters"
              className={cn(filtersOpen && "border-primary text-primary")}
            >
              <SlidersHorizontal />
              {tt("Filtrlar", "Фильтры")}
              {activeFilterCount > 0 && (
                <span className="ml-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold text-primary-foreground tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </UIButton>

            <FilterActions onRefresh={() => getInfo(dates)} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              extraItems={[
                ...reportItems({
                  key: "contract-all",
                  name: tt("Shartnomalar hisoboti", "Отчёт по договорам"),
                  fetchBlob: fetchContractReport,
                  fileName: reportName,
                }),
                // Batalon hisoboti: avval batalon tanlanadi (modal), so'ng yuklanadi
                ...batalonReportItems().map((it, i) => ({
                  ...it,
                  run: async () => {
                    setBatalonKind(i === 0 ? "excel" : "pdf");
                    await getBatalyons();
                    setBatalonOpen(true);
                  },
                })),
              ]}
              title={tt("Shartnoma", "Договор")}
              columns={contExportColumns()}
              fetchRows={async () => {
                const res = await getCont(
                  JWT,
                  dates,
                  1,
                  EXPORT_ALL_LIMIT,
                  searchText,
                  account_id,
                  0,
                  status,
                  statusSumma,
                  rasxodStatus,
                  sortParams(sort) + debtParam
                );
                return res?.data ?? [];
              }}
            />

            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => navigate("/contract/add")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>

            {/* Filtrlar paneli — "Filtrlar" tugmasi bosilganda ochiladi */}
            {filtersOpen && (
              <div
                id="contract-filters"
                className="grid w-full basis-full grid-cols-1 gap-3 rounded-md border border-border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="cf-status">{tt("Bajarilish holati", "Статус выполнения")}</Label>
                  <UISelect
                    id="cf-status"
                    selectSize="sm"
                    placeholder={tt("Barchasi", "Все")}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "done", label: tt("Bajarilgan", "Выполнено") },
                      { value: "not_done", label: tt("Bajarilmagan", "Не выполнено") },
                    ]}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="cf-statusSumma">{tt("To'lov holati", "Статус оплаты")}</Label>
                  <UISelect
                    id="cf-statusSumma"
                    selectSize="sm"
                    placeholder={tt("Barchasi", "Все")}
                    value={statusSumma}
                    onChange={(e) => setStatusSumma(e.target.value)}
                    options={[
                      { value: "debet", label: tt("To'langan", "Оплачено") },
                      { value: "kredit", label: tt("To'lanmagan", "Не оплачено") },
                    ]}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="cf-debtStatus">{tt("To'lov muddati", "Срок оплаты")}</Label>
                  <UISelect
                    id="cf-debtStatus"
                    selectSize="sm"
                    placeholder={tt("Barchasi", "Все")}
                    title={tt(
                      `Qarzning to'lov muddati holati (to'lov tadbirdan ${PAYMENT_DUE_DAYS} kun oldin)`,
                      `Статус срока оплаты долга (оплата за ${PAYMENT_DUE_DAYS} дня до мероприятия)`
                    )}
                    value={debtStatus}
                    onChange={(e) => setDebtStatus(e.target.value)}
                    options={debtStatusOptions()}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="cf-rasxodStatus">{tt("Chiqim holati", "Статус расхода")}</Label>
                  <UISelect
                    id="cf-rasxodStatus"
                    selectSize="sm"
                    placeholder={tt("Barchasi", "Все")}
                    value={rasxodStatus}
                    onChange={(e) => setRasxodStatus(e.target.value)}
                    options={[
                      { value: "spent", label: tt("Sarflangan", "Потрачено") },
                      { value: "not_spent", label: tt("Sarflanmagan", "Не потрачено") },
                    ]}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label>{tt("Sanadan", "С даты")}</Label>
                  <SpecialDatePicker
                    defaultValue={dates.date1}
                    onChange={(e) => setDates({ ...dates, date1: e })}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label>{tt("Sanagacha", "По дату")}</Label>
                  <SpecialDatePicker
                    defaultValue={dates.date2}
                    onChange={(e) => setDates({ ...dates, date2: e })}
                  />
                </div>
              </div>
            )}
          </Toolbar>
        }
        footer={
          data ? (
            <>
              <SummaryRow>
                <SummaryTile
                  label={tt("Hisoblangan summa", "Начисленная сумма")}
                  value={formatSum(balance.internal_summa) || "0"}
                />
                <SummaryTile
                  label={tt("Kelib tushgan summa", "Поступившая сумма")}
                  value={formatSum(balance.debet_summa) || "0"}
                  tone="success"
                />
                <SummaryTile
                  label={tt("Debitor qarzdorlik", "Дебиторская задолженность")}
                  value={formatSum(balance.kredit_summa) || "0"}
                  tone="danger"
                />
                <SummaryTile
                  label={tt("Chiqim summasi", "Сумма расхода")}
                  value={formatSum(balance.rasxod_summa) || "0"}
                />
              </SummaryRow>

              {/* Debitor qarzdorlik to'lov muddati bo'yicha — bosilsa filtr qo'yiladi */}
              <DebtBreakdownStrip
                className="px-3 pt-2 sm:px-4"
                data={debtBreakdown}
                active={debtStatus}
                onSelect={(s) => setDebtStatus((prev) => (prev === s ? "" : s))}
              />

              <Paginatsiya
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                limet={limet}
                setLimet={setLimet}
                count={all}
              />
            </>
          ) : null
        }
      >
        {loading && data.length === 0 ? (
          <div className="flex flex-col gap-2 p-3 sm:p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <div className="relative" aria-busy={loading}>
            <div
              className={cn(
                "transition-opacity",
                loading && "pointer-events-none opacity-50"
              )}
            >
              <ContTab
                data={data}
                handleDelete={deleteInfo}
                setActive={setactive}
                sort={sort}
                onSort={toggleSort}
              />
            </div>
            {loading && (
              <div className="absolute inset-x-0 top-0 flex justify-center pt-16">
                <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[0.8125rem] text-muted-foreground shadow-sm">
                  <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                  {tt("Yuklanmoqda...", "Загрузка...")}
                </div>
              </div>
            )}
          </div>
        )}
      </ListCard>

      <Modal
        open={open}
        closeModal={() => setOpen(false)}
        title={tt("Tushumlar", "Поступления")}
      >
        <form onSubmit={handleCreateTushum} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 text-[0.75rem] leading-[0.9075rem] font-[600] text-muted-foreground">
            <SpecialDatePicker
              defaultValue={tushum.date}
              onChange={(e: any) => setTushum({ ...tushum, date: e })}
              label={tt("Tushum vaqti", "Время поступления")}
            />
          </div>
          <Input
            v={tushum.summa}
            t={"number"}
            change={(e: any) =>
              setTushum({ ...tushum, summa: +e.target.value })
            }
            tush
            p={tt("Summa kiriting", "Введите сумму")}
            label={tt("Summasi (so'm)", "Сумма (сум)")}
          />

          <div className="mt-5 flex justify-end">
            <Button mode="save" type="submit" />
          </div>
        </form>
      </Modal>

      <Modal
        open={batalonOpen}
        closeModal={() => setBatalonOpen(false)}
        title={tt("Batalonni tanlang", "Выберите батальон")}
        w="380px"
      >
        <section
          className={`${openSelect ? "h-[18.75rem]" : ""
            } flex flex-col items-center justify-start`}
        >
          <div className="w-[18.75rem] mb-4">
            <Select
              data={batalons}
              value={selectedBatalon}
              onChange={(e: any) => setSelectedBatalon(e)}
              p={tt("Batalonni tanlang", "Выберите батальон")}
              setOpenProps={setOpenSelect}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              mode="clear"
              onClick={() => setBatalonOpen(false)}
              text={tt("Bekor qilish", "Отмена")}
            />
            <Button
              mode="download"
              text={
                batalonKind === "pdf"
                  ? tt("PDF formatda yuklab olish", "Скачать в формате PDF")
                  : tt("Excel formatda yuklab olish", "Скачать в формате Excel")
              }
              onClick={async () => {
                if (!selectedBatalon) return;
                const [excelItem, pdfItem] = batalonReportItems();
                try {
                  await (batalonKind === "pdf" ? pdfItem : excelItem).run();
                  setBatalonOpen(false);
                } catch {
                  dispatch(
                    alertt({
                      success: false,
                      text: tt("Faylni yuklab bo'lmadi", "Не удалось скачать файл"),
                    })
                  );
                }
              }}
            />
          </div>
        </section>
      </Modal>
    </div>
  );
}

export default ContractHome;
