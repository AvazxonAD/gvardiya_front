import { IContractForm } from "@/types/contract";
import { IOrganization } from "@/types/organization";
import { getSpr } from "@/api";
import { pickLang } from "@/lib/docText";
import { textNum, tt } from "@/utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

/**
 * Qabul qiluvchi (viloyat) tafsilotlari qatorlari.
 *
 * Ilgari kirish paytidagi `localStorage.user` nusxasidan o'qilardi:
 * Rekvizitlar to'ldirilgach ham panel qayta kirmaguncha bo'sh turardi,
 * "Joriy hisob" esa tanlangan emas, tasodifiy hisob raqam edi. Endi
 * rekvizitlar hujjat sahifasidagidek (`Document.tsx`) har safar
 * serverdan olinadi, hisob raqam — yuqori panelda tanlangani (shartnoma
 * aynan shunga bog'lanadi).
 */
export const useRecipientRows = () => {
  const JWT = useSelector((s: any) => s.auth.jwt);
  const account = useSelector((s: any) => s.account);
  const [spr, setSpr] = useState<{ doer?: any; bank?: any; str?: any }>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSpr(JWT, "doer"), getSpr(JWT, "bank"), getSpr(JWT, "str")])
      .then(([doer, bank, str]) => {
        if (!cancelled) setSpr({ doer: doer?.data, bank: bank?.data, str: str?.data });
      })
      .catch((e) => console.error("Rekvizitlarni olishda xatolik:", e));
    return () => {
      cancelled = true;
    };
  }, [JWT]);

  // Yangi viloyatda rekvizit yozuvi bo'lmaydi (`data` — null)
  return [
    { txt: tt("Qabul qiluvchi", "Получатель"), value: pickLang(spr.doer, "doer") },
    { txt: tt("Bank", "Банк"), value: pickLang(spr.bank, "bank") },
    { txt: tt("MFO", "МФО"), value: spr.bank?.mfo || "" },
    { txt: tt("INN", "ИНН"), value: textNum(spr.str?.str ?? "", 3) || "" },
    {
      txt: tt("Joriy hisob", "Расчетный счет"),
      value: textNum(account?.account_number ?? "", 4) || "",
    },
  ];
};

/** Ikki hisob/g'azna raqami bir xilmi (bo'sh joylarsiz) */
const sameNumber = (a?: string | null, b?: string | null) =>
  Boolean(a && b) && String(a).replace(/\s/g, "") === String(b).replace(/\s/g, "");

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
  org: selected,
  contract,
  setContract,
}: {
  /**
   * Tanlangan tashkilot obyekti. Ilgari u oynadagi joriy ro'yxat sahifasidan
   * `id` bo'yicha qidirilardi — qidiruv yoki sahifa almashsa (yoki tahrirda
   * tashkilot yuklangan ro'yxatda bo'lmasa) panel bo'sh qolardi.
   */
  org?: IOrganization | null;
  contract?: IContractForm;
  setContract?: (contract: any) => void;
}) => {
  // Faqat shartnomadagi tashkilotga mos kelsa ishlatiladi
  const org =
    selected && selected.id == contract?.organization_id ? selected : undefined;

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
    // Shartnomada saqlangan raqamlar (tahrirda serverdan keladi)
    const saved = contract as any;

    if (!accountFitsOrg) {
      // Saqlangan hisob tashkilotda yo'q: yo boshqa tashkilot tanlangan, yo
      // eski yozuv o'chirilgan (ilgari tashkilot tahrirlanganda raqamlar
      // qaytadan yaratilardi). Xuddi shu raqamli yozuv bo'lsa — o'sha,
      // bo'lmasa — tashkilotning birinchi hisobi.
      const same = (org.account_numbers ?? []).find((d: any) =>
        sameNumber(d.account_number, saved?.organization_account_number)
      ) as any;
      patch.organ_account_number_id = same?.id ?? (defaultAccount || null);
    } else if (!contract?.organ_account_number_id && defaultAccount) {
      patch.organ_account_number_id = defaultAccount;
    }

    if (!gaznaFitsOrg) {
      const same = (org.gazna_numbers ?? []).find((d: any) =>
        sameNumber(d.gazna_number, saved?.gazna_number)
      ) as any;
      patch.gazna_number_id = same?.id ?? null;
    }

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
          // Funksiya ko'rinishida: `contract` bu yerda eski nusxa bo'lishi
          // mumkin — tashkilot tanlangan zahoti tanlagich o'zgarsa, tanlov
          // (organization_id) o'chib ketardi
          setContract?.((prev: any) => ({
            ...prev,
            organ_account_number_id: value,
          }));
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
          setContract?.((prev: any) => ({
            ...prev,
            gazna_number_id: value,
          }));
        },
        value: contract?.gazna_number_id || "",
      },
    ];
    return payer;
  } catch {
    return [];
  }
};
