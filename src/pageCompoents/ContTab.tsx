import Icon from "@/assets/icons";
import Table from "@/Components/reusable/table/Table";
import useFullHeight from "@/hooks/useFullHeight";
import "@/pages/rasxod/rasxod.css";
import { IContract } from "@/types/contract";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../Components/DeleteModal";
import { formatDate, formatSum, textNum, tt } from "../utils";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface ContTabProps {
  data: any[];
  handleDelete?: (id: string) => void;
  setActive?: Dispatch<SetStateAction<any>>;
  hideActions?: boolean;
}

const ContTab: React.FC<ContTabProps> = ({ data, handleDelete, setActive, hideActions }) => {
  const navigate = useNavigate();
  const [delOpen, setDelOpen] = useState(false);

  const height = useFullHeight();
  const fullHeight = typeof height === "string" ? `calc(${height} - 230px)` : height - 230;

  const renderOrganizationTooltip = (item: IContract) => (
    <div className="text-mytextcolor absolute rasxod-tooltip-wrap !top-[0] w-[250px] z-10 bg-mybackground border border-mytableheadborder rounded-md shadow-lg p-3">
      <h2>
        {tt("Nomi", "Название")}: {item.organization_name}
      </h2>
      <h2>
        {tt("Manzil", "Адрес")}: {item.organization_address}
      </h2>
      <h2>
        {tt("INN", "ИНН")}: {textNum(item.organization_str, 3)}
      </h2>
      <h2>
        {tt("Hisob raqam", "Номер счета")}: {textNum(item.organization_account_number, 4)}
      </h2>
    </div>
  );

  return (
    <>
      {data ? (
        <>
          <Table
            tableClassName="text-[7px]"
            theadClassName="bg-mytablehead sticky z-10 top-[80px] text-mytextcolor"
            theadStyle={{ fontSize: "9px" }}
            thead={[
              {
                text: tt("№", "№"),
                className: "px-[2px] py-[2px] text-left w-[32px]",
              },
              {
                text: tt("Sana", "Дата"),
                className: "px-[2px] py-[2px] text-center w-[50px]",
              },
              {
                text: tt("Buyurtmachi", "Заказчик"),
                className: "px-[2px] py-[2px] text-left w-[90px]",
              },
              {
                text: tt("Tadbir manzili", "Место проведения"),
                className: "px-[2px] py-[2px] text-left w-[70px]",
              },
              {
                text: tt("Hisoblangan summa", "Ҳисобланган сумма"),
                className: "px-[2px] py-[2px] text-center w-[62px]",
              },
              {
                text: tt("Kelib tushgan summa", "Келиб тушган сумма"),
                className: "px-[2px] py-[2px] text-center w-[62px]",
              },
              {
                text: tt("Debitor qarzdorlik", "Дебитор қарздорлик"),
                className: "px-[2px] py-[2px] text-center w-[62px]",
              },
              {
                text: tt("Rasxod summa", "Расход сумма"),
                className: "px-[2px] py-[2px] text-center w-[55px]",
              },
              {
                text: tt("Xodim biriktirish", "Привязанность к сотруднику"),
                className: "px-[2px] py-[2px] text-center w-[52px]",
              },
              {
                text: tt("Boshliq T", "Утв. рук."),
                className: "px-[2px] py-[2px] text-center w-[52px]",
              },
              {
                text: tt("Yurist T", "Утв. юр."),
                className: "px-[2px] py-[2px] text-center w-[52px]",
              },
              {
                text: tt("Yuristga", "Юристу"),
                className: "px-[2px] py-[2px] text-center w-[52px]",
              },
              ...(!hideActions ? [{
                text: tt("Amallar", "Действия"),
                className: "px-[2px] py-[2px] text-center w-[25px]",
              }] : []),
            ]}
          >
            {data.map((item, index) => (
              <tr key={index} className="my-[25px] text-mytextcolor cursor-pointer font-[400] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-mytableheadborder">
                <td className="px-[2px] py-[2px] text-[#3B7FAF] border-l border-r text-left" onClick={() => navigate(hideActions ? `/lawyer-contract/view/${item.id}` : `/contract/view/${item.id}`)}>
                  {item.doc_num}
                </td>
                <td className="px-[2px] py-[2px] text-center text-inherit border-l border-r">{formatDate(item.doc_date)}</td>
                <td className="rasxod-tooltip relative border-l border-r px-1 py-1 text-left text-inherit">
                  {item.organization_name}
                  {renderOrganizationTooltip(item)}
                </td>
                <td className="px-[2px] py-[2px] text-left border-l border-r text-inherit">{item.adress}</td>
                <td className="px-[2px] py-[2px] text-right text-inherit border-l border-r">{formatSum(item.result_summa)}</td>
                <td className="px-[2px] py-[2px] text-right text-inherit border-l border-r">{formatSum(item.remaining_summa)}</td>
                <td className={`px-1 py-1 text-right text-inherit border-l border-r ${Number(item.remaining_balance) === 0 ? "text-green-500" : Number(item.remaining_balance) > 0 ? "text-blue-500" : "text-red-500"}`}>{formatSum(item.remaining_balance)}</td>
                <td className="px-[2px] py-[2px] text-right text-inherit border-l border-r">{formatSum(item.rasxod_summa)}</td>
                <td className="px-[2px] py-[2px] text-center border-l border-r">
                  {item.worker_task_status === "Bajarilmagan" ? (
                    <span style={{ color: "#ef4444", fontSize: "14px" }} className="flex justify-center">&#10006;</span>
                  ) : (
                    <span style={{ color: "#22c55e", fontSize: "14px" }} className="flex justify-center">&#10004;</span>
                  )}
                </td>
                <td className="px-[2px] py-[2px] text-center border-l border-r">
                  {item.verification_boss === "success" ? (
                    <span style={{ color: "#22c55e", fontSize: "14px" }} className="flex justify-center">&#10004;</span>
                  ) : item.verification_boss === "update" ? (
                    <span style={{ color: "#eab308", fontSize: "14px" }} className="flex justify-center">&#10004;</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontSize: "14px" }} className="flex justify-center">&#10006;</span>
                  )}
                </td>
                <td className="px-[2px] py-[2px] text-center border-l border-r">
                  {item.verification_lawyer === "success" ? (
                    <span style={{ color: "#22c55e", fontSize: "14px" }} className="flex justify-center">&#10004;</span>
                  ) : item.verification_lawyer === "update" ? (
                    <span style={{ color: "#eab308", fontSize: "14px" }} className="flex justify-center">&#10004;</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontSize: "14px" }} className="flex justify-center">&#10006;</span>
                  )}
                </td>
                <td className="px-[2px] py-[2px] text-center border-l border-r">
                  {item.send_lawyer ? (
                    <span style={{ color: "#22c55e", fontSize: "14px" }} className="flex justify-center">&#10004;</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontSize: "14px" }} className="flex justify-center">&#10006;</span>
                  )}
                </td>
                {!hideActions && <ThreeDotMenu id={item.id} setDelOpen={setDelOpen} setActive={setActive!} />}
              </tr>
            ))}
          </Table>
        </>
      ) : (
        <div style={{ minHeight: fullHeight }} className="w-full text-mytextcolor font-[500] text-[20px] flex justify-center items-center bg-mybackground rounded-lg">
          {tt("Ma'lumot yo'q", "Нет данных")}
        </div>
      )}

      <DeleteModal open={delOpen} deletee={handleDelete} closeModal={() => setDelOpen(false)} />
    </>
  );
};

