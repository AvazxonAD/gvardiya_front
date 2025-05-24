/** @format */

import Icon from "@/assets/icons";
import DescriptionModal from "@/Components/reusable/descriptionModal";
import useFullHeight from "@/hooks/useFullHeight";
import { IOrganization } from "@/types/organization";
import { useState } from "react";
import DeleteModal from "../Components/DeleteModal";
import { textNum, tt } from "../utils";

const OrganTAb = ({
  data,
  handleDelete,
  setActive,
  page,
  itemsPerPage,
  openEdit,
  variant,
}: any) => {
  const [delOpen, setDelOpen] = useState(false);

  // Calculate starting index based on the current page
  const getRowNumber = (index: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;
  const [activeItem, setActiveItem] = useState<IOrganization>();

  return (
    <>
      <div
        className="overflow-x-auto rounded-t-[6px] text-[14px] leading-[16.94px] hide__scrollbar"
        style={{
          maxHeight: fullHeight,
          overflowY: "auto",
        }}
      >
        <table className="min-w-full">
          <thead className="bg-mytablehead sticky z-10 -top-1 text-mytextcolor text-[14px] leading-[16.94px] rounded-t-[6px] border-b border-mytableheadborder">
            <tr>
              <th className="px-4 py-3 text-left w-[100px]">{tt("№", "№")}</th>
              <th className="px-4 py-3 text-left w-[400px]">
                {tt("Name", "Название")}
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
              {!variant && (
                <th className="px-4 py-3 text-center w-[120px]">
                  {tt("Amallar", "Действия")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((person: IOrganization, index: number) => (
              <tr
                onClick={() => {
                  if (variant) {
                    setActive(person.id);
                  }
                }}
                key={person.id}
                className={`${index % 2 === 0
                  ? "bg-white dark:bg-mybackground"
                  : "bg-[#F4FAFD] dark:bg-mybackground"
                  } cursor-pointer hover:text-[#3B7FAF] transition-colors duration-300 text-mytextcolor border-b border-mytableheadborder`}
              >
                <td className="px-4 py-3  text-inherit ">
                  {getRowNumber(index)}{" "}
                </td>
                <td
                  onClick={() => setActiveItem(person)}
                  className="px-4 py-3 text-inherit "
                >
                  {person.name}
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
                {!variant && (
                  <td className="px-3 py-3 ">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => openEdit(person.id)}>
                        <Icon name="edit" />
                      </button>
                      <button
                        onClick={() => {
                          setDelOpen(true);
                          setActive(person.id);
                        }}
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => {
          setDelOpen(false);
        }}
      />
      {/* {activeItem ? (
        <DescriptionModal
          open={Boolean(activeItem)}
          closeModal={() => setActiveItem(undefined)}
          title={activeItem.name + " " + tt("ma'lumotlari", "информация")}
          items={[
            [
              { text: tt("Manzil", "Адрес"), value: activeItem.address },
              { text: tt("INN", "ИНН"), value: textNum(activeItem.str, 3) },
              {
                text: tt("Bank nomi", "Название банка"),
                value: activeItem.bank_name,
              },
              { text: tt("MFO", "МФО"), value: activeItem.mfo },
            ],
          ]}
        />
      ) : (
        <></>
      )} */}
    </>
  );
};

export default OrganTAb;
