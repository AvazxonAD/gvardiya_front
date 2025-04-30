import { tt } from "@/utils";
import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {tt("Sahifa mavjud emas", "Страница не существует")}
            </h1>
            <p className="text-gray-600 mb-8">
                {tt("Kechirasiz, siz izlayotgan sahifa topilmadi.", "Извините, страница не найдена.")}
            </p>
            <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
                {tt("Bosh menyu", "Главное меню")}
            </button>
        </div>
    );
};

export default ErrorPage;
