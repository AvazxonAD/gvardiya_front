import Input from "@/Components/Input";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { RasxodTabelInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { IOrganization } from "@/types/organization";
import { IPrixod } from "@/types/prixod";
import { latinToCyrillic, numberToWords, textNum, tt } from "@/utils";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Recipient from "../prixod/recipient";
import RasxodModal from "./modal";
import { RasxodcreateTable } from "./rasxodcreateTable";

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

export const CreateRasxod = () => {
  const fromDate = new Date();
  //fromDate - 1 month
  fromDate.setMonth(fromDate.getMonth() - 1);
  const todate = new Date();

  const api = useApi();
  const navigate = useNavigate();

  //@ts-ignore
  const accountNumber = useSelector((state) => state.account.account_number_id);

  const [currentPrixod] = useState<IPrixod>();

  const [open, setOpen] = useState<boolean>(false);
  const [organization, setOrganization] = useState({ data: [] });
  const [selectedO, setSelectedO] = useState<IOrganization>();
  const [limit, setLimit] = useState<number>(15);
  const [page, setPage] = useState<number>(1);

  const [opisanie, setOpisanie] = useState<string>();
  const [docNum, setDocnum] = useState<string>();
  const [docDate, setDocDate] = useState<string | undefined>();

  // const [rasxodfromdate, setRasxodFromDate] = useState<string>(
  //   `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`
  // );
  // const [rasxodtodate, setRasxodToDate] = useState<string>(
  //   `${todate.getFullYear()}-${todate.getMonth() + 1}-${todate.getDate()}`
  // );
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
    RasxodTabelInterface[]
  >([]);
  const [calculatedSum, setCalculatedSum] = useState<number>();
  const dispatch = useDispatch();
  const request = useRequest();
  const handleSubmit = async () => {
    try {
      const data = {
        doc_num: docNum,
        doc_date: docDate,
        batalon_id: selectedO?.id,
        opisanie: opisanie,
        tasks: rasxodRequestdata.map((item: any) => {
          return {
            task_id: item.task_id,
          };
        }),
      };

      const res = await request.post("/rasxod", data, {
        params: {
          account_number_id: accountNumber,
        },
      });
      if (res.status == 200 || res.status == 201) {
        if (res.data.success) {
          navigate("/rasxod");
          dispatch(
            alertt({
              success: true,
              text: tt("Chiqim yaratildi!", "Создано успешно"),
            })
          );
        }
      }
    } catch (error) {
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
    let sum = 0;
    rasxodRequestdata.forEach((item) => (sum += item.result_summa));
    setCalculatedSum(sum);
  };

  useEffect(() => {
    calculateSum();
  }, [rasxodRequestdata]);

  const getBrigada = async () => {
    const get: any = await api.get(`batalon?birgada=true`);
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
        setRasxodRequestData(res.data.data);
        // setItogo(res.data.meta.itogo);
        // setSum(res.data.meta.itogo);
      }
    } catch (error) {
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
      txt: tt("To'lovchi", "Получатель"),
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
      txt: tt("Qabul qiluvchi", "Плательщик"),
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
        (selectedO?.account_number ??
          currentPrixod?.organization_account_number) ||
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
      <div className="flex items-center mb-[31px]">
        <div className="m-0 p-0">
          <BackButton />
        </div>
        <h1 className="font-[700] text-[20px] block ms-8">
          {tt("Chiqim hujjat yaratish", "Создать документ")}
        </h1>
      </div>
      {/* <SimpleText txt="Платежные документы" /> */}
      <div className="flex items-center gap-x-5 mt-5">
        <div className="flex items-center gap-x-5">
          <h5 className="font-[600]">{tt("Hujjat №", "Документ №")}</h5>
          <Input
            v={docNum ?? currentPrixod?.contract_doc_num ?? ""}
            change={(e: ChangeEvent<HTMLInputElement>) =>
              setDocnum(e.target.value)
            }
          />
        </div>
        <div className="flex items-center gap-x-5">
          <h5 className="font-[600]">
            {tt("E'lon qilingan sana", "Дата проводки")}
          </h5>
          <SpecialDatePicker
            defaultValue={docDate ?? currentPrixod?.contract_doc_date ?? ""}
            onChange={setDocDate}
          />
        </div>
      </div>
      {/* organization  */}
      <div className="flex mt-5">
        <div className="border w-1/2 p-3 ">
          {/* <SimpleText
            txt={tt("Тo'lovchi ma’lumotlari", "Информация о плательщике")}
          /> */}
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
                // readonly={true}
                // t="number"
                className="w-full text-right"
                v={calculatedSum ? calculatedSum : ""}
                change={handleChange}
              />
            </div>
            <textarea
              className="w-full text-red-600 uppercase bg-mybackground border outline-none resize-none row-span-4 px-2 py-1 rounded-[5px]"
              placeholder="..."
              readOnly
              value={calculatedSum != 0 ? numberToWords(calculatedSum) : ""}
            />
          </div>
        </div>
        <div className="w-1/2 py-5"></div>
      </div>
      {/* opisaniya  */}
      <div>
        <h3 className="font-[600]">{tt("Tavsif", "Описание")}</h3>
        <textarea
          placeholder=""
          className="border w-full mt-3 p-3 bg-mybackground outline-[grey] dark:outline-none"
          onChange={handleOpisanieChange}
          value={opisanie ?? currentPrixod?.opisanie ?? ""}
        ></textarea>
      </div>

      <div className="flex justify-end my-[50px] items-center gap-[40px]">
        <SpecialDatePicker
          label={tt("dan", latinToCyrillic("dan"))}
          defaultValue={rasxodfromdate}
          onChange={setRasxodFromDate}
        />

        <SpecialDatePicker
          label={tt("gacha", latinToCyrillic("do"))}
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
      <RasxodcreateTable
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
