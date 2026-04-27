import Icon from "@/assets/icons";
import DeleteModal from "@/Components/DeleteModal";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

    const tableHeaders: ITheadItem[] = [
        { text: "№", className: "w-[40px]" },
        { text: tt("Sana", "Дата"), className: "w-[75px]" },
        { text: tt("Qabul qiluvchi", "Получатель"), className: "w-[80px]" },
        { text: tt("Jami (100%)", "Жами (100%)"), className: "w-[100px] text-center" },
        { text: tt("Boshqarma (10%)", "Бошқарма (10%)"), className: "w-[90px] text-center" },
        { text: tt("Qolgan (90%)", "Қолган (90%)"), className: "w-[100px] text-center" },
        { text: tt("Moddiy baza (65%)", "Моддий база (65%)"), className: "w-[100px] text-center" },
        { text: tt("I-II guruh (25%)", "I-II гурух (25%)"), className: "w-[100px] text-center" },
        { text: tt("Shaxsiy tarkib", "Шахсий таркиб"), className: "w-[100px] text-center" },
        { text: tt("Ijtimoiy soliq (25%)", "Ижтимоий солиқ (25%)"), className: "w-[90px] text-center" },
        { text: tt("Daromad solig'i (12%)", "Даромад солиғи (12%)"), className: "w-[90px] text-center" },
        { text: tt("Kartaga o'tkazildi", "Картага ўтказилди"), className: "w-[100px] text-center" },
        { text: "", className: "w-[40px] text-center" },
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
                    text: tt("Excel file yuklandi", "Файл Excel загружен"),
                    success: true,
                })
            );
        } catch (error) {
            dispatch(
                alertt({
                    text: tt("Excel file yuklanishda muamo mavjud", "Проблема с загрузкой файла Excel"),
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
                    text: tt("Excel file yuklandi", "Файл Excel загружен"),
                    success: true,
                })
            );
        } catch (error) {
            dispatch(
                alertt({
                    text: tt("Excel file yuklanishda muamo mavjud", "Проблема с загрузкой файла Excel"),
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
            dispatch(alertt({ text: tt("Excel file yuklandi", "Файл Excel загружен"), success: true }));
        } catch (error) {
            dispatch(alertt({ text: tt("Excel file yuklanishda muamo mavjud", "Проблема с загрузкой файла Excel"), success: false }));
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
                    text: tt("Excel file yuklandi", "Файл Excel загружен"),
                    success: true,
                })
            );
        } catch (error) {
            dispatch(
                alertt({
                    text: tt("Excel file yuklanishda muamo mavjud", "Проблема с загрузкой файла Excel"),
                    success: false,
                })
            );
        }
    };

    return (
        <>
            <Table theadClassName="sticky top-[80px] z-[30] bg-mybackground" thead={tableHeaders}>
                {data.map((item, index) => (
                    <tr key={index} className="border-b border-mytableheadborder transition-colors text-[12px]">
                        <td className="py-2 px-2 border-l border-r text-center">{item.doc_num}</td>
                        <td className="py-2 px-2 border-l border-r text-center">{formatDate(item.doc_date)}</td>
                        <td className="py-2 px-2 relative group border-l border-r cursor-pointer">
                            {item.batalon_name}
                            <div className="hidden group-hover:block -mt-8 ms-16 absolute z-10 bg-mybackground border rounded-md p-3 shadow-lg w-[250px] text-[12px]">
                                <p>{tt("Nomi", "Название")}: {item.batalon_name}</p>
                                <p>{tt("Manzil", "Адрес")}: {item.batalon_address}</p>
                                <p>{tt("INN", "ИНН")}: {textNum(item.batalon_str, 3)}</p>
                                <p>{tt("Hisob raqam", "Номер счета")}: {textNum(item.batalon_account_number, 4)}</p>
                            </div>
                        </td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_10)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_remaining)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_65)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_25)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_1_25)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_25_2)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.summa_12)}</td>
                        <td className="py-2 px-2 text-right border-l border-r">{formatNum(item.worker_summa)}</td>
                        <ThreeDotActions
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

interface ThreeDotProps {
    item: RasxodInterface;
    source?: string;
    onExcelDownload: (item: RasxodInterface) => void;
    onExcelDownloadRasxod: (item: RasxodInterface) => void;
    onExcelDownload2: (item: RasxodInterface) => void;
    onExcelDownload3: (item: RasxodInterface) => void;
    onDelete: () => void;
}

const ThreeDotActions: React.FC<ThreeDotProps> = ({ item, source, onExcelDownload, onExcelDownloadRasxod, onExcelDownload2, onExcelDownload3, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <td className="p-2 border-l border-r relative">
            <div className="h-[25px] hover:border hover:border-mytextcolor w-[20px] mx-auto rounded-md flex items-center justify-center cursor-pointer" onClick={() => setIsOpen((prev) => !prev)} ref={buttonRef}>
                <button className="text-mytextcolor">
                    <Icon name="more" />
                </button>
                {isOpen && (
                    <div ref={menuRef} className="absolute right-[40px] top-0 w-[180px] bg-mybackground border border-gray-300 rounded-md shadow-lg z-[50]">
                        <ul className="py-1 text-mytextcolor font-[400] text-[14px]">
                            {source === "fio" && (
                                <li className="px-4 py-[6px] cursor-pointer hover:bg-gray-100 dark:hover:bg-mytableheadborder" onClick={() => { onExcelDownload3(item); setIsOpen(false); }}>
                                    {tt("Umumiy hisobot", "Умумий ҳисобот")}
                                </li>
                            )}
                            {source === "fio" && (
                                <li className="px-4 py-[6px] cursor-pointer hover:bg-gray-100 dark:hover:bg-mytableheadborder" onClick={() => { onExcelDownload(item); setIsOpen(false); }}>
                                    {tt("Premiya hisoboti", "Премия ҳисоботи")}
                                </li>
                            )}
                            {source !== "fio" && (
                                <li className="px-4 py-[6px] cursor-pointer hover:bg-gray-100 dark:hover:bg-mytableheadborder" onClick={() => { onExcelDownloadRasxod(item); setIsOpen(false); }}>
                                    {tt("Taqsimot hisoboti", "Тақсимот ҳисоботи")}
                                </li>
                            )}
                            {source === "fio" && (
                                <li className="px-4 py-[6px] cursor-pointer hover:bg-gray-100 dark:hover:bg-mytableheadborder" onClick={() => { onExcelDownload2(item); setIsOpen(false); }}>
                                    {tt("Karta hisoboti", "Карта ҳисоботи")}
                                </li>
                            )}
                            <li className="px-4 py-[6px] cursor-pointer hover:bg-gray-100 dark:hover:bg-mytableheadborder" onClick={() => { navigate(`${item.id}`); setIsOpen(false); }}>
                                {tt("Tahrirlash", "Редактировать")}
                            </li>
                            <li className="px-4 py-[6px] cursor-pointer hover:bg-gray-100 dark:hover:bg-mytableheadborder text-red-500" onClick={() => { onDelete(); setIsOpen(false); }}>
                                {tt("O'chirish", "Удалить")}
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </td>
    );
};
