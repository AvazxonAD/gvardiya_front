import Input from "@/Components/Input";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { IContract } from "@/types/contract";
import { IOrganization } from "@/types/organization";
import { IPrixod } from "@/types/prixod";
import { formatDate, formatSum, numberToWords, textNum, tt } from "@/utils";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import PrixodModal from "./modal";
import Recipient from "./recipient";
import { RootState } from "@/Redux/store";

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="opacity-[0.7] dark:opacity-[1] font-[600] text-mytextcolor">
    {txt}
  </h3>
);

const OrganizationTD = ({ txt }: { txt: string }) => (
  <td className="border px-3 py-3 text-left text-mytextcolor font-[500] text-[14px]">
    {txt}
  </td>
);

type IOrganizationState = {
  meta: {
    nextPage: number | null;
    backPage: number | null;
    pageCount: number;
    currentPage: number;
    count: number;
  };
  data: IOrganization[];
};

type IContractState = {
  meta: {
    nextPage: number | null;
    backPage: number | null;
    pageCount: number;
    currentPage: number;
    count: number;
  };
  data: IContract[];
};

const CreatePrixod = () => {
  const api = useApi();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const [currentPrixod, setCurrentPrixod] = useState<IPrixod>();
  const { account_number_id } = useSelector((state: any) => state.account);

  const getCurrentPrixod = async () => {
    const get = await api.get<IPrixod>(
      `prixod/${id}?account_number_id=${account_number_id}`
    );
    if (get?.success) {
      setCurrentPrixod(get.data);
    } else {
      navigate("/prixod");
    }
  };

  useEffect(() => {
    if (id) {
      getCurrentPrixod();
    }
  }, [id]);

  const [open, setOpen] = useState<boolean>(false);
  const [organization, setOrganization] = useState<IOrganizationState>();
  const [selectedO, setSelectedO] = useState<IOrganization>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(10);
  const [value, setValue] = useState("");
  const [searchText] = useDebounce(value, 500);

  const [contract, setContract] = useState<IContractState>();
  const [selectedC, setSelectedC] = useState<IContract>();
  const [cPage, setCPage] = useState<number>(1);
  const [cLimit, setCLimit] = useState(10);
  const [docOpen, setDocOpen] = useState<boolean>(false);
  const [cValue, setCValue] = useState("");
  const [searchCText] = useDebounce(cValue, 500);

  const [sum, setSum] = useState<number | undefined>();
  const [opisanie, setOpisanie] = useState<string>();
  const [docNum, setDocnum] = useState<string>();
  const [docDate, setDocDate] = useState<string | undefined>();
  const [contractFrom, setContractFrom] = useState<string>("2022-10-10");
  const [contractTo, setContractTo] = useState<string>("2025-10-10");
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (startDate && endDate) {
      setContractFrom(startDate);
      setContractTo(endDate);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (currentPrixod) setSum(currentPrixod?.prixod_summa);
  }, [currentPrixod]);

  useEffect(() => {
    if (selectedC) {
      setSum(selectedC?.remaining_balance);
      setDocDate(selectedC?.doc_date);
      setDocnum(selectedC?.doc_num);
    }
  }, [selectedC]);

  const getOrganization = async () => {
    const searchParam = searchText ? `&search=${searchText}` : "";
    const get: any = await api.get(
      `organization?page=${page}&limit=${limit}${searchParam}`
    );
    if (get?.success) setOrganization({ meta: get.meta, data: get.data });
  };

  const getContract = async () => {
    const searchParam = searchCText ? `&search=${searchCText}` : "";
    const get: any = await api.get(
      `contract/?from=${contractFrom}&to=${contractTo}&page=${cPage}&limit=${cLimit}&account_number_id=${account_number_id}${searchParam}`
    );
    if (get?.success) setContract({ meta: get.meta, data: get.data });
  };

  useEffect(() => {
    if (open) getOrganization();
  }, [open, page, limit, searchText]);

  useEffect(() => {
    if (docOpen) getContract();
  }, [docOpen, cPage, cLimit, searchCText, contractFrom, contractTo]);

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
      value:
        textNum(selectedO?.str ?? currentPrixod?.organization_str ?? "", 3) ||
        "",
    },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value:
        textNum(
          selectedO?.account_number ??
          currentPrixod?.organization_account_number ??
          "",
          4
        ) || "",
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Agar qiymat juda katta bo'lsa, qabul qilmaslik
    if (Number(inputValue.replace(/,/g, ".")) > 999999999999) return;
    if (inputValue === "") {
      setSum(undefined);
      return;
    }

    // Raqamlar, nuqta yoki vergul qabul qiladigan regex
    if (/^[0-9]+([.,][0-9]*)?$/.test(inputValue)) {
      // Vergulni nuqta bilan almashtirish va raqam sifatida qabul qilish
      setSum(Number(inputValue.replace(/,/g, ".")));
    }
  };

  const handleOpisanieChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setOpisanie(e.target.value);

  // const disabled = !(selectedO?.id && selectedC?.id && opisanie && docDate && sum && docNum)

  const contranctDisabled =
    !Boolean(selectedO) && !Boolean(currentPrixod?.organization_id);

  const validContractData =
    (selectedO?.id ?? currentPrixod?.organization_id) ===
    (selectedC?.organization_id ?? currentPrixod?.organization_id);

  useEffect(() => {
    if (!validContractData) {
      setSum(undefined);
    }
  }, [selectedO]);

  const handleSubmit = async () => {
    if (true) {
      const method: any = id ? api.update : api.post;
      const post: any = await method(
        `prixod${id ? `/${id}` : ""}?account_number_id=${account_number_id}`,
        {
          organization_id: selectedO?.id ?? currentPrixod?.organization_id,
          contract_id:
            selectedC?.id ??
            (validContractData ? currentPrixod?.contract_id : null),
          opisanie: opisanie ?? currentPrixod?.opisanie,
          doc_num: docNum ?? currentPrixod?.prixod_doc_num,
          doc_date: docDate ?? currentPrixod?.prixod_date,
          summa: sum ?? currentPrixod?.prixod_summa,
        }
      );
      if (post?.success) {
        navigate("/prixod");
      } else {
        dispatch(
          alertt({
            text: post?.error ?? post?.message ?? "Error",
            success: false,
          })
        );
      }
    }
  };

  const { pathname } = useLocation();

  return (
    <div className="relative">
      <div className="flex items-center mb-5">
        <div className="m-0 p-0">
          <BackButton />
        </div>
        <h1 className="font-[700] text-mytextcolor text-[20px] block ms-8">
          {pathname.includes("/create")
            ? tt("Hujjat yaratish", "Создать документ")
            : tt("Hujjat tahrirlash", "Редактировать документ")}
        </h1>
      </div>
      <SimpleText txt="To'lov hujjatlari" />
      <div className="flex items-center gap-x-5 mt-5">
        <div className="flex items-center gap-x-5">
          <h5 className="font-[600]">{tt("Hujjat №", "Документ №")}</h5>
          <Input
            v={docNum ?? currentPrixod?.prixod_doc_num ?? ""}
            change={(e: ChangeEvent<HTMLInputElement>) =>
              setDocnum(e.target.value)
            }
          />
        </div>
        <div className="flex items-center gap-x-5">
          <h5 className="font-[600]">{tt("Hujjat sanasi", "Дата проводки")}</h5>
          <SpecialDatePicker
            defaultValue={docDate ?? currentPrixod?.prixod_date ?? ""}
            onChange={setDocDate}
          />
        </div>
      </div>
      {/* organization  */}
      <div className="flex mt-5">
        <div className="border w-1/2 p-3">
          <SimpleText
            txt={tt("Qabul qiluvchi tafsilotlari", "Данные получателя")}
          />
          <div>
            {recipient.map((e, ind) => (
              <Recipient key={ind} txt={e.txt} value={e.value} />
            ))}
          </div>
        </div>
        <div className="border w-1/2 p-3 bg-mybackground">
          <SimpleText
            txt={tt("To'lovchi tafsilotlari", "Данные плательщика")}
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
          <PrixodModal
            open={open}
            setOpen={setOpen}
            type="organization"
            meta={organization?.meta}
            setPage={setPage}
            page={page}
            limit={limit}
            setLimit={setLimit}
            contractFrom={contractFrom}
            contractTo={contractTo}
            setContractFrom={setContractFrom}
            setContractTo={setContractTo}
            onChange={(e: any) => setValue(e.target.value)}
          >
            {organization?.data.map((o, ind) => (
              <tr
                key={ind}
                // style={{
                //     background: (selectedO?.id ?? currentPrixod?.organization_id) === o.id ? "#f3f4f6" : "white"
                // }}
                className={`cursor-pointer text-mytextcolor ${(selectedO?.id ?? currentPrixod?.organization_id) === o.id
                  ? "bg-[#f3f4f6] dark:bg-mytableheadborder"
                  : "bg-mybackground"
                  }`}
                onClick={() => {
                  setSelectedO(o);
                  setOpen(false);
                  setSelectedC(undefined);
                  setContract(undefined);
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
          </PrixodModal>
        </div>
      </div>
      {/* prixod  */}
      <div className="flex">
        <div className="w-1/2 py-5 pr-5">
          <SimpleText txt={tt("Kirim", "Приход")} />
          <div className="flex items-start gap-x-4 mt-5 w-full">
            <h4 className="w-2/8">{tt("Summa", "Сумма")}</h4>
            <div className="w-[50%]">
              <Input
                className={`w-full text-right outline-none `}
                v={sum}
                change={handleChange}
              />
            </div>
            <textarea
              className="w-full text-red-600 bg-mybackground uppercase border outline-none resize-none row-span-4 px-2 py-1 rounded-[5px]"
              placeholder="..."
              readOnly
              value={numberToWords(sum)}
            />
          </div>
        </div>
        <div className="w-1/2 py-5">
          <SimpleText txt={tt("Shartnoma", "Договор")} />
          <div className="flex items-center mt-5">
            <div className="flex items-center gap-x-3">
              <h3>{tt("Hujjat №", "№ договора")}</h3>
              <div className="w-1/2">
                <Input
                  onDoubleClick={() => setDocOpen(true)}
                  className={`w-full ${"cursor-auto"}`}
                  readonly
                  v={selectedC?.doc_num ?? currentPrixod?.contract_doc_num}
                />
              </div>
            </div>

            <div className="flex items-center gap-x-3">
              <h3>{tt("Hujjat sanasi", "Дата договора")}</h3>
              <div className="w-1/2">
                <Input
                  onDoubleClick={() => setDocOpen(true)}
                  className={`w-full ${"cursor-auto"}`}
                  readonly
                  v={
                    (selectedC?.doc_date
                      ? formatDate(selectedC?.doc_date)
                      : undefined) ??
                    formatDate(currentPrixod?.contract_doc_date)
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-x-3">
              <h3>{tt("Summa", "Сумма")}</h3>
              <div className="w-1/2">
                <Input
                  className={`w-full ${"cursor-auto"}`}
                  readonly
                  v={
                    (selectedC?.remaining_balance
                      ? formatSum(selectedC?.remaining_balance)
                      : undefined) ??
                    formatSum(currentPrixod?.remaining_balance)
                  }
                />
              </div>
            </div>
          </div>
          <PrixodModal
            open={docOpen}
            setOpen={setDocOpen}
            type="contract"
            meta={contract?.meta}
            setPage={setCPage}
            page={cPage}
            limit={cLimit}
            setLimit={setCLimit}
            contractFrom={contractFrom}
            contractTo={contractTo}
            setContractFrom={setContractFrom}
            hasDate={true}
            setContractTo={setContractTo}
            onChange={(e: any) => setCValue(e.target.value)}
          >
            {contract?.data &&
              contract.data.map((c, ind) => (
                <tr
                  key={ind}
                  className={`cursor-pointer ${c.id === selectedC?.id
                    ? "bg-[#f3f4f6] dark:bg-mytableheadborder"
                    : "bg-mybackground"
                    }`}
                  onClick={() => {
                    setSelectedC(c);

                    // Find and set the organization based on the contract's organization_id
                    if (c.organization_id) {
                      api
                        .get(`organization/${c.organization_id}`)
                        .then((response: any) => {
                          if (response?.success) {
                            setSelectedO(response.data);
                          }
                        });
                    }

                    setDocOpen(false);
                  }}
                >
                  <OrganizationTD txt={c.doc_num} />
                  <OrganizationTD txt={formatDate(c.doc_date)} />
                  <OrganizationTD txt={c.organization_name} />
                  <OrganizationTD txt={c.adress} />
                  <OrganizationTD txt={formatSum(c.result_summa) + ""} />
                  <OrganizationTD txt={formatSum(c.remaining_balance) + ""} />
                </tr>
              ))}
          </PrixodModal>
        </div>
      </div>
      {/* opisaniya  */}
      <div>
        <h3 className="font-[600]">{tt("Tavsif", "Описание")}</h3>
        <textarea
          placeholder=""
          className="border w-full mt-3 bg-mybackground p-3 outline-[grey] dark:outline-none"
          onChange={handleOpisanieChange}
          value={opisanie ?? currentPrixod?.opisanie ?? ""}
        ></textarea>
      </div>

      {/* submit btn  */}
      <div className="mt-5 disabled">
        <Button mode={!Boolean(id) ? "add" : "edit"} onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default CreatePrixod;
