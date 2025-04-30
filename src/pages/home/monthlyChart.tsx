import { IMonthly } from "@/types/monitoring";
import { formatSum, tt } from "@/utils";

type Props = {
  data: IMonthly;
};

const MonthlyPercentageChart = ({ data }: Props) => {
  // Extracting month_sum from data
  const { month_sum } = data;

  // Mapping of month keys to real month names
  const monthNames = [
    tt("Yanvar", "Январь"),
    tt("Fevral", "Февраль"),
    tt("Mart", "Март"),
    tt("Aprel", "Апрель"),
    tt("May", "Май"),
    tt("Iyun", "Июнь"),
    tt("Iyul", "Июль"),
    tt("Avgust", "Август"),
    tt("Sentabr", "Сентябрь"),
    tt("Oktyabr", "Октябрь"),
    tt("Noyabr", "Ноябрь"),
    tt("Dekabr", "Декабрь"),
  ];

  return (
    <div className="w-full border bg-mybackground shadow-sm p-6 rounded-lg">
      <div className="mb-10">
        <h2 className="text-lg font-medium text-mytextcolor">
          {tt("Oylar kesimi bo'yicha", "Разрез по месяцам")}
        </h2>
      </div>

      <div className="relative h-64">
        {/* Y-axis grid lines */}
        <div className="absolute mb-7 inset-0 flex flex-col justify-between">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-px border" />
          ))}
        </div>

        {/* Bars and Progress Boxes */}
        <div className="relative z-10 h-full flex items-end justify-between gap-2">
          {Object.keys(month_sum).map((month, ind) => {
            // Skip regular keys like 'oy_1' and process only percentage keys
            if (!month.includes("_percent")) return null;

            // Extract percentage value
            const percent = month_sum[month as keyof typeof month_sum] as number;
            // Get the original month key (e.g., 'oy_1')
            const originalMonthKey = formatSum(month_sum[month.replace("_percent", "") as keyof typeof month_sum]);
            // Get the month index (e.g., 'oy_1' => 0 for 'Yanvar')
            const monthIndex = parseInt(month.split("_")[1], 10) - 1;

            return (
              <div key={ind} className="flex flex-col items-center flex-1">
                {/* Progress Box Container */}
                <div className="w-[50px] h-64 flex flex-col items-center justify-end">
                  {/* Fixed Percentage Display */}
                  <div title={originalMonthKey} className="cursor-pointer text-xs text-mytextcolor">
                    {percent}%
                  </div>
                  {/* Progress Bar */}
                  <div
                    title={originalMonthKey}
                    className="cursor-pointer w-full bg-blue-500 rounded"
                    style={{ height: `${percent + 1}%` }}
                  />
                </div>
                <div title={originalMonthKey} className="cursor-pointer mt-2 text-md text-mytextcolor whitespace-nowrap">
                  {monthNames[monthIndex]} {/* Show the real month name */}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MonthlyPercentageChart;
