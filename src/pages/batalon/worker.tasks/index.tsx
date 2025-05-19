import Table from "./table";
import useApi from "@/services/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Tasks() {
  const [data, setData] = useState<any[]>([]);
  const api = useApi();

  const { id } = useParams();

  const getInfo = async () => {
    const get = await api.get<any[]>(`batalon/tasks/${id}`);
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
