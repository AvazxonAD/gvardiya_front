import { ModalText } from "@/Components/reusable/descriptionModal";
import Table from "@/Components/reusable/table/Table";
import { IContractAnaliz } from "@/types/contract";
import { formatDate, formatSum, tt } from "@/utils";
import React from "react";
import Input from "../../Components/Input";
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
            label={tt("Tadbir manzili", "Адрес мероприятия")}
            value={data.contract.adress}
          />
          <ModalText
            label={tt("Xodimlar soni", "Количество сотрудников")}
            value={`${data.contract.all_worker_number} ${tt("ta", "шт.")}`}
          />
          <ModalText
            label={tt("Umumiy tadbir vaqti", "Общее время мероприятия")}
            value={`${data.contract.all_task_time} ${tt("soat", "часов")}`}
          />
          <ModalText
            label={tt("Umumiy xizmat vaqti", "Общее время обслуживания")}
            value={`${data.contract.all_task_time * data.contract.all_worker_number} ${tt("soat", "часов")}`}
          />
        </div>

        {/* Right Column */}
        <div className="w-1/2">
          <ModalText
            label={tt("Umumiy", "Общая")}
            value={formatSum(data.contract.result_summa)}
          />
          <ModalText
            label={tt("Chegirma", "Скидки")}
            value={formatSum(data.contract.discount_money)}
          />
          <ModalText
            label={tt("Debet", "Дебет")}
            value={formatSum(data.contract.debit)}
          />
          <ModalText
            label={tt("Kredit", "Кредит")}
            value={formatSum(data.contract.kridit)}
          />
          <ModalText
            label={tt("Rasxod", "Плот")}
            value={formatSum(data.contract.rasxod_summa)}
          />
          <ModalText
            label={tt("Qoldiq", "Салдо")}
            value={formatSum(data.contract.remaining_summa)}
          />
        </div>
      </div>

      {/* Tables Section */}
      <div className="w-full flex-col gap-6 mt-10 px-2">
        {/* Kirim va Chiqim yonma-yon */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Kirim */}
          <div className="w-full lg:w-1/2">
            <h2 className="mb-3 font-[700] text-mytextcolor">
              {tt("Kirim", "Приход")}
            </h2>
            <Table
              thead={[
                { text: "№", className: "py-[7px] w-[20%] px-[5px]" },
                {
                  text: tt("Sanasi", "Дата"),
                  className: "py-[7px] text-left px-[5px] capitalize",
                },
                {
                  text: tt("Tashkilot", "Ташкилот"),
                  className: "py-[7px] text-left px-[5px] capitalize",
                },
                {
                  text: tt("Summa", "Сумма"),
                  className: "py-[7px] text-left px-[5px] capitalize",
                },
              ]}
            >
              {data.prixods.map((p, index) => (
                <tr
                  key={index}
                  className="border-b border-l border-r border-mytableheadborder"
                >
                  <td className="py-[7px] text-center font-[500]">
                    {p.prixod_doc_num}
                  </td>
                  <td className="py-[7px] px-[5px] font-[500]">
                    {formatDate(p.prixod_date)}
                  </td>
                  <td className="py-[7px] px-[5px] font-[500]">
                    {p.organization_name}
                  </td>
                  <td className="py-[7px] px-[5px] font-[500]">
                    {formatSum(p.prixod_summa)}
                  </td>
                </tr>
              ))}
            </Table>
            <div className="w-full flex justify-end mt-2">
              <div className="w-[180px]">
                <Input v={formatSum(Number(data.contract.debit))} className="w-full text-right" />
              </div>
            </div>
          </div>

          {/* Chiqim */}
          <div className="w-full lg:w-1/2">
            <h2 className="mb-3 font-[700] text-mytextcolor">
              {tt("Chiqim", "Расход")}
            </h2>
            <Table
              thead={[
                { text: "№", className: "py-[7px] w-[20%] px-[5px]" },
                {
                  text: tt("Sanasi", "Дата"),
                  className: "py-[7px] text-left px-[5px] capitalize",
                },
                {
                  text: tt("Birgada №", "Биргада №"),
                  className: "py-[7px] text-left px-[5px] capitalize",
                },
                {
                  text: tt("Summa", "Сумма"),
                  className: "py-[7px] text-left px-[5px] capitalize",
                },
              ]}
            >
              {data.rasxods.map((p, index) => (
                <tr
                  key={index}
                  className="border-b border-l border-r border-mytableheadborder"
                >
                  <td className="py-[7px] text-center font-[500]">{p.doc_num}</td>
                  <td className="py-[7px] px-[5px] font-[500]">
                    {formatDate(p.rasxod_date)}
                  </td>
                  <td className="py-[7px] px-[5px] font-[500]">
                    {p.batalon_account_number}
                  </td>
                  <td className="py-[7px] px-[5px] font-[500]">
                    {formatSum(Number(p.result_summa))}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4}>
                  <div className="w-full flex justify-end mt-2">
                    <div className="w-[180px]">
                      <Input v={formatSum(Number(data.contract.rasxod))} className="w-full text-right" />
                    </div>
                  </div>
                </td>
              </tr>

            </Table>
          </div>
        </div>

        {/* Chiqim FIO pastda */}
        <div className="w-full mt-10">
          <h2 className="mb-3 font-[700] text-mytextcolor">
            {tt("Chiqim FIO", "Расход ФИО")}
          </h2>
          <Table
            thead={[
              { text: "№", className: "py-[7px] w-[20%] px-[5px]" },
              {
                text: tt("Sanasi", "Дата"),
                className: "py-[7px] text-left px-[5px] capitalize",
              },
              {
                text: tt("Batalon", "Баталон"),
                className: "py-[7px] text-center px-[5px] capitalize",
              },
              {
                text: tt("FIO", "ФИО"),
                className: "py-[7px] text-center px-[5px] capitalize",
              },
              {
                text: tt("Tadbir vaqti", "Время события"),
                className: "py-[7px] text-center px-[5px] capitalize",
              },
              {
                text: tt("Summa", "Сумма"),
                className: "py-[7px] text-center px-[5px] capitalize",
              },
            ]}
          >
            {data.rasxod_fios.map((p, index) => (
              <tr
                key={index}
                className="border-b border-l border-r border-mytableheadborder"
              >
                <td className="py-[7px] text-center font-[500]">{p.doc_num}</td>
                <td className="py-[7px] px-[5px] font-[500]">
                  {formatDate(p.rasxod_date)}
                </td>
                <td className="py-[7px] px-[5px] font-[500] text-center">{p.batalon}</td>
                <td className="py-[7px] px-[5px] font-[500] text-center">{p.fio}</td>
                <td className="py-[7px] px-[5px] font-[500] text-center">{p.task_time}</td>
                <td className="py-[7px] px-[5px] font-[500] text-center">
                  {formatSum(Number(p.summa))}
                </td>
              </tr>
            ))}
          </Table>
          <div className="w-full flex justify-end mt-2">
            <div className="w-[180px]">
              <Input v={formatSum(Number(data.contract.rasxod_fio))} className="w-full text-right" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
});

AnalizView.displayName = "AnalizView";
export default AnalizView;
