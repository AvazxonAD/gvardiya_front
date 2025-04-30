import { IByUser } from '@/types/monitoring';
import React from 'react';
import PieChart from './batalonChart';
// import PieChart from './chart';

interface DiagramProps {
    data: IByUser[];
    title?: string;
}

export const Diagram: React.FC<DiagramProps> = ({ data, title = "Batalonlar" }) => {

    return (
        <div className="w-full border border-mybordercolor rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>
            <div className="flex items-center gap-x-3 w-full">
                {/* Legend */}
                <div className="w-1/2 max-h-[310px] overflow-y-auto">
                    <div className="space-y-2">
                        {data.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full shadow-md border cursor-pointer"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className=" text-sm cursor-pointer">{item.region_name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <div className="w-1/2 flex justify-center">
                    <PieChart type='region' data={data} />
                </div>
            </div>
        </div>
    );
};

export default Diagram;