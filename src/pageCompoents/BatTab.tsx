import Icon from "@/assets/icons";
import DescriptionModal from "@/Components/reusable/descriptionModal";
import useFullHeight from "@/hooks/useFullHeight";
import { IBatalon } from "@/types/batalon";
import { useState } from "react";
import DeleteModal from "../Components/DeleteModal";
import { textNum, tt } from "../utils";

const BatTab = ({ data, setActive, edit, handleDelete }: any) => {
  const [delOpen, setDelOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<IBatalon>();

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  return (
    <>
      {data ? (
        <div
          className="mt-6 overflow-x-auto rounded-t-[6px] text-[14px] leading-[16.94px]"
          style={{
            height: fullHeight,
            maxHeight: fullHeight,
            overflowY: "auto",
          }}
        >
          <table className="min-w-full">
            <thead className="bg-mytablehead text-mytextcolor text-[14px] leading-[16.94px] rounded-t-[6px] border-b border-mytableheadborder sticky -top-1">
              <tr>
                <th className="px-4 py-3 text-left w-[100px]">
                  {tt("№", "№")}
                </th>
                <th className="px-4 py-3 text-left w-[400px]">
                  {tt("Name", "Название")}
                </th>
                <th className="px-4 py-3 text-left w-[400px]">
                  {tt("Batalon", "Батальон")}
                </th>
                <th className="px-4 py-3 text-left w-[400px]">
                  {tt("Adress", "Адрес")}
                </th>
                <th className="px-4 py-3 text-left w-[200px]">
                  {tt("INN", "ИНН")}
                </th>
                <th className="px-4 py-3 text-left w-[200px]">
                  {tt("Bank Nomi", "Название банка")}
                </th>
                <th className="px-4 py-3 text-left w-[200px]">
                  {tt("MFO", "МФО")}
                </th>
                <th className="px-4 py-3 text-left w-[200px]">
                  {tt("Hisob raqami", "Номер счета")}
                </th>
                <th className="px-4 py-3 text-left w-[200px]">
                  {tt("Hisob raqami g'azna", "Номер счета казна")}
                </th>
                <th className="px-4 py-3 text-center w-[120px]">
                  {tt("Amallar", "Действия")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((person: IBatalon, index: number) => (
                <tr
                  key={person.id}
                  className={`${
                    person.birgada
                      ? "bg-[#F1FAFA] dark:bg-mytableheadborder"
                      : ""
                  } cursor-pointer hover:text-[#3B7FAF] text-mytextcolor border-b border-mytableheadborder transition-colors duration-300`}
                >
                  <td className="px-4 py-3 text-inherit ">{index + 1}</td>
                  <td
                    onClick={() => setActiveItem(person)}
                    className="px-4 py-3 text-inherit  max-w-[200px] truncate"
                  >
                    {person.name}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[124px] truncate">
                    {person.birgada
                      ? tt("Brigada", "Бригада")
                      : tt("Batalon", "Батальон")}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[124px] truncate">
                    {person.address}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[70px] truncate">
                    {textNum(person.str, 3)}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[70px] truncate">
                    {person.bank_name}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[70px] truncate">
                    {person.mfo}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[70px] truncate">
                    {person.account_numbers?.map((num) => (
                      <div key={num.account_number}>{num.account_number}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-inherit  max-w-[70px] truncate">
                    {person.gazna_numbers?.map((num) => (
                      <div key={num.gazna_number}>{num.gazna_number}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 ">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => edit(person.id)}
                        className="hover:opacity-80"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        onClick={() => {
                          setDelOpen(true);
                          setActive(person.id);
                        }}
                        className="hover:opacity-80"
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{ height: fullHeight }}
          className="w-full text-[#323232] font-[500] text-[20px] flex justify-center items-center bg-[#F4FAFD] rounded-lg"
        >
          {tt("Malumot yo'q", "Нет ссылки")}
        </div>
      )}

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => setDelOpen(false)}
      />

      {activeItem && (
        <DescriptionModal
          open={true}
          closeModal={() => setActiveItem(undefined)}
          title={activeItem.name}
          items={[
            [
              { text: tt("Manzil", "Адрес"), value: activeItem.address },
              { text: tt("MFO", "МФО"), value: activeItem.mfo },
              {
                text: tt("Bank nomi", "Название банка"),
                value: activeItem.bank_name,
              },
              { text: tt("INN", "ИНН"), value: textNum(activeItem.str, 3) },
            ],
          ]}
        />
      )}
    </>
  );
};

export default BatTab;