export default ContTab;

type Props = {
  id: number;
  setDelOpen: Dispatch<SetStateAction<boolean>>;
  setActive: Dispatch<SetStateAction<number>>;
};

export const ThreeDotMenu = ({ id, setDelOpen, setActive }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Toggle modal visibility
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Close modal if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close modal if the click is outside the menu or button
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();

  return (
    <td className="p-2 h-full border-l border-r relative">
      <div className="h-[25px] hover:border hover:border-mytextcolor w-[20px] mx-auto rounded-md flex items-center justify-center" onClick={toggleMenu} ref={buttonRef}>
        <button className="text-mytextcolor">
          <Icon name="more" />
        </button>
        {isOpen && (
          <div ref={menuRef} className="absolute right-[80px] mt-[110px] w-[180px] bg-mybackground border border-gray-300 rounded-md shadow-lg z-10 p-1 flex flex-col">
              <button
                className="w-full px-3 py-2 text-[12px] font-[500] text-mytextcolor hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left transition"
                onClick={() => navigate("/contract/" + id)}
              >
                {tt("Tahrirlash", "Редактировать")}
              </button>
              <button
                className="w-full px-3 py-2 text-[12px] font-[500] text-mytextcolor hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left transition"
                onClick={() => {
                  setDelOpen(true);
                  setActive(id);
                }}
              >
                {tt("O'chirish", "Удалить")}
              </button>
              <button
                className="w-full px-3 py-2 text-[12px] font-[500] text-mytextcolor hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left transition"
                onClick={() => navigate("/contract/tasks/" + id)}
              >
                {tt("Xodim biriktirish", "Прикрепить сотрудника")}
              </button>
              <button
                className="w-full px-3 py-2 text-[12px] font-[500] text-mytextcolor hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left transition"
                onClick={() => navigate("/contract/analiz/" + id)}
              >
                {tt("Analiz", "Анализ")}
              </button>
          </div>
        )}
      </div>
    </td>
  );
};
