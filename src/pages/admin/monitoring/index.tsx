import Icon from "@/assets/icons";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import BatalonDiagram from "@/pages/home/batalonDiagram";
import MonthlyPercentageChart from "@/pages/home/monthlyChart";
import { setItem } from "@/Redux/monitoringSlice";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { IAdminMonitoring } from "@/types/monitoring";
import { formatSum, tt } from "@/utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminMonitoring() {
  const currentMonth = useSelector((state: RootState) => state.month);

  const [data, setData] = useState<IAdminMonitoring>();
  const regionId = useSelector((state: RootState) => state.adminMonitoring);
  const api = useApi();
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      const [year, month] = currentMonth.month.split("-");
      const regionIdParams =
        regionId?.item && regionId.item > 0 ? `&user_id=${regionId.item}` : "";
      const response = await api.get<IAdminMonitoring>(
        `admin/monitoring/?year=${year}&month=${month}${regionIdParams}`
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
  }, [currentMonth.month, regionId]);

  const languageType = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "0";

  const handleClick = (id: number) => {
    dispatch(setItem(id));
  };

  return (
    <div className="">
      <div className="flex justify-between items-start">
        <div className="flex gap-x-3 items-center">
          <h2 className="font-[600] text-[36px]">
            {tt("Viloyatlar bo'yicha", "По регионам")}
          </h2>
          {regionId?.item && regionId.item > 0 && (
            <Button
              text={tt("Barcha hududlarni ko'rish", "Просмотр всех регионов")}
              onClick={() => dispatch(setItem(undefined))}
            />
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-center items-center w-full">
        <div className="w-[85%] ms-[10%]">
          <Icon name="uzb_map" />
        </div>
      </div>
      <div className="-mt-[80px] mb-5">
        <h3 className="font-[600]">{tt("Jami summa", "Общая сумма")}</h3>
        <h1 className="font-[700] text-[35px]">
          {formatSum(data?.itogo || 0)}
        </h1>
      </div>
      <div className="flex items-start h-[430px] gap-x-3 mb-5">
        <div className="w-1/2 h-full">
          <BatalonDiagram
            title={tt("Viloyatlar", "Регионы")}
            type="region"
            data={data?.byUser ?? []}
          />
        </div>
        <div className="w-1/2 h-[434px] border border-mybordercolor px-4 py-5 rounded-md">
          <Table
            theadClassName="sticky -top-1 z-20"
            tableClassName="max-h-[390px] overflow-y-auto"
            thead={[
              {
                text: "№",
                className: `text-center ${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
              {
                text: tt("Viloyatlar", "Регионы"),
                className: `${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
              {
                text: tt("Shartnomalar soni", "Количество договоров"),
                className: `${
                  Number(languageType) > 1 ? "py-[4px]" : "py-[12px]"
                }`,
              },
              {
                text: tt("Tadbir vaqti (soat)", "Время мероприятий (часы)"),
                className: `px-[2px] w-[200px] ${
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
            {data?.byUser.map((r, ind) => (
              <tr
                key={ind}
                className="cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-[#3B7FAF66]"
              >
                <td className="px-[8px] py-3 border-b border-l border-r text-center">
                  {ind + 1}
                </td>
                <td
                  onClick={() => handleClick(r.id)}
                  className="px-[8px] py-3 border-b border-l border-r text-center"
                >
                  {r.region_name}
                </td>
                <td className="px-[8px] py-3 border-b border-l border-r text-center">
                  {r.count}
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

      {data?.month ? (
        <div>
          <MonthlyPercentageChart data={data.month} />
        </div>
      ) : (
        <></>
      )}

      <div className="my-10 flex gap-x-3">
        <div className="w-1/2">
          <h2 className="font-[600]">
            {tt("Top 10 gvardiya hodimlari", "Топ 10 сотрудников гвардии")}
          </h2>
          <div className="mt-3">
            <Table
              thead={[
                { text: "№", className: " py-[4px] w-[30px]" },
                {
                  text: tt("Viloyat nomi", "Название региона"),
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
                    {r.region_name}
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
        <div className="w-1/2">
          <h2 className="font-[600]">
            {tt("Top 10 batalonlar", "Топ 10 батальонов")}
          </h2>
          <div className="mt-3">
            <Table
              thead={[
                { text: "№", className: " py-[4px] w-[30px]" },
                {
                  text: tt("Viloyat nomi", "Название региона"),
                  className: " py-[4px]",
                },
                {
                  text: tt("Batalon nomi", "Название батальона"),
                  className: " py-[4px]",
                },
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
              {data?.batalons.map((r, ind) => (
                <tr
                  key={ind}
                  className="cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-[#3B7FAF66]"
                >
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {ind + 1}
                  </td>
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {r.region_name}
                  </td>
                  <td className="px-[8px] py-3 border-b border-l border-r text-center">
                    {r.batalon_name}
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

export default AdminMonitoring;
