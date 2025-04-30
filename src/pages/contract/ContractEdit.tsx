/** @format */

import {
  getAllOrgans,
  getBat,
  getOrgan,
  getSearch,
  getSingleCont,
  getSpr,
  putCont,
} from "@/api";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import OrganTAb from "@/pageCompoents/OrganTAb";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { formatNum, textNum, tt } from "@/utils";
import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Recipient from "../prixod/recipient";
import TaskColumn from "./taskColumn";

export const initialContract = {
  account_number_id: 0,
  adress: "",
  all_task_time: 9,
  all_worker_number: 9,
  discount: 0,
  doc_date: "",
  doc_num: "",
  end_date: "",
  end_time: "",
  id: 0,
  organization_id: 0,
  payment: false,
  period: "",
  remaining_balance: 0,
  start_date: "",
  start_time: "",
  summa: 0,
  dist: false,
  tasks: [
    {
      batalon_id: 0,
      unique_id: 0,
      id: undefined,
      comment: "",
      remaining_task_time: 0,
      summa: 0,
      task_date: "",
      task_time: "",
      worker_number: "",
      bxm_id: 0,
      address: "",
    },
  ],
};

export type IContract = {
  account_number_id: number;
  adress: string;
  all_task_time: number;
  all_worker_number: number;
  discount: number;
  doc_date: string;
  doc_num: string;
  end_date: string;
  end_time: string;
  id: number;
  organization_id: number;
  payment: boolean;
  period: string;
  remaining_balance: number;
  start_date: string;
  start_time: string;
  summa: number;
  dist: boolean;
  tasks: Array<{
    batalon_id: number;
    id: number | undefined;
    remaining_task_time: number;
    summa: number;
    task_date: string;
    task_time: string;
    unique_id: number;
    comment: string;
    worker_number: string;
    bxm_id: number;
    address: string;
  }>;
};

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="opacity-[0.7] dark:opacity-[1] font-[600] text-mytextcolor">
    {txt}
  </h3>
);

