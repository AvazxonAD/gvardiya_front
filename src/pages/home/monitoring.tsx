import Icon, { IconName } from "@/assets/icons";
import { datas } from "@/assets/icons/map/uzb";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import MonthlyPercentageChart from "@/pages/home/monthlyChart";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IUserMonitoring } from "@/types/monitoring";
import { formatSum, tt } from "@/utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BatalonDiagram from "./batalonDiagram";

function UserMonitoring() {
  const currentMonth = useSelector((state: RootState) => state.month);
  const [batalonId, setBatalonId] = useState<number>(0);

  const [data, setData] = useState<IUserMonitoring>();
  const api = useApi();
  const { user } = useSelector((state: RootState) => state.auth);
  const getData = async () => {
    try {
      const btParams = Boolean(batalonId) ? `&batalon_id=${batalonId}` : "";
      const [year, month] = currentMonth.month.split("-");
      const response = await api.get<IUserMonitoring>(
        `monitoring/?year=${year}&month=${month}${btParams}`
      );
      if (response?.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [currentMonth.month, batalonId]);

  const languageType = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "0";

  const findRegion = datas?.find((r) => r?.id === user?.region_id);

  const images = [
    { id: 1, imgName: "tashkent" },
    { id: 2, imgName: "tashkent_v" },
    { id: 3, imgName: "andijon" },
    { id: 4, imgName: "buxoro" },
    { id: 5, imgName: "fargona" },
    { id: 6, imgName: "jizzax" },
    { id: 7, imgName: "xorazm" },
    { id: 8, imgName: "namangan" },
    { id: 9, imgName: "navoiy" },
    { id: 10, imgName: "qashqadaryo" },
    { id: 11, imgName: "qoraqalpoq" },
    { id: 12, imgName: "samarqand" },
    { id: 13, imgName: "surxondaryo" },
    { id: 14, imgName: "sirdaryo" },
  ];

  const findImg = images.find((i) => i.id === user?.region_id);

  return (
    <div className="">
      <div className="flex justify-between items-start">
        <div className="flex gap-x-3 items-center">
          <h2 className="font-[600] text-[36px] text-mytextcolor">
            {findRegion ? findRegion.title : ""}
          </h2>
        </div>
      </div>
      <div className="flex justify-center items-center w-full">
        <div className="w-[65%] min-h-[100px] ms-[8%]">
          {findImg && <Icon name={findImg.imgName as IconName} />}
        </div>
      </div>
      <div className="-mt-[80px] mb-5 flex justify-between items-end w-full">
        <div>
          <h3 className="font-[600] text-mysecondarytext">
            {tt("Jami summa", "Общая сумма")}
          </h3>
          <h1 className="font-[500] text-mysecondarytext text-[35px]">
            {formatSum(data?.itogo || 0)}
          </h1>
        </div>
        {Boolean(batalonId) && (
          <div>
            <Button
              onClick={() => setBatalonId(0)}
              text={tt("Barcha batalonlarni ko'rish", "")}
            />
          </div>
        )}
      </div>
      <div className="flex items-start gap-x-3 my-16 h-[430px]">
        <div className="w-1/2 h-full">
          <BatalonDiagram
            title={tt("Batalonlar", "Батальоны")}
            type="batalon"
            data={data?.byBatalon ?? []}
          />
        </div>

        <div className="w-1/2 h-[430px] border border-mybordercolor px-4 py-5 rounded-md">
          <Table
            theadClassName="sticky -top-1 z-20"
            tableClassName="max-h-[390px] overflow-y-auto"
            thead={[
              {
                text: "№",
                className: `text-center w-[50px] ${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
              {
                text: tt("Batalon nomi", "Название батальона"),
                className: `${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
              {
                text: tt("Topshiriq vaqti (soat)", "Время задачи (часов)"),
                className: `px-[2px] w-[180px] ${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
              {
                text: tt("Summa", "Сумма"),
                className: `text-right ${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
            ]}
          >
            {data?.byBatalon.map((r, ind) => (
              <tr
                key={ind}
                className="cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-[#3B7FAF66]"
              >
                <td className="px-[8px] py-3 border-b border-l border-r text-center">
                  {ind + 1}
                </td>
                <td
                  onClick={() => setBatalonId(r.id)}
                  className="px-[8px] py-3 border-b border-l border-r text-center"
                >
                  {r.batalon_name}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r text-center">
                  {r?.task_time ?? 0}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r text-right">
                  {formatSum(r?.summa ?? 0)}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      {data?.month ? (
        <div>
          <MonthlyPercentageChart data={data.month} />
        </div>
      ) : (
        <></>
      )}

      <div className="my-10 flex justify-center">
        <div className="w-11/12">
          <h2 className="font-[600] text-mytextcolor">
            {tt("Top 10 gvardiya hodimlari", "Топ 10 сотрудников гвардии")}
          </h2>
          <div className="mt-3">
            <Table
              thead={[
                { text: "№", className: " py-[4px] w-[30px]" },
                {
                  text: tt("Batalon nomi", "Название батальона"),
                  className: " py-[4px]",
                },
                { text: tt("FIO", "ФИО"), className: " py-[4px]" },
                {
                  text: tt("Topshiriq vaqti (soat)", "Время задачи (часов)"),
                  className: "w-[200px] py-[4px]",
                },
                {
                  text: tt("Summa", "Сумма"),
                  className: "text-right py-[4px]",
                },
              ]}
            >
              {data?.workers.map((r, ind) => (
                <tr
                  key={ind}
                  className="cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-[#3B7FAF66]"
                >
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {ind + 1}
                  </td>
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {r.batalon_name}
                  </td>
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {r.fio}
                  </td>
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {r.task_time}
                  </td>
                  <td className="px-[8px] py-3 border-b border-l border-r text-right">
                    {formatSum(r?.summa ?? 0)}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMonitoring;
