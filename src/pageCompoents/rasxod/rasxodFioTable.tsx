import DeleteModal from "@/Components/DeleteModal";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatInn, formatNum, textNum, tt } from "@/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import ExportMenu, { reportItems, type ExportMenuItem } from "@/Components/ExportMenu";
import { Button } from "@/ui";
import Table, { ITheadItem } from "../../Components/reusable/table/Table";
import { getExcel } from "@/api";
import { permBtn, usePermission } from "@/lib/permissions";
import type { SortState } from "@/hooks/useTableSort";
import ScreenLoader from "@/Components/ScreenLoader";

interface RasxodTableProps {
    data: RasxodInterface[];
    getAllFn: () => void;
    source?: string;
    /** Backend saralash (ixtiyoriy) */
    sort?: SortState;
    onSort?: (key: string) => void;
}

export const RasxodFIOTable: React.FC<RasxodTableProps> = ({ data, getAllFn, source, sort, onSort }) => {
    const [activeDeleteModal, setActiveDeleteModal] = useState(false);
    const [activeId, setActiveId] = useState(0);
    const [screenLoader, setScreenLoader] = useState(false);

    const request = useRequest();
    const { account_number_id } = useSelector((state: any) => state.account);
    const JWT = useSelector((s: any) => s.auth.jwt);
    const dispatch = useDispatch();
    // "fio" — hodimlar hisob-kitobi, aks holda chiqimlar kitobi
    const perm = usePermission(source === "fio" ? "rasxod_workers" : "rasxod");

    // 13 ta ustun bitta ekranga sig'ishi kerak: shrift kichik, sarlavhalar
    // esa `whitespace-normal` bilan ikki qatorga tushadi — shunda ustun
    // kengligini uzun sarlavha emas, raqamning o'zi belgilaydi.
    const NUM = "whitespace-normal text-center text-[0.5625rem] leading-[1.15]";
    const tableHeaders: ITheadItem[] = [
        { sortKey: "doc_num", text: "\u2116", className: "w-[1.875rem] text-center text-[0.5625rem]" },
        { sortKey: "doc_date", text: tt("Sana", "Дата"), className: "w-[3.625rem] text-center text-[0.5625rem]" },
        // `w-` emas `min-w-`: joy bo'lsa (katta monitor) ustun kengayadi va
        // batalon nomi so'zma-so'z ustunga tizilib ketmaydi
        { sortKey: "batalon_name", text: tt("Qabul qiluvchi", "Получатель"), className: "min-w-[2.75rem] whitespace-normal text-center text-[0.5625rem] leading-[1.15]" },
        { sortKey: "summa", text: tt("Jami (100%)", "Всего (100%)"), className: NUM },
        { sortKey: "summa_10", text: tt("Boshqarma (10%)", "Управление (10%)"), className: NUM },
        { sortKey: "summa_remaining", text: tt("Qolgan (90%)", "Остаток (90%)"), className: NUM },
        { sortKey: "summa_65", text: tt("Moddiy baza (75%)", "Материальная база (75%)"), className: NUM },
        { sortKey: "summa_25", text: tt("I-II guruh (25%)", "I-II группы (25%)"), className: NUM },
        { sortKey: "summa_1_25", text: tt("Shaxsiy tarkib", "Личный состав"), className: NUM },
        { sortKey: "summa_25_2", text: tt("Ijtimoiy soliq (25%)", "Социальный налог (25%)"), className: NUM },
        { sortKey: "summa_12", text: tt("Daromad solig'i (12%)", "Налог на доходы (12%)"), className: NUM },
        { sortKey: "worker_summa", text: tt("Kartaga o'tkazildi", "Перечислено на карту"), className: NUM },
        { text: tt("Amallar", "Действия"), className: "w-[6.25rem] whitespace-normal text-center text-[0.5625rem] leading-[1.15]" },
    ];

    const handleRemove = async () => {
        try {
            setScreenLoader(true);
            const res = await request.delete(`/rasxod${source === "fio" ? "/fio" : ""}/${activeId}`, {
                params: { account_number_id },
            });

            if (res.status === 200 || res.status === 201) {
                getAllFn();
                setActiveDeleteModal(false);
            }
            setScreenLoader(false);
        } catch (error: any) {
            console.error("Error during deletion:", error);
            setScreenLoader(false);
            dispatch(
                alertt({
                    text: error.response?.data?.error || error.message,
                })
            );
        }
    };

    // Qator hisobotlari (backend Excel) — har biri ⋮ menyuda Excel va PDF
    const rowReports = (item: RasxodInterface): ExportMenuItem[] => {
        const q = `?account_number_id=${account_number_id}`;
        const fetchBlob = (url: string) => () => getExcel(JWT, url + q);
        if (source !== "fio") {
            return reportItems({
                key: "batalon",
                name: tt("Shartnomalar bo'yicha ma'lumot", "Сведения о договорах"),
                fetchBlob: fetchBlob(`/rasxod/export/${item.id}`),
                fileName: "export_file.xlsx",
            });
        }
        return [
            ...reportItems({
                key: "umumiy",
                name: tt("Umumiy hisobot", "Общий отчёт"),
                fetchBlob: fetchBlob(`/rasxod/fio/export3/${item.id}`),
                fileName: `taqsimot_${item.doc_num}.xlsx`,
            }),
            ...reportItems({
                key: "vedomost",
                name: tt("Tarqatuv vedomosti", "Раздаточная ведомость"),
                fetchBlob: fetchBlob(`/rasxod/fio/export/${item.id}`),
                fileName: "fio_file.xlsx",
            }),
            ...reportItems({
                key: "vedomost-karta",
                name: tt("Tarqatuv vedomosti (karta raqamlari bilan)", "Раздаточная ведомость (с номерами карт)"),
                fetchBlob: fetchBlob(`/rasxod/fio/export2/${item.id}`),
                fileName: "fio_file.xlsx",
            }),
        ];
    };

    return (
        <>
            <Table
                thead={tableHeaders}
                sort={sort}
                onSort={onSort}
                // Keng ekranda joy yetarli: mayda shrift faqat tor ekran uchun
                theadClassName="[&>tr>th]:px-1 [&>tr>th]:py-1.5 min-[1700px]:[&>tr>th]:text-[0.6875rem]"
                tbodyClassName="text-[0.5625rem] min-[1360px]:text-[0.625rem] min-[1700px]:text-[0.75rem] [&>tr>td]:px-1 [&>tr>td]:py-1.5"
            >
                {data.map((item) => (
                    <tr key={item.id}>
                        <td className="text-center tabular-nums">{item.doc_num}</td>
                        <td className="whitespace-nowrap text-center tabular-nums">{formatDate(item.doc_date)}</td>
                        <td className="group relative cursor-default">
                            {item.batalon_name}
                            <div className="pointer-events-none absolute left-4 top-full z-30 hidden w-[15.625rem] rounded-md border border-border bg-popover p-3 text-[0.75rem] text-popover-foreground shadow-lg group-hover:block">
                                <p>{tt("Nomi", "Название")}: {item.batalon_name}</p>
                                <p>{tt("Manzil", "Адрес")}: {item.batalon_address}</p>
                                <p>{tt("INN", "ИНН")}: {formatInn(item.batalon_str)}</p>
                                <p>{tt("Hisob raqam", "Номер счета")}: {textNum(item.batalon_account_number, 4)}</p>
                            </div>
                        </td>
                        <td className="whitespace-nowrap text-right font-medium tabular-nums">{formatNum(item.summa)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_10)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_remaining)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_65)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_25)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_1_25)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_25_2)}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{formatNum(item.summa_12)}</td>
                        <td className="whitespace-nowrap text-right font-medium tabular-nums text-success">{formatNum(item.worker_summa)}</td>
                        <RowActions
                            item={item}
                            reports={rowReports(item)}
                            canEdit={perm.update}
                            canDelete={perm.delete}
                            onDelete={() => {
                                setActiveDeleteModal(true);
                                setActiveId(item.id);
                            }}
                        />
                    </tr>
                ))}
            </Table>

            <DeleteModal closeModal={() => setActiveDeleteModal(false)} open={activeDeleteModal} deletee={handleRemove} />
            {screenLoader && <ScreenLoader title={tt("O'chirilmoqda...", "Удаляется...")} />}
        </>
    );
};