const ContractEdit = () => {
  const { jwt } = useSelector((s: { auth: { jwt: string } }) => s.auth);
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(initialContract);
  const dispatch = useDispatch();
  // for batalons
  const [batalons, setBatalons] = useState([]);
  // for organ workers
  const [organWorkers, setOrganWorkers] = useState({
    datas: [],
    active: 0,
  });
  const [organWorkers2, setOrganWorkers2] = useState<any>({
    datas: [],
    active: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Starting at page 2 for example
  const [totalPages, setTotalPages] = useState(1);
  const [dateBox, setDateBox] = useState<boolean>(false);
  const [addressBox, setAddressBox] = useState<boolean>(false);
  const [bxm, setBxm] = useState([]);
  const api = useApi();
  // for modal
  const [open, setOpen] = useState(false);
  // datas for input

  const { account_number_id } = useSelector((state: any) => state.account);
  const handleExistContact = async () => {
    const resp = await getSingleCont(jwt, id as any, account_number_id);

    if (!resp.success) {
      navigate("/contract");
    }
    setContract(resp.data);
    if (resp.data?.dist) {
      setAddressBox(true);
    }
  };
  const handleAllAccNumbers = async () => {
    let resp = await getSpr(jwt, "account");
    if (!resp.success) {
      resp = await getSpr(jwt, "account");
    }
  };
  const handleOrganWorkers = async () => {
    const resp = await getOrgan(jwt, currentPage, 15);
    if (resp.success) {
      setOrganWorkers((prev) => ({ ...prev, datas: resp.data }));
      setTotalPages(resp.meta.pageCount);
    }
  };

  const handleOrganWorkers2 = async () => {
    const resp = await getAllOrgans(jwt);
    if (resp.success) {
      setOrganWorkers2((prev: any) => ({ ...prev, datas: resp.data }));
    }
  };
  const handleBatalons = async () => {
    const resp = await getBat(jwt);
    if (resp.success) {
      setBatalons(resp.data);
    }
    const bxm = await api.get("bxm");
    if (bxm?.success) {
      setBxm(bxm.data as any);
    }
  };
  useEffect(() => {
    handleExistContact();
    handleBatalons();
    handleAllAccNumbers();
    handleOrganWorkers2();
  }, []);

  useEffect(() => {
    handleOrganWorkers();
  }, [currentPage]);

  const handleSearch = async () => {
    const res = await getSearch(jwt, currentPage, searchValue.trim());

    if (res.success) {
      setOrganWorkers((prev) => ({ ...prev, datas: res.data }));
      setTotalPages(res.meta.pageCount);
    }
  };

  useEffect(() => {
    if (searchValue) {
      handleSearch();
    } else {
      handleOrganWorkers();
    }
  }, [searchValue]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newrows = contract.tasks?.map((row) => {
      const {
        bxm_id,
        address,
        batalon_id,
        task_date,
        task_time,
        worker_number,
        comment,
      } = row;
      return {
        bxm_id,
        batalon_id,
        task_time,
        worker_number,
        address: addressBox ? address : contract.adress,
        task_date: dateBox ? task_date : contract?.doc_date?.slice(0, 10) ?? "",
        comment,
      };
    });

    const resp = await putCont(jwt, String(id), account_number_id, {
      // account_number_id: contract.account_number_id,
      adress: contract.adress,
      discount: contract.discount,
      doc_num: contract.doc_num,
      end_time: contract.end_time,
      organization_id: contract.organization_id,
      start_time: contract.start_time,
      doc_date: contract.doc_date?.slice(0, 10),
      end_date: contract.end_date?.slice(0, 10),
      period: contract.period?.slice(0, 10),
      start_date: contract.start_date?.slice(0, 10),
      tasks: newrows,
      dist: addressBox,
      date: dateBox,
    });
    if (resp.success) {
      dispatch(alertt({ text: resp.message, success: true }));
      navigate(`/contract/view/${id}`);
    } else {
      dispatch(alertt({ text: resp?.error, success: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, namee: any) => {
    // Faqat raqamlar va maksimal uzunligi 4 ta belgini qabul qilish
    let inputVal = e.target.value.replace(/:/g, ""); // ":" belgilarini olib tashlaymiz

    if (inputVal.length > 4) return; // 4 raqamdan oshib ketmasligi uchun

    if (inputVal.length > 2) {
      inputVal = inputVal.slice(0, 2) + ":" + inputVal.slice(2); // ikki raqamdan keyin ":" qo'shamiz
    }

    if (namee === "start_time") {
      setContract({ ...contract, start_time: inputVal });
    } else {
      setContract({ ...contract, end_time: inputVal });
    }
  };

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
      value:
        organWorkers2?.datas?.find((d: any) => d.id == contract.organization_id)
          ?.name || "",
    },
    {
      txt: tt("Bank", "Банк"),
      value:
        organWorkers2?.datas?.find((d: any) => d.id == contract.organization_id)
          ?.bank_name || "",
    },
    {
      txt: tt("MFO", "МФО"),
      value:
        organWorkers2?.datas?.find((d: any) => d.id == contract.organization_id)
          ?.mfo || "",
    },
    {
      txt: tt("INN", "ИНН"),
      value:
        textNum(
          organWorkers2?.datas?.find(
            (d: any) => d.id == contract.organization_id
          )?.str,
          3
        ) || "",
    },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value:
        textNum(
          organWorkers2?.datas?.find(
            (d: any) => d.id == contract.organization_id
          )?.account_number,
          4
        ) || "",
    },
  ];

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 240px)` : height - 240;

  const returnSum = (id: number) => {
    try {
      const find: any = bxm.find((i: any) => i?.id == id);
      if (find) {
        return find.bxm_07;
      } else {
        return 1;
      }
    } catch (error) {
      return 1;
    }
  };

  const allDiscount = (): { sum: string; dis: string } => {
    try {
      if (contract?.tasks) {
        let sum = 0;
        let dis = 0;
        for (let i of contract.tasks) {
          if (i?.worker_number && i?.task_time && i?.bxm_id) {
            const summa =
              Number(i.worker_number) *
              Number(i.task_time) *
              returnSum(i.bxm_id);
            const chegirma = contract.discount
              ? summa * (contract.discount / 100)
              : 0;
            sum += summa;
            dis += chegirma;
          }
        }
        return { sum: formatNum(sum, true), dis: formatNum(dis) };
      } else {
        return { sum: "", dis: "" };
      }
    } catch (error) {
      return { sum: "", dis: "" };
    }
  };

  return (
    <div className="h-full mt-5 mx-auto">
      <form onSubmit={handleSubmit} className="p-0">
        <div style={{ maxHeight: fullHeight }} className="w-full  overfloww">
          <div className="w-full flex justify-between my-7 gap-x-5">
            <div className="flex-col w-1/2 items-start gap-x-5 bg-mybackground rounded-md">
              <div className="flex gap-x-5">
                <div className="w-1/2">
                  <Input
                    label={tt("Shartnoma raqam", "Номер контракта")}
                    n="doc_num"
                    v={contract.doc_num}
                    change={(event: any) => {
                      setContract((prev) => ({
                        ...prev,
                        doc_num: event.target.value,
                      }));
                    }}
                    className="w-full"
                  />
                </div>

                <SpecialDatePicker
                  label={tt("Shartnoma sanasi", "Дата контракта")}
                  name="doc_date"
                  defaultValue={contract.doc_date}
                  onChange={(event) => {
                    setContract((prev) => ({
                      ...prev,
                      doc_date: event,
                    }));
                  }}
                />
              </div>
              <div className="flex mt-5 gap-x-5">
                <div className="w-1/2">
                  <Input
                    label={tt("Manzil", "Адрес")}
                    n="address"
                    v={contract.adress}
                    change={(event: any) => {
                      setContract((prev) => ({
                        ...prev,
                        adress: event.target.value,
                      }));
                    }}
                    className="w-full"
                  />
                </div>
                <SpecialDatePicker
                  label={tt("Amal qilish muddati", "Срок действия")}
                  name="period"
                  defaultValue={contract.period}
                  onChange={(event) => {
                    setContract((prev) => ({
                      ...prev,
                      period: event,
                    }));
                  }}
                />
              </div>
              <div className="flex items-end mt-5 gap-5">
                <div>
                  <Input
                    n="discount"
                    v={contract.discount + "" || "0"}
                    label={tt("Chegirma (%)", "Скидка (%)")}
                    t="number"
                    change={(event: any) => {
                      setContract((prev) => ({
                        ...prev,
                        discount: +event.target.value,
                      }));
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-x-1">
                  <input
                    checked={addressBox}
                    onChange={() => setAddressBox(!addressBox)}
                    type="checkbox"
                    name="all__address"
                    id="address_input"
                    className="w-6 h-6 cursor-pointer"
                  />
                  <label
                    htmlFor="address_input"
                    className="cursor-pointer block text-[#636566] text-[16px]  leading-[14.52px] font-[600]"
                  >
                    {tt("Manzil", "Адрес")}
                  </label>
                </div>
                <div className="flex items-center gap-x-1">
                  <input
                    checked={dateBox}
                    onChange={() => setDateBox(!dateBox)}
                    type="checkbox"
                    name="all__date"
                    id="date_input"
                    className="w-6 h-6 cursor-pointer"
                  />
                  <label
                    htmlFor="date_input"
                    className="cursor-pointer block text-[#636566] text-[16px]  leading-[14.52px] font-[600]"
                  >
                    {tt("Sana", "Дата")}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex-col w-1/2 items-start gap-x-5 bg-mybackground rounded-md">
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-[4fr_3fr] gap-x-5">
                  <SpecialDatePicker
                    label={tt("Boshlanish sana", "Дата начала")}
                    name="start_date"
                    defaultValue={contract.start_date?.slice(0, 10)}
                    onChange={(event) => {
                      setContract((prev) => ({
                        ...prev,
                        start_date: event,
                      }));
                    }}
                  />

                  <Input
                    change={(e: any) => handleChange(e, "start_time")}
                    v={contract.start_time}
                    label={tt("Boshlanish vaqti", "Время начала")}
                    t="text"
                    n="start_time"
                    className="w-auto"
                  />
                </div>
                <div className="grid grid-cols-[4fr_3fr] gap-x-5">
                  <SpecialDatePicker
                    label={tt("Tugash sana", "Дата начала")}
                    defaultValue={contract.end_date?.slice(0, 10)}
                    name="end_date"
                    onChange={(event) => {
                      setContract((prev) => ({
                        ...prev,
                        end_date: event,
                      }));
                    }}
                  />

                  <Input
                    change={(e: any) => handleChange(e, "end_time")}
                    v={contract.end_time}
                    label={tt("Boshlanish vaqti", "Время начала")}
                    t="text"
                    n="end_time"
                    className="w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex mt-5 gap-x-5">
            <div className="border w-1/2 p-3 bg-mybackground rounded-sm">
              <SimpleText
                txt={tt("Qabul qiluvchi tafsilotlari", "Данные получателя")}
              />
              <div>
                {recipient.map((e, ind) => (
                  <Recipient key={ind} txt={e.txt} value={e.value} />
                ))}
              </div>
            </div>
            <div className="border w-1/2 p-3 bg-mybackground rounded-sm">
              <SimpleText
                txt={tt("To'lovchi tafsilotlari", "Данные плательщика")}
              />
              <div>
                {payer.map((e, ind) => (
                  <Recipient
                    onDoubleClick={() => setOpen(true)}
                    key={ind}
                    txt={e.txt}
                    value={e.value}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="py-5 bg-mybackground mt-8">
            <div className="">
              {contract?.tasks?.map((e, i) => (
                <TaskColumn
                  e={e as any}
                  adressBox={addressBox}
                  batalons={batalons}
                  bxm={bxm}
                  contract={contract as any}
                  dateBox={dateBox}
                  setContract={setContract as any}
                  key={i}
                />
              ))}
            </div>
            <div className="flex gap-2 ms-[692px]">
              <div className="!w-[200px]">
                <Input v={allDiscount().dis} className="w-full mt-3" readonly />
              </div>
              <div className="!w-[200px]">
                <Input v={allDiscount().sum} className="w-full mt-3" readonly />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center items-center gap-x-10 mt-4">
          <Button
            mode="cancel"
            type="button"
            onClick={() => navigate("/contract")}
          />
          <Button mode="save" type="submit" />
          <Button
            mode="add"
            type="button"
            onClick={() => {
              setContract((prev: any) => ({
                ...prev,
                tasks: [
                  ...prev.tasks,
                  {
                    ...initialContract.tasks[0],
                    id: undefined,
                    unique_id: prev.tasks?.length + 1,
                  },
                ],
              }));
            }}
          />
        </div>
      </form>

      <Modal
        className="!w-full !max-w-[95vw] !min-w-[85vw]"
        title="Buyurtmachi"
        open={open}
        closeModal={async () => {
          setOpen(false);
        }}
      >
        <div className="min-w-[80vw]">
          <div className="mb-4">
            <Input
              search={true}
              v={searchValue}
              change={(e: any) => setSearchValue(e.target.value)}
              p={tt("Nomlar bo’yicha qidiruv", "Поиск по имени")}
            />
          </div>
          <OrganTAb
            openEdit={false}
            setActive={(id: number) => {
              setContract((prev) => ({
                ...prev,
                organization_id: id,
              }));
              setOpen(false);
            }}
            data={organWorkers.datas}
            page={currentPage}
            itemsPerPage={20}
            variant
          />

          <div className="mt-4">
            <Paginatsiya
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractEdit;
