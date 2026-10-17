import { usePagedFetch } from "@/hooks/usePagedFetch";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Paginatsiya from "@/Components/Paginatsiya";
import ExportButtons from "@/Components/ExportButtons";
import { reportItems } from "@/Components/ExportMenu";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { useRequest } from "@/hooks/useRequest";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { permBtn, usePermission } from "@/lib/permissions";
import { ContractStatusConfirm, type ContractStatusTarget, cancelBtnProps, useContractStatusAction } from "@/lib/contractStatus";
import CancelledPrixodModal from "./CancelledPrixodModal";
import { IPrixod } from "@/types/prixod";
import { formatDate, formatSum, textNum, toNumber, tt } from "@/utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import { Outlet, useNavigate } from "react-router-dom";
import { Ban, Pencil, Plus, Trash2 } from "lucide-react";
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

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<IPrixod>[] => [
  { header: tt("№", "№"), value: (p) => p.prixod_doc_num, width: 8, align: "center" },
  { header: tt("Shartnoma №", "№ договора"), value: (p) => p.contract_doc_num, align: "center" },
  { header: tt("O‘tkazma sanasi", "Дата проводки"), value: (p) => formatDate(p.prixod_date), align: "center" },
  { header: tt("To'lovchi haqida", "О плательщике"), value: (p) => p.organization_name },
  {
    header: tt("summa", "Сумма"),
    value: (p) => formatSum(p.prixod_summa),
    excelValue: (p) => toNumber(p.prixod_summa) || 0,
    align: "right",
  },
  { header: tt("Tavsiflar", "Описания"), value: (p) => p.opisanie },
];

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
  const perm = usePermission("prixod");

  /* Maydonga yozilgan matn (`searchTerm`) va so'rovga ketadigan matn
     (`query`) ataylab ajratilgan: har bosilgan harfda so'rov yuborilsa,
     javoblar bir-birini quvib yetib, ro'yxat noto'g'ri to'ldirilardi. */
  const [query] = useDebounce(searchTerm.trim(), 400);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listQuery = (p: number, l: number) =>
    `prixod?from=${startDate}&to=${endDate}&account_number_id=${account_number_id}&limit=${l}&page=${p}&search=${encodeURIComponent(query)}` +
    sortParams(sort);

  const fetchPrixod = () => api.get<IPrixodState>(listQuery(currentPage, limet));

  const clearFilters = () => {
    setSearchTerm("");
    resetSort();
    setStartDate(defDate.startDate);
    setEndDate(defDate.endDate);
  };

  /** O'chirishdan keyin ro'yxatni yangilaydi */
  const getData = async () => {
    const get = await fetchPrixod();
    if (get?.success) setData(get as any);
  };

  // Sana yoki qidiruv o'zgarganda ro'yxat yangilanadi va 1-sahifaga qaytadi
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, query, startDate, endDate, sort],
    fetch: () => {
      if (!((startDate && endDate) || query)) return;

      // Kechikkan javob yangisining ustidan yozib yubormasin
      let stale = false;
      fetchPrixod().then((get) => {
        if (!stale && get?.success) setData(get as any);
      });

      return () => {
        stale = true;
      };
    },
  });

  // Bekor qilish: kirim hamma summalardan chiqadi, «Bekor qilinganlar» oynasida qoladi
  const setStatus = useContractStatusAction("prixod");
  const [cancelItem, setCancelItem] = useState<ContractStatusTarget | null>(null);
  const [cancelledOpen, setCancelledOpen] = useState(false);
  const [cancelledCount, setCancelledCount] = useState(0);
  const loadCancelledCount = async () => {
    if (!account_number_id) return;
    const res = await api.get<unknown[]>(`prixod/cancelled?page=1&limit=1&account_number_id=${account_number_id}`);
    if (res?.success) setCancelledCount((res as any).meta?.count ?? 0);
  };
  useEffect(() => {
    loadCancelledCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account_number_id]);
  const refreshAfterStatus = () => {
    getData();
    loadCancelledCount();
  };
  const cancelPrixod = async (p: ContractStatusTarget) => {
    const ok = await setStatus("cancel", p.id, account_number_id);
    if (ok) refreshAfterStatus();
    return ok;
  };

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

  const request = useRequest();
  // Backend hisoboti (Excel) — ⋮ menyuda Excel va xuddi o'sha hisobotning PDF varianti
  const fetchPrixodReport = async (): Promise<Blob> => {
    const response = await request({
      url: "/prixod/export",
      method: "GET",
      params: {
        from: startDate,
        to: endDate,
        account_number_id: account_number_id,
        ...(query ? { search: query } : {}),
        ...(sort ? { sort_by: sort.by, sort_dir: sort.dir } : {}),
      },
      responseType: "blob",
    });
    return response.data;
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        flush
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                p={tt("№, tashkilot yoki tavsif", "№, организация или описание")}
                className="h-9 w-full"
                v={searchTerm}
                change={(e: any) => {
                  setSearchTerm(e.target.value);
                  // Uchinchi sahifada turib qidirilsa, natija bo'sh
                  // sahifaga tushib qolardi
                  setCurrentPage(1);
                }}
                removeValue={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                search
              />
            </div>

            <div className="flex items-center gap-1.5">
              <SpecialDatePicker defaultValue={startDate} onChange={setStartDate} />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker defaultValue={endDate} onChange={setEndDate} />
            </div>

            <FilterActions onRefresh={getData} onClear={clearFilters} />

            <ToolbarSpacer />

            <UIButton
              variant="secondary"
              size="sm"
              onClick={() => setCancelledOpen(true)}
              title={tt("Bekor qilingan kirimlar — ko'rish va qayta faollashtirish", "Отменённые приходы — просмотр и восстановление")}
            >
              <Ban className="text-destructive" />
              {tt("Bekor qilinganlar", "Отменённые")}
              {cancelledCount > 0 && (
                <span className="ml-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-destructive/10 px-1 text-[0.6875rem] font-semibold text-destructive tabular-nums">
                  {cancelledCount}
                </span>
              )}
            </UIButton>

            {/* Backend hisoboti filtr va saralashni hisobga oladi — ro'yxat
                eksporti shart emas: Excel ham, PDF ham o'sha hisobot */}
            <ExportButtons
              kinds={[]}
              extraItems={reportItems({
                key: "prixod",
                fetchBlob: fetchPrixodReport,
                fileName: `prixod-${startDate}-dan-${endDate}-gacha.xlsx`,
              })}
              title={tt("Kirim", "Приход")}
              columns={exportColumns()}
              fetchRows={async () => {
                const get = await api.get<IPrixodState>(listQuery(1, EXPORT_ALL_LIMIT));
                return (get as any)?.data ?? [];
              }}
            />
            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => navigate("/prixod/create")}>
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
            sort={sort}
            onSort={toggleSort}
            thead={[
              {
                className: "w-[3.125rem]",
                sortKey: "prixod_doc_num",
                text: tt("№", "№"),
              },
              {
                className: "w-[12.5rem]",
                sortKey: "contract_doc_num",
                text: tt("Shartnoma №", "№ договора"),
              },
              {
                sortKey: "prixod_date",
                text: tt("O‘tkazma sanasi", "Дата проводки"),
                className: "w-[12.5rem]",
              },
              {
                sortKey: "organization_name",
                text: tt("To'lovchi haqida", "О плательщике"),
                className: "w-[25rem]",
              },
              {
                sortKey: "prixod_summa",
                text: tt("summa", "Сумма"),
                className: "w-[12.5rem]",
              },
              { sortKey: "opisanie", text: tt("Tavsiflar", "Описания") },
              {
                text: tt("Amallar", "Действия"),
                className: "w-[3.125rem]",
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
                          className="absolute bg-card bottom-full mb-0 w-[15.625rem] shadow-lg z-10 rounded-none"
                          style={{
                            top: tooltipPosition.y,
                            left: tooltipPosition.x,
                          }}
                        >
                          <div className="text-[0.8125rem] space-y-1 p-3 text-left bg-card border-b border-border shadow-xl">
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
                      <div className="flex items-center justify-center gap-0.5">
                        <UIButton
                          variant="ghost"
                          size="icon-xs"
                          {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"))}
                          aria-label={tt("Tahrirlash", "Редактировать")}
                          onClick={() => navigate(`/prixod/${p.id}`)}
                        >
                          <Pencil />
                        </UIButton>
                        <UIButton
                          variant="ghost"
                          size="icon-xs"
                          {...cancelBtnProps(perm.update, p.cancel_block, "hover:bg-warning/15 hover:text-warning", "prixod")}
                          aria-label={tt("Bekor qilish", "Отменить")}
                          onClick={() =>
                            setCancelItem({
                              id: p.id,
                              doc_num: p.prixod_doc_num,
                              organization_name: p.organization_name,
                              result_summa: p.prixod_summa,
                              note: `${tt("Shartnoma", "Договор")} № ${p.contract_doc_num}`,
                            })
                          }
                        >
                          <Ban />
                        </UIButton>
                        <UIButton
                          variant="ghost"
                          size="icon-xs"
                          {...permBtn(perm.delete, tt("O'chirish", "Удалить"), "hover:bg-destructive/10 hover:text-destructive")}
                          aria-label={tt("O'chirish", "Удалить")}
                          onClick={() => setOpen(p.id)}
                        >
                          <Trash2 />
                        </UIButton>
                      </div>
                    </td>
                </tr>
              );
            })}
          </Table>
      </ListCard>

      <ContractStatusConfirm
        kind="prixod"
        action="cancel"
        contract={cancelItem}
        onClose={() => setCancelItem(null)}
        onConfirm={cancelPrixod}
      />
      <CancelledPrixodModal
        open={cancelledOpen}
        onClose={() => setCancelledOpen(false)}
        accountNumberId={account_number_id}
        onRestored={refreshAfterStatus}
      />

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
