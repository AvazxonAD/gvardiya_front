import Button from "@/Components/reusable/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSpr, updateSpr, updateSprPair } from "../api";
import Input from "../Components/Input";
import { alertt } from "../Redux/LanguageSlice";
import { tt } from "../utils";
import SprTab from "./SprTab";
import { ListCard } from "@/ui";
function Spr({
  title,
  titleT,
  path,
  text,
  n,
  label,
  bank,
  /** Ikkita maydonli bo'lim: "bank" yoki "doer" */
  pair,
  number,
  format,
  deduction,
}: any) {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [_, setActive] = useState(1);
  const [value, setValue] = useState<any>();
  const [pairValue, setPairValue] = useState<Record<string, string>>({});

  /**
   * Ba'zi bo'limlar bitta emas, IKKITA maydondan iborat va server ularni
   * birga talab qiladi (Joi da ikkalasi `required`).
   *
   * Ilgari bu faqat Bank uchun qotirib yozilgan edi. Ijrochi ham shunday
   * — `doer` bilan birga `title` kerak — lekin unga forma yo'q edi:
   * faqat `doer` yuborilib, server "title is required" deb rad etardi,
   * ya'ni Ijrochini na yaratib, na tahrirlab bo'lardi.
   *
   * `tt()` tilni localStorage'dan o'qigani uchun ro'yxat komponent
   * ichida quriladi — modul darajasida til qotib qolardi.
   */
  const pairKey: string | undefined = bank ? "bank" : pair;
  const pairFields =
    pairKey === "bank"
      ? [
          { key: "bank", label: tt("Bank nomi", "Название банка") },
          { key: "mfo", label: tt("MFO", "МФО") },
        ]
      : pairKey === "doer"
      ? [
          { key: "doer", label: tt("Ijrochi nomi", "Название исполнителя") },
          { key: "title", label: tt("Hujjat sarlavhasi", "Заголовок документа") },
        ]
      : null;
  const JWT = useSelector((s: any) => s.auth.jwt);
  const getInfo = async () => {
    const res = await getSpr(JWT, pairKey ?? path);

    if (res?.error || !res?.data) {
      return null
    }
    setData(res.data);
    if (pairFields) {
      setPairValue(
        Object.fromEntries(pairFields.map((f) => [f.key, res.data[f.key] ?? ""]))
      );
    } else {
      setValue(res.data[text]);
    }
  };
  useEffect(() => {
    getInfo();
  }, []);
  const dispatch = useDispatch();
  const update = async () => {
    if (!pairFields) {
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
      const res = await updateSprPair(pairValue, JWT, pairKey as string);
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
  // SprTab ga uzatiladigan ro'yxat bilan bir xil hisoblanadi: bu bo'limlarda
  // server bitta obyekt qaytaradi, ma'lumot bo'lmasa esa `data` bo'sh qoladi.
  const rows = ([] as any[]).concat((data as any) ?? []);
  const isEmpty = rows.length === 0;

  const handleSumbet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ikki maydonli bo'limda holat OBYEKT — u doim "rost" bo'lgani uchun
    // ilgari bo'sh forma ham yuborilardi. Endi server qator yaratadigan
    // bo'lgani uchun bu bo'sh yozuv hosil qilardi: har bir maydon
    // alohida tekshiriladi (serverda ham ikkalasi majburiy).
    const filled = pairFields
      ? pairFields.every((f) => String(pairValue[f.key] ?? "").trim())
      : Boolean(value);

    if (filled) {
      update();
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h1 className="text-[16px] font-semibold text-foreground">{title}</h1>

      <ListCard>
      <SprTab
        pairFields={pairFields}
        title={titleT}
        setActive={setActive}
        open={open}
        format={format}
        number={number}
        setOpen={setOpen}
        path={text}
        titleM={title + (isEmpty ? tt(" qo'shish", " добавить") : tt(" tahrirlash", " править"))}
        data={[].concat(data as any)}
        deduction={deduction}
        template={path === "template"}>
        <form onSubmit={handleSumbet}>
          {pairFields ? (
            <div className="flex flex-col gap-3 w-full">
              {pairFields.map((f) => (
                <Input
                  key={f.key}
                  t={"text"}
                  v={pairValue[f.key] ?? ""}
                  change={(e: any) =>
                    setPairValue((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  label={f.label}
                  p={f.label + tt(" kiriting", " Введите")}
                  className="w-full"
                />
              ))}
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
            <Button type="submit" mode={isEmpty ? "add" : "edit"} />
          </div>
        </form>
      </SprTab>
      </ListCard>
    </div>
  );
}

export default Spr;
