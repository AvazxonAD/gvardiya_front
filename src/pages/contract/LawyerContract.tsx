import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Input from "../../Components/Input";
import Paginatsiya from "../../Components/Paginatsiya";
import { getCont } from "../../api";
import ContTab from "../../pageCompoents/ContTab";
import { tt } from "../../utils";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import Button from "@/Components/reusable/button";
import { RootState } from "@/Redux/store";
import useFullHeight from "@/hooks/useFullHeight";
import { useDebounce } from "use-debounce";

function LawyerContract() {
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );
  const [data, setData] = useState([]);
  const JWT = useSelector((s: any) => s.auth.jwt);

  const [value, setValue] = useState("");
  const [searchText] = useDebounce(value, 500);
  const [limet, setLimet] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [all, setAll] = useState(10);
  const [dates, setDates] = useState<any>({
    date1: startDate,
    date2: endDate,
  });
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  useEffect(() => {
    setDates({ date1: startDate, date2: endDate });
  }, [startDate, endDate]);

  //@ts-ignore
  const account_id = useSelector((state) => state.account.account_number_id);

  const getInfo = async (dates?: any) => {
    const res = await getCont(
      JWT,
      dates,
      currentPage,
      limet,
      searchText,
      account_id,
      0,
      "",
      "",
      ""
    );
    setData(res.data || []);
    setTotalPages(res.meta.pageCount);
    setAll(res.meta?.total || (res.data || []).length);
  };

  const filteredData = data.filter((item: any) => {
    if (filter === "verified") return item.verification_lawyer === "success";
    if (filter === "pending") return item.verification_lawyer !== "success";
    return true;
  });

  useEffect(() => {
    getInfo(dates);
  }, [currentPage, limet, searchText, account_id]);

  const handleDownload = () => {
    getInfo(dates);
  };

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 230px)` : height - 230;

  return (
    <div className="flex flex-col w-full">
      <div style={{ minHeight: fullHeight }}>
        <div className="-mt-5 sticky py-5 -top-1 z-[30] bg-mybackground flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-[200px]">
              <Input
                v={value}
                change={(e: any) => setValue(e.target.value)}
                search={true}
                p={tt("Ma'lumotlarni qidirish", "Поиск данных")}
                className="w-full"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {tt("Barchasi", "Все")}
              </button>
              <button
                onClick={() => setFilter("verified")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  filter === "verified" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {tt("Tasdiqlangan", "Утверждено")}
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {tt("Tasdiqlanmagan", "Не утверждено")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex gap-1 items-center">
              <SpecialDatePicker
                defaultValue={dates.date1}
                onChange={(e) => setDates({ ...dates, date1: e })}
              />
              <SpecialDatePicker
                defaultValue={dates.date2}
                onChange={(e) => setDates({ ...dates, date2: e })}
              />
              <Button mode="download" onClick={handleDownload} className="!px-2" />
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
              }}
              className="!px-2"
            />
          </div>
        </div>

        <div>
          <ContTab data={filteredData} hideActions isLawyer />
        </div>
      </div>

      {data ? (
        <div className="sticky bottom-0 bg-mybackground z-2 mt-[30px]">
          <Paginatsiya
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            limet={limet}
            setLimet={setLimet}
            count={all}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default LawyerContract;
