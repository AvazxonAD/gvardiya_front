import BackButton from "@/Components/reusable/BackButton";
import useApi from "@/services/api";
import { IContractAnaliz } from "@/types/contract";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AnalizView from "./analizView";


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

    const fioRef = useRef<HTMLDivElement>(null);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <BackButton />
                </div>
            </div>
            {
                data ? (
                    <div>
                        <AnalizView data={data} />
                        <div className="hidden">
                            <AnalizView data={data} ref={fioRef} />
                        </div>
                    </div>
                ) : (
                    <></>
                )
            }
        </div>
    )
}

export default ContractAnaliz;