import Button from "@/Components/reusable/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSpr, updateSpr, updateSpr2 } from "../api";
import Input from "../Components/Input";
import { alertt } from "../Redux/LanguageSlice";
import { latinToCyrillic, tt } from "../utils";
import SprTab from "./SprTab";
function Spr({
  title,
  titleT,
  path,
  text,
  n,
  label,
  bank,
  number,
  format,
  deduction,
}: any) {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [_, setActive] = useState(1);
  const [value, setValue] = useState<any>();
  const [value2, setValue2] = useState({
    bank: "",
    mfo: "",
  });
  const JWT = useSelector((s: any) => s.auth.jwt);
  const getInfo = async () => {
    const res = await getSpr(JWT, bank ? "bank" : path);

    if (res?.error || !res?.data) {
      return null
    }
    setData(res.data);
    if (bank) {
      setValue2({ bank: res.data.bank, mfo: res.data.mfo });
    } else {
      setValue(res.data[text]);
    }
  };
  useEffect(() => {
    getInfo();
  }, []);
  const dispatch = useDispatch();
  const update = async () => {
    if (!bank) {
      const res = await updateSpr(
        n ? +value : value,
        JWT,
        `${path == "bxm" ? "bxm/1" : path}`,
        text
      );

      if (res.success) {
        dispatch(
          alertt({
            text: res.message,
            success: true,
          })
        );
        setOpen(false);
        getInfo();
      } else {
        dispatch(
          alertt({
            text: res.message,
            success: false,
          })
        );
      }
    } else {
      const res = await updateSpr2(value2, JWT);
      if (res.success) {
        dispatch(
          alertt({
            text: res.message,
            success: true,
          })
        );
        setOpen(false);
        getInfo();
      } else {
        dispatch(
          alertt({
            text: res.message,
            success: false,
          })
        );
      }
    }
  };
  const handleSumbet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (value || value2) {
      update();
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between mb-6">
        <h1 className="text-mytextcolor text-[20px] leading-[24.2px] font-[500]">
          {title}
        </h1>
      </div>

      <SprTab
        bank={bank}
        title={titleT}
        setActive={setActive}
        open={open}
        format={format}
        number={number}
        setOpen={setOpen}
        path={text}
        titleM={title + tt(" tahrirlash", " править")}
        data={[].concat(data as any)}
        deduction={deduction}
        template={path === "template"}>
        <form onSubmit={handleSumbet}>
          {bank ? (
            <div className="flex flex-col gap-3 w-full">
              <Input
                t={"text"}
                v={value2.bank}
                change={(e: any) =>
                  setValue2({ ...value2, bank: e.target.value })
                }
                label={tt("Bank nomi", "Название банка")}
                p={tt("Bank nomi kiriting", "Введите название банка")}
                className="w-full"
              />
              <Input
                t={"text"}
                v={value2.mfo}
                change={(e: any) =>
                  setValue2({ ...value2, mfo: e.target.value })
                }
                label={tt("MFO", latinToCyrillic("MFO"))}
                p={tt("MFO kiriting", "Введите MFO")}
                className="w-full"
              />
            </div>
          ) : (
            <div className="w-full">
              <Input
                t={n ? "number" : "text"}
                v={value}
                change={(e: any) => setValue(e.target.value)}
                label={label}
                p={label + tt(" kiriting", " Введите")}
                className="w-full"
              />
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Button type="submit" mode="edit" />
          </div>
        </form>
      </SprTab>
    </div>
  );
}

export default Spr;
