import { ModalText } from "@/Components/reusable/descriptionModal";
import Table from "@/Components/reusable/table/Table";
import { IContractAnaliz } from "@/types/contract";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import React from "react";
// import { useSelector } from "react-redux";

type Props = {
  data: IContractAnaliz;
};

const AnalizView = React.forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  // const { user } = useSelector((state: any) => state.auth);

  return (
    <div ref={ref}>
      <div className="bg-mybackground mt-5 px-5 flex gap-6">
        {/* Left Column */}
        <div className="w-1/2">
          <ModalText
            label={tt("Shartnoma raqam", "Номер договора")}
            value={data.contract.doc_num}
          />
          <ModalText
            label={tt("Shartnoma sanasi", "Дата договора")}
            value={formatDate(data.contract.doc_date)}
          />
          <ModalText
            label={tt("Shartnoma summasi", "Сумма договора")}
            value={formatSum(data.contract.summa)}
          />
          <ModalText
            label={tt("Xodimlar soni", "Количество сотрудников")}
            value={`${data.contract.all_worker_number} ${tt("ta", "шт.")}`}
          />
          <ModalText
            label={tt("Umumiy tadbir vaqti", "Общее время мероприятия")}
            value={`${data.contract.all_task_time} ${tt("soat", "часов")}`}
          />
        </div>

        {/* Right Column */}
        <div className="w-1/2">
          <ModalText
            label={tt("Umumiy summa", "Общая сумма")}
            value={formatSum(data.contract.result_summa)}
          />
          <ModalText
            label={tt("Chegirma summa", "Сумма скидки")}
            value={formatSum(data.contract.discount_money)}
          />
          <ModalText
            label={tt("Kelib tushgan summa", "Поступившая сумма")}
            value={formatSum(
              data.contract.result_summa - data.contract.remaining_summa
            )}
          />
          <ModalText
            label={tt("Ishlatilgan summa", "Использованная сумма")}
            value={formatSum(data.contract.debit)}
          />
          <ModalText
            label={tt("Qolgan summa", "Оставшаяся сумма")}
            value={formatSum(data.contract.remaining_summa)}
          />
        </div>
      </div>

      {/* Tables Section */}
      <div className={`w-full ${ref ? "flex-col" : "flex"} gap-6 mt-10 px-2`}>
        {/* Kirim */}
        <div className={ref ? "w-full" : "w-1/3"}>
          <h2 className="mb-3 font-[700] text-mytextcolor">
            {tt("Kirim", "Приход")}
          </h2>
          {/* {data.prixods.length > 0 ? ( */}
          <Table
            thead={[
              { text: "№", className: "py-[7px] w-[20%] px-[5px]" },
              {
                text: tt("Sanasi", "Дата"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
              {
                text: tt("Summa", "Сумма"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
            ]}>
            {data.prixods.map((p, index) => (
              <tr
                key={index}
                className="border-b border-l border-r border-mytableheadborder">
                <td className="py-[7px] text-center font-[500]">
                  {p.prixod_doc_num}
                </td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatDate(p.prixod_date)}
                </td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatSum(p.prixod_summa)}
                </td>
              </tr>
            ))}
          </Table>
          {/* ) : (
            <p className="text-mytextcolor">
              {tt("Ma'lumot yo'q", "Информация отсутствует")}
            </p> */}
          {/* )} */}
        </div>

        {/* Chiqim */}
        <div className={ref ? "w-full" : "w-1/3"}>
          <h2 className="mb-3 font-[700] text-mytextcolor">
            {tt("Chiqim", "Расход")}
          </h2>

          {/* {data.rasxods.length > 0 ? ( */}
          <Table
            thead={[
              { text: "№", className: "py-[7px] w-[20%] px-[5px]" },
              {
                text: tt("Sanasi", "Дата"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
              {
                text: tt("Batalon №", "Батальон №"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
              {
                text: tt("Summa", "Сумма"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
            ]}>
            {data.rasxods.map((p, index) => (
              <tr
                key={index}
                className="border-b border-l border-r border-mytableheadborder">
                <td className="py-[7px] text-center font-[500]">{p.doc_num}</td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatDate(p.rasxod_date)}
                </td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {textNum(p.batalon_account_number, 4)}
                </td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatSum(Number(p.result_summa))}
                </td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Chiqim FIO */}
        <div className={ref ? "w-full" : "w-1/3"}>
          <h2 className="mb-3 font-[700] text-mytextcolor">
            {tt("Chiqim FIO", "Расход ФИО")}
          </h2>
          {/* {data.rasxod_fios.length > 0 ? ( */}
          <Table
            thead={[
              { text: "№", className: "py-[7px] w-[20%] px-[5px]" },
              {
                text: tt("Sanasi", "Дата"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
              {
                text: tt("FIO", "ФИО"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
              {
                text: tt("Summa", "Сумма"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
            ]}>
            {data.rasxod_fios.map((p, index) => (
              <tr
                key={index}
                className="border-b border-l border-r border-mytableheadborder">
                <td className="py-[7px] text-center font-[500]">{p.doc_num}</td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatDate(p.rasxod_date)}
                </td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {p.batalon_name}
                </td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatSum(Number(p.summa))}
                </td>
              </tr>
            ))}
          </Table>
          {/* ) : ( */}
          {/* <p className="text-mytextcolor">
              {tt("Ma'lumot yo'q", "Информация отсутствует")}
            </p> */}
          {/* )} */}
        </div>
      </div>

      {/* Footer Section */}
      {/* <div className="my-10 flex justify-center gap-5 text-mytextcolor">
                <div className="w-2/5 flex flex-col justify-center items-start font-[600]">
                    <h2>{tt("Buyurtmachi", "Заказчик")}: “{data.contract.organization_name}”</h2>
                    <h2>{tt("Manzil", "Адрес")}: {data.contract.bank}</h2>
                    <h2>{tt("INN", "ИНН")}: {textNum(data.contract.str, 3)}</h2>
                    <h2>{tt("Bank rekvizitlari", "Банковские реквизиты")}: {data.contract.organization_bank_name}</h2>
                    <h2>{tt("MFO", "МФО")}: {data.contract.mfo}</h2>
                    <h2>{tt("Hisob raqam", "Расчетный счет")}: {textNum(data.contract.organization_account_number, 4)}</h2>
                </div>
                <div className="w-2/5 flex flex-col justify-center items-start font-[600]">
                    <h2>{tt("Bajaruvchi", "Исполнитель")}: “{user?.doer_name}”</h2>
                    <h2>{tt("Manzil", "Адрес")}: {user?.adress}</h2>
                    <h2>{tt("INN", "ИНН")}: {user?.inn}</h2>
                    <h2>{tt("Bank rekvizitlari", "Банковские реквизиты")}: {user?.bank_name}</h2>
                    <h2>{tt("MFO", "МФО")}: {user?.mfo}</h2>
                    <h2>{tt("Hisob raqam", "Расчетный счет")}: {user?.bank_account}</h2>
                </div>
            </div> */}
    </div>
  );
});

AnalizView.displayName = "AnalizView";
export default AnalizView;
