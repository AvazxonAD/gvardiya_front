import { getSpr } from "@/api";
import DeleteModal from "@/Components/DeleteModal";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Button from "@/Components/reusable/button";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tt } from "../../utils";
import Table from "@/Components/reusable/table/Table";
import { Coins, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button as UIButton,
  EmptyState,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

function Bxm() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState(1);
  const [delOpen, setDelOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  const JWT = useSelector((s: any) => s.auth.jwt);
  const api = useApi();
  const dispatch = useDispatch();

  const getInfo = async () => {
    const res = await getSpr(JWT, "bxm");
    if (res?.data) {
      setData(res.data);
    }
  };

  useEffect(() => {
    if (!open) {
      setValue("")
    }
    if (!open2) {
      setValue2("")
    }
  }, [open, open2])

  useEffect(() => {
    getInfo();
  }, []);


  const handleDelete = async () => {
    const res: any = await api.remove(`bxm/${active}`);
    if (res?.success) {
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );

      getInfo();
    } else {
      dispatch(
        alertt({
          text: res?.error || res?.message,
          success: false,
        })
      );
    }
  };

  const handleSumbit = async (e: any) => {
    e.preventDefault();
    const upd: any = await api.update(`bxm/${active}`, { summa: value });
    if (upd?.success) {
      setOpen(false)
      getInfo();
    } else {
      dispatch(
        alertt({
          text: upd?.error || upd?.message,
          success: false,
        })
      );
    }
  }

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const upd: any = await api.post(`bxm/`, { summa: value2 });
    if (upd?.success) {
      setOpen2(false)
      getInfo();
    } else {
      dispatch(
        alertt({
          text: upd?.error || upd?.message,
          success: false,
        })
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h1 className="text-[16px] font-semibold text-foreground">
        {tt("BXM", "БХМ")}
      </h1>

      <ListCard
        toolbar={
          <Toolbar>
            <ToolbarSpacer />
            <UIButton size="sm" onClick={() => setOpen2(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
      >
        {data && data.length ? (
          <Table
            thead={[
              { text: "№", className: "w-[70px]" },
              { text: tt("BXM summa", "Сумма БХМ") },
              {
                text: tt("Amallar", "Действия"),
                className: "w-[110px] text-center",
              },
            ]}
          >
            {data.map((person: any, index: number) => (
              <tr key={person.id}>
                <td className="text-muted-foreground tabular-nums">{index + 1}</td>
                <td className="font-medium tabular-nums">{person.summa}</td>
                <td>
                  <div className="flex items-center justify-center gap-0.5">
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("Tahrirlash", "Редактировать")}
                      aria-label={tt("Tahrirlash", "Редактировать")}
                      onClick={() => {
                        setValue(person.summa);
                        setActive(person.id);
                        setOpen(true);
                      }}
                    >
                      <Pencil />
                    </UIButton>
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("O'chirish", "Удалить")}
                      aria-label={tt("O'chirish", "Удалить")}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setDelOpen(true);
                        setActive(person.id);
                      }}
                    >
                      <Trash2 />
                    </UIButton>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState icon={Coins} title={tt("Ma'lumot yo'q", "Нет данных")} />
        )}
      </ListCard>

        <Modal
          closeModal={() => {
            setOpen(false);
          }}
          title={tt("Tahrirlash", "Редактировать")}
          open={open}
        >
          <form onSubmit={handleSumbit}>
            <Input
              t={"number"}
              v={value}
              change={(e: any) => {
                const val = e.target.value;
                setValue(val)
              }} // Har safar qiymatni formatlaymiz
              label={tt("Summa", "Сумма")}
              p={tt("Summa kiriting", "Введите Сумма")}
            />
            <div className="mt-5 flex justify-end">
              <Button mode="edit" type="submit" />
            </div>
          </form>
        </Modal>

        <Modal
          closeModal={() => {
            setOpen2(false);
          }}
          title={tt("Qo'shish", "Добавить")}
          open={open2}
        >
          <form onSubmit={handleAdd}>
            <Input
              t={"number"}
              v={value2}
              change={(e: any) => {
                const val = e.target.value;
                setValue2(val)
              }} // Har safar qiymatni formatlaymiz
              label={tt("Summa", "Сумма")}
              p={tt("Summa kiriting", "Введите Сумма")}
            />
            <div className="mt-5 flex justify-end">
              <Button mode="add" type="submit" />
            </div>
          </form>
        </Modal>

        <DeleteModal
          open={delOpen}
          deletee={handleDelete}
          closeModal={() => {
            setDelOpen(false);
          }}
        />
    </div>
  );
}

export default Bxm;
