/** @format */

import { usePagedFetch } from "@/hooks/usePagedFetch";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import {
  CreateOrgn,
  DeleteOrgan,
  getExcel,
  getOrgan,
  getOrganId,
  getSearch,
  updateOrgn,
} from "../api";
import Input from "../Components/Input";
import Paginatsiya from "../Components/Paginatsiya";
import OrganTAb from "../pageCompoents/OrganTAb";
import { alertt } from "../Redux/LanguageSlice";
import { tt } from "../utils";
import ExportMenu, { reportItems } from "@/Components/ExportMenu";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import OrganizationModal from "@/shared/components/OrganizationModal";
import { Plus } from "lucide-react";
import { permBtn, usePermission } from "@/lib/permissions";
import {
  Button as UIButton,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

export const formatAccountNumber = (value: string, count?: number) => {
  let newValue = value.replace(/[^\d]/g, ""); // faqat raqamlar qolsin
  let formattedValue = "";

  for (let i = 0; i < newValue.length; i++) {
    if (i > 0 && i % (count || 4) === 0) {
      formattedValue += " "; // Har 3 ta raqamdan keyin bo'sh joy qo'shamiz
    }
    formattedValue += newValue[i]; // Raqamlarni formatlangan qiymatga qo'shamiz
  }

  return formattedValue.trim(); // O'ng va chapdagi bo'sh joylarni tozalaymiz
};

function Organisation() {
  const JWT = useSelector((s: any) => s.auth.jwt);
  const perm = usePermission("organisation");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Starting at page 2 for example
  const [totalPages, setTotalPages] = useState(1);
  const [active, setActive] = useState(1);
  const [open2, setOpen2] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [limet, setLimet] = useState(15);
  const [all, setAll] = useState(10);
  const [value2, setValue2] = useState<any>({
    name: "",
    address: "",
    str: "",
    bank_name: "",
    mfo: "",
    boss: "",
    account_numbers: [] as string[],
    gazna_numbers: [] as string[],
  });
  const dispatch = useDispatch();
  const [value, setValue] = useState({
    name: "",
    address: "",
    str: "",
    bank_name: "",
    mfo: "",
    boss: "",
    account_numbers: [] as string[],
    gazna_numbers: [] as string[],
  });
  const [open, setOpen] = useState(false);

  /* Maydonga yozilgan matn (`searchValue`) va so'rovga ketadigan matn
     (`query`) ataylab ajratilgan: har bosilgan harfda so'rov yuborilsa,
     javoblar bir-birini quvib yetib, ro'yxat noto'g'ri to'ldirilardi. */
  const [query] = useDebounce(searchValue.trim(), 400);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const clearFilters = () => {
    setSearchValue("");
    resetSort();
  };

  /* Qidiruv bo'sh bo'lsa oddiy ro'yxat, aks holda qidiruv chaqiriladi —
     ikkalasi ham bitta `organization` yo'liga boradi va bir xil `meta`
     qaytaradi. */
  const readList = async (page = currentPage, limit = limet) =>
    query
      ? await getSearch(JWT, page, query, limit, sortParams(sort))
      : await getOrgan(JWT, page, limit, sortParams(sort));

  const applyList = (res: any) => {
    if (!res?.data) return;
    setData(res.data);
    setTotalPages(res.meta?.pageCount ?? 1);
    setAll(res.meta?.count ?? 0);
  };

  /** O'zgartirishdan keyin ro'yxatni yangilaydi — qidiruv saqlanadi */
  const getInfo = async () => applyList(await readList());

  const handleDelete = async () => {
    const res = await DeleteOrgan(JWT, active);

    if (res.success) {
      getInfo();
      dispatch(
        alertt({
          text: tt(
            "Ma'lumot muvaffaqiyatli o'chirildi",
            "Данные удалены"
          ),
          success: true,
        })
      );
    } else {
      dispatch(
        alertt({
          text: res.message,
          success: false,
        })
      );
    }
  };
  const handleChange = (e: any) => {
    if (e.target.name === "str") {
      setValue({
        ...value,
        str: formatAccountNumber(e.target.value, 3),
      });
      return;
    }

    setValue({ ...value, [e.target.name]: e.target.value });
  };

  const handleChange2 = (e: any) => {
    if (e.target.name === "str") {
      setValue2({
        ...value2,
        str: formatAccountNumber(e.target.value, 3),
      });
      return;
    }

    setValue2({ ...value2, [e.target.name]: e.target.value });
  };
  const setInfo = async () => {
    // Format the data to match the expected structure
    const formattedData = {
      ...value,
      account_numbers: value.account_numbers.map((num: any) => ({
        account_number: num.replace(/\s/g, ""),
      })),
      gazna_numbers: value.gazna_numbers.map((num: any) => ({
        gazna_number: num.replace(/\s/g, ""),
      })),
    };

    const res = await CreateOrgn(formattedData, JWT);

    if (res.success) {
      getInfo();
      setOpen(false);
      dispatch(
        alertt({
          success: true,
          text: tt("Ma'lumot qo'shildi", "Данные добавлены"),
        })
      );
      setValue({
        name: "",
        address: "",
        str: "",
        bank_name: "",
        mfo: "",
        boss: "",
        account_numbers: [],
        gazna_numbers: [],
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

  const editInfo = async () => {
    // Format the data to match the expected structure
    const formattedData = {
      ...value2,
      account_numbers: value2.account_numbers.map((num: any) => ({
        account_number: num.replace(/\s/g, ""),
      })),
      gazna_numbers: value2.gazna_numbers.map((num: any) => ({
        gazna_number: num.replace(/\s/g, ""),
      })),
    };

    const res = await updateOrgn(formattedData, JWT, active);

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
  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    editInfo();
  };
  usePagedFetch({
    page: currentPage,
    setPage: setCurrentPage,
    filters: [limet, query, sort],
    fetch: () => {
      // Kechikkan javob yangisining ustidan yozib yubormasin
      let stale = false;
      readList().then((res) => {
        if (!stale) applyList(res);
      });
      return () => {
        stale = true;
      };
    },
  });

  const openEdit = async (id: any) => {
    setActive(id);
    const res = await getOrganId(JWT, id);
    if (res?.success && res?.data) {
      setValue2({
        name: res.data?.name ?? "",
        address: res.data?.address ?? "",
        str: res.data?.str ?? "",
        bank_name: res.data?.bank_name ?? "",
        mfo: res.data?.mfo ?? "",
        boss: res.data?.boss ?? "",
        // Extract account_numbers from the objects
        account_numbers: (res.data?.account_numbers || []).map((item: any) =>
          formatAccountNumber(item.account_number || "")
        ),
        // Extract gazna_numbers from the objects
        gazna_numbers: (res.data?.gazna_numbers || []).map((item: any) =>
          formatAccountNumber(item.gazna_number || "")
        ),
      });
    }
    setOpen2(true);
  };


  // Add new functions to handle account numbers and gazna_numbers
  const handleAccountNumberChange = (index: number, inputValue: string) => {
    const updatedAccountNumbers = [...value.account_numbers];
    updatedAccountNumbers[index] = formatAccountNumber(inputValue);
    setValue({ ...value, account_numbers: updatedAccountNumbers });
  };

  const handleGaznaChange = (index: number, inputValue: string) => {
    const updatedGaznas = [...value.gazna_numbers];
    updatedGaznas[index] = formatAccountNumber(inputValue);
    setValue({ ...value, gazna_numbers: updatedGaznas });
  };

  const addAccountNumber = () => {
    setValue({ ...value, account_numbers: [...value.account_numbers, ""] });
  };

  const addGazna = () => {
    setValue({ ...value, gazna_numbers: [...value.gazna_numbers, ""] });
  };

  const removeAccountNumber = (index: number) => {
    const updatedAccountNumbers = [...value.account_numbers];
    updatedAccountNumbers.splice(index, 1);
    setValue({ ...value, account_numbers: updatedAccountNumbers });
  };

  const removeGazna = (index: number) => {
    const updatedGaznas = [...value.gazna_numbers];
    updatedGaznas.splice(index, 1);
    setValue({ ...value, gazna_numbers: updatedGaznas });
  };

  // Similar functions for value2 (edit form)
  const handleAccountNumberChange2 = (index: number, inputValue: string) => {
    const updatedAccountNumbers = [...(value2.account_numbers || [])];
    updatedAccountNumbers[index] = formatAccountNumber(inputValue);
    setValue2({ ...value2, account_numbers: updatedAccountNumbers });
  };

  const handleGaznaChange2 = (index: number, inputValue: string) => {
    const updatedGaznas = [...(value2.gazna_numbers || [])];
    updatedGaznas[index] = formatAccountNumber(inputValue);
    setValue2({ ...value2, gazna_numbers: updatedGaznas });
  };

  const addAccountNumber2 = () => {
    setValue2({ ...value2, account_numbers: [...value2.account_numbers, ""] });
  };

  const addGazna2 = () => {
    setValue2({ ...value2, gazna_numbers: [...value2.gazna_numbers, ""] });
  };

  const removeAccountNumber2 = (index: number) => {
    const updatedAccountNumbers = [...value2.account_numbers];
    updatedAccountNumbers.splice(index, 1);
    setValue2({ ...value2, account_numbers: updatedAccountNumbers });
  };

  const removeGazna2 = (index: number) => {
    const updatedGaznas = [...value2.gazna_numbers];
    updatedGaznas.splice(index, 1);
    setValue2({ ...value2, gazna_numbers: updatedGaznas });
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-72">
              <Input
                search={true}
                v={searchValue}
                change={(e: any) => {
                  setSearchValue(e.target.value);
                  // Uchinchi sahifada turib qidirilsa, natija bo'sh
                  // sahifaga tushib qolardi
                  setCurrentPage(1);
                }}
                p={tt("Nomi, INN, manzil yoki rahbar bo'yicha", "По названию, ИНН, адресу или руководителю")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={getInfo} onClear={clearFilters} />

            <ToolbarSpacer />

            {/* Bitta "⋮" menyu: backend Excel hisobot va aynan shu hisobotning PDF nusxasi */}
            <ExportMenu
              items={reportItems({
                key: "organizations",
                fetchBlob: () => getExcel(JWT, "/organization/excel"),
                fileName: "excel_file.xlsx",
              })}
            />
            <UIButton {...permBtn(perm.create)} size="sm" onClick={() => setOpen(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          <Paginatsiya
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            limet={limet}
            setLimet={setLimet}
            count={all}
          />
        }
      >
        <OrganTAb
          handleDelete={handleDelete}
          setActive={setActive}
          data={data}
          openEdit={openEdit}
          page={currentPage}
          itemsPerPage={10}
          sort={sort}
          onSort={toggleSort}
        />
      </ListCard>

      <OrganizationModal
        open={open}
        closeModal={() => setOpen(false)}
        value={value}
        handleChange={handleChange}
        handleSubmit={handleCreate}
        handleAccountNumberChange={handleAccountNumberChange}
        handleGaznaChange={handleGaznaChange}
        addAccountNumber={addAccountNumber}
        addGazna={addGazna}
        removeAccountNumber={removeAccountNumber}
        removeGazna={removeGazna}
        title={tt("Tashkilotchi", "Организатор")}
        onFill={({ newAccountNumber, ...data }) =>
          setValue((prev: any) => ({
            ...prev,
            ...data,
            account_numbers: newAccountNumber
              ? [...prev.account_numbers, newAccountNumber]
              : prev.account_numbers,
          }))
        }
      />

      <OrganizationModal
        open={open2}
        closeModal={() => setOpen2(false)}
        value={value2}
        handleChange={handleChange2}
        handleSubmit={handleEdit}
        handleAccountNumberChange={handleAccountNumberChange2}
        handleGaznaChange={handleGaznaChange2}
        addAccountNumber={addAccountNumber2}
        addGazna={addGazna2}
        removeAccountNumber={removeAccountNumber2}
        removeGazna={removeGazna2}
        title={tt("Hamkor korxona", "Партнерское предприятие")}
        onFill={({ newAccountNumber, ...data }) =>
          setValue2((prev: any) => ({
            ...prev,
            ...data,
            account_numbers: newAccountNumber
              ? [...prev.account_numbers, newAccountNumber]
              : prev.account_numbers,
          }))
        }
      />
    </div>
  );
}

export default Organisation;
