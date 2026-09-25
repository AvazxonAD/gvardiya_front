/** @format */

import { useState } from "react";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useDispatch, useSelector } from "react-redux";
import {
  CreateBatalonWorker,
  deleteBatalonWorker,
  getBatalonWorkerId,
  getBatalonWorkers,
  getExcel,
  updateBatalonWorker,
} from "../../../api";
import Input from "../../../Components/Input";
import Modal from "../../../Components/Modal";
import Paginatsiya from "../../../Components/Paginatsiya";
import WorkerTab from "../../../pageCompoents/WorkerTab";
import { tt } from "../../../utils";

import ExportMenu, { reportItems } from "@/Components/ExportMenu";
import Button from "@/Components/reusable/button";
import { useDebounce } from "use-debounce";
import { alertt } from "../../../Redux/LanguageSlice";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { Plus } from "lucide-react";
import { Button as UIButton, ListCard, Toolbar, ToolbarSpacer } from "@/ui";

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
  const [search, setSearch] = useState("");
  const [searchId, setSearchID] = useState(0);
  const [limet, setLimet] = useState(15);
  const [all, setAll] = useState(10);

  const [value, setValue] = useState<any>({
    fio: "",
    account_number: "",
    xisob_raqam: "",
  });

  const [open2, setOpen2] = useState(false);

  const [value2, setValue2] = useState<any>({
    fio: "",
    account_number: "",
  });

  const [searchingText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const clearFilters = () => {
    setSearch("");
    setSearchID(0);
    resetSort();
  };

  const getInfo = async () => {
    const res = await getBatalonWorkers(
      JWT,
      currentPage,
      limet,
      searchingText,
      sortParams(sort)
    );

    setData(res.data);
    setTotalpage(res.meta.pageCount);
    setAll(res.meta.count);
  };
  // Starting at page 2 for example

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
    const res = await deleteBatalonWorker(JWT, active);

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
    const res = await CreateBatalonWorker(
      {
        ...value,
        //@ts-ignore
        account_number: value.account_number.replaceAll(" ", ""),
        //@ts-ignore
        xisob_raqam: value.xisob_raqam.replaceAll(" ", ""),
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
        account_number: "",
        xisob_raqam: "",
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

  const editInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newdata = value2;
    newdata.account_number = newdata.account_number.replaceAll(" ", "");
    newdata.xisob_raqam = newdata.xisob_raqam.replaceAll(" ", "");

    const res = await updateBatalonWorker(newdata, JWT, active);

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
    const res = await getBatalonWorkerId(JWT, e);

    const { id, batalon_name, ...data } = res.data;
    if (res.success) {
      setValue2({
        fio: res.data.fio,
        ...data,
        account_number: formatAccountNumber(res?.data?.account_number),
        xisob_raqam: formatAccountNumber(res?.data.xisob_raqam),
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
            <div className="w-full sm:w-64">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt("F.I.Sh., PINFL yoki hisob raqam bo'yicha", "По Ф.И.О., ПИНФЛ или номеру счета")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={getInfo} onClear={clearFilters} />

            <ToolbarSpacer />

            {/* Bitta "⋮" menyu: backend Excel hisobot va aynan shu hisobotning PDF nusxasi */}
            <ExportMenu
              items={reportItems({
                key: "workers",
                fetchBlob: () => getExcel(JWT, "/worker/excel"),
                fileName: "excel_file.xlsx",
              })}
            />
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
