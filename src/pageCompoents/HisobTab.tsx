import { useState } from "react";

import Icon from "@/assets/icons";
import DeleteModal from "../Components/DeleteModal";
import Modal from "../Components/Modal";
import { textNum, tt } from "../utils";

const HisobTab = ({
  data,
  children,
  setActive,
  setOpen,
  open,
  titleM,
  handleDelete,
}: any) => {
  const [delOpen, setDelOpen] = useState(false);

  return (
    <>
      {data ? (
        <div className="overflow-x-auto rounded-t-[6px] h-[510px] text-[#323232] text-[14px] leading-[16.94px]">
          <table className="min-w-full  ">
            <thead className="bg-mytablehead text-mytextcolor text-[14px] leading-[16.94px] rounded-t-[6px] border-b border-mytableheadborder">
              <tr className="">
                <th className="px-4 py-3 text-left">{tt("№", "№")}</th>

                <th className="pr-[350px] py-3 text-left">
                  {tt("Hisob raqami", "Номер счета")}
                </th>

                <th className="py-3 text-center w-[80px]">
                  {tt("Amallar", "Действия")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((person: any, index: number) => (
                <tr
                  key={person.id}
                  className={`${index % 2 === 0 ? " bg-white   dark:bg-mybackground" : " bg-[#F4FAFD] dark:bg-mybackground"
                    } cursor-pointer hover:text-[#3B7FAF] transition-colors duration-300 text-mytextcolor border-b border-mytableheadborder`}
                >
                  <td className="px-4 py-3 text-inherit ">
                    {index + 1}
                  </td>

                  <td className="pr-[100px] py-3 text-inherit ">
                    {textNum(person.account_number, 4)}
                  </td>

                  <td className="py-3 text-inherit flex justify-center ">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setActive(person.id);
                          setOpen(true);
                        }}
                      >
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[400px] w-full text-[#323232] font-[500] text-[20px] flex justify-center items-center bg-[#F4FAFD] rounded-lg">
          {tt("Malumot yo'q", "Нет ссылки")}
        </div>
      )}
      <Modal
        closeModal={() => {
          setOpen(false);
        }}
        title={titleM}
        open={open}
      >
        {children}
      </Modal>

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => {
          setDelOpen(false);
        }}
      />
    </>
  );
};

export default HisobTab;
