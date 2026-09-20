/** @format */
import Paginatsiya from "@/Components/Paginatsiya";
import { DateInput } from "@/Components/ui/date-input";
import { Button, Field, Input, Modal, Select, SummaryTile } from "@/ui";
import { Plus, Save, Search, X } from "lucide-react";
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
import { recipient, usePayerRows } from "./recipientData";
import TaskColumn, { returnBxmSum } from "./taskColumn";
import OrganizationModal from "@/shared/components/OrganizationModal";

const SimpleText = ({ txt }: { txt: string }) => (
  <h3 className="text-[14px] font-semibold text-foreground">{txt}</h3>
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
  const [templates, setTemplates] = useState<any[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const [organizationValue, setOrganizationValue] = useState({
    name: "",
    address: "",
    str: "",
    bank_name: "",
    mfo: "",
    boss: "",
    account_numbers: [] as string[],
    gazna_numbers: [] as string[],
  });

  const getContract = async () => {
    const get = await api.get<IContractForm>(
      `contract/${id}?account_number_id=${account_number_id}`
    );
    if (get?.success) {
      // Shartnomada topshiriq bo'lmasligi mumkin — javobda `tasks`
      // umuman kelmasa sahifa yiqilardi
      const appendUniqueId = (Array.isArray(get.data?.tasks)
        ? get.data.tasks
        : []
      ).map((task) => ({
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

  const getTemplates = async () => {
    const res = await api.get<any[]>("template/");
    if (res?.success) setTemplates(res.data);
  };

  useEffect(() => {
    if (id) {
      getContract();
      getAllOrgan();
    }
    getBxm();
    getTemplates();
  }, [id]);

  /* Maydonga yozilgan matn (`searchValue`) va so'rovga ketadigan matn
     (`query`) ataylab ajratilgan: har bosilgan harfda so'rov yuborilsa,
     tarmoq javoblari bir-birini quvib yetib, ro'yxat noto'g'ri
     to'ldirilardi. */
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchValue.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    // Kechikkan javob yangisining ustidan yozib yubormasin
    let stale = false;

    (async () => {
      const sParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const get: any = await api.get<IOrganization[]>(
        `organization?page=${currentPage}&limit=${15}${sParam}`
      );
      if (stale) return;
      if (get?.success) {
        setOrganWorkers(get.data);
        setTotalPages(get.meta.pageCount);
      }
    })();

    return () => {
      stale = true;
    };
  }, [currentPage, query]);

  /* Hook, shuning uchun JSX ichidan emas, komponentning yuqorisidan
     chaqiriladi — chaqiruv shartli bo'lib qolsa hooklar tartibi buzilardi. */
  const payerRows = usePayerRows({
    data: id ? allOrgan : organWorkers,
    contract,
    setContract,
  });

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
      template_id: contract.template_id || null,
    };

    const method = id ? api.update : api.post;
    const request: any = await method(
      `contract${id ? `/${id}` : ""}?account_number_id=${account_number_id}`,
      data
    );
    if (request?.success) {
      dispatch(alertt({ text: request.message, success: true }));
      event?.currentTarget?.reset();
      const targetId = id ?? request.data.id;
      localStorage.setItem(`pdf_stale_${targetId}`, "1");
      navigate(`/contract/view/${targetId}`, { state: { generatePdf: true } });
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
        boss: organizationValue.boss,
        account_numbers: (organizationValue.account_numbers ?? []).map(
          (number) => ({ account_number: number })
        ),
        gazna_numbers: (organizationValue.gazna_numbers ?? []).map((number) => ({
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

  const totals = allDiscount();

  return (
    <div className="h-full mt-5 mx-auto">
      <form onSubmit={handleSubmit}>
        <div style={{ maxHeight: fullHeight }} className="w-full overfloww">
          {/* ═══ Shartnoma ma'lumotlari ═════════════════════════════
              Ilgari bu qism ikkita `w-1/2` kartaga bo'lingan edi: chapda
              uchta qator, o'ngda ikkita — natijada o'ng kartaning yarmi
              bo'sh turardi. Endi bitta karta ichida yagona 4-ustunli
              setka: maydonlar ma'no bo'yicha guruhlangan va bo'sh joy
              qolmaydi. */}
          <div className="my-6 rounded-lg border border-border bg-card p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label={tt("Shartnoma raqam", "Номер контракта")}>
                <Input
                  name="doc_num"
                  value={contract.doc_num ?? ""}
                  onChange={(event) =>
                    setContract((prev) => ({
                      ...prev,
                      doc_num: event.target.value,
                    }))
                  }
                />
              </Field>

              <DateInput
                className="w-full"
                label={tt("Shartnoma sanasi", "Дата контракта")}
                name="doc_date"
                defaultValue={contract.doc_date}
                onChange={(event) =>
                  setContract((prev) => ({ ...prev, doc_date: event }))
                }
              />

              <DateInput
                className="w-full"
                label={tt("Amal qilish muddati", "Срок действия")}
                name="period"
                defaultValue={contract.period}
                onChange={(event) =>
                  setContract((prev) => ({ ...prev, period: event }))
                }
              />

              <Field label={tt("Chegirma (%)", "Скидка (%)")}>
                <Input
                  name="discount"
                  type="number"
                  value={contract.discount ?? 0}
                  onChange={(event) =>
                    setContract((prev) => ({
                      ...prev,
                      discount: +event.target.value,
                    }))
                  }
                  className="tabular-nums"
                />
              </Field>

              {/* Avval ikkala SANA, keyin ikkala VAQT: ikki ustunli
                  panjarada sanalar bir qatorda, vaqtlar keyingisida
                  turadi va bir-biri bilan solishtirish oson bo'ladi. */}
              <DateInput
                className="w-full"
                label={tt("Boshlanish sana", "Дата начала")}
                name="start_date"
                defaultValue={contract.start_date?.slice(0, 10)}
                onChange={(event) =>
                  setContract((prev) => ({ ...prev, start_date: event }))
                }
              />

              <DateInput
                className="w-full"
                label={tt("Tugash sana", "Дата окончания")}
                name="end_date"
                defaultValue={contract.end_date?.slice(0, 10)}
                onChange={(event) =>
                  setContract((prev) => ({ ...prev, end_date: event }))
                }
              />

              <Field label={tt("Boshlanish vaqti", "Время начала")}>
                <Input
                  name="start_time"
                  value={contract.start_time ?? ""}
                  onChange={(e) => handleTimeChange(e, "start_time")}
                  placeholder="00:00"
                  className="tabular-nums"
                />
              </Field>

              <Field label={tt("Tugash vaqti", "Время окончания")}>
                <Input
                  name="end_time"
                  value={contract.end_time ?? ""}
                  onChange={(e) => handleTimeChange(e, "end_time")}
                  placeholder="00:00"
                  className="tabular-nums"
                />
              </Field>

              <Field
                label={tt("Manzil", "Адрес")}
                className="sm:col-span-2"
              >
                <Input
                  name="address"
                  value={contract.adress ?? ""}
                  onChange={(event) =>
                    setContract((prev) => ({
                      ...prev,
                      adress: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label={tt("Shablon", "Шаблон")}>
                <Select
                  value={contract.template_id || ""}
                  onChange={(e) =>
                    setContract((prev: any) => ({
                      ...prev,
                      template_id: e.target.value ? +e.target.value : null,
                    }))
                  }
                  placeholder={tt("Tanlang", "Выберите")}
                  options={templates.map((t: any) => ({
                    value: t.id,
                    label: t.shablon_name,
                  }))}
                />
              </Field>

              {/* Belgilar maydon balandligiga tekislanadi */}
              <div className="flex items-center gap-5 sm:h-9 sm:self-end">
                <div className="flex items-center gap-2">
                  <input
                    checked={addressBox}
                    onChange={() => setAddressBox(!addressBox)}
                    type="checkbox"
                    name="all__address"
                    id="address_input"
                    className="size-4 cursor-pointer accent-primary"
                  />
                  <label
                    htmlFor="address_input"
                    className="cursor-pointer select-none text-[13px] font-medium text-foreground"
                  >
                    {tt("Manzil", "Адрес")}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    checked={dateBox}
                    onChange={() => setDateBox(!dateBox)}
                    type="checkbox"
                    name="all__date"
                    id="date_input"
                    className="size-4 cursor-pointer accent-primary"
                  />
                  <label
                    htmlFor="date_input"
                    className="cursor-pointer select-none text-[13px] font-medium text-foreground"
                  >
                    {tt("Sana", "Дата")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* tolovchi malumotlari */}
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-border bg-card p-4">
              <SimpleText
                txt={tt("Qabul qiluvchi tafsilotlari", "Данные получателя")}
              />
              <div>
                {recipient().map((e, ind) => (
                  <Recipient key={ind} txt={e.txt} value={e.value} />
                ))}
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-border bg-card p-4">
              <SimpleText
                txt={tt("To'lovchi tafsilotlari", "Данные плательщика")}
              />
              <div>
                {payerRows.map((e, ind) => (
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
          <div className="mt-8 py-5" ref={divRef}>
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
            {/* Jami ko'rsatkichlar.

                Ilgari bu yerda ikkita yorliqsiz `readOnly` input turardi —
                qaysi raqam chegirma, qaysi biri summa ekanini bilib
                bo'lmasdi va ular oddiy tahrirlanadigan maydonga o'xshab
                ko'rinardi. Endi yorliqli jamlanma katakchalari.
                (Joylashuvi ham `ms-[692px]` bilan qo'lda surilgan edi —
                tor ekranda jadvaldan chiqib ketardi.) */}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <SummaryTile
                className="w-[200px] text-right"
                label={tt("Jami chegirma", "Итого скидка")}
                value={totals.dis || "0"}
              />
              <SummaryTile
                className="w-[200px] text-right"
                label={tt("Jami summa", "Итого сумма")}
                value={totals.sum || "0"}
                tone="primary"
              />
            </div>
          </div>
        </div>
        {/* yuborish */}
        <div className="w-full flex justify-center items-center gap-x-10 mt-4">
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/contract")}
          >
            {tt("Bekor qilish", "Отмена")}
          </Button>
          <Button type="submit">
            <Save />
            {tt("Saqlash", "Сохранить")}
          </Button>
          <Button
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
          >
            <Plus />
            {tt("Qo'shish", "Добавить")}
          </Button>
        </div>
      </form>
      <Modal
        size="full"
        title={tt("Buyurtmachi", "Заказчик")}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <Input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                // Uchinchi sahifada turib qidirilsa, natija bo'sh
                // sahifaga tushib qolardi
                setCurrentPage(1);
              }}
              placeholder={tt("Nomlar bo'yicha qidiruv", "Поиск по имени")}
              startIcon={<Search />}
              className="max-w-sm"
              endIcon={
                searchValue ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue("");
                      setCurrentPage(1);
                    }}
                    aria-label={tt("Tozalash", "Очистить")}
                    className="rounded p-0.5 transition-colors hover:text-foreground"
                  >
                    <X />
                  </button>
                ) : undefined
              }
            />
            <Button onClick={() => setOrganizationModalOpen(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </Button>
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
        onFill={({ newAccountNumber, ...data }) =>
          setOrganizationValue((prev) => ({
            ...prev,
            ...data,
            account_numbers: newAccountNumber
              ? [...prev.account_numbers, newAccountNumber]
              : prev.account_numbers,
          }))
        }
      />
    </div>
  );
};

export default ContractPage;
