import { changeAccountNumber } from "@/Redux/accountSlice";
import { can } from "@/lib/permissions";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { textNum, tt } from "../utils";
import Modal from "./Modal";
import Select from "./Select";
import { Button } from "./ui/button";

interface accountdata {
  id: number;
  account_number: string;
}

interface props {
  openmodal: boolean;
  setOpenmodal: React.Dispatch<React.SetStateAction<boolean>>;
  accountData: accountdata[];
}

export const AccountNumberSelect = ({
  openmodal,
  setOpenmodal,
  accountData,
}: props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accNumber = useSelector(
    (state: any) => state.account.account_number_id
  );

  const accountselection = accountData?.map((el) => ({
    id: el.id,
    name: textNum(el.account_number, 4),
  }));
  const isEmpty = !accountselection?.length;

  const handleChangeAccount = (id: number) => {
    const account = accountData.find((el) => el.id === id);
    if (account) {
      dispatch(
        changeAccountNumber({
          id: id,
          number: account.account_number,
        })
      );
    }
  };

  const { user } = useSelector((state: any) => state.auth);

  // Hisob tanlanmaguncha oyna yopilmaydi — lekin tanlaydigan hisobning
  // o'zi bo'lmasa, yopish mumkin (aks holda faqat F5 qutqarardi)
  const close = accNumber || isEmpty ? () => setOpenmodal(false) : undefined;

  const goToRekvizitlar = () => {
    setOpenmodal(false);
    navigate("/spravichnik");
  };

  return (
    <Modal
      open={user?.region_id && openmodal}
      closeModal={close}
      title={tt("Hisob raqam", "Номер счета")}
    >
      {isEmpty ? (
        <div className="flex flex-col gap-4">
          <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
            {tt(
              "Hisob raqam hali qo'shilmagan. Uni «Ma'lumotnoma → Rekvizitlar» sahifasidagi «Hisob raqami» bo'limida qo'shing — shundan so'ng shu yerda tanlash mumkin bo'ladi.",
              "Номер счёта ещё не добавлен. Добавьте его в разделе «Номер счета» на странице «Справочник → Реквизиты» — после этого его можно будет выбрать здесь."
            )}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenmodal(false)}>
              {tt("Yopish", "Закрыть")}
            </Button>
            {can(user, "spravochnik") && (
              <Button onClick={goToRekvizitlar}>
                {tt("Rekvizitlarga o'tish", "Перейти к реквизитам")}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <Select
            label={tt("Hisob raqam", "Номер счета")}
            value={accNumber}
            onChange={handleChangeAccount}
            data={accountselection}
          />

          <div className="flex justify-center mt-[3.125rem]">
            <Button
              disabled={!accNumber}
              onClick={() => setOpenmodal(false)}
              className="w-[70%] mt-3"
            >
              {tt("Yopish", "Закрыть")}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};
