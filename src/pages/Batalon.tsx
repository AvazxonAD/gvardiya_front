import Button from "@/Components/reusable/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateBatalon, getBat, getBatID, getDEl, updateBat } from "../api";
import Input from "../Components/Input";
import Modal from "../Components/Modal";
import BatTab from "../pageCompoents/BatTab";
import ChangeSelect from "../pageCompoents/ChangeSelect";
import { alertt } from "../Redux/LanguageSlice";
import { formatInn, tt } from "../utils";
import { formatAccountNumber } from "./Organisation";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import { type ExportColumn } from "@/lib/tableExport";
import { Plus } from "lucide-react";
import { permBtn, usePermission } from "@/lib/permissions";
import {
  Button as UIButton,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<any>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Nomi", "Название"), value: (b) => b.name },
  {
    header: tt("Turi", "Тип"),
    value: (b) => (b.birgada ? tt("Brigada", "Бригада") : tt("Batalon", "Батальон")),
    align: "center",
  },
  { header: tt("Manzil", "Адрес"), value: (b) => b.address },
  { header: "INN", value: (b) => formatInn(b.str), align: "center" },
  { header: tt("Bank nomi", "Название банка"), value: (b) => b.bank_name },
  { header: "MFO", value: (b) => b.mfo, align: "center" },
  {
    header: tt("Hisob raqami", "Номер счета"),
    value: (b) => b.account_number,
    excelValue: (b) => String(b.account_number ?? "").replace(/\D/g, ""),
    align: "center",
  },
];

function Batalon() {
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const JWT = useSelector((s: any) => s.auth.jwt);
  const perm = usePermission("batalon");
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
  const [search, setSearch] = useState("");
  const [searchText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const clearFilters = () => {
    setSearch("");
    resetSort();
  };

  // Ro'yxat sahifalanmaydi, lekin qidiruv va saralash serverda bajariladi
  const getInfo = async () => {
    const res = await getBat(
      JWT,
      (searchText ? `search=${encodeURIComponent(searchText)}` : "") +
        sortParams(sort)
    );

    setData(res.data);
  };

  useEffect(() => {
    getInfo();
  }, [searchText, sort]);

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
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-72">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt("Nomi, INN yoki manzil bo'yicha", "По названию, ИНН или адресу")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={getInfo} onClear={clearFilters} />

            <ToolbarSpacer />
            {/* Ro'yxat sahifalanmaydi — ekrandagi (qidirilgan, saralangan) ro'yxat */}
            <ExportButtons
              title={tt("Batalon", "Батальон")}
              columns={exportColumns()}
              fetchRows={async () => data}
            />
            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => setOpen(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
      >
        <BatTab
          data={data}
          edit={edit}
          handleDelete={handleDelete}
          setActive={setActive}
          sort={sort}
          onSort={toggleSort}
        />
      </ListCard>

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
                label={tt("Nomi", "Название")}
                p={tt("Nom kiriting", "Введите название")}
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
                label={tt("MFO", "МФО")}
                p={tt("MFO kiriting", "Введите МФО")}
              />
              <Input
                change={handleChange}
                v={value.account_number}
                n="account_number"
                label={tt("Hisob raqam", "Номер счета")}
                p={tt("Hisob raqam kiriting", "Введите номер счета")}
              />
            </div>
          </div>
          <div className="flex flex-col mt-2 gap-2">
            <span className="text-[0.75rem] leading-[0.9075rem] font-[600] text-muted-foreground">
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
                label={tt("Nomi", "Название")}
                p={tt("Nom kiriting", "Введите название")}
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
                p={tt("Bank nomi kiriting", "Введите название банка")}
              />
              <Input
                change={handleChangeEdit}
                v={value2.mfo}
                n="mfo"
                t="number"
                label={tt("MFO", "МФО")}
                p={tt("MFO kiriting", "Введите МФО")}
              />
              <Input
                change={handleChangeEdit}
                v={value2.account_number}
                n="account_number"
                label={tt("Hisob raqam", "Номер счета")}
                p={tt("Hisob raqam kiriting", "Введите номер счета")}
              />
            </div>
          </div>
          <div className="flex flex-col mt-2 gap-2">
            <span className="text-[0.75rem] leading-[0.9075rem] font-[600] text-muted-foreground">
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
