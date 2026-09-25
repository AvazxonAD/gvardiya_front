/** @format */

import { useEffect, useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useDispatch, useSelector } from "react-redux";
import {
  CreateWorker,
  deleteWorker,
  getSpr,
  getExcel,
  getWorkerId,
  getWorkers,
  updateWorker,
} from "../api";
import Input from "../Components/Input";
import Modal from "../Components/Modal";
import Paginatsiya from "../Components/Paginatsiya";
import WorkerTab from "../pageCompoents/WorkerTab";
import { tt } from "../utils";

import ExportMenu, { excelIcon, reportItems } from "@/Components/ExportMenu";
import { saveBlob } from "@/lib/tableExport";
import Button from "@/Components/reusable/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { useDebounce } from "use-debounce";
import Select from "../Components/Select";
import { alertt } from "../Redux/LanguageSlice";
import { Plus } from "lucide-react";
import { permBtn, usePermission } from "@/lib/permissions";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
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
  const perm = usePermission("workers");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalpage] = useState(10); // Example number of pages
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(1);
  const [batalons, setBatalons] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [searchId, setSearchID] = useState(0);
  const [limet, setLimet] = useState(15);
  const [all, setAll] = useState(10);
  const [value, setValue] = useState<any>({
    fio: "",
    batalon_id: 0,
    account_number: "",
    xisob_raqam: "",
    pinfl: "",
    is_muddatli_harbiy: false,
  });
  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState<any>({
    fio: "",
    batalon_id: 0,
    account_number: "",
    pinfl: "",
    is_muddatli_harbiy: false,
  });
  const [searchingText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const clearFilters = () => {
    setSearch("");
    setSearchID(0);
    resetSort();
  };

  const getInfo = async () => {
    const res = await getWorkers(
      JWT,
      currentPage,
      limet,
      searchId,
      searchingText,
      sortParams(sort)
    );

    setData(res.data);
    setTotalpage(res.meta.pageCount);
    setAll(res.meta.count);
  };
  // Starting at page 2 for example

  useEffect(() => {
    getBatalyons();
  }, []);

  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, searchId, searchingText, sort],
    fetch: getInfo,
  });

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
  const pinflInvalid = (pinfl?: string | null) => {
    if (!pinfl || /^\d{14}$/.test(pinfl)) return false;
    dispatch(
      alertt({
        success: false,
        text: tt(
          "PINFL 14 ta raqamdan iborat bo'lishi kerak",
          "ПИНФЛ должен состоять из 14 цифр"
        ),
      })
    );
    return true;
  };
  const setInfo = async () => {
    if (pinflInvalid(value.pinfl)) return;
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
        pinfl: "",
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
    if (pinflInvalid(value2.pinfl)) return;

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
        pinfl: res.data.pinfl ?? "",
        is_muddatli_harbiy: !!res.data.is_muddatli_harbiy,
      });
      setActive(e);
      setOpen2(true);
    }
  };

  const handleSearchByBatalon = async (e: number) => {
    setSearchID(e);
  };


  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt("F.I.Sh., PINFL yoki raqam bo'yicha", "По Ф.И.О., ПИНФЛ или номеру")}
                className="h-9 w-full"
              />
            </div>

            <Select
              data={batalons}
              def
              value={searchId}
              onChange={(e: any) => handleSearchByBatalon(e)}
              p={tt("Batalon orqali qidiring", "Поиск по батальону")}
              w={240}
            />

            <FilterActions onRefresh={getInfo} onClear={clearFilters} />

            <ToolbarSpacer />

            {/* Bitta "⋮" menyu: xodimlar ro'yxati (backend Excel va aynan
                shu hisobotning PDF nusxasi) + import shabloni */}
            <ExportMenu
              items={[
                ...reportItems({
                  key: "workers",
                  name: tt("Xodimlar ro'yxati", "Список сотрудников"),
                  fetchBlob: () => getExcel(JWT, "/worker/excel"),
                  fileName: "excel_file.xlsx",
                }),
                // Import shabloni — qo'shish ruhsati bo'lmasa o'chirilgan holda
                {
                  key: "worker-template",
                  disabled: !perm.create,
                  disabledTitle: tt("Ruxsat yo'q", "Нет доступа"),
                  icon: excelIcon,
                  label: tt("Import shabloni (Excel)", "Шаблон импорта (Excel)"),
                  hint: tt("Xodimlarni yuklash uchun bo'sh shablon", "Пустой шаблон для импорта сотрудников"),
                  run: async () => {
                    const blob = await getExcel(JWT, "/worker/template/");
                    if (!blob || blob.size === 0 || blob.type.includes("json")) throw new Error("BAD_FILE");
                    saveBlob(blob, "template_file.xlsx");
                  },
                },
              ]}
            />
            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => setOpen(true)}>
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
          sort={sort}
          onSort={toggleSort}
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
                "Familiya, ism, otasining ismi",
                "Фамилия, имя, отчество"
              )}
              p={tt(
                "Familiya, ism, otasining ismini kiriting",
                "Введите фамилию, имя и отчество"
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
            <Input
              v={value.pinfl}
              change={(e: any) =>
                setValue({
                  ...value,
                  pinfl: e.target.value.replace(/\D/g, "").slice(0, 14),
                })
              }
              label={tt("PINFL (JSHSHIR)", "ПИНФЛ")}
              p={tt("14 xonali PINFL ni kiriting", "Введите 14-значный ПИНФЛ")}
              inputMode="numeric"
              maxLength={14}
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
        title={tt("Xodim tahrirlash", "Редактировать сотрудника")}
      >
        <form onSubmit={editInfo}>
          <div className="flex gap-3 flex-col w-full">
            <Input
              v={value2.fio}
              change={(e: any) => setValue2({ ...value2, fio: e.target.value })}
              label={tt(
                "Familiya, ism, otasining ismi",
                "Фамилия, имя, отчество"
              )}
              p={tt(
                "Familiya, ism, otasining ismini kiriting",
                "Введите фамилию, имя и отчество"
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
            <Input
              v={value2.pinfl}
              change={(e: any) =>
                setValue2({
                  ...value2,
                  pinfl: e.target.value.replace(/\D/g, "").slice(0, 14),
                })
              }
              label={tt("PINFL (JSHSHIR)", "ПИНФЛ")}
              p={tt("14 xonali PINFL ni kiriting", "Введите 14-значный ПИНФЛ")}
              inputMode="numeric"
              maxLength={14}
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
    </div>
  );
}

export default Workers;
