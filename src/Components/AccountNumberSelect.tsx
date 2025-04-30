import { changeAccountNumber } from "@/Redux/accountSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const accNumber = useSelector(
    (state: any) => state.account.account_number_id
  );

  const accountselection = accountData?.map((el) => ({
    id: el.id,
    name: textNum(el.account_number, 4),
  }));

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

  return (
    <Modal
      open={user?.region_id && openmodal}
      title={tt("Hisob raqam", "Номер счета")}
    >
      <Select
        label={tt("Hisob raqam", "Номер счета")}
        value={accNumber}
        onChange={handleChangeAccount}
        data={accountselection}
      />

      <div className="flex justify-center mt-[50px]">
        <Button
          disabled={!accNumber}
          onClick={() => setOpenmodal(false)}
          className="w-[70%] mt-3"
        >
          {tt("Yopish", "Закрыть")}
        </Button>
      </div>
    </Modal>
  );
};
