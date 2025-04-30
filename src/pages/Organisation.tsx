/** @format */

import Download from "@/Components/Download";
import Button from "@/Components/reusable/button";
import useFullHeight from "@/hooks/useFullHeight";
import useApi from "@/services/api";
import { IOrganization } from "@/types/organization";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import {
  CreateOrgn,
  DeleteOrgan,
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
import OrganizationForPrint from "./organization/print";
import OrganizationModal from "@/shared/components/OrganizationModal";

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
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Starting at page 2 for example
  const [totalPages, setTotalPages] = useState(1);
  const [active, setActive] = useState(1);
  const [open2, setOpen2] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [limet, setLimet] = useState(15);
  const [all, setAll] = useState(10);
  const [downOpen, setDownOpen] = useState(false);
  const [value2, setValue2] = useState<any>({
    name: "",
    address: "",
    str: "",
    bank_name: "",
    mfo: "",
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
    account_numbers: [] as string[],
    gazna_numbers: [] as string[],
  });
  const [open, setOpen] = useState(false);

  const getInfo = async () => {
    const res = await getOrgan(JWT, currentPage, limet);

    setData(res.data);
    setTotalPages(res.meta.pageCount);
    setAll(res.meta.count);
  };

  const handleDelete = async () => {
    const res = await DeleteOrgan(JWT, active);

    if (res.success) {
      getInfo();
      dispatch(
        alertt({
          text: tt(
            "Malumot muvofaqiyatli o'chirildi",
            "Ссылка удалена соответствующим образом"
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
          text: tt("Malumot qo'shildi", "Добавлена ссылка"),
        })
      );
      setValue({
        name: "",
        address: "",
        str: "",
        bank_name: "",
        mfo: "",
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
  useEffect(() => {
    getInfo();
  }, [currentPage, limet]);

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

  const handleSearch = async () => {
    const res = await getSearch(JWT, currentPage, searchValue.trim(), limet);

    if (res.success) {
      setData(res.data);
      setTotalPages(res.meta.pageCount);
    }
  };

  useEffect(() => {
    if (searchValue) {
      handleSearch();
    } else {
      getInfo();
    }
  }, [searchValue]);

  const api = useApi();
  const [forPdf, setForPdf] = useState<{
    total: number;
    data: IOrganization[];
  }>();
  const fioRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: fioRef,
  });
  const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const get = await api.get("organization/pdf");
    if (get?.success) {
      setForPdf(get.data as any);
    }
  };
  useEffect(() => {
    if (forPdf) {
      reactToPrintFn();
    }
  }, [forPdf]);

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 190px)` : height - 190;

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
    <div className="flex flex-col w-full">
      <div className=" hidden">
        <OrganizationForPrint ref={fioRef} data={forPdf} />
      </div>
      <div style={{ minHeight: fullHeight }}>
        <div className="flex justify-between items-center mb-4">
          <Input
            search={true}
            v={searchValue}
            change={(e: any) => setSearchValue(e.target.value)}
            p={tt("Nomlar bo'yicha qidiruv", "Поиск по имени")}
          />
          <div className="flex items-center gap-5">
            <Button mode="print" onClick={onPrintClick} />
            <Button
              mode="download"
              onClick={() => setDownOpen(true)}
              text={tt("Excel", "Экcель")}
            />
            <Button mode="add" onClick={() => setOpen(true)} />
          </div>
        </div>

        <div>
          <OrganTAb
            handleDelete={handleDelete}
            setActive={setActive}
            data={data}
            openEdit={openEdit}
            page={currentPage}
            itemsPerPage={10}
          />
        </div>
      </div>

      <div className="">
        <Paginatsiya
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          limet={limet}
          setLimet={setLimet}
          count={all}
        />
      </div>

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
        title={tt("Organizator", "Организатор")}
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
      />

      <Download
        open={downOpen}
        closeModal={() => setDownOpen(false)}
        URL={"/organization/excel"}
      />
    </div>
  );
}

export default Organisation;
