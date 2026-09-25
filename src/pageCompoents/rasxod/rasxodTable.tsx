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
import Table, { ITheadItem } from "../../Components/reusable/table/Table"; // Assuming Table is in the same directory
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

export const RasxodTable: React.FC<RasxodTableProps> = ({ data, getAllFn, source, sort, onSort }) => {
  const [activeDeleteModal, setActiveDeleteModal] = useState(false);
  const [activeId, setActiveId] = useState(0);
  const [screenLoader, setScreenLoader] = useState(false);

  const request = useRequest();
  const { account_number_id } = useSelector((state: any) => state.account);
  const JWT = useSelector((s: any) => s.auth.jwt);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // "fio" — hodimlar hisob-kitobi, aks holda chiqimlar kitobi
  const perm = usePermission(source === "fio" ? "rasxod_workers" : "rasxod");

  const tableHeaders: ITheadItem[] = [
    {
      sortKey: "doc_num",
      text: "№",
      className: "w-[6.25rem]",
    },
    {
      sortKey: "doc_date",
      text: tt(`Hujjat sanasi`, "Дата документа"),
      className: "w-[6.25rem]",
    },
    {
      sortKey: "batalon_name",
      text: tt("Qabul qiluvchi", "Получатель"),
      className: "w-[6.25rem]",
    },
    {
      sortKey: "opisanie",
      text: tt("Izoh", "Примечание"),
      className: "w-[6.25rem]",
    },
    {
      sortKey: "summa",
      text: tt("Summa", "Сумма"),
      className: "w-[13rem] text-center",
    },
    {
      text: tt("Amallar", "Действия"),
      className: "w-[5rem] text-center",
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
        dispatch(
          alertt({
            success: true,
            text: res.data?.message || tt("O'chirildi", "Удалено"),
          })
        );
      }
      setScreenLoader(false);
    } catch (error: any) {
      console.error("Error during deletion:", error);
      setScreenLoader(false);
      setActiveDeleteModal(false);
      dispatch(
        alertt({
          success: false,
          // Backend xato matnini `message` da yuboradi (`error` maydoni yo'q)
          text: error.response?.data?.message || error.message,
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
      <Table thead={tableHeaders} sort={sort} onSort={onSort}>
        {data.map((item) => (
          <tr key={item.id}>
            <td className="text-center tabular-nums">{item.doc_num}</td>
            <td className="whitespace-nowrap text-center tabular-nums">
              {formatDate(item.doc_date)}
            </td>
            <td className="group relative cursor-default">
              {item.batalon_name}
              <div className="pointer-events-none absolute left-4 top-full z-30 hidden w-[16.25rem] rounded-md border border-border bg-popover p-3 text-[0.75rem] text-popover-foreground shadow-lg group-hover:block">
                <p>{tt("Nomi", "Название")}: {item.batalon_name}</p>
                <p>{tt("Manzil", "Адрес")}: {item.batalon_address}</p>
                <p>{tt("INN", "ИНН")}: {formatInn(item.batalon_str)}</p>
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
                {/* Barcha hisobotlar bitta ⋮ menyuda (menyu body ga chiziladi — kesilmaydi) */}
                <ExportMenu size="xs" items={rowReports(item)} title={tt("Hisobotlar", "Отчёты")} />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"))}
                  aria-label={tt("Tahrirlash", "Редактировать")}
                  onClick={() => navigate(`${item.id}`)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  {...permBtn(perm.delete, tt("O'chirish", "Удалить"), "hover:bg-destructive/10 hover:text-destructive")}
                  aria-label={tt("O'chirish", "Удалить")}
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
