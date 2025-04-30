import { getSpr } from "@/api";
import Icon from "@/assets/icons";
import DeleteModal from "@/Components/DeleteModal";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Button from "@/Components/reusable/button";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tt } from "../../utils";

function Bxm() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState(1);
  const [delOpen, setDelOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  const JWT = useSelector((s: any) => s.auth.jwt);
  const api = useApi();
  const dispatch = useDispatch();

  const getInfo = async () => {
    const res = await getSpr(JWT, "bxm");
    if (res?.data) {
      setData(res.data);
    }
  };

  useEffect(() => {
    if (!open) {
      setValue("")
    }
    if (!open2) {
      setValue2("")
    }
  }, [open, open2])

  useEffect(() => {
    getInfo();
  }, []);


  const handleDelete = async () => {
    const res: any = await api.remove(`bxm/${active}`);
    if (res?.success) {
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );

      getInfo();
    } else {
      dispatch(
        alertt({
          text: res?.error || res?.message,
          success: false,
        })
      );
    }
  };

  const handleSumbit = async (e: any) => {
    e.preventDefault();
    const upd: any = await api.update(`bxm/${active}`, { summa: value });
    if (upd?.success) {
      setOpen(false)
      getInfo();
    } else {
      dispatch(
        alertt({
          text: upd?.error || upd?.message,
          success: false,
        })
      );
    }
  }

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const upd: any = await api.post(`bxm/`, { summa: value2 });
    if (upd?.success) {
      setOpen2(false)
      getInfo();
    } else {
      dispatch(
        alertt({
          text: upd?.error || upd?.message,
          success: false,
        })
      );
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-mytextcolor text-[20px] leading-[24.2px] font-[500]">
          {tt("Hisob Raqami", "Номер Счета")}
        </h1>
        <Button mode="add" onClick={() => setOpen2(true)} />
      </div>
      <div>
        {data ? (
          <div className="overflow-x-auto rounded-t-[6px] h-[510px] text-[#323232] text-[14px] leading-[16.94px]">
            <table className="min-w-full  ">
              <thead className="bg-mytablehead text-mytextcolor text-[14px] leading-[16.94px] rounded-t-[6px] border-b border-mytableheadborder">
                <tr className="">
                  <th className="px-4 py-3 text-left">{tt("№", "№")}</th>

                  <th className="pr-[350px] py-3 text-left">
                    {tt("Bxm summa", "Сумма Bxm")}
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
                      {person.summa}
                    </td>

                    <td className="py-3 text-inherit flex justify-center ">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setValue(person.summa);
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
            {tt("Malumot yo'q", "Нет дата")}
          </div>
        )}
        <Modal
          closeModal={() => {
            setOpen(false);
          }}
          title={tt("Tahrirlash", "Редактировать")}
          open={open}
        >
          <form onSubmit={handleSumbit}>
            <Input
              t={"number"}
              v={value}
              change={(e: any) => {
                const val = e.target.value;
                setValue(val)
              }} // Har safar qiymatni formatlaymiz
              label={tt("Summa", "Сумма")}
              p={tt("Summa kiriting", "Введите Сумма")}
            />
            <div className="mt-5 flex justify-end">
              <Button mode="edit" type="submit" />
            </div>
          </form>
        </Modal>

        <Modal
          closeModal={() => {
            setOpen2(false);
          }}
          title={tt("Qo'shish", "Добавить")}
          open={open2}
        >
          <form onSubmit={handleAdd}>
            <Input
              t={"number"}
              v={value2}
              change={(e: any) => {
                const val = e.target.value;
                setValue2(val)
              }} // Har safar qiymatni formatlaymiz
              label={tt("Summa", "Сумма")}
              p={tt("Summa kiriting", "Введите Сумма")}
            />
            <div className="mt-5 flex justify-end">
              <Button mode="add" type="submit" />
            </div>
          </form>
        </Modal>

        <DeleteModal
          open={delOpen}
          deletee={handleDelete}
          closeModal={() => {
            setDelOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default Bxm;
