import { IContractForm } from "@/types/contract";
import { IOrganization } from "@/types/organization";
import { textNum, tt } from "@/utils";
import { useEffect, useState } from "react";

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
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedGaznaAccount, setSelectedGaznaAccount] = useState<any>(null);

  const defaultAccount =
    data
      ?.find((d: any) => d.id == contract?.organization_id)
      ?.account_numbers?.map((d: any) => ({
        ...d,
        name: textNum(d.account_number, 4),
      }))?.[0]?.id ?? "";

  const defaultGaznaAccount =
    data
      ?.find((d: any) => d.id == contract?.organization_id)
      ?.gazna_numbers?.map((d: any) => ({
        ...d,
        name: textNum(d.gazna_number, 4),
      }))?.[0]?.id ?? "";

  useEffect(() => {
    if (contract?.organ_account_number_id) {
      setSelectedAccount(contract?.organ_account_number_id);
    } else {
      setSelectedAccount(defaultAccount);
    }
    if (contract?.gazna_number_id) {
      setSelectedGaznaAccount(contract?.gazna_number_id);
    } else {
      setSelectedGaznaAccount(defaultGaznaAccount);
    }
  }, [contract]);

  useEffect(() => {
    if (selectedAccount || selectedGaznaAccount) {
      setContract?.({
        ...contract,
        organ_account_number_id: selectedAccount,
        gazna_number_id: selectedGaznaAccount,
      });
    }
  }, [selectedAccount, selectedGaznaAccount]);

  try {
    const payer = [
      {
        txt: tt("To'lovchi", "Плательщик"),
        value:
          data?.find((d: any) => d.id == contract?.organization_id)?.name || "",
      },
      {
        txt: tt("Bank", "Банк"),
        value:
          data?.find((d: any) => d.id == contract?.organization_id)
            ?.bank_name || "",
      },
      {
        txt: tt("MFO", "МФО"),
        value:
          data?.find((d: any) => d.id == contract?.organization_id)?.mfo || "",
      },
      {
        txt: tt("INN", "ИНН"),
        value:
          textNum(
            data?.find((d: any) => d.id == contract?.organization_id)?.str ??
              "",
            3
          ) || "",
      },
      {
        type: "select",
        txt: tt("Hisob raqami", "Счет"),
        selectData:
          data
            ?.find((d: any) => d.id == contract?.organization_id)
            ?.account_numbers?.map((d: any) => ({
              ...d,
              name: textNum(d.account_number, 4),
            })) ?? [],
        onChange: (value: any) => {
          const accountNumbers: any =
            data?.find((d: any) => d.id == contract?.organization_id)
              ?.account_numbers || [];
          const selectedAccount = accountNumbers.find(
            (acc: any) => acc.id === value
          )?.id;

          if (selectedAccount) {
            setSelectedAccount(selectedAccount);
            setContract?.({
              ...contract,
              organ_account_number_id: selectedAccount,
            });
          }
        },
        value: selectedAccount ?? defaultAccount,
      },
      {
        type: "select",
        txt: tt("Hisob raqami g'azna", "Номер счета казна"),
        selectData:
          data
            ?.find((d: any) => d.id == contract?.organization_id)
            ?.gazna_numbers?.map((d: any) => ({
              ...d,
              name: textNum(d.gazna_number, 4),
            })) ?? [],
        onChange: (value: any) => {
          const accountNumbers: any =
            data?.find((d: any) => d.id == contract?.organization_id)
              ?.gazna_numbers || [];
          const selectedGaznaAccount = accountNumbers.find(
            (acc: any) => acc.id === value
          )?.id;

          if (selectedGaznaAccount) {
            setSelectedGaznaAccount(selectedGaznaAccount);
            setContract?.({
              ...contract,
              gazna_number_id: selectedGaznaAccount,
            });
          }
        },
        value: selectedGaznaAccount ?? defaultGaznaAccount,
      },
    ];
    return payer;
  } catch {
    return [];
  }
};
