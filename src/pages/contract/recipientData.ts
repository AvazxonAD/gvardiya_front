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

/**
 * To'lovchi tafsilotlari qatorlari.
 *
 * Ichida `useEffect` bor, shuning uchun bu — HOOK, oddiy funksiya emas.
 * Ilgari `payer` deb atalib, JSX ichidan `payer({...}).map(...)` tarzida
 * chaqirilardi: hook render paytida, shartli joyda chaqirilishi mumkin
 * bo'lib qolardi va shart qo'shilishi bilanoq sahifa "Rendered fewer
 * hooks than expected" bilan yiqilardi. Nomi `use` bilan boshlanadi va
 * komponentning yuqorisidan chaqiriladi.
 */
export const usePayerRows = ({
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

  // Tanlangan raqamlar joriy tashkilotga tegishlimi. Tahrirlashda tashkilot
  // almashtirilsa, eski tashkilotning hisob/gazna raqami qolib ketar va
  // backend uni "Hisob raqami topilmadi" deb 404 bilan rad etardi.
  const accountFitsOrg =
    !contract?.organ_account_number_id ||
    (org?.account_numbers ?? []).some(
      (d: any) => d.id === contract.organ_account_number_id
    );

  const gaznaFitsOrg =
    !contract?.gazna_number_id ||
    (org?.gazna_numbers ?? []).some(
      (d: any) => d.id === contract.gazna_number_id
    );

  // Hisob/gazna raqamini tashkilotga moslab turadi — yangi shartnomada ham,
  // tahrirlashda ham.
  useEffect(() => {
    // `org` hali yuklanmagan bo'lsa tegmaymiz: aks holda tahrirlash sahifasi
    // ochilganda saqlangan qiymat o'chib ketardi.
    if (!org) return;

    const patch: Record<string, any> = {};

    if (!accountFitsOrg) {
      // Boshqa tashkilotniki — joriy tashkilotning birinchisiga almashtiramiz
      patch.organ_account_number_id = defaultAccount || null;
    } else if (!contract?.organ_account_number_id && defaultAccount) {
      patch.organ_account_number_id = defaultAccount;
    }

    if (!gaznaFitsOrg) patch.gazna_number_id = null;

    if (Object.keys(patch).length === 0) return;

    // Funksiya ko'rinishidagi yangilash: closure'dagi eski `contract`
    // ni butunlay yozib yuborish, shu asnoda foydalanuvchi kiritgan
    // o'zgarishlarni o'chirib tashlash xavfi bor edi.
    setContract?.((prev: any) => ({ ...prev, ...patch }));
  }, [org?.id, defaultAccount, accountFitsOrg, gaznaFitsOrg]);

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
        txt: tt("MFO", "МФО"),
        value: org?.mfo || "",
      },
      {
        txt: tt("INN", "ИНН"),
        value: textNum(org?.str ?? "", 3) || "",
      },
      {
        type: "select",
        txt: tt("Hisob raqami", "Номер счета"),
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
        txt: tt("G'azna hisob raqami", "Казначейский счёт"),
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
