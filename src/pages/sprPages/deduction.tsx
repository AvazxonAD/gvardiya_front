import Icon from "@/assets/icons";
import DeleteModal from "@/Components/DeleteModal";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Paginatsiya from "@/Components/Paginatsiya";
import Button from "@/Components/reusable/button";
import useFullHeight from "@/hooks/useFullHeight";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { IDeduction } from "@/types/deduction";
import { FormEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Table, { ITheadItem } from "../../Components/reusable/table/Table"; // Assuming Table is in the same directory
import { tt } from "../../utils";

type IDeductionState = {
  meta?: {
    from_balance: string;
    to_balance: string;
    count: number;
    pageCount: number;
  };
  data?: IDeduction[];
};

function Deduction() {
  const [data, setData] = useState<IDeductionState>();
  const [limit, setLimit] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState<number>(0);
  const [open2, setOpen2] = useState<number>(0);
  const [value, setValue] = useState<string>("");
  const [value2, setValue2] = useState<string>("");
  const [add, setAdd] = useState<boolean>(false);
  const [addValue, setAddValue] = useState<string>("");
  const [addValue2, setAddValue2] = useState<string>("");
  const api = useApi();
  const dispatch = useDispatch();

  const tableHeaders: ITheadItem[] = [
    {
      text: tt("№", "№"),
      className: "w-[100px] text-left",
    },
    {
      text: tt("Ushlanma nomi", "Название удержание"),
      className: "w-[250px] text-left",
    },
    {
      text: tt("Foiz", "Процент"),
      className: "w-[200px] text-center",
    },
    {
      text: tt("Amallar", "Действия"),
      className: "w-[120px] text-right",
    },
  ];

  const getData = async () => {
    const get = await api.get<IDeductionState>(
      `deduction?page=${currentPage}&limit=${limit}`
    );
    if (get?.success) {
      setData(get as any);
    }
  };

  useEffect(() => {
    getData();
  }, [currentPage, limit]);

  const handleRemove = async (id: number) => {
    const remove: any = await api.remove(`deduction/${id}`);
    if (remove?.success) {
      getData();
    } else {
      dispatch(
        alertt({
          text: remove?.error,
          success: false,
        })
      );
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const remove: any = await api.update(`deduction/${open2}`, {
      name: value,
      percent: value2,
    });
    if (remove?.success) {
      setOpen2(0);
      getData();
    } else {
      dispatch(
        alertt({
          text: remove?.error,
          success: false,
        })
      );
    }
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const remove: any = await api.post(`deduction`, {
      name: addValue,
      percent: addValue2,
    });
    if (remove?.success) {
      setAdd(false);
      setAddValue("");
      setAddValue2("");
      getData();
    } else {
      dispatch(
        alertt({
          text: remove?.error,
          success: false,
        })
      );
    }
  };

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 190px)` : height - 190;
  const tbHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  return (
    <div>
      <div style={{ minHeight: fullHeight }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-mytextcolor text-[20px] leading-[24.2px] font-[500]">
            {tt("Ushlanma", "Удержание")}
          </h1>
          <Button mode="add" onClick={() => setAdd(true)} />
        </div>

        <Table
          tableStyle={{
            maxHeight: tbHeight,
            overflowY: "auto",
          }}
          theadClassName="bg-mytablehead sticky z-10 -top-1 text-mytextcolor"
          thead={tableHeaders}
        >
          {data?.data?.map((item, index) => (
            <tr
              key={item.id}
              className={`${
                index % 2 === 0
                  ? "bg-white dark:bg-mybackground"
                  : "bg-[#F4FAFD] dark:bg-mybackground"
              } hover:text-[#3B7FAF] cursor-pointer transition-colors duration-300 text-mytextcolor border-b border-mytableheadborder`}
            >
              <td className="px-4 py-3 text-inherit text-left">
                {(currentPage - 1) * limit + index + 1}
              </td>
              <td className="px-4 py-3 text-inherit text-left truncate">
                {item.name}
              </td>
              <td className="px-4 py-3 text-inherit text-center">
                {item.percent}%
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setValue(item.name);
                      setValue2(String(item.percent));
                      setOpen2(item.id);
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    onClick={() => setOpen(item.id)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <div>
        <Paginatsiya
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={data?.meta?.pageCount}
          limet={limit}
          setLimet={setLimit}
          count={data?.meta?.count}
        />
      </div>

      <DeleteModal
        open={Boolean(open)}
        deletee={() => handleRemove(open)}
        closeModal={() => setOpen(0)}
      />

      <Modal
        closeModal={() => {
          setValue("");
          setValue2("");
          setOpen2(0);
        }}
        title={tt("Ushlanmani tahrirlash", "Редактировать удержание")}
        open={Boolean(open2)}
      >
        <form onSubmit={handleSubmit}>
          <Input
            t="text"
            v={value}
            change={(e: any) => setValue(e.target.value)}
            label={tt("Ushlanma", "Удержание")}
            p={tt("Ushlanma nomi", "Название удержания")}
            className="w-full"
          />
          <br />
          <Input
            t="text"
            v={value2}
            change={(e: any) => setValue2(e.target.value)}
            label={tt("Foiz", "Процент")}
            p={tt("Foiz", "Процент")}
            className="w-full"
          />
          <div className="mt-5 flex justify-end">
            <Button type="submit" mode="edit" />
          </div>
        </form>
      </Modal>

      <Modal
        closeModal={() => {
          setAddValue("");
          setAddValue2("");
          setAdd(false);
        }}
        title={tt("Ushlanma qo'shish", "Добавить удержание")}
        open={add}
      >
        <form onSubmit={handleAdd}>
          <Input
            t="text"
            v={addValue}
            change={(e: any) => setAddValue(e.target.value)}
            label={tt("Ushlanma", "Удержание")}
            p={tt("Ushlanma nomi", "Название удержания")}
            className="w-full"
          />
          <br />
          <Input
            t="text"
            v={addValue2}
            change={(e: any) => setAddValue2(e.target.value)}
            label={tt("Foiz", "Процент")}
            p={tt("Foiz", "Процент")}
            className="w-full"
          />
          <div className="mt-5 flex justify-end">
            <Button type="submit" mode="add" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Deduction;
