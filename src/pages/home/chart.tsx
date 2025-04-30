import { IByUser } from "@/types/monitoring";
import {
    ArcElement,
    Chart as ChartJS,
    Legend,
    Tooltip,
} from "chart.js";
import React from "react";
import { Pie } from "react-chartjs-2";

// Chart.js ni ro'yxatdan o'tkazish
ChartJS.register(ArcElement, Tooltip, Legend);
interface PieChartProps {
    data: IByUser[];
}
const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const chartData = {
        datasets: [
            {
                data: data.map((item) => item.percent), // Foiz qiymatlari
                backgroundColor: data.map((item) => item.color), // Ranglar
                borderColor: "#FFFFFF", // Chegara rangi
                borderWidth: data.length > 1 ? 2 : 0,
                hoverOffset: 40,
                ofsett: 20
            },
        ],
    };

    const options = {
        responsive: true,
        layout: {
            padding: 10, // Har tomondan 30px padding
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const regionName = data[tooltipItem.dataIndex].region_name;
                        const percent = data[tooltipItem.dataIndex].percent;
                        return `${regionName}  - ${percent}%`;
                    },
                },
            },
        },
    };

    return (
        <div className="max-w-sm mx-auto m-5">
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default PieChart;