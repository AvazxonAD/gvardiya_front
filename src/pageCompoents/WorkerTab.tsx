import Icon from "@/assets/icons";
import useFullHeight from "@/hooks/useFullHeight";
import { useState } from "react";
import DeleteModal from "../Components/DeleteModal";
import { textNum, tt } from "../utils";

interface IWorker {
  id: string | number;
  fio: string;
  account_number: string;
  xisob_raqam: string;
  batalon_name: string;
}

const WorkerTab = ({
  data,
  handleDelete,
  setActive,
  page,
  itemsPerPage,
  edit,
}: any) => {
  const [delOpen, setDelOpen] = useState(false);

  const getRowNumber = (index: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const height = useFullHeight();

  // fullHeight ni integer yoki string bo'lishiga qarab px formatini beramiz
  const fullHeightValue =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  return (
    <>
      {data ? (
        <div
          className="rounded-t-[6px] text-[14px] leading-[16.94px] border"
          style={{
            maxHeight: fullHeightValue,
            overflowY: "auto",
          }}
        >
          <table className="min-w-full relative border-collapse">
            <thead className="bg-mytablehead sticky top-0 z-10 text-[14px] leading-[16.94px] rounded-t-[6px] border border-mytableheadborder">
              <tr className="text-mytextcolor">
                <th className="px-4 py-3 text-left w-[100px]">
                  {tt("№", "№")}
                </th>
                <th className="px-4 py-3 text-left w-[250px]">
                  {tt("F.I.O", "Ф.И.О")}
                </th>
                <th className="px-4 py-3 text-center w-[200px]">
                  {tt("Karta raqam", "Номер карты")}
                </th>
                <th className="px-4 py-3 text-center w-[200px]">
                  {tt("Hisob raqam", "Номер счета")}
                </th>
                <th className="px-4 py-3 text-center w-[200px]">
                  {tt("Batalon", "Батальон")}
                </th>
                <th className="px-4 py-3 text-right w-[120px]">
                  {tt("Amallar", "Действия")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((person: IWorker, index: number) => (
                <tr
                  key={person.id}
                  className="hover:text-[#3B7FAF] text-mytextcolor cursor-pointer transition-colors duration-300 border-b border-mytableheadborder"
                >
                  <td className="px-4 py-3 text-left">{getRowNumber(index)}</td>
                  <td className="px-4 py-3 text-left truncate">{person.fio}</td>
                  <td className="px-4 py-3 text-center">
                    {textNum(person.account_number, 4)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {textNum(person.xisob_raqam, 4)}
                  </td>
                  <td className="px-4 py-3 text-center truncate">
                    {person.batalon_name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => edit(person.id)}
                        className="hover:opacity-80 transition-opacity"
                        type="button"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        onClick={() => {
                          setDelOpen(true);
                          setActive(person.id);
                        }}
                        className="hover:opacity-80 transition-opacity"
                        type="button"
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
          style={{
            height:
              typeof fullHeightValue === "number"
                ? `${fullHeightValue}px`
                : fullHeightValue,
          }}
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
    </>
  );
};

export default WorkerTab;
