import Table from "@/pageCompoents/tasks/Table";
import useApi from "@/services/api";
import { ITask } from "@/types/task";
import { IContractForm } from "@/types/contract";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { formatDate, tt } from "@/utils";
import { Card } from "@/ui";

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
    <div className="flex min-w-0 flex-col gap-3">
      {contract && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-lg border border-border bg-card px-4 py-3 text-[13px] text-foreground">
          <div>
            <span className="text-muted-foreground">{tt("Shartnoma raqami", "Номер договора")}: </span>
            <span className="font-semibold">{contract.doc_num}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Shartnoma sanasi", "Дата договора")}: </span>
            <span className="font-semibold">{formatDate(contract.doc_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Boshlanish sanasi", "Дата начала")}: </span>
            <span className="font-semibold">{formatDate(contract.start_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Tugallash sanasi", "Дата окончания")}: </span>
            <span className="font-semibold">{formatDate(contract.end_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Boshlanish vaqti", "Время начала")}: </span>
            <span className="font-semibold">{contract.start_time}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{tt("Tugallash vaqti", "Время окончания")}: </span>
            <span className="font-semibold">{contract.end_time}</span>
          </div>
        </div>
      )}
      <Card className="overflow-hidden">
        <Table getTasks={getInfo} data={data} contract={contract} />
      </Card>
    </div>
  );
}

export default Tasks;
