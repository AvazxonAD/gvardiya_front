import useApi from "@/services/api";
import { IContractAnaliz } from "@/types/contract";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AnalizView from "./analizView";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { tt } from "@/utils";
import { Button as UIButton, Card, EmptyState } from "@/ui";


const ContractAnaliz = () => {
    const { id } = useParams();
    const [data, setData] = useState<IContractAnaliz>();
    const account_id = useSelector((state: any) => state.account.account_number_id)
    const api = useApi();

    const getData = async () => {
        const get = await api.get<IContractAnaliz>(`contract/view/${id}?account_number_id=${account_id}`);
        if (get?.success) {
            setData(get.data)
        }
    }

    useEffect(() => {
        if (id) {
            getData();
        }
    }, [id])

    const navigate = useNavigate();

    return (
        <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center gap-3">
                <UIButton variant="secondary" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft />
                    {tt("Orqaga", "Назад")}
                </UIButton>
                <h1 className="text-[1rem] font-semibold text-foreground">
                    {tt("Shartnoma tahlili", "Анализ договора")}
                </h1>
            </div>

            {/* `data` bor bo'lsa ham `contract` bo'lmasligi mumkin —
                ilgari shu holatda sahifa yiqilardi */}
            {data?.contract ? (
                <Card className="overflow-hidden">
                    <AnalizView data={data} />
                </Card>
            ) : (
                <EmptyState
                    icon={BarChart3}
                    title={tt("Ma'lumot yo'q", "Нет данных")}
                    description={tt(
                        "Shartnoma bo'yicha tahlil topilmadi",
                        "Анализ по договору не найден"
                    )}
                />
            )}
        </div>
    )
}

export default ContractAnaliz;