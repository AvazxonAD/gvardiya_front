import { formatNum, latinToCyrillic } from "@/utils";

const BudgetTable = ({ data }: any) => {
  return (
    <div className="overflow-x-auto text-[10px] leading-3 text-mytextcolor">
      <table className="max-w-full border ">
        <thead>
          <tr className="border border-mytableheadborder">
            <th className="border text-center py-1 w-[120px]">
              {latinToCyrillic("Tadbir o'tadigan joy nomi")}
            </th>
            {data.date && (
              <th className="border text-center py-1 w-[120px]">
                {latinToCyrillic("Tadbir o'tadigan sanasi")}
              </th>
            )}
            <th className="border text-center  py-1">
              Жалб этиладиган шахсий таркиб ваколатли давлат идоралари ёки
              органлар номи
            </th>
            <th className="border text-center py-1 w-[60px]">
              {latinToCyrillic("Jami ishlatilgan shaxsiy tarkib soni")}
            </th>
            <th className="border text-center py-1 w-[60px]">
              {latinToCyrillic("Ommaiy tadbir o'tkazish vaqti (soat)")}
            </th>
            <th className="border text-center py-1">
              {latinToCyrillic("Bir kishilik soatbay ish haqi (BHM*7%)")}
            </th>
            <th className="border text-center py-1">
              {latinToCyrillic("Jami hisoblangan (3*4*5)")}
            </th>
            <th className="border text-center py-1  w-[70px]">
              {latinToCyrillic("     Chegirma    ")}
            </th>
            <th className="border text-center py-1">
              {latinToCyrillic("Umumiy hisoblangan")}
            </th>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          <tr className="border border-mytableheadborder">
            <td className="border text-center py-1">1</td>
            <td className="border text-center py-1">2</td>
            <td className="border text-center py-1">3</td>
            <td className="border text-center py-1">4</td>
            <td className="border text-center py-1">5</td>
            <td className="border text-center py-1">6</td>
            <td className="border text-center py-1">7</td>
            <td className="border text-center py-1">8</td>
          </tr>

          {data.tasks &&
            data.tasks.map((row: any, i: number) => (
              <tr key={row.id} className={`${data?.dist ? "border" : ""}`}>
                <td className="border-r text-center font-bold py-1">
                  {data.dist ? row.address : i === 0 ? row.address : ""}
                </td>
                {data.date && (
                  <td className="border text-center font-bold py-1">
                    {row.local_date}
                  </td>
                )}
                <td className="border text-center py-1">
                  {/* {row.batalon_id} */}
                  {row.batalon_name}
                </td>
                <td className="border text-center py-1">{row.worker_number}</td>
                <td className="border text-center py-1">{row.task_time}</td>
                <td className="border text-center py-1">
                  {/* {formatNum(row.summa)} */}
                  {formatNum(row?.timemoney, true)}
                </td>
                <td className="border text-center py-1">
                  {/* {formatNum(data.summa)} */}
                  {formatNum(row.summa, true)}
                </td>
                <td className="border text-center py-1">
                  {data.discount ? formatNum(row?.discount_money, true) : "_"}
                </td>
                <td className="border text-center py-1">
                  {formatNum(row.result_summa, true)}
                </td>
              </tr>
            ))}
          <tr className="border border-mytableheadborder font-[600]">
            <td colSpan={data.date ? 3 : 2} className="border text-center py-1">
              {latinToCyrillic("Jami")}
            </td>
            <td className="border text-center py-1">
              {data.all_worker_number}
            </td>
            <td className="border text-center py-1">
              {/* {data.all_task_time} */}
            </td>
            <td className="border text-center py-1">
              {/* {formatNum(data.summa)} */}
              {/* {formatNum(data?.tasks?.reduce((accumulator: any, current: any) => accumulator + current.timemoney, 0), true)} */}
            </td>
            <td className="border text-center py-1">
              {formatNum(data.summa, true)}
            </td>
            <td className="border text-center py-1">
              {/* {data.discount ? data.discount : "_"} */}
              {data.discount ? formatNum(data?.discount_money, true) : "_"}
            </td>
            <td className="border text-center  py-1">
              {formatNum(data.result_summa, true)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;
