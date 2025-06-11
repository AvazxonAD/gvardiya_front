import Icon from "@/assets/icons";
import DeleteModal from "@/Components/DeleteModal";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Table, { ITheadItem } from "../../Components/reusable/table/Table"; // Assuming Table is in the same directory
import { Download } from "lucide-react";
import { getExcel } from "@/api";
import ScreenLoader from "@/Components/ScreenLoader";

interface RasxodTableProps {
  data: RasxodInterface[];
  getAllFn: () => void;
  source?: string;
}

export const RasxodTable: React.FC<RasxodTableProps> = ({ data, getAllFn, source }) => {
  const [activeDeleteModal, setActiveDeleteModal] = useState(false);
  const [activeId, setActiveId] = useState(0);
  const [screenLoader, setScreenLoader] = useState(false);

  const request = useRequest();
  const { account_number_id } = useSelector((state: any) => state.account);
  const JWT = useSelector((s: any) => s.auth.jwt);
  const dispatch = useDispatch();

  const tableHeaders: ITheadItem[] = [
    {
      text: "№",
      className: "w-[100px]",
    },
    {
      text: tt(`Hujjat sanasi`, "Дата публикации"),
      className: "w-[100px]",
    },
    {
      text: tt("Qabul qiluvchi", "Получатель"),
      className: "w-[100px]",
    },
    {
      text: tt("Premiya (100%)", "Премия (100%)"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("Moddiy bazani rivojlantirish uchun (75%)", "Моддий базани ривожлантириш учун (75%)"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("I va II guruh xarajatlari uchun (25%)", "I ва II гурух харажатлари учун (25%)"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("Shaxsiy tarkibga taqsimlandi", "Шахсий таркибга таксимланди"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("Yagona ijtimoiy soliq (25%)", "Ягона ижтимоий солик (25%)"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("Daromad solig'i (12%)", "Даромад солиғи (12%)"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("Bank plastik kartasiga o'tkazib berildi", "Банк пластик картасига ўтказиб берилди"),
      className: "w-[208px] text-center",
    },
    {
      text: tt("Amallar", "Действия"),
      className: "w-[80px] text-center",
    },
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
          <tr key={index} className="border-b border-mytableheadborder transition-colors">
            <td className="py-3 px-6 border-l border-r text-center">{item.doc_num}</td>
            <td className="py-3 px-6 border-l border-r text-center">{formatDate(item.doc_date)}</td>
            <td className="py-3 px-6 relative group border-l border-r cursor-pointer">
              {item.batalon_name}
              <div className="hidden group-hover:block -mt-8 ms-16 absolute z-10 bg-mybackground border rounded-md p-3 shadow-lg w-[250px]">
                <h2>
                  {tt("Nomi", "Название")}: {item.batalon_name}
                </h2>
                <h2>
                  {tt("Manzil", "Адрес")}: {item.batalon_address}
                </h2>
                <h2>
                  {tt("INN", "ИНН")}: {textNum(item.batalon_str, 3)}
                </h2>
                <h2>
                  {tt("Hisob raqam", "Номер счета")}: {textNum(item.batalon_account_number, 4)}
                </h2>
              </div>
            </td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.summa)}</td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.summa_75)}</td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.summa_25)}</td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.summa_1_25)}</td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.summa_25_2)}</td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.summa_12)}</td>
            <td className="py-3 px-6 text-right border-l border-r">{formatNum(item.worker_summa)}</td>
            <td className="py-3 px-15 border-l border-r flex justify-center gap-2">
              {source === "fio" && (
                <button onClick={() => handleExcelDownload(item)} className="text-blue-500">
                  {tt("Taqsimot", "Тақсимот")}
                </button>
              )}
              {source !== "fio" && (
                <button onClick={() => handleExcelDownloadRasxod(item)} className="text-blue-500">
                  {tt("Taqsimot", "Тақсимот")}
                </button>
              )}
              {source === "fio" && (
                <button onClick={() => handleExcelDownload2(item)} className="text-blue-500">
                  {tt("Premiya", "Премия")}
                </button>
              )}
              <Link to={`${item.id}`}>
                <Icon name="edit" />
              </Link>
              <button
                onClick={() => {
                  setActiveDeleteModal(true);
                  setActiveId(item.id);
                }}
              >
                <Icon name="delete" />
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <DeleteModal closeModal={() => setActiveDeleteModal(false)} open={activeDeleteModal} deletee={handleRemove} />
      {screenLoader && <ScreenLoader title={tt("O'chirilmoqda...", "Удаляется...")} />}
    </>
  );
};
