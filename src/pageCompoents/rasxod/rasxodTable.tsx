import DeleteModal from "@/Components/DeleteModal";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatNum, textNum, tt } from "@/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Award, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/ui";
import Table, { ITheadItem } from "../../Components/reusable/table/Table"; // Assuming Table is in the same directory
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
  const navigate = useNavigate();

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
      text: tt("Izoh", "Объяснение"),
      className: "w-[100px]",
    },
    {
      text: tt("Summa", "Сумма"),
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
      <Table thead={tableHeaders}>
        {data.map((item) => (
          <tr key={item.id}>
            <td className="text-center tabular-nums">{item.doc_num}</td>
            <td className="whitespace-nowrap text-center tabular-nums">
              {formatDate(item.doc_date)}
            </td>
            <td className="group relative cursor-default">
              {item.batalon_name}
              <div className="pointer-events-none absolute left-4 top-full z-30 hidden w-[260px] rounded-md border border-border bg-popover p-3 text-[12px] text-popover-foreground shadow-lg group-hover:block">
                <p>{tt("Nomi", "Название")}: {item.batalon_name}</p>
                <p>{tt("Manzil", "Адрес")}: {item.batalon_address}</p>
                <p>{tt("INN", "ИНН")}: {textNum(item.batalon_str, 3)}</p>
                <p>{tt("Hisob raqam", "Номер счета")}: {textNum(item.batalon_account_number, 4)}</p>
              </div>
            </td>
            <td className="text-muted-foreground">{item.opisanie || ""}</td>
            <td className="whitespace-nowrap text-right font-medium tabular-nums">
              {formatNum(item.summa)}
            </td>
            <td>
              {/* Jadval aylanuvchi qutida — ochiluvchi menyu kesilib qolardi,
                  shuning uchun amallar bevosita tugma sifatida turadi */}
              <div className="flex items-center justify-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={tt("Taqsimot", "Тақсимот")}
                  aria-label={tt("Taqsimot", "Тақсимот")}
                  onClick={() =>
                    source === "fio"
                      ? handleExcelDownload(item)
                      : handleExcelDownloadRasxod(item)
                  }
                >
                  <FileSpreadsheet />
                </Button>
                {source === "fio" && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={tt("Premiya", "Премия")}
                    aria-label={tt("Premiya", "Премия")}
                    onClick={() => handleExcelDownload2(item)}
                  >
                    <Award />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={tt("Tahrirlash", "Редактировать")}
                  aria-label={tt("Tahrirlash", "Редактировать")}
                  onClick={() => navigate(`${item.id}`)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={tt("O'chirish", "Удалить")}
                  aria-label={tt("O'chirish", "Удалить")}
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setActiveDeleteModal(true);
                    setActiveId(item.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <DeleteModal closeModal={() => setActiveDeleteModal(false)} open={activeDeleteModal} deletee={handleRemove} />
      {screenLoader && <ScreenLoader title={tt("O'chirilmoqda...", "Удаляется...")} />}
    </>
  );
};
