import DeleteModal from "@/Components/DeleteModal";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatInn, formatNum, textNum, tt } from "@/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Award, CreditCard, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/ui";
import Table, { ITheadItem } from "../../Components/reusable/table/Table";
import { getExcel } from "@/api";
import ScreenLoader from "@/Components/ScreenLoader";

interface RasxodTableProps {
    data: RasxodInterface[];
    getAllFn: () => void;
    source?: string;
}

export const RasxodFIOTable: React.FC<RasxodTableProps> = ({ data, getAllFn, source }) => {
    const [activeDeleteModal, setActiveDeleteModal] = useState(false);
    const [activeId, setActiveId] = useState(0);
    const [screenLoader, setScreenLoader] = useState(false);

    const request = useRequest();
    const { account_number_id } = useSelector((state: any) => state.account);
    const JWT = useSelector((s: any) => s.auth.jwt);
    const dispatch = useDispatch();

    // 13 ta ustun bitta ekranga sig'ishi kerak: shrift kichik, sarlavhalar
    // esa `whitespace-normal` bilan ikki qatorga tushadi — shunda ustun
    // kengligini uzun sarlavha emas, raqamning o'zi belgilaydi.
    const NUM = "whitespace-normal text-center text-[9px] leading-[1.15]";
    const tableHeaders: ITheadItem[] = [
        { text: "\u2116", className: "w-[30px] text-center text-[9px]" },
        { text: tt("Sana", "Дата"), className: "w-[58px] text-center text-[9px]" },
        { text: tt("Qabul qiluvchi", "Получатель"), className: "w-[44px] whitespace-normal text-center text-[9px] leading-[1.15]" },
        { text: tt("Jami (100%)", "Всего (100%)"), className: NUM },
        { text: tt("Boshqarma (10%)", "Управление (10%)"), className: NUM },
        { text: tt("Qolgan (90%)", "Остаток (90%)"), className: NUM },
        { text: tt("Moddiy baza (65%)", "Материальная база (65%)"), className: NUM },
        { text: tt("I-II guruh (25%)", "I-II группы (25%)"), className: NUM },
        { text: tt("Shaxsiy tarkib", "Личный состав"), className: NUM },
        { text: tt("Ijtimoiy soliq (25%)", "Социальный налог (25%)"), className: NUM },
        { text: tt("Daromad solig'i (12%)", "Налог на доходы (12%)"), className: NUM },
        { text: tt("Kartaga o'tkazildi", "Перечислено на карту"), className: NUM },
        { text: tt("Amallar", "Действия"), className: "w-[100px] whitespace-normal text-center text-[9px] leading-[1.15]" },
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

    const handleExcelDownload = async (item: RasxodInterface) => {
        try {
            const URL = `/rasxod/fio/export/${item.id}?account_number_id=${account_number_id}`;
            const excelBlob = await getExcel(JWT, URL);
            const url = window.URL.createObjectURL(excelBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${URL.split("/")[2]}_file.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            dispatch(
                alertt({
                    text: tt("Excel fayl yuklandi", "Файл Excel загружен"),
                    success: true,
                })
            );
        } catch (error) {
            dispatch(
                alertt({
                    text: tt("Excel faylni yuklashda muammo yuz berdi", "Проблема с загрузкой файла Excel"),
                    success: false,
                })
            );
        }
    };

    const handleExcelDownloadRasxod = async (item: RasxodInterface) => {
        try {
            const URL = `/rasxod/export/${item.id}?account_number_id=${account_number_id}`;
            const excelBlob = await getExcel(JWT, URL);
            const url = window.URL.createObjectURL(excelBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${URL.split("/")[2]}_file.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            dispatch(
                alertt({
                    text: tt("Excel fayl yuklandi", "Файл Excel загружен"),
                    success: true,
                })
            );
        } catch (error) {
            dispatch(
                alertt({
                    text: tt("Excel faylni yuklashda muammo yuz berdi", "Проблема с загрузкой файла Excel"),
                    success: false,
                })
            );
        }
    };

    const handleExcelDownload3 = async (item: RasxodInterface) => {
        try {
            const URL = `/rasxod/fio/export3/${item.id}?account_number_id=${account_number_id}`;
            const excelBlob = await getExcel(JWT, URL);
            const url = window.URL.createObjectURL(excelBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `taqsimot_${item.doc_num}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            dispatch(alertt({ text: tt("Excel fayl yuklandi", "Файл Excel загружен"), success: true }));
        } catch (error) {
            dispatch(alertt({ text: tt("Excel faylni yuklashda muammo yuz berdi", "Проблема с загрузкой файла Excel"), success: false }));
        }
    };

    const handleExcelDownload2 = async (item: RasxodInterface) => {
        try {
            const URL = `/rasxod/fio/export2/${item.id}?account_number_id=${account_number_id}`;
            const excelBlob = await getExcel(JWT, URL);
            const url = window.URL.createObjectURL(excelBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${URL.split("/")[2]}_file.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            dispatch(
                alertt({
                    text: tt("Excel fayl yuklandi", "Файл Excel загружен"),
                    success: true,
                })
            );
        } catch (error) {
            dispatch(
                alertt({
                    text: tt("Excel faylni yuklashda muammo yuz berdi", "Проблема с загрузкой файла Excel"),
                    success: false,
                })
            );
        }
    };

    return (
        <>
            <Table
                thead={tableHeaders}
                theadClassName="[&>tr>th]:px-1 [&>tr>th]:py-1.5"
                tbodyClassName="text-[9px] min-[1360px]:text-[10px] [&>tr>td]:px-1 [&>tr>td]:py-1.5"
            >
                {data.map((item) => (
                    <tr key={item.id}>
                        <td className="text-center tabular-nums">{item.doc_num}</td>
                        <td className="whitespace-nowrap text-center tabular-nums">{formatDate(item.doc_date)}</td>
                        <td className="group relative cursor-default">
                            {item.batalon_name}
                            <div className="pointer-events-none absolute left-4 top-full z-30 hidden w-[250px] rounded-md border border-border bg-popover p-3 text-[12px] text-popover-foreground shadow-lg group-hover:block">
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
                            source={source}
                            onExcelDownload={handleExcelDownload}
                            onExcelDownloadRasxod={handleExcelDownloadRasxod}
                            onExcelDownload2={handleExcelDownload2}
                            onExcelDownload3={handleExcelDownload3}
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
    source?: string;
    onExcelDownload: (item: RasxodInterface) => void;
    onExcelDownloadRasxod: (item: RasxodInterface) => void;
    onExcelDownload2: (item: RasxodInterface) => void;
    onExcelDownload3: (item: RasxodInterface) => void;
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
    source,
    onExcelDownload,
    onExcelDownloadRasxod,
    onExcelDownload2,
    onExcelDownload3,
    onDelete,
}) => {
    const navigate = useNavigate();
    // Ustun tor bo'lgani uchun tugmalar odatdagidan kichikroq
    const btn = "h-5 w-5 [&_svg]:size-3";

    return (
        <td>
            <div className="flex items-center justify-center">
                {source === "fio" ? (
                    <>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className={btn}
                            title={tt("Umumiy hisobot", "Общий отчёт")}
                            aria-label={tt("Umumiy hisobot", "Общий отчёт")}
                            onClick={() => onExcelDownload3(item)}
                        >
                            <FileSpreadsheet />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className={btn}
                            title={tt("Premiya hisoboti", "Отчёт по премиям")}
                            aria-label={tt("Premiya hisoboti", "Отчёт по премиям")}
                            onClick={() => onExcelDownload(item)}
                        >
                            <Award />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className={btn}
                            title={tt("Karta hisoboti", "Отчёт по картам")}
                            aria-label={tt("Karta hisoboti", "Отчёт по картам")}
                            onClick={() => onExcelDownload2(item)}
                        >
                            <CreditCard />
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className={btn}
                        title={tt("Taqsimot hisoboti", "Отчёт по распределению")}
                        aria-label={tt("Taqsimot hisoboti", "Отчёт по распределению")}
                        onClick={() => onExcelDownloadRasxod(item)}
                    >
                        <FileSpreadsheet />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className={btn}
                    title={tt("Tahrirlash", "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c")}
                    aria-label={tt("Tahrirlash", "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c")}
                    onClick={() => navigate(`${item.id}`)}
                >
                    <Pencil />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className={`${btn} hover:bg-destructive/10 hover:text-destructive`}
                    title={tt("O'chirish", "\u0423\u0434\u0430\u043b\u0438\u0442\u044c")}
                    aria-label={tt("O'chirish", "\u0423\u0434\u0430\u043b\u0438\u0442\u044c")}
                    onClick={onDelete}
                >
                    <Trash2 />
                </Button>
            </div>
        </td>
    );
};
