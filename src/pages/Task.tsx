import Table from "@/pageCompoents/tasks/Table";
import useApi from "@/services/api";
import { ITask } from "@/types/task";
import { IContractForm } from "@/types/contract";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { formatDate, tt } from "@/utils";

function Tasks() {
  const [data, setData] = useState<ITask[]>([]);
  const [contract, setContract] = useState<IContractForm | null>(null);
  const { account_number_id } = useSelector((state: any) => state.account);
  const api = useApi();

  const { id } = useParams();

  const getInfo = async () => {
    const get = await api.get<ITask[]>(
      `task/contract/${id}?account_number_id=${account_number_id}`
    );
    if (get?.success && get.data) {
      setData(get.data);
    }
  };

  const getContract = async () => {
    const get = await api.get<IContractForm>(`contract/${id}?account_number_id=${account_number_id}`);
    if (get?.success && get.data) {
      setContract(get.data);
    }
  };

  useEffect(() => {
    getInfo();
    getContract();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {contract && (
        <div className="flex items-center gap-6 text-[13px] text-mytextcolor border border-mytableheadborder rounded-lg px-4 py-2 bg-mytablehead mt-3">
          <div>
            <span className="text-mylabelcolor">{tt("Shartnoma raqami", "Номер договора")}: </span>
            <span className="font-semibold">{contract.doc_num}</span>
          </div>
          <div>
            <span className="text-mylabelcolor">{tt("Shartnoma sanasi", "Дата договора")}: </span>
            <span className="font-semibold">{formatDate(contract.doc_date)}</span>
          </div>
          <div>
            <span className="text-mylabelcolor">{tt("Boshlanish sanasi", "Дата начала")}: </span>
            <span className="font-semibold">{formatDate(contract.start_date)}</span>
          </div>
          <div>
            <span className="text-mylabelcolor">{tt("Tugallash sanasi", "Дата окончания")}: </span>
            <span className="font-semibold">{formatDate(contract.end_date)}</span>
          </div>
          <div>
            <span className="text-mylabelcolor">{tt("Boshlanish vaqti", "Время начала")}: </span>
            <span className="font-semibold">{contract.start_time}</span>
          </div>
          <div>
            <span className="text-mylabelcolor">{tt("Tugallash vaqti", "Время окончания")}: </span>
            <span className="font-semibold">{contract.end_time}</span>
          </div>
        </div>
      )}
      <Table getTasks={getInfo} data={data} contract={contract} />
    </div>
  );
}

export default Tasks;
