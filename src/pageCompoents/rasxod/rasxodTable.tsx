import DeleteModal from "@/Components/DeleteModal";
import { useRequest } from "@/hooks/useRequest";
import { RasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatInn, formatNum, textNum, tt } from "@/utils";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ExportMenu, { reportItems, type ExportMenuItem } from "@/Components/ExportMenu";
import Table, { ITheadItem } from "../../Components/reusable/table/Table"; // Assuming Table is in the same directory
import { getExcel } from "@/api";
import { usePermission } from "@/lib/permissions";
import type { SortState } from "@/hooks/useTableSort";
import ScreenLoader from "@/Components/ScreenLoader";
import {
  PaidStatusBadge,
  PaidStatusConfirm,
  usePaidStatusAction,
  type PaidStatusTarget,
} from "@/pages/RasxodFio/paidStatus";
import { rasxodRowMenu } from "./rowMenu";

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
  const kind = source === "fio" ? "fio" : "rasxod";
  const perm = usePermission(source === "fio" ? "rasxod_workers" : "rasxod");

  // "To'landi" holati (summa qabul qiluvchiga o'tkazildi): tanlangan hujjat
  // tasdiqlash oynasida ko'rsatiladi; null — oyna yopiq
  const [paidTarget, setPaidTarget] = useState<PaidStatusTarget | null>(null);
  const setPaid = usePaidStatusAction(kind);

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
      sortKey: "is_paid",
      text: tt("Holati", "Статус"),
      className: "w-[7rem] text-center",
    },
    // Barcha amallar bitta ⋮ menyuda — ustunga bitta tugma sig'sa yetarli
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
            <td className="text-center">
              {item.is_paid == null ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <PaidStatusBadge paid={item.is_paid} dot={false} />
              )}
            </td>
            <td className="text-center">
              {/* Amallar va hisobotlar bitta ⋮ menyuda, har biri nomi bilan.
                  Menyu body ga chiziladi — aylanuvchi jadval qutisida kesilmaydi */}
              <ExportMenu
                size="xs"
                title={tt("Amallar", "Действия")}
                items={rasxodRowMenu({
                  kind,
                  paid: Boolean(item.is_paid),
                  canEdit: perm.update,
                  canDelete: perm.delete,
                  reports: rowReports(item),
                  onEdit: () => navigate(`${item.id}`),
                  onTogglePaid: () => setPaidTarget(item),
                  onDelete: () => {
                    setActiveDeleteModal(true);
                    setActiveId(item.id);
                  },
                })}
              />
            </td>
          </tr>
        ))}
      </Table>

      <DeleteModal closeModal={() => setActiveDeleteModal(false)} open={activeDeleteModal} deletee={handleRemove} />
      <PaidStatusConfirm
        doc={paidTarget}
        kind={kind}
        onClose={() => setPaidTarget(null)}
        onConfirm={async (doc) => {
          const ok = await setPaid(doc.id, !doc.is_paid);
          if (ok) getAllFn();
          return ok;
        }}
      />
      {screenLoader && <ScreenLoader title={tt("O'chirilmoqda...", "Удаляется...")} />}
    </>
  );
};
