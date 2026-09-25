import { formatNum } from "@/utils";
import { docText } from "@/lib/docText";

const BudgetTable = ({ data }: any) => {
  return (
    <div className="overflow-x-auto text-[10px] leading-[12px] text-foreground">
      <table className="max-w-full border">
        <thead>
          <tr className="border-b border-border">
            <th className="border text-center py-[4px] w-[120px]">
              {docText("smPlace")}
            </th>
            {data.date && (
              <th className="border text-center py-[4px] w-[120px]">
                {docText("smDate")}
              </th>
            )}
            <th className="border text-center py-[4px]">
              {docText("smUnit")}
            </th>
            <th className="border text-center py-[4px] w-[60px]">
              {docText("smWorkers")}
            </th>
            <th className="border text-center py-[4px] w-[60px]">
              {docText("smHours")}
            </th>
            <th className="border text-center py-[4px]">
              {docText("smRate")}
            </th>
            <th className="border text-center py-[4px]">
              {docText("smTotal")}
            </th>
            <th className="border text-center py-[4px] w-[70px]">
              {docText("smDiscount")}
            </th>
            <th className="border text-center py-[4px]">
              {docText("smGrand")}
            </th>
          </tr>
        </thead>
        <tbody className="text-[10px]">
          <tr className="border-b border-border">
            <td className="border text-center py-[4px]">1</td>
            <td className="border text-center py-[4px]">2</td>
            <td className="border text-center py-[4px]">3</td>
            <td className="border text-center py-[4px]">4</td>
            <td className="border text-center py-[4px]">5</td>
            <td className="border text-center py-[4px]">6</td>
            <td className="border text-center py-[4px]">7</td>
            <td className="border text-center py-[4px]">8</td>
          </tr>

          {data.tasks &&
            data.tasks.map((row: any, i: number) => (
              <tr key={row.id} className={`${data?.dist ? "border" : ""}`}>
                <td className="border-r text-center font-bold py-[4px]">
                  {data.dist ? row.address : i === 0 ? row.address : ""}
                </td>
                {data.date && (
                  <td className="border text-center font-bold py-[4px]">
                    {row.local_date}
                  </td>
                )}
                <td className="border text-center py-[4px]">
                  {/* {row.batalon_id} */}
                  {row.batalon_name}
                </td>
                <td className="border text-center py-[4px]">{row.worker_number}</td>
                <td className="border text-center py-[4px]">{row.task_time}</td>
                <td className="border text-center py-[4px]">
                  {/* {formatNum(row.summa)} */}
                  {formatNum(row?.timemoney, true)}
                </td>
                <td className="border text-center py-[4px]">
                  {/* {formatNum(data.summa)} */}
                  {formatNum(row.summa, true)}
                </td>
                <td className="border text-center py-[4px]">
                  {data.discount ? formatNum(row?.discount_money, true) : "_"}
                </td>
                <td className="border text-center py-[4px]">
                  {formatNum(row.result_summa, true)}
                </td>
              </tr>
            ))}
          <tr className="border-b border-border font-[600]">
            <td colSpan={data.date ? 3 : 2} className="border text-center py-[4px]">
              {docText("smSum")}
            </td>
            <td className="border text-center py-[4px]">
              {data.all_worker_number}
            </td>
            <td className="border text-center py-[4px]">
              {/* {data.all_task_time} */}
            </td>
            <td className="border text-center py-[4px]">
              {/* {formatNum(data.summa)} */}
              {/* {formatNum(data?.tasks?.reduce((accumulator: any, current: any) => accumulator + current.timemoney, 0), true)} */}
            </td>
            <td className="border text-center py-[4px]">
              {formatNum(data.summa, true)}
            </td>
            <td className="border text-center py-[4px]">
              {/* {data.discount ? data.discount : "_"} */}
              {data.discount ? formatNum(data?.discount_money, true) : "_"}
            </td>
            <td className="border text-center py-[4px]">
              {formatNum(data.result_summa, true)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;
