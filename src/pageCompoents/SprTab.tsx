import Icon from "@/assets/icons";
import { useNavigate } from "react-router-dom";
import Modal from "../Components/Modal";
import { formatNum, textNum, tt } from "../utils";

interface SprTabProps {
  data: any[];
  bank?: boolean;
  title: string;
  path: string;
  children: React.ReactNode;
  setActive: (id: number) => void;
  setOpen: (open: boolean) => void;
  open: boolean;
  titleM: string;
  number?: number;
  format?: boolean;
  deduction?: boolean;
  template?: boolean;
}

const SprTab = ({
  data,
  bank,
  title,
  path,
  children,
  setActive,
  setOpen,
  open,
  titleM,
  number,
  format,
  deduction,
  template,
}: SprTabProps) => {
  const navigate = useNavigate();

  const renderBankColumns = (person: any) => (
    <>
      <td className="px-2 py-3 font-normal text-left ">{person.bank}</td>
      <td className="px-4 py-3 font-normal text-center ">{person?.mfo}</td>
    </>
  );

  const renderDeductionColumns = (person: any) => (
    <>
      <td className="px-2 py-3 font-normal text-left ">{person.bank}</td>
      <td className="px-4 py-3 font-normal text-center ">{person.mfo}</td>
    </>
  );

  const renderDefaultColumn = (person: any) => (
    <td className="pr-[100px] py-3 ">
      {number
        ? textNum(person[path], number)
        : format
        ? formatNum(person[path])
        : person[path]}
    </td>
  );

  const handleRowAction = (person: any) => {
    if (template) {
      navigate(`/spravichnik/template/${person.id}`);
      return;
    }
    setActive(person.id);
    setOpen(true);
  };

  if (!data) {
    return (
      <div className="h-[400px] w-full text-[#323232] font-medium text-xl flex justify-center items-center bg-[#F4FAFD] rounded-lg">
        {tt("Ma'lumot yo'q", "Нет данных")}
      </div>
    );
  }

  const handleContractNavigate = async (id: number) => {
    navigate(`/spravichnik/template/view/${id}`);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-t-[6px] h-[400px] text-mytextcolor text-sm">
        <table className="min-w-full">
          <thead className="bg-mytablehead text-mytextcolor rounded-t-[6px] border border-mytableheadborder">
            <tr>
              <th className="px-4 py-3 text-left">{tt("№", "№")}</th>
              {bank ? (
                <>
                  <th className="px-4 py-3 text-left">
                    {tt("Bank nomi", "Название банка")}
                  </th>
                  <th className="px-4 py-3 text-center">{tt("MFO", "МФО")}</th>
                </>
              ) : deduction ? (
                <>
                  <th className="px-4 py-3 text-left">
                    {tt("Ushlanma nomi", "Название удержание")}
                  </th>
                  <th className="px-4 py-3 text-center">
                    {tt("Foiz", "Процент")}
                  </th>
                </>
              ) : (
                <th className="pr-[350px] py-3 text-left">{title}</th>
              )}
              <th className=" py-3 text-center w-[100px]">
                {tt("Amallar", "Действия")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((person, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0
                    ? "bg-white dark:bg-mybackground"
                    : "bg-[#F4FAFD] dark:bg-mybackground"
                } text-mytextcolor border-b border-mytableheadborder`}
              >
                <td className="px-4 py-3 border-b border-mytableheadborder">
                  {index + 1}
                </td>
                {bank
                  ? renderBankColumns(person)
                  : deduction
                  ? renderDeductionColumns(person)
                  : renderDefaultColumn(person)}
                <td className="py-3 ">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => handleRowAction(person)}>
                      <Icon name="edit" />
                    </button>
                    {template && (
                      <button
                        onClick={() => {
                          handleContractNavigate(person.id);
                        }}
                      >
                        <Icon name="eye" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal closeModal={() => setOpen(false)} title={titleM} open={open}>
        {children}
      </Modal>
    </>
  );
};

export default SprTab;
