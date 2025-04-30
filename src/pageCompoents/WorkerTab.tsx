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
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  return (
    <>
      {data ? (
        <div
          className={`rounded-t-[6px] text-[14px] leading-[16.94px] border hide__scrollbar`}
          style={{ maxHeight: fullHeight, overflowY: "auto" }}
        >
          <table className="min-w-full relative">
            <thead className="bg-mytablehead sticky z-10 -top-1 text-[14px] leading-[16.94px] rounded-t-[6px] border border-mytableheadborder">
              <tr className="text-mytextcolor">
                <th className="px-4 py-3 text-left w-[100px]">
                  {tt("№", "№")}
                </th>
                <th className="px-4 py-3 text-left w-[250px]">
                  {tt("ID", "ID")}
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
                  {tt("Batalion", "Батальон")}
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
                  className={`hover:text-[#3B7FAF] text-mytextcolor cursor-pointer transition-colors duration-300 border-b border-mytableheadborder`}
                >
                  <td className="px-4 py-3 text-inherit   text-left">
                    {getRowNumber(index)}
                  </td>
                  <td className="px-4 py-3 text-inherit   text-left truncate">
                    {person.id}
                  </td>
                  <td className="px-4 py-3 text-inherit   text-left truncate">
                    {person.fio}
                  </td>
                  <td className="px-4 py-3 text-inherit   text-center">
                    {textNum(person.account_number, 4)}
                  </td>
                  <td className="px-4 py-3 text-inherit   text-center">
                    {textNum(person.xisob_raqam, 4)}
                  </td>
                  <td className="px-4 py-3 text-inherit   text-center truncate">
                    {person.batalon_name}
                  </td>
                  <td className="px-4 py-3   text-right">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => edit(person.id)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        onClick={() => {
                          setDelOpen(true);
                          setActive(person.id);
                        }}
                        className="hover:opacity-80 transition-opacity"
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
    </>
  );
};

export default WorkerTab;
