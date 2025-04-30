/** @format */
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import useApi from "@/services/api";
import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllOrgans, getBat, getOrgan, getSearch, postCont } from "../../api";
import Input from "../../Components/Input";
import Modal from "../../Components/Modal";
import OrganTAb from "../../pageCompoents/OrganTAb";
import { alertt } from "../../Redux/LanguageSlice";
import { textNum, tt } from "../../utils";
import Recipient from "../prixod/recipient";
import { initialContract } from "./ContractEdit";
import TaskColumn from "./taskColumn";

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="opacity-[0.7] dark:opacity-[1] font-[600] text-mytextcolor">
    {txt}
  </h3>
);

const ContractAdd = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jwt } = useSelector((s: any) => s.auth);
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [batalons, setBatalons] = useState([]);
  const [bxm, setBxm] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Starting at page 2 for example
  const [totalPages, setTotalPages] = useState(1);
  const [contract, setContract] = useState(initialContract);
  const [errors] = useState<any>({});

  const [dateBox, setDateBox] = useState<boolean>(false);
  const [adressBox, setAdressBox] = useState<boolean>(false);
  const api = useApi();

  //@ts-ignore
  const { account_number_id } = useSelector((state) => state.account);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newrows = contract.tasks.map((row) => {
      const { id, address, task_date, ...rowitem } = row;
      return {
        ...rowitem,
        address: adressBox ? address : contract.adress,
        task_date: dateBox ? task_date : contract.doc_date ?? "",
      };
    });

    const formValues = {
      doc_num: contract.doc_num,
      doc_date: contract.doc_date,
      period: contract.period,
      adress: contract.adress,
      start_date: contract.start_date,
      start_time: contract.start_time,
      end_date: contract.end_date,
      end_time: contract.end_time,
      discount: contract.discount || 0,
      organization_id: active,
      // account_number_id: value,
      tasks: newrows,
      dist: adressBox,
      date: dateBox,
    };

    // Submit data
    const resp = await postCont(jwt, formValues, account_number_id);

    if (resp.success) {
      navigate(`/contract/view/${resp?.data?.id}`);

      dispatch(alertt({ text: resp.message, success: true }));
      event.currentTarget.reset();
    } else {
      dispatch(alertt({ text: resp.message, success: false }));
    }
  };

  const handleOrganization = async () => {
    const data = await getOrgan(jwt, currentPage, 20);
    if (data.success) {
      setData(data.data);
      setTotalPages(data.meta.pageCount);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setData((await getAllOrgans(jwt)).data);
      setBatalons((await getBat(jwt)).data);
      const bxm = await api.get("bxm");
      if (bxm?.success) {
        setBxm(bxm.data as any);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    handleOrganization();
  }, [currentPage]);

  const handleSearch = async () => {
    const res = await getSearch(jwt, currentPage, searchValue.trim());

    if (res.success) {
      setData(res.data);
      setTotalPages(res.meta.pageCount);
    }
  };
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Faqat raqamlar va maksimal uzunligi 4 ta belgini qabul qilish
  //   let inputVal = e.target.value.replace(/:/g, ""); // ":" belgilarini olib tashlaymiz

  //   if (inputVal.length > 4) return; // 4 raqamdan oshib ketmasligi uchun

  //   if (inputVal.length > 2) {
  //     inputVal = inputVal.slice(0, 2) + ":" + inputVal.slice(2); // ikki raqamdan keyin ":" qo'shamiz
  //   }

  //   if (e.target.name === "start_time") {
  //     setStartAndFinishTimes({ ...startAndFinishTimes, starttime: inputVal });
  //   } else {
  //     setStartAndFinishTimes({ ...startAndFinishTimes, endtime: inputVal });
  //   }
  // };
  useEffect(() => {
    if (searchValue) {
      handleSearch();
    } else {
      handleOrganization();
    }
  }, [searchValue]);

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
      value: data.find((d) => d.id === active)?.name || "",
    },
    {
      txt: tt("Bank", "Банк"),
      value: data.find((d) => d.id === active)?.bank_name || "",
    },
    {
      txt: tt("MFO", "МФО"),
      value: data.find((d) => d.id === active)?.mfo || "",
    },
    {
      txt: tt("INN", "ИНН"),
      value: textNum(data.find((d) => d.id === active)?.str, 3) || "",
    },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value:
        textNum(data.find((d) => d.id === active)?.account_number, 4) || "",
    },
  ];

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 240px)` : height - 240;

  return (
    <div className="h-full mt-5 mx-auto">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div
          style={{ maxHeight: fullHeight }}
          className="overfloww flex flex-col gap-10"
        >
          <div className="flex justify-between gap-x-4 mt-5">
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
              <div className="flex items-end mt-5 gap-x-5">
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
                <div className="flex items-center gap-x-1">
                  <input
                    checked={adressBox}
                    onChange={() => setAdressBox(!adressBox)}
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
                <div className="flex gap-5">
                  <div className="flex flex-col w-[212px] gap-5">
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
                    <SpecialDatePicker
                      label={tt("Tugash sanasi", "Дата окончания")}
                      onChange={(event) => {
                        setContract((prev) => ({
                          ...prev,
                          end_date: event,
                        }));
                      }}
                      error={errors.finish_date}
                    />
                  </div>
                  <div className="flex flex-col w-[212px] gap-5">
                    <Input
                      v={contract.start_time}
                      change={(event: any) => {
                        setContract((prev) => ({
                          ...prev,
                          start_time: event.target.value,
                        }));
                      }}
                      label={tt("Boshlanish vaqti", "Время начала")}
                      t="text"
                      n="start_time"
                      className="w-auto"
                    />
                    <Input
                      n="end_time"
                      label={tt("Tugash vaqti", "Время окончания")}
                      t="text"
                      className="w-auto"
                      error={errors.end_time}
                      v={contract.end_time}
                      change={(event: any) => {
                        setContract((prev) => ({
                          ...prev,
                          end_time: event.target.value,
                        }));
                      }}
                    />
                  </div>
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
          <div>
            <div className="bg-mybackground mt-8">
              <div>
                {contract?.tasks?.map((e, i) => (
                  <TaskColumn
                    e={e as any}
                    adressBox={adressBox}
                    batalons={batalons}
                    bxm={bxm}
                    contract={contract}
                    dateBox={dateBox}
                    setContract={setContract}
                    key={i}
                  />
                  // <ContractAddColumn
                  //   key={i}
                  //   data={e}
                  //   rows={rows}
                  //   index={i}
                  //   errorInfo={errors}
                  //   batalons={batalons}
                  //   setDatas={setRows}
                  //   dateBox={dateBox}
                  //   adressBox={adressBox}
                  //   bxm={bxm}
                  // />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-10">
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
            setActive={(e: any) => {
              setOpen(false);
              setActive(e);
            }}
            data={data}
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

export default ContractAdd;
