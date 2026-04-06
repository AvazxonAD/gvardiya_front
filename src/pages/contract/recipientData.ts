import { IContractForm } from "@/types/contract";
import { IOrganization } from "@/types/organization";
import { textNum, tt } from "@/utils";
import { useEffect } from "react";

export const recipient = () => {
  try {
    const userStore = localStorage.getItem("user");
    const userData = userStore ? JSON.parse(userStore) : undefined;
    const user = userData ? userData.user : undefined;
    const result = [
      { txt: tt("Qabul qiluvchi", "Получатель"), value: user?.doer_name || "" },
      { txt: tt("Bank", "Банк"), value: user?.bank_name || "" },
      { txt: tt("MFO", "МФО"), value: user?.mfo || "" },
      { txt: tt("INN", "ИНН"), value: textNum(user?.str, 3) || "" },
      {
        txt: tt("Joriy hisob", "Расчетный счет"),
        value: textNum(user?.account_number, 4) || "",
      },
    ];
    return result;
  } catch {
    return [];
  }
};

export const payer = ({
  data,
  contract,
  setContract,
}: {
  data?: IOrganization[];
  contract?: IContractForm;
  setContract?: (contract: any) => void;
}) => {
  const org = data?.find((d: any) => d.id == contract?.organization_id);

  const defaultAccount =
    org?.account_numbers?.map((d: any) => ({
      ...d,
      name: textNum(d.account_number, 4),
    }))?.[0]?.id ?? "";

  // Yangi shartnoma uchun default hisob raqamni set qilish
  useEffect(() => {
    if (contract?.organization_id && data?.length && !contract?.organ_account_number_id && defaultAccount) {
      setContract?.({
        ...contract,
        organ_account_number_id: defaultAccount,
      });
    }
  }, [contract?.organization_id, defaultAccount]);

  try {
    const payer = [
      {
        txt: tt("To'lovchi", "Плательщик"),
        value: org?.name || "",
      },
      {
        txt: tt("Bank", "Банк"),
        value: org?.bank_name || "",
      },
      {
        txt: tt("MFО", "МФО"),
        value: org?.mfo || "",
      },
      {
        txt: tt("INN", "ИНН"),
        value: textNum(org?.str ?? "", 3) || "",
      },
      {
        type: "select",
        txt: tt("Hisob raqami", "Счет"),
        selectData:
          org?.account_numbers?.map((d: any) => ({
            ...d,
            name: textNum(d.account_number, 4),
          })) ?? [],
        onChange: (value: any) => {
          setContract?.({
            ...contract,
            organ_account_number_id: value,
          });
        },
        value: contract?.organ_account_number_id || defaultAccount,
      },
      {
        type: "select",
        txt: tt("Hisob raqami g'azna", "Номер счета казна"),
        selectData:
          org?.gazna_numbers?.map((d: any) => ({
            ...d,
            name: textNum(d.gazna_number, 4),
          })) ?? [],
        onChange: (value: any) => {
          setContract?.({
            ...contract,
            gazna_number_id: value,
          });
        },
        value: contract?.gazna_number_id || "",
      },
    ];
    return payer;
  } catch {
    return [];
  }
};
