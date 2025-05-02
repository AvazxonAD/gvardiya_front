import Input from "@/Components/Input";
import BackButton from "@/Components/reusable/BackButton";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import {
  RasxodFioTaskInterface,
  UstamaInterFace,
  UstamaInterFaceEdited,
} from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { IOrganization } from "@/types/organization";
import { latinToCyrillic, numberToWords, textNum, tt } from "@/utils";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Recipient from "../prixod/recipient";

import Button from "@/Components/reusable/button";
import { Checkbox } from "@/Components/ui/checkbox";
import RasxodModal from "@/pages/rasxod/modal";
import { RasxodcreateTableFio } from "./createRasxodTableFio";
import ScreenLoader from "@/Components/ScreenLoader";

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="opacity-[0.7] dark:opacity-[1] text-mytextcolor font-[600]">
    {txt}
  </h3>
);

const OrganizationTD = ({ txt }: { txt: string }) => (
  <td className="border px-3 py-3 text-left text-mytextcolor font-[500] text-[14px]">
    {txt}
  </td>
);

export const CreateRasxodFio = () => {
  const fromDate = new Date();
  //fromDate - 1 month
  fromDate.setMonth(fromDate.getMonth() - 1);
  const todate = new Date();

  const api = useApi();
  const navigate = useNavigate();

  const accountNumber = useSelector(
    (state: any) => state.account.account_number_id
  );

  const [open, setOpen] = useState<boolean>(false);
  const [organization, setOrganization] = useState({ data: [] });
  const [selectedO, setSelectedO] = useState<IOrganization>();
  const [limit, setLimit] = useState<number>(15);
  const [page, setPage] = useState<number>(1);

  const [opisanie, setOpisanie] = useState<string>();
  const [docNum, setDocnum] = useState<string>();
  const [docDate, setDocDate] = useState<string | undefined>();
  const [screenLoader, setScreenLoader] = useState<boolean>(false);

  const [rasxodfromdate, setRasxodFromDate] = useState<string>(
    `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(fromDate.getDate()).padStart(2, "0")}`
  );

  const [rasxodtodate, setRasxodToDate] = useState<string>(
    `${todate.getFullYear()}-${String(todate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(todate.getDate()).padStart(2, "0")}`
  );

  const [rasxodRequestdata, setRasxodRequestData] = useState<
    RasxodFioTaskInterface[]
  >([]);
  const [calculatedSum, setCalculatedSum] = useState<number>();
  const [ustamaData, setUstama] = React.useState<UstamaInterFaceEdited[]>([]);
  const dispatch = useDispatch();
  const request = useRequest();

  const getUstama = async () => {
    try {
      const res = await request.get("/deduction");
      if (res.status == 200 || res.status == 201) {
        if (res.data.success) {
          const data: UstamaInterFaceEdited[] = res.data.data.map(
            (item: UstamaInterFace) => {
              return {
                ...item,
                active: false,
              };
            }
          );
          setUstama(data);
        }
      }
    } catch (error: any) {
      dispatch(
        alertt({
          success: false,
          text: error.response.data.error || error.message,
        })
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        doc_num: docNum,
        doc_date: docDate,
        batalon_id: selectedO?.id,
        opisanie: opisanie,
        deductions: ustamaData
          .filter((el) => el.active == true)
          .map((el) => ({
            deduction_id: el.id,
          })),
        worker_tasks: rasxodRequestdata.map((item) => ({
          worker_task_id: item.worker_task_id,
        })),
      };

      setScreenLoader(true);

      const res = await request.post("/rasxod/fio", data, {
        params: {
          account_number_id: accountNumber,
          from: rasxodfromdate,
          to: rasxodtodate,
        },
      });
      if (res.status == 200 || res.status == 201) {
        if (res.data.success) {
          navigate("/rasxod-workers");
          dispatch(
            alertt({
              success: true,
              text: tt("Chiqim FIO yaratildi!", "Создано успешно"),
            })
          );
        }
      }
      setScreenLoader(false);
    } catch (error) {
      setScreenLoader(false);
      dispatch(
        alertt({
          success: false,
          //@ts-ignore
          text: error?.response?.data?.error || error.message,
        })
      );
    }
  };

  const calculateSum = () => {
    const sum = rasxodRequestdata.reduce((acc, el) => acc + el.summa, 0);

    // Tanlangan foizlar ro'yxatini olish
    const activeUstama = ustamaData.filter((el) => el.active);

    // Agar tanlangan foizlar bo'lsa, summani bosqichma-bosqich hisoblaymiz
    if (activeUstama.length > 0) {
      const discountedSum = activeUstama.reduce((currentSum, ustama) => {
        return currentSum - (currentSum * ustama.percent) / 100;
      }, sum);

      setCalculatedSum(discountedSum);
    } else {
      // Agar tanlangan foizlar bo'lmasa, oddiy yig'indini qaytaramiz
      setCalculatedSum(sum);
    }
  };

  useEffect(() => {
    getUstama();
  }, []);

  useEffect(() => {
    calculateSum();
  }, [rasxodRequestdata, ustamaData]);

  const getBrigada = async () => {
    const get: any = await api.get(`batalon?birgada=false`);
    if (get?.success)
      setOrganization({
        data: get.data,
      });
  };

  const getRasxodRequest = async () => {
    try {
      if (!selectedO?.id) {
        return;
      }

      setScreenLoader(true);
      const res = await request.get("/rasxod/fio/request", {
        params: {
          account_number_id: accountNumber,
          from: rasxodfromdate,
          to: rasxodtodate,
          batalon_id: selectedO?.id,
        },
      });
      if (res.data.success) {
        delete res.data.success;
        setRasxodRequestData(res.data.data);
      }
      setScreenLoader(false);
    } catch (error) {
      setScreenLoader(false);
      dispatch(
        alertt({
          success: false,
          //@ts-ignore
          text: error?.response?.data?.message || error.message,
        })
      );
    }
  };

  useEffect(() => {
    if (accountNumber) {
      getRasxodRequest();
    }
  }, [accountNumber, selectedO?.id]);

  useEffect(() => {
    if (open) getBrigada();
  }, [open, page]);

  const userStore = localStorage.getItem("user");
  const userData = userStore ? JSON.parse(userStore) : undefined;
  const user = userData ? userData.user : undefined;

  const recipient = [
    {
      txt: tt("To'lovchi", "Плательщик"),
      value: user?.doer_name || "",
    },
    { txt: tt("Bank", "Банк"), value: user?.bank_name || "" },
    { txt: tt("MFO", "МФО"), value: user?.mfo || "" },
    { txt: tt("INN", "ИНН"), value: textNum(user?.str, 3) || "" },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value: textNum(user?.account_number, 4) || "",
    },
  ];

  const payer = [
    {
      txt: tt("Qabul qiluvchi", "Получатель"),
      value: selectedO?.name || "",
    },
    {
      txt: tt("Bank", "Банк"),
      value: selectedO?.bank_name || "",
    },
    {
      txt: tt("MFO", "МФО"),
      value: selectedO?.mfo || "",
    },
    {
      txt: tt("INN", "ИНН"),
      value: textNum(selectedO?.str || "", 3),
    },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value: textNum(selectedO?.account_number || "", 4),
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Agar qiymat juda katta bo'lsa, qabul qilmaslik
    if (Number(inputValue.replace(/,/g, ".")) > 999999999999) return;
    if (inputValue === "") {
      return;
    }

    // Raqamlar, nuqta yoki vergul qabul qiladigan regex
    if (/^[0-9]+([.,][0-9]*)?$/.test(inputValue)) {
      // setSum(Number(inputValue.replace(/,/g, ".")));
    }
  };

  const handleOpisanieChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setOpisanie(e.target.value);

  return (
    <div className="relative">
      {screenLoader && <ScreenLoader />}
      <div className="flex items-center mb-[31px]">
        <div className="">
          <BackButton />
        </div>
        <h1 className=" font-[700] text-[20px] block ms-8">
          {tt("Сhiqim FIO yaratish ", "Создание расхода ФИО")}
        </h1>
        <div className="flex ml-[53px] gap-[32px] items-center">
          {ustamaData.map((item: UstamaInterFaceEdited, index: number) => (
            <Checkbox
              label={item.name + " /" + item.percent + "%"}
              key={index}
              checked={item.active}
              handleChange={() => {
                setUstama((prevState) =>
                  prevState.map((el) =>
                    el.id === item.id ? { ...el, active: !el.active } : el
                  )
                );
              }}
            />
          ))}
        </div>
      </div>
      {/* <SimpleText txt="To'lov hujjatlari" /> */}
      <div className="flex items-center gap-x-5 mt-5">
        <div className="flex items-center gap-x-5">
          <h5 className="font-[600]">{tt("Hujjat №", "Документ №")}</h5>
          <Input
            v={docNum ?? ""}
            change={(e: ChangeEvent<HTMLInputElement>) =>
              setDocnum(e.target.value)
            }
          />
        </div>
        <div className="flex items-center gap-x-5">
          <h5 className="font-[600]">{tt("Hujjat sanasi", "Дата проводки")}</h5>
          <SpecialDatePicker
            defaultValue={docDate ?? ""}
            onChange={setDocDate}
          />
        </div>
      </div>
      {/* organization  */}
      <div className="flex mt-5">
        <div className="border w-1/2 p-3 ">
          <SimpleText
            txt={tt("Qabul qiluvchi ma’lumotlari", "Информация о получателе")}
          />
          <div>
            {payer.map((e, ind) => (
              <Recipient
                key={ind}
                txt={e.txt}
                value={e.value}
                onDoubleClick={() => setOpen(true)}
              />
            ))}
          </div>
          <RasxodModal
            open={open}
            setOpen={setOpen}
            type="organization"
            setPage={setPage}
            page={page}
            limit={limit}
            setLimit={setLimit}
          >
            {organization?.data.map((o: any, ind) => (
              <tr
                key={ind}
                className={`cursor-pointer ${
                  selectedO?.id === o.id
                    ? "bg-[#f3f4f6] dark:bg-mytableheadborder"
                    : "bg-mybackground"
                }`}
                onClick={() => {
                  setSelectedO(o);
                  setOpen(false);
                }}
              >
                <OrganizationTD txt={o.name} />
                <OrganizationTD txt={textNum(o.str, 3)} />
                <OrganizationTD txt={o.mfo} />
                <OrganizationTD txt={o.bank_name} />
                <OrganizationTD txt={textNum(o.account_number, 4)} />
                <OrganizationTD txt={textNum(o.treasury1, 4)} />
              </tr>
            ))}
          </RasxodModal>
        </div>
        <div className="border w-1/2 p-3 bg-mybackground">
          <SimpleText
            txt={tt("Тo'lovchi ma’lumotlari", "Информация о плательщике")}
          />
          <div>
            {recipient.map((e, ind) => (
              <Recipient key={ind} txt={e.txt} value={e.value} />
            ))}
          </div>
        </div>
      </div>
      {/* prixod  */}
      <div className="flex">
        <div className="w-1/2 py-5 pr-5">
          <div className="flex items-start gap-x-4 mt-5 w-full">
            <h4 className="w-2/8">{tt("Summa", "Сумма")}</h4>

            <div className="w-[50%]">
              {/* yigilgan pull */}
              <Input
                className="w-full text-right"
                v={calculatedSum ? calculatedSum : ""}
                change={handleChange}
              />
            </div>
            <textarea
              className="w-full text-red-600 bg-mybackground uppercase border outline-none resize-none row-span-4 px-2 py-1 rounded-[5px]"
              placeholder="..."
              readOnly
              value={calculatedSum ? numberToWords(calculatedSum) : ""}
            />
          </div>
        </div>
      </div>
      {/* opisaniya  */}
      <div>
        <h3 className="font-[600]">{tt("Tavsif", "Описание")}</h3>
        <textarea
          placeholder=""
          className="border w-full mt-3 p-3 bg-mybackground outline-[grey] dark:outline-none"
          onChange={handleOpisanieChange}
          value={opisanie ?? ""}
        ></textarea>
      </div>

      <div className="flex justify-end my-[50px] items-center gap-[40px]">
        <SpecialDatePicker
          label={tt("dan", latinToCyrillic("dan"))}
          ru={"от"}
          defaultValue={rasxodfromdate}
          onChange={setRasxodFromDate}
        />

        <SpecialDatePicker
          label={tt("gacha", latinToCyrillic("do"))}
          ru={latinToCyrillic("do")}
          defaultValue={rasxodtodate}
          onChange={setRasxodToDate}
        />
        <Button
          text="Ishga tushirish"
          type="button"
          className="text-white hover:!bg-white hover:!text-[#297157] border-[#297157] !h-10 !bg-[#297157] !mt-[20px]"
          onClick={() => getRasxodRequest()}
        />
      </div>
      <RasxodcreateTableFio
        // data={rasxodRequestdata}
        ustamaData={ustamaData}
        data={rasxodRequestdata}
        setRasxodRequestData={setRasxodRequestData}
      />

      {/* submit btn  */}
      <div className="mt-5  mb-5 flex justify-center">
        <Button mode="save" type="button" onClick={handleSubmit}></Button>
      </div>
    </div>
  );
};
