/** @format */

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreateWorker,
  deleteWorker,
  getSpr,
  getWorkerId,
  getWorkers,
  updateWorker,
} from "../api";
import Input from "../Components/Input";
import Modal from "../Components/Modal";
import Paginatsiya from "../Components/Paginatsiya";
import WorkerTab from "../pageCompoents/WorkerTab";
import { tt } from "../utils";

import Download from "@/Components/Download";
import Button from "@/Components/reusable/button";
import { Checkbox } from "@/Components/ui/checkbox";
import useApi from "@/services/api";
import { IWorker } from "@/types/worker";
import { useReactToPrint } from "react-to-print";
import { useDebounce } from "use-debounce";
import Select from "../Components/Select";
import { alertt } from "../Redux/LanguageSlice";
import FIOForPrint from "./workers/FioForPrint";
import { FileSpreadsheet, Plus, Printer, RotateCcw } from "lucide-react";
import {
  Button as UIButton,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

const formatAccountNumber = (value: string) => {
  if (!value) return "";
  let newValue = value?.replace(/[^\d]/g, ""); // faqat raqamlar qolsin
  let formattedValue = "";

  for (let i = 0; i < newValue?.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += " "; // Har 3 ta raqamdan keyin bo'sh joy qo'shamiz
    }
    formattedValue += newValue[i]; // Raqamlarni formatlangan qiymatga qo'shamiz
  }

  return formattedValue?.trim(); // O'ng va chapdagi bo'sh joylarni tozalaymiz
};
function Workers() {
  const [data, setData] = useState<any[]>([]);
  const JWT = useSelector((s: any) => s.auth.jwt);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalpage] = useState(10); // Example number of pages
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(1);
  const [batalons, setBatalons] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [searchId, setSearchID] = useState(0);
  const [downOpen, setDownOpen] = useState(false);
  const [downOpen2, setDownOpen2] = useState(false);
  const [limet, setLimet] = useState(15);
  const [all, setAll] = useState(10);
  const [value, setValue] = useState<any>({
    fio: "",
    batalon_id: 0,
    account_number: "",
    xisob_raqam: "",
    is_muddatli_harbiy: false,
  });
  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState<any>({
    fio: "",
    batalon_id: 0,
    account_number: "",
    is_muddatli_harbiy: false,
  });
  const [searchingText] = useDebounce(search, 500);
  const getInfo = async () => {
    const res = await getWorkers(
      JWT,
      currentPage,
      limet,
      searchId,
      searchingText
    );

    setData(res.data);
    setTotalpage(res.meta.pageCount);
    setAll(res.meta.count);
  };
  // Starting at page 2 for example

  useEffect(() => {
    getBatalyons();
  }, []);

  useEffect(() => {
    // If search or filter changes and we're not on page 1, reset to page 1
    if ((searchId || searchingText) && currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // Only fetch data if we're not in the middle of resetting the page
      getInfo();
    }
  }, [currentPage, limet, searchId, searchingText]);

  const closeModal = () => {
    setOpen(false);
  };
  const handleDelete = async () => {
    const res = await deleteWorker(JWT, active);

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

  const dispatch = useDispatch();
  const setInfo = async () => {
    const res = await CreateWorker(
      {
        ...value,
        //@ts-ignore
        account_number: value.account_number.replaceAll(" ", ""),
        //@ts-ignore
        xisob_raqam: value.xisob_raqam.replaceAll(" ", ""),
        batalon_id: value?.batalon_id > 0 ? value.batalon_id : null,
      },
      JWT
    );

    if (res.success) {
      getInfo();
      setOpen(false);
      setValue({});
      dispatch(
        alertt({
          success: true,
          text: res.message,
        })
      );

      setValue({
        fio: "",
        batalon_id: 0,
        account_number: "",
        xisob_raqam: "",
        is_muddatli_harbiy: false,
      });
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

  const getBatalyons = async () => {
    const res = await getSpr(JWT, "batalon", true);

    if (res?.data && res?.success) {
      setBatalons(res.data);
    }
  };

  const editInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newdata = value2;
    newdata.account_number = newdata.account_number.replaceAll(" ", "");
    newdata.xisob_raqam = newdata.xisob_raqam.replaceAll(" ", "");
    if (newdata?.batalon_id == 0) {
      newdata.batalon_id = null;
    }

    const res = await updateWorker(newdata, JWT, active);

    if (res.success) {
      getInfo();
      setOpen2(false);
      setValue2({});
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
    const res = await getWorkerId(JWT, e);
    const batalon = batalons.find((i: any) => i.name === res.data.batalon_name);

    const { id, batalon_name, ...data } = res.data;
    if (res.success) {
      setValue2({
        fio: res.data.fio,
        ...data,
        account_number: formatAccountNumber(res?.data?.account_number),
        xisob_raqam: formatAccountNumber(res?.data.xisob_raqam),
        batalon_id: batalon ? batalon.id : 0,
        is_muddatli_harbiy: !!res.data.is_muddatli_harbiy,
      });
      setActive(e);
      setOpen2(true);
    }
  };

  const handleSearchByBatalon = async (e: number) => {
    setSearchID(e);
  };

  const api = useApi();
  const [forPdf, setForPdf] = useState<{ total: number; data: IWorker[] }>();
  const fioRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: fioRef,
  });
  const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const batalonParam = searchId ? `?batalon_id=${searchId}` : "";
    const get = await api.get(`worker/pdf${batalonParam}`);
    if (get?.success) {
      setForPdf(get.data as any);
    }
  };
  useEffect(() => {
    if (forPdf) {
      reactToPrintFn();
    }
  }, [forPdf]);


  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="hidden">
        <FIOForPrint ref={fioRef} data={forPdf} />
      </div>

      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt("Ismlar bo’yicha qidiruv", "Поиск по имени")}
                className="h-9 w-full"
              />
            </div>

            <Select
              data={batalons}
              def
              value={searchId}
              onChange={(e: any) => handleSearchByBatalon(e)}
              p={tt("Batalon orqali qidiring", "Выберите батальон")}
              w={240}
            />

            <UIButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSearchID(0);
              }}
            >
              <RotateCcw />
              {tt("Tozalash", "Очистить")}
            </UIButton>

            <ToolbarSpacer />

            <UIButton variant="secondary" size="sm" onClick={onPrintClick}>
              <Printer />
              {tt("Chop etish", "Печать")}
            </UIButton>
            <UIButton variant="secondary" size="sm" onClick={() => setDownOpen(true)}>
              <FileSpreadsheet />
              Excel
            </UIButton>
            <UIButton variant="secondary" size="sm" onClick={() => setDownOpen2(true)}>
              <FileSpreadsheet />
              {tt("Shablon", "Шаблон")}
            </UIButton>
            <UIButton size="sm" onClick={() => setOpen(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          <Paginatsiya
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            limet={limet}
            setLimet={setLimet}
            count={all}
          />
        }
      >
        <WorkerTab
          setActive={setActive}
          handleDelete={handleDelete}
          page={currentPage}
          itemsPerPage={10}
          data={data}
          edit={edit}
        />
      </ListCard>

      <Modal
        open={open}
        closeModal={closeModal}
        title={tt("Xodim qo'shish", "Добавить сотрудника")}
      >
        <form onSubmit={handleCreate}>
          <div className="flex gap-3 flex-col w-full">
            <Input
              v={value.fio}
              change={(e: any) => setValue({ ...value, fio: e.target.value })}
              label={tt(
                "Ism, familya, otasining ismi",
                "Имя, фамилия, отчество"
              )}
              p={tt(
                "Ism, familya, otasining ismini kiriting",
                "Введите имя, фамилия и отчество"
              )}
            />
            <Input
              v={value.account_number}
              change={(e: any) =>
                setValue({
                  ...value,
                  account_number: formatAccountNumber(e.target.value),
                })
              }
              label={tt("Karta raqam", "Номер карты")}
              p={tt("Karta raqamini kiriting", "Введите номер карты")}
            />
            <Input
              v={value.xisob_raqam}
              change={(e: any) =>
                setValue({
                  ...value,
                  xisob_raqam: formatAccountNumber(e.target.value),
                })
              }
              label={tt("Hisob raqam", "Номер счета")}
              p={tt("Hisob raqamini kiriting", "Введите номер счета")}
            />
            <Select
              up
              value={value.batalon_id}
              onChange={(e: any) => setValue({ ...value, batalon_id: e })}
              data={[{ id: 0, name: tt("Tanlang", "Выбрать") }, ...batalons]}
              label={tt("Batalon nomi", "Наименование батальона")}
              p={tt("Batalon nomini tanlang", "Выберите название батальона")}
            />
            <Checkbox
              label={tt(
                "Muddatli harbiy xizmatchi",
                "Военнослужащий срочной службы"
              )}
              checked={!!value.is_muddatli_harbiy}
              handleChange={() =>
                setValue({
                  ...value,
                  is_muddatli_harbiy: !value.is_muddatli_harbiy,
                })
              }
            />
            <div className="flex justify-end mt-4">
              <Button mode="save" type="submit" />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={open2}
        closeModal={() => setOpen2(false)}
        title={tt("Xodim tahrirlash", "Сотрудник править")}
      >
        <form onSubmit={editInfo}>
          <div className="flex gap-3 flex-col w-full">
            <Input
              v={value2.fio}
              change={(e: any) => setValue2({ ...value2, fio: e.target.value })}
              label={tt(
                "Ism, familya, otasining ismi",
                "Имя, фамилия, отчество"
              )}
              p={tt(
                "Ism, familya, otasining ismini kiriting",
                "Введите имя, фамилия и отчество"
              )}
              className="w-full"
            />
            <Input
              v={value2.account_number}
              change={(e: any) =>
                setValue2({
                  ...value2,
                  account_number: formatAccountNumber(e.target.value),
                })
              }
              label={tt("Karta raqam", "Номер карты")}
              p={tt("Karta raqamini kiriting", "Введите номер карты")}
              className="w-full"
            />
            <Input
              v={value2.xisob_raqam}
              change={(e: any) =>
                setValue2({
                  ...value2,
                  xisob_raqam: formatAccountNumber(e.target.value),
                })
              }
              label={tt("Hisob raqam", "Номер счета")}
              p={tt("Hisob raqamini kiriting", "Введите номер счета")}
              className="w-full"
            />
            {value2 && (
              <Select
                up
                value={value2?.batalon_id ? value2.batalon_id : 0}
                onChange={(e: any) => setValue2({ ...value2, batalon_id: e })}
                data={[{ id: 0, name: tt("Tanlang", "Выбрать") }, ...batalons]}
                label={tt("Batalon nomi", "Наименование батальона")}
                p={tt("Batalon nomini tanlang", "Выберите название батальона")}
                className="!w-full"
              />
            )}
            <Checkbox
              label={tt(
                "Muddatli harbiy xizmatchi",
                "Военнослужащий срочной службы"
              )}
              checked={!!value2.is_muddatli_harbiy}
              handleChange={() =>
                setValue2({
                  ...value2,
                  is_muddatli_harbiy: !value2.is_muddatli_harbiy,
                })
              }
            />
            <div className="flex justify-end mt-4">
              <Button mode="save" type="submit" />
            </div>
          </div>
        </form>
      </Modal>

      <Download
        open={downOpen2}
        closeModal={() => setDownOpen2(false)}
        URL={"/worker/template/"}
      />
      <Download
        open={downOpen}
        closeModal={() => setDownOpen(false)}
        URL={"/worker/excel"}
      />
    </div>
  );
}

export default Workers;
