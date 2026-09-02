/** @format */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Input from "../../Components/Input";
import Paginatsiya from "../../Components/Paginatsiya";
import { alertt } from "../../Redux/LanguageSlice";
import { PayCont, deleteCont, getSpr, getCont } from "../../api";
import ContTab from "../../pageCompoents/ContTab";
import { formatSum, tt } from "../../utils";
import Modal from "@/Components/Modal";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import Button from "@/Components/reusable/button";
import { RootState } from "@/Redux/store";
import { useRequest } from "@/hooks/useRequest";
import { useDebounce } from "use-debounce";
import Select from "../../Components/Select";
import {
  FileSpreadsheet,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  Button as UIButton,
  ListCard,
  Select as UISelect,
  SummaryRow,
  SummaryTile,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

function ContractHome() {
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const JWT = useSelector((s: any) => s.auth.jwt);
  const [open, setOpen] = useState(false);

  const [batalonOpen, setBatalonOpen] = useState(false);
  const [batalons, setBatalons] = useState([]);
  const [selectedBatalon, setSelectedBatalon] = useState("");

  // const [searchId, setSearchID] = useState(0);
  const [value, setValue] = useState("");
  const [searchText] = useDebounce(value, 500);
  // const [value2, setValue2] = useState();
  const dispatch = useDispatch();
  const [limet, setLimet] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [active, setactive] = useState(1);
  const [all, setAll] = useState(10);
  const [status, setStatus] = useState("");
  const [statusSumma, setStatusSumma] = useState("");
  const [rasxodStatus, setRasxodStatus] = useState("");
  const [balance, setBalance] = useState({
    internal_summa: 0,
    debet_summa: 0,
    kredit_summa: 0,
    rasxod_summa: 0,
  });
  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });

  useEffect(() => {
    setDates({ date1: startDate, date2: endDate });
  }, [startDate, endDate]);

  const [tushum, setTushum] = useState<any>({
    summa: "",
    date: dates.date2,
  });
  const [openSelect, setOpenSelect] = useState(false);
  //getAll
  //@ts-ignore
  const account_id = useSelector((state) => state.account.account_number_id);

  const getInfo = async (dates?: any) => {
    const res = await getCont(
      JWT,
      dates,
      currentPage,
      limet,
      // value,
      searchText,
      account_id,
      0,
      status,
      statusSumma,
      rasxodStatus
    );
    setData(res.data);
    setTotalPages(res.meta.pageCount);
    setAll(res.meta.count);
    setBalance({
      debet_summa: res.meta.debet_summa,
      kredit_summa: res.meta.kredit_summa,
      internal_summa: res.meta.internal_summa,
      rasxod_summa: res.meta.rasxod_summa,
    });
  };

  // Filtrlar o'zgarishi bilan ro'yxat o'zi yangilanadi — alohida
  // "Yuklash" tugmasi kerak emas.
  useEffect(() => {
    getInfo(dates);
  }, [
    currentPage,
    limet,
    searchText,
    account_id,
    status,
    statusSumma,
    rasxodStatus,
    dates.date1,
    dates.date2,
  ]);

  const deleteInfo = async () => {
    const res = await deleteCont(JWT, active, account_id);

    if (res.success) {
      getInfo(dates);
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );
    } else {
      dispatch(
        alertt({
          text: res.message,
          success: false,
        })
      );
    }
  };

  const setInfoToTushum = async () => {
    const res = await PayCont(tushum, JWT, active);

    if (res.success) {
      getInfo(dates);
      setOpen(false);
      dispatch(
        alertt({
          success: true,
          text: res.message,
        })
      );
    } else {
      dispatch(
        alertt({
          success: false,
          text: res.message,
        })
      );
    }
  };
  const handleCreateTushum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setInfoToTushum();
  };

  const request = useRequest();
  const { account_number_id } = useSelector((state: any) => state.account);

  const handleDownloadExel = async () => {
    const response = await request({
      url: "/contract/export",
      method: "GET",
      params: {
        from: dates.date1,
        to: dates.date2,
        account_number_id: account_number_id,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `contract-${dates.date1}-dan-${dates.date2}-gacha.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const getBatalyons = async () => {
    const res = await getSpr(JWT, "batalon");

    if (res?.data && res?.success) {
      const prepareData = res.data.map((d: any) => ({
        ...d,
        value: d.id,
        label: d.name,
      }));

      setBatalons(prepareData);
    }
  };

  const handleDownloadExelByBatalon = async () => {
    const response = await request({
      url: "/contract/export/batalon",
      method: "GET",
      params: {
        from: dates.date1,
        to: dates.date2,
        account_number_id: account_number_id,
        batalon_id: selectedBatalon,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `contract-${dates.date1}-dan-${dates.date2}-gacha.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-64">
              <Input
                v={value}
                change={(e: any) => setValue(e.target.value)}
                search={true}
                p={tt("Ma’lumotlarni qidirish", "Поиск данных")}
                className="h-9 w-full"
              />
            </div>

            <div className="w-[150px]">
              <UISelect
                selectSize="sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder={tt("Barchasi", "Все")}
                options={[
                  { value: "done", label: tt("Bajarilgan", "Выполнено") },
                  { value: "not_done", label: tt("Bajarilmagan", "Не выполнено") },
                ]}
              />
            </div>

            <div className="w-[150px]">
              <UISelect
                selectSize="sm"
                value={statusSumma}
                onChange={(e) => setStatusSumma(e.target.value)}
                placeholder={tt("Barchasi", "Все")}
                options={[
                  { value: "debet", label: tt("To'langan", "Оплачено") },
                  { value: "kredit", label: tt("To'lanmagan", "Не оплачено") },
                ]}
              />
            </div>

            <div className="w-[160px]">
              <UISelect
                selectSize="sm"
                value={rasxodStatus}
                onChange={(e) => setRasxodStatus(e.target.value)}
                placeholder={tt("Barchasi", "Все")}
                options={[
                  { value: "spent", label: tt("Sarflangan", "Потрачено") },
                  { value: "not_spent", label: tt("Sarflanmagan", "Не потрачено") },
                ]}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <SpecialDatePicker
                defaultValue={dates.date1}
                onChange={(e) => setDates({ ...dates, date1: e })}
              />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker
                defaultValue={dates.date2}
                onChange={(e) => setDates({ ...dates, date2: e })}
              />
            </div>

            <ToolbarSpacer />

            <UIButton
              variant="ghost"
              size="sm"
              onClick={async () => {
                setDates({ date1: startDate, date2: endDate });
                setValue("");
                getInfo({ date1: startDate, date2: endDate });
                setStatus("");
                setStatusSumma("");
                setRasxodStatus("");
              }}
            >
              <RotateCcw />
              {tt("Tozalash", "Очистить")}
            </UIButton>

            <UIButton variant="secondary" size="sm" onClick={handleDownloadExel}>
              <FileSpreadsheet />
              {tt("Barchasi", "Все")}
            </UIButton>

            <UIButton
              variant="secondary"
              size="sm"
              onClick={async () => {
                await getBatalyons();
                setBatalonOpen(true);
              }}
            >
              <FileSpreadsheet />
              {tt("Batalon", "Бат.")}
            </UIButton>

            <UIButton size="sm" onClick={() => navigate("/contract/add")}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
        footer={
          data ? (
            <>
              <SummaryRow>
                <SummaryTile
                  label={tt("Hisoblangan summa", "Начисленная сумма")}
                  value={formatSum(balance.internal_summa) || "0"}
                />
                <SummaryTile
                  label={tt("Kelib tushgan summa", "Поступившая сумма")}
                  value={formatSum(balance.debet_summa) || "0"}
                  tone="success"
                />
                <SummaryTile
                  label={tt("Debitor qarzdorlik", "Дебиторская задолженность")}
                  value={formatSum(balance.kredit_summa) || "0"}
                  tone="danger"
                />
                <SummaryTile
                  label={tt("Rasxod summa", "Сумма расхода")}
                  value={formatSum(balance.rasxod_summa) || "0"}
                />
              </SummaryRow>

              <Paginatsiya
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                limet={limet}
                setLimet={setLimet}
                count={all}
              />
            </>
          ) : null
        }
      >
        <ContTab data={data} handleDelete={deleteInfo} setActive={setactive} />
      </ListCard>

      <Modal
        open={open}
        closeModal={() => setOpen(false)}
        title={tt("Tushumlar", "Квитанции")}
      >
        <form onSubmit={handleCreateTushum} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 text-[12px] leading-[14.52px] font-[600] text-muted-foreground">
            <SpecialDatePicker
              defaultValue={tushum.date}
              onChange={(e: any) => setTushum({ ...tushum, date: e })}
              label={tt("Tushum vaqti", "Время поступления")}
            />
          </div>
          <Input
            v={tushum.summa}
            t={"number"}
            change={(e: any) =>
              setTushum({ ...tushum, summa: +e.target.value })
            }
            tush
            p={tt("Summa kiriting", "Введите сумму")}
            label={tt("Summasi (so’m)", "Сумма (Сум)")}
          />

          <div className="mt-5 flex justify-end">
            <Button mode="save" type="submit" />
          </div>
        </form>
      </Modal>

      <Modal
        open={batalonOpen}
        closeModal={() => setBatalonOpen(false)}
        title={tt("Batalonni tanlang", "Выберите батальон")}
        w="380px"
      >
        <section
          className={`${openSelect ? "h-[300px]" : ""
            } flex flex-col items-center justify-start`}
        >
          <div className="w-[300px] mb-4">
            <Select
              data={batalons}
              value={selectedBatalon}
              onChange={(e: any) => setSelectedBatalon(e)}
              p={tt("Batalonni tanlang", "Выберите батальон")}
              setOpenProps={setOpenSelect}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              mode="clear"
              onClick={() => setBatalonOpen(false)}
              text={tt("Bekor qilish", "Отмена")}
            />
            <Button
              mode="download"
              text={tt("Yuklab olish", "Скачать")}
              onClick={async () => {
                if (!selectedBatalon) return;
                await handleDownloadExelByBatalon();
                setBatalonOpen(false);
              }}
            />
          </div>
        </section>
      </Modal>
    </div>
  );
}

export default ContractHome;
