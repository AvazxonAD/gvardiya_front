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
  handleDelete: (id: string) => void;
  setActive: Dispatch<SetStateAction<any>>;
}

const ContTab: React.FC<ContTabProps> = ({ data, handleDelete, setActive }) => {
  const navigate = useNavigate();
  const [delOpen, setDelOpen] = useState(false);

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 230px)` : height - 230;

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
        {tt("Hisob raqam", "Номер счета")}:{" "}
        {textNum(item.organization_account_number, 4)}
      </h2>
    </div>
  );

  return (
    <>
      {data ? (
        <>
          <Table
            tableClassName=""
            theadClassName="bg-mytablehead sticky z-10 top-[80px] text-mytextcolor"
            thead={[
              {
                text: tt("№", "№"),
                className: "px-2 py-3 text-left w-[120px]",
              },
              {
                text: tt("Sana", "Дата"),
                className: "px-2 py-3 text-center w-[100px]",
              },
              {
                text: tt("Buyurtmachi", "Заказчик"),
                className: "px-2 py-3 text-left w-[350px]",
              },
              {
                text: tt("Tadbir manzili", "Место проведения"),
                className: "px-2 py-3 text-left",
              },
              {
                text: tt("Hisoblangan summa", "Ҳисобланган сумма"),
                className: "px-2 py-3 text-center w-[180px]",
              },
              {
                text: tt("Kelib tushgan summa", "Келиб тушган сумма"),
                className: "px-2 py-3 text-center w-[180px]",
              },
              {
                text: tt("Debitor qarzdorlik", "Дебитор қарздорлик"),
                className: "px-2 py-3 text-center w-[180px]",
              },
              {
                text: tt("Xodim biriktirish", "Привязанность к сотруднику"),
                className: "px-2 py-3 text-center w-[180px]",
              },
              {
                text: tt("Amallar", "Действия"),
                className: "px-2 py-3 text-center w-[50px]",
              },
            ]}
          >
            {data.map((item, index) => (
              <tr
                key={index}
                className="my-[25px] text-mytextcolor cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-mytableheadborder"
              >
                <td
                  className="px-2 py-3 text-[#3B7FAF] border-l border-r text-left"
                  onClick={() => navigate(`/contract/view/${item.id}`)}
                >
                  {item.doc_num}
                </td>
                <td className="text-center text-inherit border-l border-r">
                  {formatDate(item.doc_date)}
                </td>
                <td className="rasxod-tooltip relative border-l border-r px-2 text-left text-inherit">
                  {item.organization_name}
                  {renderOrganizationTooltip(item)}
                </td>
                <td className="px-2 py-[6px] text-left border-l border-r text-inherit">
                  {item.adress}
                </td>
                <td className="px-2 text-right text-inherit border-l border-r">
                  {formatSum(item.result_summa)}
                </td>
                <td className="px-2 text-right text-inherit border-l border-r">
                  {formatSum(item.remaining_summa)}
                </td>
                <td
                  className={`px-2 text-right text-inherit border-l border-r ${
                    Number(item.remaining_balance) === 0
                      ? "text-green-500"
                      : Number(item.remaining_balance) > 0
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {formatSum(item.remaining_balance)}
                </td>
                <td className="px-2 text-center border-l border-r">
                  {item.worker_task_status === "Bajarilmagan" ? (
                    <span className="text-red-500 flex items-center justify-center gap-1">
                      <FaTimesCircle /> Bajarilmagan
                    </span>
                  ) : (
                    <span className="text-green-500 flex items-center justify-center gap-1">
                      <FaCheckCircle /> Bajarilgan
                    </span>
                  )}
                </td>
                <ThreeDotMenu
                  id={item.id}
                  setDelOpen={setDelOpen}
                  setActive={setActive}
                />
              </tr>
            ))}
          </Table>
        </>
      ) : (
        <div
          style={{ minHeight: fullHeight }}
          className="w-full text-mytextcolor font-[500] text-[20px] flex justify-center items-center bg-mybackground rounded-lg"
        >
          {tt("Ma'lumot yo'q", "Нет данных")}
        </div>
      )}

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => setDelOpen(false)}
      />
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
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();

  return (
    <td className="p-2 h-full border-l border-r relative">
      <div
        className="h-[25px] hover:border hover:border-mytextcolor w-[20px] mx-auto rounded-md flex items-center justify-center"
        onClick={toggleMenu}
        ref={buttonRef}
      >
        <button className="text-mytextcolor">
          <Icon name="more" />
        </button>
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute right-[80px] mt-[110px] w-[170px] bg-mybackground border border-gray-300 rounded-md shadow-lg z-10"
          >
            <ul className="py-1 text-mytextcolor font-[400] text-[14px]">
              <li
                className="px-4 py-[6px]  cursor-pointer"
                onClick={() => {
                  navigate("/contract/" + id);
                }}
              >
                {tt("Tahrirlash", "Редактировать")}
              </li>
              <li
                className="px-4 py-[6px] cursor-pointer"
                onClick={() => {
                  setDelOpen(true);
                  setActive(id);
                }}
              >
                {tt("O'chirish", "Удалить")}
              </li>
              <li
                onClick={() => navigate("/contract/tasks/" + id)}
                className="px-4 py-[6px] cursor-pointer"
              >
                {tt("Xodim biriktirish", "Прикрепить сотрудника")}
              </li>
              <li
                onClick={() => navigate("/contract/analiz/" + id)}
                className="px-4 py-[6px] cursor-pointer"
              >
                {tt("Analiz", "Анализ")}
              </li>
            </ul>
          </div>
        )}
      </div>
    </td>
  );
};