interface RowActionsProps {
    item: RasxodInterface;
    reports: ExportMenuItem[];
    canEdit: boolean;
    canDelete: boolean;
    onDelete: () => void;
}

/**
 * Ilgari bu yerda `absolute` joylashgan uch nuqtali menyu bor edi. Jadval
 * endi o'z ichida aylanadigan qutida turibdi va har qanday ochiluvchi qatlam
 * shu quti chetida kesiladi — shuning uchun amallar bevosita tugma bo'lib
 * turadi.
 */
const RowActions: React.FC<RowActionsProps> = ({
    item,
    reports,
    canEdit,
    canDelete,
    onDelete,
}) => {
    const navigate = useNavigate();
    // Ustun tor bo'lgani uchun tugmalar odatdagidan kichikroq
    const btn = "h-5 w-5 [&_svg]:size-3";

    return (
        <td>
            <div className="flex items-center justify-center">
                {/* Barcha hisobotlar bitta ⋮ menyuda (menyu body ga chiziladi — kesilmaydi) */}
                <ExportMenu size="xs" items={reports} title={tt("Hisobotlar", "Отчёты")} />
                <Button
                    variant="ghost"
                    size="icon-xs"
                    {...permBtn(canEdit, tt("Tahrirlash", "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c"), btn)}
                    aria-label={tt("Tahrirlash", "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c")}
                    onClick={() => navigate(`${item.id}`)}
                >
                    <Pencil />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    {...permBtn(canDelete, tt("O'chirish", "\u0423\u0434\u0430\u043b\u0438\u0442\u044c"), `${btn} hover:bg-destructive/10 hover:text-destructive`)}
                    aria-label={tt("O'chirish", "\u0423\u0434\u0430\u043b\u0438\u0442\u044c")}
                    onClick={onDelete}
                >
                    <Trash2 />
                </Button>
            </div>
        </td>
    );
};
