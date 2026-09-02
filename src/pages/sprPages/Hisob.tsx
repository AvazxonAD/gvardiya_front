import Button from "@/Components/reusable/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateAcount, DeleteSpr, getSpr, updateSpr } from "../../api";
import Input from "../../Components/Input";
import Modal from "../../Components/Modal";
import HisobTab from "../../pageCompoents/HisobTab";
import { alertt } from "../../Redux/LanguageSlice";
import { tt } from "../../utils";
import { Plus } from "lucide-react";
import { Button as UIButton, ListCard, Toolbar, ToolbarSpacer } from "@/ui";

// Bu funksiya foydalanuvchi kiritayotgan raqamlarni 3 belgidan keyin bo'sh joy qo'yib formatlaydi
const formatAccountNumber = (value: string) => {
  let newValue = value.replace(/[^\d]/g, ""); // faqat raqamlar qolsin
  let formattedValue = "";

  for (let i = 0; i < newValue.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += " "; // Har 3 ta raqamdan keyin bo'sh joy qo'shamiz
    }
    formattedValue += newValue[i]; // Raqamlarni formatlangan qiymatga qo'shamiz
  }

  return formattedValue.trim(); // O'ng va chapdagi bo'sh joylarni tozalaymiz
};

function Hisob() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState(1);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  const JWT = useSelector((s: any) => s.auth.jwt);

  const getInfo = async () => {
    const res = await getSpr(JWT, "account");
    setData(res.data);
  };

  const getInfoID = async () => {
    const res = await getSpr(JWT, "account/" + active);
    // Javob kutilgan shaklda bo'lmasligi mumkin — sahifa shu sababli
    // yiqilib qolmasligi kerak.
    setValue(formatAccountNumber(res?.data?.account_number ?? ""));
  };

  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    getInfoID();
  }, [active]);
  const dispatch = useDispatch();
  const update = async () => {
    const res = await updateSpr(
      value.replace(/\s/g, ""),
      JWT,
      `account/${active}`,
      "account_number"
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
  };

  const handleSumbet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value) {
      update();
    }
  };

  const create = async () => {
    const res = await CreateAcount(value2.replace(/\s/g, ""), JWT);

    if (res.success) {
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );
      setOpen2(false);
      getInfo();
      setValue("");
    } else {
      dispatch(
        alertt({
          text: res.message,
          success: false,
        })
      );
    }
  };

  const handleSumbet2 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value2) {
      create();
    }
  };

  const handleDelete = async () => {
    const res = await DeleteSpr(JWT, active);
    if (res.success) {
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );

      getInfo();
      //edit dispacth
    } else {
      dispatch(
        alertt({
          text: res.message,
          success: false,
        })
      );
    }
  };

  useEffect(() => {
    setValue2("");
  }, [open2])

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-foreground">
          {tt("Hisob Raqami", "Номер Счета")}
        </h1>
      </div>

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
      <HisobTab
        handleDelete={handleDelete}
        setActive={setActive}
        open={open}
        setOpen={setOpen}
        titleM={tt("Hisob raqam tahrirlash", "Изменить номер счета")}
        data={data}
      >
        <form onSubmit={handleSumbet}>
          <Input
            t={"text"}
            v={value}
            change={(e: any) => {
              const val = e.target.value;
              if (val?.split(" ")?.join("").length < 17) {
                setValue(formatAccountNumber(e.target.value))
              }
            }} // Har safar qiymatni formatlaymiz
            label={tt("Hisob Raqami", "Номер Счета")}
            p={tt("Hisob raqami kiriting", "Введите Номер Счета")}
          />
          <div className="mt-5 flex justify-end">
            <Button mode="edit" type="submit" />
          </div>
        </form>
      </HisobTab>
      </ListCard>

      <Modal
        closeModal={() => {
          setOpen2(false);
        }}
        title={tt("Hisob raqam qo'shish", "Добавить номер счета")}
        open={open2}
      >
        <form onSubmit={handleSumbet2}>
          <Input
            t={"text"}
            v={value2}
            change={(e: any) => {
              const val = e.target.value;
              if (val?.split(" ")?.join("").length < 17) {
                setValue2(formatAccountNumber(e.target.value))
              }
            }} // Har safar qiymatni formatlaymiz
            label={tt("Hisob Raqami", "Номер Счета")}
            p={tt("Hisob raqami kiriting", "Введите Номер Счета")}
          />
          <div className="mt-5 flex justify-end">
            <Button mode="add" type="submit" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Hisob;
