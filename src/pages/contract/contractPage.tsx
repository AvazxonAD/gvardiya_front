/** @format */
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import useFullHeight from "@/hooks/useFullHeight";
import OrganTAb from "@/pageCompoents/OrganTAb";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IBatalon } from "@/types/batalon";
import { IContractForm } from "@/types/contract";
import { IOrganization } from "@/types/organization";
import { formatNum, tt } from "@/utils";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Recipient from "../prixod/recipient";
import { initialContract } from "./ContractEdit";
import { payer, recipient } from "./recipientData";
import TaskColumn, { returnBxmSum } from "./taskColumn";
import OrganizationModal from "@/shared/components/OrganizationModal";

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="opacity-[0.7] dark:opacity-[1] font-[600] text-mytextcolor">
    {txt}
  </h3>
);

const ContractPage = () => {
  const api = useApi();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { account_number_id } = useSelector(
    (state: RootState) => state.account
  );
  const [dateBox, setDateBox] = useState<boolean>(false);
  const [addressBox, setAddressBox] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [organizationModalOpen, setOrganizationModalOpen] =
    useState<boolean>(false);
  const [contract, setContract] = useState<IContractForm>(
    initialContract as any
  );
  const [allOrgan, setAllOrgan] = useState<IOrganization[]>([]);
  const [organWorkers, setOrganWorkers] = useState<IOrganization[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1); // Starting at page 2 for example
  const [totalPages, setTotalPages] = useState(1);
  const [batalons, setBatalons] = useState<IBatalon[]>([]);
  const [bxm, setBxm] = useState<any[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const [organizationValue, setOrganizationValue] = useState({
    name: "",
    address: "",
    str: "",
    bank_name: "",
    mfo: "",
    account_numbers: [] as string[],
    gazna_numbers: [] as string[],
  });

  const getContract = async () => {
    const get = await api.get<IContractForm>(
      `contract/${id}?account_number_id=${account_number_id}`
    );
    if (get?.success) {
      const appendUniqueId = get.data.tasks.map((task) => ({
        ...task,
        unique_id: task.id,
      }));

      setContract({ ...get.data, tasks: appendUniqueId });
      if (get.data?.dist) setAddressBox(true);
      if (get.data?.date) setDateBox(true);
    }
    //  else navigate("/contract");
  };

  const getAllOrgan = async () => {
    const get = await api.get<IOrganization[]>(
      `organization?page=1&limit=10000`
    );
    if (get?.success) setAllOrgan(get.data);
  };

  const getBxm = async () => {
    const batalon = await api.get<IBatalon[]>("batalon");
    if (batalon?.success) setBatalons(batalon.data);

    const bxmGet = await api.get<any[]>("bxm");
    if (bxmGet?.success) setBxm(bxmGet.data);
  };

  useEffect(() => {
    if (id) {
      getContract();
      getAllOrgan();
    }
    getBxm();
  }, [id]);

  const getOrgans = async () => {
    const sParam = searchValue ? `&search=${searchValue}` : "";
    const get: any = await api.get<IOrganization[]>(
      `organization?page=${currentPage}&limit=${15}${sParam}`
    );
    if (get?.success) {
      setOrganWorkers(get.data);
      setTotalPages(get.meta.pageCount);
    }
  };

  useEffect(() => {
    getOrgans();
  }, [currentPage, searchValue]);

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 240px)` : height - 240;

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    namee: any
  ) => {
    let inputVal = e.target.value.replace(/:/g, "");
    if (inputVal.length > 4) return;
    if (inputVal.length > 2) {
      inputVal = inputVal.slice(0, 2) + ":" + inputVal.slice(2);
    }
    if (namee === "start_time") {
      setContract({ ...contract, start_time: inputVal });
    } else {
      setContract({ ...contract, end_time: inputVal });
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
              returnBxmSum(i.bxm_id, bxm);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newrows = contract.tasks?.map((row) => {
      const {
        id,
        bxm_id,
        address,
        comment,
        batalon_id,
        task_date,
        task_time,
        worker_number,
      } = row;
      return {
        id,
        bxm_id,
        batalon_id,
        task_time,
        worker_number,
        address: addressBox ? address : contract.adress,
        task_date: dateBox ? task_date : contract?.doc_date?.slice(0, 10) ?? "",
        comment,
      };
    });
    const data = {
      adress: contract.adress,
      discount: contract.discount,
      doc_num: contract.doc_num,
      end_time: contract.end_time,
      organization_id: contract.organization_id,
      gazna_number_id:
        // @ts-ignore
        contract.gazna_number_id === "" ? null : contract.gazna_number_id,
      organ_account_number_id:
        // @ts-ignore
        contract.organ_account_number_id === ""
          ? null
          : contract.organ_account_number_id,
      start_time: contract.start_time,
      doc_date: contract.doc_date?.slice(0, 10),
      end_date: contract.end_date?.slice(0, 10),
      period: contract.period?.slice(0, 10),
      start_date: contract.start_date?.slice(0, 10),
      tasks: newrows,
      dist: addressBox,
      date: dateBox,
    };

    const method = id ? api.update : api.post;
    const request: any = await method(
      `contract${id ? `/${id}` : ""}?account_number_id=${account_number_id}`,
      data
    );
    if (request?.success) {
      dispatch(alertt({ text: request.message, success: true }));
      event?.currentTarget?.reset();
      navigate(`/contract/view/${id ?? request.data.id}`);
    } else {
      dispatch(alertt({ text: request?.message, success: false }));
    }
  };

  const handleOrganizationChange = (e: any) => {
    setOrganizationValue({
      ...organizationValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountNumberChange = (index: number, value: string) => {
    const updatedNumbers = [...organizationValue.account_numbers];
    updatedNumbers[index] = value;
    setOrganizationValue({
      ...organizationValue,
      account_numbers: updatedNumbers,
    });
  };

  const handleGaznaChange = (index: number, value: string) => {
    const updatedGazna = [...organizationValue.gazna_numbers];
    updatedGazna[index] = value;
    setOrganizationValue({
      ...organizationValue,
      gazna_numbers: updatedGazna,
    });
  };

  const addAccountNumber = () => {
    setOrganizationValue({
      ...organizationValue,
      account_numbers: [...organizationValue.account_numbers, ""],
    });
  };

  const addGazna = () => {
    setOrganizationValue({
      ...organizationValue,
      gazna_numbers: [...organizationValue.gazna_numbers, ""],
    });
  };

  const removeAccountNumber = (index: number) => {
    const updatedNumbers = [...organizationValue.account_numbers];
    updatedNumbers.splice(index, 1);
    setOrganizationValue({
      ...organizationValue,
      account_numbers: updatedNumbers,
    });
  };

  const removeGazna = (index: number) => {
    const updatedGazna = [...organizationValue.gazna_numbers];
    updatedGazna.splice(index, 1);
    setOrganizationValue({
      ...organizationValue,
      gazna_numbers: updatedGazna,
    });
  };

  const handleOrganizationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const response = await api.post("organization", {
        name: organizationValue.name,
        address: organizationValue.address,
        str: organizationValue.str,
        bank_name: organizationValue.bank_name,
        mfo: organizationValue.mfo,
        account_numbers: organizationValue.account_numbers.map((number) => ({
          account_number: number,
        })),
        gazna_numbers: organizationValue.gazna_numbers.map((number) => ({
          gazna_number: number,
        })),
      });

      if (response?.success) {
        dispatch(alertt({ text: response.message, success: true }));
        setOrganizationModalOpen(false);
        getAllOrgan(); // Refresh the organizations list
      } else {
        dispatch(alertt({ text: response?.message, success: false }));
      }
    } catch (error) {
      dispatch(alertt({ text: "Error creating organization", success: false }));
    }
  };

  return (
    <div className="h-full mt-5 mx-auto">
      <form onSubmit={handleSubmit}>
        <div style={{ maxHeight: fullHeight }} className="w-full  overfloww">
          {/* sana,shartnoma raqamlari */}
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
                    setContract((prev) => ({ ...prev, doc_date: event }));
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
                    setContract((prev) => ({ ...prev, period: event }));
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
                      setContract((prev) => ({ ...prev, start_date: event }));
                    }}
                  />

                  <Input
                    change={(e: any) => handleTimeChange(e, "start_time")}
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
                      setContract((prev) => ({ ...prev, end_date: event }));
                    }}
                  />

                  <Input
                    change={(e: any) => handleTimeChange(e, "end_time")}
                    v={contract.end_time}
                    label={tt("Tugash vaqti", "Время окончания")}
                    t="text"
                    n="end_time"
                    className="w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* tolovchi malumotlari */}
          <div className="flex mt-5 gap-x-5">
            <div className="border w-1/2 p-3 bg-mybackground rounded-sm">
              <SimpleText
                txt={tt("Qabul qiluvchi tafsilotlari", "Данные получателя")}
              />
              <div>
                {recipient().map((e, ind) => (
                  <Recipient key={ind} txt={e.txt} value={e.value} />
                ))}
              </div>
            </div>
            <div className="border w-1/2 p-3 bg-mybackground rounded-sm">
              <SimpleText
                txt={tt("To'lovchi tafsilotlari", "Данные плательщика")}
              />
              <div>
                {payer({
                  data: id ? allOrgan : organWorkers,
                  contract,
                  setContract,
                }).map((e, ind) => (
                  <Recipient
                    onDoubleClick={() => setOpen(true)}
                    key={ind}
                    txt={e.txt}
                    value={e.value}
                    type={e.type}
                    selectData={e.selectData}
                    onChange={e.onChange}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* topshiriqlar */}
          <div className="py-5 bg-mybackground mt-8" ref={divRef}>
            <div className="">
              {contract?.tasks?.map((e, i) => (
                <TaskColumn
                  e={e as any}
                  adressBox={addressBox}
                  batalons={batalons}
                  bxm={bxm}
                  contract={contract}
                  dateBox={dateBox}
                  setContract={setContract}
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
        {/* yuborish */}
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
              setContract((prev: any) => {
                const updatedContract = {
                  ...prev,
                  tasks: [
                    ...prev?.tasks,
                    {
                      ...initialContract.tasks[0],
                      id: undefined,
                      unique_id: prev?.tasks?.length + 1,
                    },
                  ],
                };

                // Use requestAnimationFrame to ensure scroll after render
                requestAnimationFrame(() => {
                  const lastTask = divRef.current?.lastElementChild;
                  lastTask?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                  });
                });

                return updatedContract;
              });
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
          <div className="mb-4 flex items-center gap-x-5 justify-between">
            <Input
              search={true}
              v={searchValue}
              change={(e: any) => setSearchValue(e.target.value)}
              p={tt("Nomlar bo'yicha qidiruv", "Поиск по имени")}
            />
            <Button mode="add" onClick={() => setOrganizationModalOpen(true)} />
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
            data={organWorkers}
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
      <OrganizationModal
        open={organizationModalOpen}
        closeModal={() => setOrganizationModalOpen(false)}
        value={organizationValue}
        handleChange={handleOrganizationChange}
        handleSubmit={handleOrganizationSubmit}
        handleAccountNumberChange={handleAccountNumberChange}
        handleGaznaChange={handleGaznaChange}
        addAccountNumber={addAccountNumber}
        addGazna={addGazna}
        removeAccountNumber={removeAccountNumber}
        removeGazna={removeGazna}
        title={tt("Yangi tashkilot qo'shish", "Добавить новую организацию")}
      />
    </div>
  );
};

export default ContractPage;
