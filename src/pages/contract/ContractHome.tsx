/** @format */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Input from "../../Components/Input";
import Paginatsiya from "../../Components/Paginatsiya";
import { alertt } from "../../Redux/LanguageSlice";
import { PayCont, deleteCont, getBat, getSpr, getCont } from "../../api";
import ContTab from "../../pageCompoents/ContTab";
import { tt } from "../../utils";
import Modal from "@/Components/Modal";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import Button from "@/Components/reusable/button";
import { RootState } from "@/Redux/store";
import useFullHeight from "@/hooks/useFullHeight";
import { useRequest } from "@/hooks/useRequest";
import { useDebounce } from "use-debounce";
import Select from "../../Components/Select";

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
  const [limet, setLimet] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [active, setactive] = useState(1);
  const [all, setAll] = useState(10);
  const [balance, setBalance] = useState({
    from_balance: 0,
    to_balance: 0,
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
      0
    );
    setData(res.data);
    setTotalPages(res.meta.pageCount);
    setAll(res.meta.count);
    setBalance({
      from_balance: res.meta.from_balance,
      to_balance: res.meta.to_balance,
    });
  };
  // const getBatalyons = async () => {
  //   const res = await getSpr(JWT, "batalon");

  //   setBatalons(res.data);
  // };
  // useEffect(() => {
  //   getBatalyons();
  // }, []);

  useEffect(() => {
    getInfo(dates);
  }, [currentPage, limet, searchText, account_id]);

  const handleDownload = () => {
    getInfo(dates);
  };

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

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 230px)` : height - 230;

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

  console.log(selectedBatalon);

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
    <div className="flex flex-col w-full">
      <div style={{ minHeight: fullHeight }}>
        <div className="-mt-5 sticky py-5 -top-1 z-[30] bg-mybackground flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 w-[200px]">
              <Input v={balance.from_balance} className="w-full" />
            </div>
            <div className="w-[250px]">
              <Input
                v={value}
                change={(e: any) => setValue(e.target.value)}
                search={true}
                p={tt("Ma’lumotlarni qidirish", "Поиск данных")}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* <div>
              <Select
                data={batalons}
                def
                value={searchId}
                onChange={(e: any) => setSearchID(e)}
                p={tt("Batalon orqali qidiring", "Выберите название батальона")}
              />
            </div> */}
            <div className="flex gap-2  items-center">
              <SpecialDatePicker
                defaultValue={dates.date1}
                onChange={(e) => setDates({ ...dates, date1: e })}
              />
              <SpecialDatePicker
                defaultValue={dates.date2}
                onChange={(e) => setDates({ ...dates, date2: e })}
              />
              <div className="">
                <Button mode="download" onClick={handleDownload} />
              </div>
            </div>
            <Button
              mode="clear"
              onClick={async () => {
                setDates({
                  date1: startDate,
                  date2: endDate,
                });
                setValue("");
                getInfo({
                  date1: startDate,
                  date2: endDate,
                });
                // setSearchID(0);
              }}
            />
            <div className="ms-2 flex gap-x-3">
              <Button
                mode="download"
                onClick={handleDownloadExel}
                text={tt("Barchasi", "Барчаси")}
              />

              <Button
                mode="download"
                onClick={async () => {
                  await getBatalyons();
                  setBatalonOpen(true);
                }}
                text={tt("Batalon bo‘yicha", "Батальон бўйича")}
              />

              <Button mode="add" onClick={() => navigate("/contract/add")} />
            </div>
          </div>
        </div>

        <div>
          <ContTab
            data={data}
            handleDelete={deleteInfo}
            setActive={setactive}
          />
        </div>
      </div>

      {data ? (
        <div className="sticky bottom-0 bg-mybackground z-2 mt-[30px]">
          <div className="flex justify-center items-center relative">
            <div className="absolute left-0 w-[200px] flex justify-start">
              <Input v={balance.to_balance} className="w-full" />
            </div>
            <div className="">
              <Paginatsiya
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                limet={limet}
                setLimet={setLimet}
                count={all}
              />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <Modal
        open={open}
        closeModal={() => setOpen(false)}
        title={tt("Tushumlar", "Квитанции")}
      >
        <form onSubmit={handleCreateTushum} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 text-[12px]  leading-[14.52px] font-[600] text-[#636566]">
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
        setOpen={setBatalonOpen}
        title="Batalonni tanlang"
        className="!p-5"
      >
        <section
          className={`${
            openSelect ? "h-[300px]" : ""
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
