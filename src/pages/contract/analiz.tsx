import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import useApi from "@/services/api";
import { IContractAnaliz } from "@/types/contract";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
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
    const reactToPrintFn = useReactToPrint({
        contentRef: fioRef,
    });
    const onPrintClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        reactToPrintFn();
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <BackButton />
                </div>
                <Button onClick={onPrintClick} mode="print" />
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