import Input from "@/Components/Input";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { Checkbox } from "@/Components/ui/checkbox";
import { useRequest } from "@/hooks/useRequest";
import {
  RasxodFioTaskInterface,
  UstamaInterFace,
  UstamaInterFaceEdited,
} from "@/interface";
import RasxodModal from "@/pages/rasxod/modal";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { permBtn, usePermission } from "@/lib/permissions";
import { primaryAccountNumber, OrganizationLike } from "@/types/organization";
import { IPrixod } from "@/types/prixod";
import {
  formatNum,
  latinToCyrillic,
  numberToWords,
  textNum,
  tt,
} from "@/utils";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Recipient from "../prixod/recipient";
import { RasxodcreateTableFio } from "./createRasxodTableFio";
import { splitSumma } from "./splitSumma";
import ScreenLoader from "@/Components/ScreenLoader";

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="opacity-[0.7] dark:opacity-[1] text-foreground font-[600]">
    {txt}
  </h3>
);

const OrganizationTD = ({ txt }: { txt: string }) => (
  <td className="border px-3 py-3 text-left text-foreground font-[500] text-[0.875rem]">
    {txt}
  </td>
);

export const EditRasxodFio = () => {
  const fromDate = new Date();
  //fromDate - 1 month
  fromDate.setMonth(fromDate.getMonth() - 1);

  const api = useApi();
  const navigate = useNavigate();
  const { id } = useParams();
  // update ruxsati bo'lmasa sahifa faqat ko'rish uchun
  const perm = usePermission("rasxod_workers");

  //@ts-ignore
  const accountNumber = useSelector((state) => state.account.account_number_id);

  const [currentPrixod] = useState<IPrixod>();

  const [open, setOpen] = useState<boolean>(false);
  const [organization, setOrganization] = useState({ data: [] });
  // Bu holatga IKKI xil shakl tushadi: tanlash modalidan haqiqiy
  // tashkilot (`account_numbers` massivi) va yuklashda batalon
  // ma'lumoti (skalyar `account_number`). `OrganizationLike` ikkalasini
  // ham qamraydi — ilgari bu yer `@ts-ignore` bilan yopilgan edi.
  const [selectedO, setSelectedO] = useState<OrganizationLike>();
  const [limit, setLimit] = useState<number>(15);
  const [page, setPage] = useState<number>(1);

  const [opisanie, setOpisanie] = useState<string>();
  const [docNum, setDocnum] = useState<string>();
  const [docDate, setDocDate] = useState<string | undefined>();

  const [rasxodfromdate, setRasxodFromDate] = useState<string>("");
  const [rasxodtodate, setRasxodToDate] = useState<string>("");
  const [tableSearch, setTableSearch] = useState<string>("");

  const [rasxodRequestdata, setRasxodRequestData] = useState<
    RasxodFioTaskInterface[]
  >([]);
  const [calculatedSum, setCalculatedSum] = useState<number>();
  const [ustamaData, setUstama] = React.useState<UstamaInterFaceEdited[]>([]);
  const [screenLoader, setScreenLoader] = useState<boolean>(false);

  const dispatch = useDispatch();
  const request = useRequest();
  const [editedData, setEditedData] = useState<any>(null);
  const filtereddata: RasxodFioTaskInterface[] = rasxodRequestdata?.filter(
    (item) => selectedO?.id == item.batalon_id
  );

  // Jadval uchun frontda qidiruv: shartnoma №, tashkilot, FIO bo'yicha
  const searchText = tableSearch.trim().toLowerCase();
  const searchCyr = latinToCyrillic(tableSearch.trim()).toLowerCase();
  const searchedData = searchText
    ? filtereddata.filter((item) => {
        const fields = [
          String(item.contract_doc_num ?? ""),
          item.organization_name ?? "",
          item.fio ?? "",
        ].map((f) => f.toLowerCase());
        return fields.some(
          (f) => f.includes(searchText) || f.includes(searchCyr)
        );
      })
    : filtereddata;

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
                deleted: false,
              };
            }
          );
          setUstama(data);
          // setOrganization(res.data.data);
        }
      }
    } catch (error: any) {
      dispatch(
        alertt({
          success: false,
          text: error.response?.data?.message || error.message,
        })
      );
    }
  };

  const getByRasxodId = async () => {
    try {
      const res = await request.get("/rasxod/fio/" + id, {
        params: {
          account_number_id: accountNumber,
        },
      });

      if (res.status == 200 || res.status == 201) {
        if (res.data.success) {
          const data = res.data.data;
          setDocnum(data.doc_num);
          setEditedData(data);
          setRasxodFromDate(data.from);
          setRasxodToDate(data.to);
          // setCalculatedSum(data.summa);
          setSelectedO({
            account_number: data.batalon_account_number,
            address: data.batalon_address,
            bank_name: data.batalon_bank_name,
            name: data.batalon_name,
            id: data.batalon_id,
            mfo: data.batalon_mfo,
            str: data.batalon_str,

            //   treasury1: data.batalon_treasury1,
            //   treasury2: data.batalon_treasury2,
          });

          const regenerated = (data.worker_tasks ?? []).map((item: any) => {
            return {
              ...item,
              saved: true,
              batalon_id: data.batalon_id,
            };
          });
          setRasxodRequestData(regenerated);
          setDocDate(data.doc_date);
          await getUstama();

          setUstama((prev) => {
            // Deductions ichida mavjud bo'lganlarni yangilash
            const updated = prev.map((el) => {
              const find = (data.deductions ?? []).find(
                (x: any) => x.deduction_id == el.id
              );
              if (find) {
                return {
                  ...el,
                  active: true,
                  deleted: false,
                };
              }
              return el;
            });

            // Ustama data da mavjud bo'lmaganlarni qo'shish
            const missing = (data.deductions ?? [])
              .filter(
                (deduction: any) =>
                  !prev.some((el) => el.id === deduction.deduction_id)
              )
              .map((deduction: any) => ({
                id: deduction.deduction_id,
                name: deduction.deduction_name, // Agar `name` bo'lsa
                percent: deduction.percent,
                active: true,
                deleted: true,
              }));

            // Yangi massivni qaytarish
            return [...updated, ...missing];
          });
          setOpisanie(data.opisanie ? data.opisanie : undefined);
          //@ts-ignore
        }
      }
    } catch (error: any) {
      dispatch(
        alertt({
          text: error.response?.data?.message || error.message,
          success: false,
        })
      );
      navigate("/rasxod-workers");
    }
  };

  useEffect(() => {
    getByRasxodId();
  }, [id]);

  const handleSubmit = async () => {
    if (
      ustamaData.filter((el) => el.active == true && el.deleted == true).length
    ) {
      dispatch(
        alertt({
          text: tt(
            "Hozirda mavjud bo'lmagan ustamalarni tanlagansiz, ularni tanlovdan olib tashlang",
            "Вы выбрали недоступные надбавки — снимите их выбор."
          ),
        })
      );
      return;
    }

    if (rasxodfromdate == "" && rasxodtodate == "") {
      dispatch(
        alertt({
          text: tt(
            "dan va gacha qiymatlarini tanlash majburiy",
            "Обязательно выбирать значения от и до"
          ),
          success: false,
        })
      );
      return;
    }

    try {
      const data = {
        doc_num: docNum,
        doc_date: docDate,
        batalon_id: selectedO?.id,
        opisanie: opisanie,
        deductions: ustamaData
          .filter((el) => el.active == true && el.deleted == false)
          .map((el) => ({
            deduction_id: el.id,
          })),
        // Saqlangan qatorlar bazadagi summasi bilan ketadi — eski hujjat qayta
        // hisoblanmaydi. Yangi qo'shilgan qator joriy qoida bo'yicha hisoblanadi.
        worker_tasks: filtereddata.map((item) => ({
          worker_task_id: item.worker_task_id,
          summa: item.summa,
          ...splitSumma(item.summa, 10, item.saved ? item : undefined),
        })),
      };

      setScreenLoader(true);

      const res = await request.put("/rasxod/fio/" + editedData?.id, data, {
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
              text: tt(
                "O'zgartirish muvaffaqiyatli bajarildi!",
                "Изменения сохранены!"
              ),
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
    calculateSum();
  }, [
    rasxodRequestdata,
    selectedO?.id,
    editedData,
    ustamaData,
    rasxodfromdate,
    rasxodtodate,
  ]);

  const getBrigada = async () => {
    const get: any = await api.get(`batalon?birgada=false`);
    if (get?.success)
      setOrganization({
        data: get.data,
      });
  };
  const getRasxodRequest = async () => {
    try {
      // if (!selectedC?.id) return;

      if (!selectedO?.id) {
        return;
      }
      if (rasxodfromdate == "" || rasxodtodate == "") return;

      setScreenLoader(true);
      //   const res = await request.get("/rasxod/request", {
      const res = await request.get("rasxod/fio/request", {
        params: {
          account_number_id: accountNumber,
          from: rasxodfromdate,
          to: rasxodtodate,
          batalon_id: selectedO?.id,
        },
      });
      if (res.data.success) {
        delete res.data.success;
        const data = res.data.data;
        const newdata = data.map((item: any) => {
          return {
            ...item,
            saved: false,
            batalon_id: selectedO.id,
          };
        });
        setRasxodRequestData((prev) => {
          const filtereddata = prev.filter((item) => item.saved == true);

          return [...filtereddata, ...newdata];
        });
        // setRasxodRequestData(res.data.tasks);
        // setItogo(res.data.meta.itogo);
        // setSum(res.data.meta.itogo);
      }
      setScreenLoader(false);
    } catch (error: any) {
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

  // getRasxodRequest faqat tugma bosilganda chaqiriladi

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
    { txt: tt("INN", "ИНН"), value: textNum(user?.str || "", 3) },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value: textNum(user?.account_number || "", 4),
    },
  ];

  const payer = [
    {
      txt: tt("Qabul qiluvchi", "Получатель"),
      value: (selectedO?.name ?? currentPrixod?.organization_name) || "",
    },
    {
      txt: tt("Bank", "Банк"),
      value:
        (selectedO?.bank_name ?? currentPrixod?.organization_bank_name) || "",
    },
    {
      txt: tt("MFO", "МФО"),
      value: (selectedO?.mfo ?? currentPrixod?.organization_mfo) || "",
    },
    {
      txt: tt("INN", "ИНН"),
      value: textNum(
        (selectedO?.str ?? currentPrixod?.organization_str) || "",
        3
      ),
    },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value: textNum(
        primaryAccountNumber(selectedO) ||
          currentPrixod?.organization_account_number ||
          "",
        4
      ),
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
      // Vergulni nuqta bilan almashtirish va raqam sifatida qabul qilish
    }
  };

  const handleOpisanieChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setOpisanie(e.target.value);

  return (
    <div className="relative">
      {screenLoader && <ScreenLoader />}
      <div className="flex items-center mb-[1.9375rem]">
        <div className="">
          <BackButton />
        </div>
        <h1 className="font-[700] text-foreground text-[1.25rem] block ms-8">
          {tt("Chiqim F.I.Sh. tahrirlash", "Редактирование расхода по Ф.И.О.")}
        </h1>
        <div className="flex ml-[3.3125rem] gap-[2rem] items-center">
          {/* {ustamaData?.map((item: UstamaInterFaceEdited, index: number) => (
            <Checkbox
              deleted={item.deleted}
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
          ))} */}
        </div>
      </div>
      {/* <SimpleText txt="To'lov hujjatlari" /> */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-x-5">
          <h5 className="whitespace-nowrap font-[600]">{tt("Hujjat №", "№ документа")}</h5>
          <Input
            v={docNum ?? currentPrixod?.contract_doc_num ?? ""}
            change={(e: ChangeEvent<HTMLInputElement>) =>
              setDocnum(e.target.value)
            }
          />
        </div>
        <div className="flex items-center gap-x-5">
          <h5 className="whitespace-nowrap font-[600]">{tt("Hujjat sanasi", "Дата проводки")}</h5>
          <SpecialDatePicker
            defaultValue={docDate ?? currentPrixod?.contract_doc_date ?? ""}
            onChange={setDocDate}
          />
        </div>
      </div>
      {/* organization  */}
      <div className="mt-5 grid md:grid-cols-2">
        <div className="min-w-0 border p-3">
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
                  (selectedO?.id ?? currentPrixod?.organization_id) === o.id
                    ? "bg-muted dark:bg-muted/60border"
                    : "bg-card"
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
        <div className="min-w-0 border p-3 bg-card">
          <SimpleText
            txt={tt("To'lovchi ma'lumotlari", "Информация о плательщике")}
          />
          <div>
            {recipient.map((e, ind) => (
              <Recipient key={ind} txt={e.txt} value={e.value} />
            ))}
          </div>
        </div>
      </div>
      {/* prixod  */}
      <div className="flex flex-col lg:flex-row">
        <div className="w-full py-5 lg:w-1/2 lg:pr-5">
          <div className="mt-5 flex w-full flex-wrap items-start gap-x-4 gap-y-2">
            <h4 className="shrink-0 pt-2">{tt("Summa", "Сумма")}</h4>

            <div className="w-[13rem] max-w-full shrink-0">
              {/* yigilgan pull */}
              <Input
                // readonly={true}
                // t="number"
                className="w-full text-right"
                v={calculatedSum ? formatNum(calculatedSum) : ""}
                change={handleChange}
              />
            </div>
            <textarea
              className="min-w-[12rem] flex-1 text-destructive bg-card uppercase border outline-none resize-none row-span-4 px-2 py-1 rounded-none"
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
          className="border w-full mt-3 p-3 bg-card outline-[grey] dark:outline-none"
          onChange={handleOpisanieChange}
          value={opisanie ?? currentPrixod?.opisanie ?? ""}
        ></textarea>
      </div>

      <div className="my-[3.125rem] flex flex-wrap items-center justify-end gap-x-10 gap-y-3">
        <div className="w-[17.5rem]">
          <Input
            v={tableSearch}
            change={(e: ChangeEvent<HTMLInputElement>) =>
              setTableSearch(e.target.value)
            }
            search={true}
            p={tt(
              "Shartnoma №, tashkilot, F.I.Sh.",
              "№ договора, организация, Ф.И.О."
            )}
            className="w-full"
          />
        </div>
        <SpecialDatePicker
          label={tt("dan", "с")}
          ru={"от"}
          defaultValue={rasxodfromdate}
          onChange={setRasxodFromDate}
        />

        <SpecialDatePicker
          label={tt("gacha", "по")}
          ru="по"
          defaultValue={rasxodtodate}
          onChange={setRasxodToDate}
        />
        <Button
          text={tt("Summalarni yangilash", "Обновить суммы")}
          type="button"
          {...permBtn(perm.update, undefined, "!h-10 !mt-[1.25rem] border-success !bg-success text-success-foreground hover:!bg-success/90")}
          onClick={() => getRasxodRequest()}
        />
      </div>
      <RasxodcreateTableFio
        ustamaData={ustamaData}
        data={searchedData}
        setRasxodRequestData={setRasxodRequestData}
        summa_10_percent={10}
      />

      {/* submit btn  */}
      <div className="mt-5 mb-5 flex justify-center">
        <Button mode="save" type="button" {...permBtn(perm.update)} onClick={handleSubmit}></Button>
      </div>
    </div>
  );
};
