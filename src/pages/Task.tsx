import Table from "@/pageCompoents/tasks/Table";
import useApi from "@/services/api";
import { ITask } from "@/types/task";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

function Tasks() {
  const [data, setData] = useState<ITask[]>([]);
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

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <Table getTasks={getInfo} data={data} />
    </div>
  );
}

export default Tasks;
