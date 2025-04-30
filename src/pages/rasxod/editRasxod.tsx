import Input from "@/Components/Input";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { RasxodTabelInterface, SingleRasxodInterface } from "@/interface";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { IOrganization } from "@/types/organization";
import { latinToCyrillic, numberToWords, textNum, tt } from "@/utils";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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

export const EditRasxod = () => {
  const fromDate = new Date();
  //fromDate - 1 month
  fromDate.setMonth(fromDate.getMonth() - 1);

  const api = useApi();
  const navigate = useNavigate();
  const { id } = useParams();

  //@ts-ignore
  const accountNumber = useSelector((state) => state.account.account_number_id);

  const [open, setOpen] = useState<boolean>(false);
  const [organization, setOrganization] = useState({ data: [] });
  const [selectedO, setSelectedO] = useState<IOrganization>();
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
  const dispatch = useDispatch();
  const request = useRequest();
  const [editedData, setEditedData] = useState<SingleRasxodInterface | null>(
    null
  );
  const filtereddata = rasxodRequestdata.filter(
    (item) => selectedO?.id == item.batalon_id
  );

  const getByRasxodId = async () => {
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

          //@ts-ignore
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

          const regenerated = data.tasks.map((item) => {
            return {
              ...item,
              saved: true,
              batalon_id: data.batalon_id,
            };
          });
          setRasxodRequestData(regenerated);
          setDocDate(data.doc_date);
          setOpisanie(data.opisanie ? data.opisanie : undefined);
          //@ts-ignore
        }
      }
    } catch (error: any) {
      dispatch(
        alertt({
          success: false,
          text: error.response.data.error || error.message,
        })
      );
      navigate("/rasxod");
    }
  };

  useEffect(() => {
    getByRasxodId();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const data = {
        doc_num: docNum,
        doc_date: docDate,
        batalon_id: selectedO?.id,
        opisanie: opisanie,
        tasks: filtereddata.map((item: any) => {
          return {
            task_id: item.task_id,
          };
        }),
      };

      const res = await request.put("/rasxod/" + editedData?.id, data, {
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
              text: tt(
                "O'zgartirish muvaffaqiyatli bajarildi!",
                "Смена прошла успешно!"
              ),
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
    rasxodRequestdata?.forEach((item) => (sum += item.result_summa));
    setCalculatedSum(sum);
  };

  useEffect(() => {
    calculateSum();
  }, [rasxodRequestdata, id]);

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
    } catch (error: any) {
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
    if (accountNumber && selectedO?.id) {
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
    { txt: tt("Qabul qiluvchi", "Получатель"), value: user?.doer_name || "" },
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
      txt: tt("To'lovchi", "Плательщик"),
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
        <h1 className=" font-[700] text-[20px] block ms-8">
          {tt(
            "Chiqim hujjatini tahrirlash",
            "Редактирование расходного документа"
          )}
        </h1>
      </div>
      {/* <SimpleText txt="Платежные документы" /> */}
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
          <h5 className="font-[600]">
            {tt("E'lon qilingan sanaku bu", "Дата проводки")}
          </h5>
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
                // readonly={true}
                // t="number"
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
      <RasxodcreateTable
        // data={rasxodRequestdata}
        data={filtereddata}
        setRasxodRequestData={setRasxodRequestData}
      />

      {/* submit btn  */}
      <div className="mt-5 mb-5 flex justify-center">
        <Button mode="save" type="button" onClick={handleSubmit}></Button>
      </div>
    </div>
  );
};
