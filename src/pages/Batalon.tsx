import Button from "@/Components/reusable/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateBatalon, getBat, getBatID, getDEl, updateBat } from "../api";
import Input from "../Components/Input";
import Modal from "../Components/Modal";
import BatTab from "../pageCompoents/BatTab";
import ChangeSelect from "../pageCompoents/ChangeSelect";
import { alertt } from "../Redux/LanguageSlice";
import { latinToCyrillic, tt } from "../utils";
import { formatAccountNumber } from "./Organisation";

function Batalon() {
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const JWT = useSelector((s: any) => s.auth.jwt);
  const [active, setActive] = useState(1);

  const [open, setOpen] = useState(false);

  const [value, setValue] = useState({
    name: "",
    birgada: false,
    mfo: "",
    bank_name: "",
    account_number: "",
    address: "",
    str: "",
  });

  const [open2, setOpen2] = useState(false);

  const [value2, setValue2] = useState({
    name: "",
    birgada: false,
    mfo: "",
    bank_name: "",
    account_number: "",
    address: "",
    str: "",
  });
  const getInfo = async () => {
    const res = await getBat(JWT);

    setData(res.data);
  };

  useEffect(() => {
    getInfo();
  }, []);

  const handleDelete = async () => {
    const res = await getDEl(JWT, active);

    if (res.success) {
      dispatch(
        alertt({
          success: true,
          text: res.message,
        })
      );
      getInfo();
    } else {
      dispatch(
        alertt({
          success: false,
          text: res.message,
        })
      );
    }
  };

  const handleChange = (e: any) => {
    if (e.target.name === "account_number") {
      setValue({
        ...value,
        account_number: formatAccountNumber(e.target.value),
      });
    } else {
      setValue({ ...value, [e.target.name]: e.target.value });
    }
  };
  const handleChangeEdit = (e: any) => {
    if (e.target.name === "account_number") {
      setValue2({
        ...value2,
        account_number: formatAccountNumber(e.target.value),
      });
    } else {
      setValue2({ ...value2, [e.target.name]: e.target.value });
    }
  };
  const setInfo = async () => {
    if (value.account_number) {
      setValue({
        ...value,
        // @ts-ignore
        account_number: value.account_number.replaceAll(" ", ""),
      });
    }
    const res = await CreateBatalon(value, JWT);

    if (res.success) {
      getInfo();
      setOpen(false);
      dispatch(
        alertt({
          success: true,
          text: res.message,
        })
      );
      //@ts-ignore
      setValue({ name: "", birgada: false });
    } else {
      dispatch(
        alertt({
          success: false,
          text: res.message,
        })
      );
    }
  };
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInfo();
  };

  const editInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value2.account_number) {
      setValue2({
        ...value2,
        // @ts-ignore
        account_number: value2.account_number.replaceAll(" ", ""),
      });
    }
    const res = await updateBat(value2, JWT, active);
    if (res.success) {
      getInfo();
      setOpen2(false);
      dispatch(
        alertt({
          success: true,
          text: res.message,
        })
      );
    } else {
      dispatch(
        alertt({
          success: false,
          text: res.message,
        })
      );
    }
  };

  const edit = async (e: any) => {
    const res = await getBatID(JWT, e);
    if (res.success) {
      const { id, account_number, ...rest } = res.data;

      setValue2({
        account_number: account_number ? formatAccountNumber(account_number) : '',
        ...rest,
      });

      setActive(e);

      setOpen2(true);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-end items-center ">
        <Button mode="add" onClick={() => setOpen(true)} />
      </div>

      <BatTab
        data={data}
        edit={edit}
        handleDelete={handleDelete}
        setActive={setActive}
      />

      <Modal
        open={open}
        closeModal={() => setOpen(false)}
        w="730px"
        title={tt("Batalon qo’shish", "Добавить батальон")}
      >
        <form onSubmit={handleCreate}>
          <div className="flex gap-6">
            <div className="flex gap-3 flex-col">
              <Input
                t={"text"}
                change={handleChange}
                v={value.name}
                n="name"
                label={tt("Nomi", "Имя")}
                p={tt("Nom kiriting", "Введите имя")}
              />
              <Input
                change={handleChange}
                v={value.address}
                n="address"
                label={tt("Manzil", "Адрес")}
                p={tt("Manzil kiriting", "Введите адрес")}
              />
              <Input
                change={handleChange}
                v={value.str}
                n="str"
                t="number"
                label={tt("INN", "ИНН")}
                p={tt("INN", "ИНН")}
              />
            </div>
            <div className="flex gap-3 flex-col">
              <Input
                change={handleChange}
                v={value.bank_name}
                n="bank_name"
                label={tt("Bank nomi", "Название банка")}
                p={tt("Bank nomi kiriting", "Введите название банка")}
              />
              <Input
                change={handleChange}
                v={value.mfo}
                n="mfo"
                t="number"
                label={tt("MFO", latinToCyrillic("MFO"))}
                p={tt("MFO kiriting", "Введите информацию")}
              />
              <Input
                change={handleChange}
                v={value.account_number}
                n="account_number"
                label={tt("Hisob raqam", "Счет номер")}
                p={tt("Hisob raqam kiriting", "Введите номер счета")}
              />
            </div>
          </div>
          <div className="flex flex-col mt-2 gap-2">
            <span className="text-[12px]  leading-[14.52px] font-[600] text-[#636566]">
              {tt("Batalon tanlang", "Выберите батальон")}
            </span>
            <ChangeSelect
              onChange={(e: any) => setValue({ ...value, birgada: e })}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button mode="save" type="submit" />
          </div>
        </form>
      </Modal>

      <Modal
        open={open2}
        w="730px"
        closeModal={() => setOpen2(false)}
        title={tt("Batalon tahrirlash", "Редактировать батальон")}
      >
        <form onSubmit={editInfo}>
          <div className="flex gap-6">
            <div className="flex gap-3 flex-col">
              <Input
                t={"text"}
                change={handleChangeEdit}
                v={value2.name}
                n="name"
                label={tt("Nomi", "Имя")}
                p={tt("Nom kiriting", "Введите имя")}
              />
              <Input
                change={handleChangeEdit}
                v={value2.address}
                n="address"
                label={tt("Manzil", "Адрес")}
                p={tt("Manzil kiriting", "Введите адрес")}
              />
              <Input
                change={handleChangeEdit}
                v={value2.str}
                n="str"
                t="number"
                label={tt("INN", "ИНН")}
                p={tt("INN", "ИНН")}
              />
            </div>
            <div className="flex gap-3 flex-col">
              <Input
                change={handleChangeEdit}
                v={value2.bank_name}
                n="bank_name"
                label={tt("Bank nomi", "Название банка")}
                p={tt("Bank nomi kiritng", "Введите название банка")}
              />
              <Input
                change={handleChangeEdit}
                v={value2.mfo}
                n="mfo"
                t="number"
                label={tt("MFO", latinToCyrillic("MFO"))}
                p={tt("MFO kiriting", "Введите информацию")}
              />
              <Input
                change={handleChangeEdit}
                v={value2.account_number}
                n="account_number"
                label={tt("Hisob raqam", "Счет номер")}
                p={tt("Hisob raqam kiriting", "Введите номер счета")}
              />
            </div>
          </div>
          <div className="flex flex-col mt-2 gap-2">
            <span className="text-[12px]  leading-[14.52px] font-[600] text-[#636566]">
              {tt("Batalon tanlang", "Выберите батальон")}
            </span>
            <ChangeSelect
              value={value2.birgada}
              onChange={(e: any) => setValue2({ ...value2, birgada: e })}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button mode="save" type="submit" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Batalon;
