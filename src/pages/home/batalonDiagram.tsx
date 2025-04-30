import { formatSum } from "@/utils";
import React from "react";
import PieChart from "./batalonChart";

interface DiagramProps {
  data: any[];
  title?: string;
  type?: "region" | "batalon"
}

export const BatalonDiagram: React.FC<DiagramProps> = ({
  data,
  title = "Batalonlar",
  type
}) => {

  return (
    <div className="w-full h-full border border-mybordercolor rounded-lg p-6">
      <h2 className="text-mysecondarytext text-xl font-semibold mb-4">
        {title}
      </h2>
      <div className="flex items-start gap-x-3 w-full">
        {/* Legend */}
        <div className="w-1/2 max-h-[330px] overflow-y-auto">
          <div className="space-y-2 flex flex-col items-start justify-center">
            {data.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full shadow-md border cursor-pointer"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-mynavactiveborder cursor-pointer">
                  {item[`${type}_name`]} - {formatSum(item.summa)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="w-1/2 flex justify-center -mt-10">
          <PieChart type={type} data={data} />
        </div>
      </div>
    </div>
  );
};

export default BatalonDiagram;