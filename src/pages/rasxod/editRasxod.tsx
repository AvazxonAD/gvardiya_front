import Input from "@/Components/Input";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { RasxodTabelInterface, SingleRasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { permBtn, usePermission } from "@/lib/permissions";
import { primaryAccountNumber, OrganizationLike } from "@/types/organization";
import { numberToWords, textNum, tt } from "@/utils";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Recipient from "../prixod/recipient";
import RasxodModal from "./modal";
import { RasxodcreateTable } from "./rasxodcreateTable";
import ScreenLoader from "@/Components/ScreenLoader";
import { validateRasxodForm } from "./validate";

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

export const EditRasxod = () => {
  const fromDate = new Date();
  //fromDate - 1 month
  fromDate.setMonth(fromDate.getMonth() - 1);

  const api = useApi();
  const navigate = useNavigate();
  const { id } = useParams();
  // update ruxsati bo'lmasa sahifa faqat ko'rish uchun
  const perm = usePermission("rasxod");

  //@ts-ignore
  const accountNumber = useSelector((state) => state.account.account_number_id);

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

  const [rasxodRequestdata, setRasxodRequestData] = useState<
    RasxodTabelInterface[]
  >([]);
  const [calculatedSum, setCalculatedSum] = useState<number>();
  const [screenLoader, setScreenLoader] = useState<boolean>(false);
  const dispatch = useDispatch();
  const request = useRequest();
  const [editedData, setEditedData] = useState<SingleRasxodInterface | null>(
    null
  );

  const filtereddata = rasxodRequestdata.filter(
    (item) => selectedO?.id == item.batalon_id
  );

  const getByRasxodId = async () => {
    setScreenLoader(true);
    try {
      const res = await request.get("/rasxod/" + id, {
        params: {
          account_number_id: accountNumber,
        },
      });

      if (res.status == 200 || res.status == 201) {
        if (res.data.success) {
          const data = res.data.data as SingleRasxodInterface;
          setDocnum(data.doc_num);
          setEditedData(data);
          setRasxodFromDate(data.from);
          setRasxodToDate(data.to)

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

          const regenerated = (data.tasks ?? []).map((item) => {
            return {
              ...item,
              saved: true,
              batalon_id: data.batalon_id,
            };
          });
          setRasxodRequestData(regenerated);
          setDocDate(data.doc_date);
          setOpisanie(data.opisanie ? data.opisanie : undefined);
        }
      }
    } catch (error: any) {
      dispatch(
        alertt({
          success: false,
          text: error?.response?.data?.message || error?.message,
        })
      );
      navigate("/rasxod");
    } finally {
      setScreenLoader(false);
    }
  };

  useEffect(() => {
    getByRasxodId();
  }, [id]);

  const handleSubmit = async () => {
    if (screenLoader) return;
    const formError = validateRasxodForm({
      docNum,
      docDate,
      batalonId: selectedO?.id,
      from: rasxodfromdate,
      to: rasxodtodate,
      taskCount: filtereddata.length,
    });
    if (formError) {
      dispatch(alertt({ success: false, text: formError }));
      return;
    }
    setScreenLoader(true);
    try {
      const data = {
        doc_num: docNum,
        doc_date: docDate,
        batalon_id: selectedO?.id,
        opisanie: opisanie,
        from: rasxodfromdate,
        to: rasxodtodate,
        tasks: filtereddata.map((item: any) => {
          return {
            task_id: item.task_id,
          };
        }),
      };

      const res: any = await api.update(`rasxod/${editedData?.id}?account_number_id=${accountNumber}`, data);

      if (res?.success) {
        navigate("/rasxod");
        dispatch(
          alertt({
            success: true,
            text: tt(
              "O'zgartirish muvaffaqiyatli bajarildi!",
              "Изменения сохранены!"
            ),
          })
        );
      } else {
        dispatch(
          alertt({
            success: false,
            text: res?.message || tt("Saqlashda xatolik", "Ошибка при сохранении"),
          })
        );
      }
    } catch (error) {
      dispatch(
        alertt({
          success: false,
          //@ts-ignore
          text: error?.response?.data?.message || error?.message,
        })
      );
    } finally {
      setScreenLoader(false);
    }
  };

  const calculateSum = () => {
    let sum = 0;
    // Faqat saqlanadigan qatorlar (tanlangan qabul qiluvchiniki)
    filtereddata.forEach((item) => (sum += Number(item.result_summa) || 0));
    setCalculatedSum(sum);
  };

  useEffect(() => {
    calculateSum();
  }, [rasxodRequestdata, selectedO?.id]);

  const getBrigada = async () => {
    const get: any = await api.get(`batalon?birgada=true`);
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
      if (rasxodfromdate == "" || rasxodtodate == "") return;
      setScreenLoader(true);
      const res = await request.get("/rasxod/request", {
        params: {
          account_number_id: accountNumber,
          from: rasxodfromdate,
          to: rasxodtodate,
          batalon_id: selectedO?.id,
        },
      });
      if (res.data.success) {
        delete res.data.success;
        const data = res.data.data ?? [];
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
    } catch (error: any) {
      dispatch(
        alertt({
          success: false,
          //@ts-ignore
          text: error?.response?.data?.message || error.message,
        })
      );
    } finally {
      setScreenLoader(false);
    }
  };

  // Yangi (hali biriktirilmagan) topshiriqlar FAQAT "Ishga tushirish"
  // bosilganda olinadi — sahifa ochilganda avval hujjatdagi saqlangan
  // qatorlar ko'rinadi (Chiqim F.I.Sh. tahrirlash sahifasi bilan bir xil).

  useEffect(() => {
    if (open) getBrigada();
  }, [open, page]);

  const userStore = localStorage.getItem("user");
  const userData = userStore ? JSON.parse(userStore) : undefined;
  const user = userData ? userData.user : undefined;

  const recipient = [
    { txt: tt("To'lovchi", "Плательщик"), value: user?.doer_name || "" },
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
      value: textNum(primaryAccountNumber(selectedO), 4),
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
        <div className="m-0 p-0">
          <BackButton />
        </div>
        <h1 className="font-[700] text-[1.25rem] block ms-8">
          {tt(
            "Chiqim hujjatini tahrirlash",
            "Редактирование расходного документа"
          )}
        </h1>
      </div>
      {/* <SimpleText txt="To'lov hujjatlari" /> */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-x-5">
          <h5 className="whitespace-nowrap font-[600]">{tt("Hujjat №", "№ документа")}</h5>
          <Input
            v={docNum ?? ""}
            change={(e: ChangeEvent<HTMLInputElement>) =>
              setDocnum(e.target.value)
            }
          />
        </div>
        <div className="flex items-center gap-x-5">
          <h5 className="whitespace-nowrap font-[600]">
            {tt("Hujjat sanasi", "Дата проводки")}
          </h5>
          <SpecialDatePicker
            defaultValue={docDate ?? ""}
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
                className={`cursor-pointer ${selectedO?.id === o.id
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
                className="w-full text-left"
                v={
                  calculatedSum
                    ? Math.round(Number(calculatedSum) * 100) / 100
                    : ""
                }
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
          value={opisanie ?? ""}
        ></textarea>
      </div>

      <div className="my-[3.125rem] flex flex-wrap items-center justify-end gap-x-10 gap-y-3">
        <SpecialDatePicker
          label={tt("dan", "с")}
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
          text={tt("Ishga tushirish", "Запустить")}
          type="button"
          {...permBtn(perm.update, undefined, "!h-10 !mt-[1.25rem] border-success !bg-success text-success-foreground hover:!bg-success/90")}
          onClick={() => getRasxodRequest()}
        />
      </div>
      <RasxodcreateTable
        // data={rasxodRequestdata}
        data={filtereddata}
        setRasxodRequestData={setRasxodRequestData}
      />

      {/* submit btn  */}
      <div className="mt-5 mb-5 flex justify-center">
        <Button mode="save" type="button" {...permBtn(perm.update)} onClick={handleSubmit}></Button>
      </div>
    </div>
  );
};
