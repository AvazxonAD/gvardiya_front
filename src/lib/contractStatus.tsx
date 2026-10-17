import { useState } from "react";
import { useDispatch } from "react-redux";
import { Ban, Loader2, RotateCcw } from "lucide-react";

import { useRequest } from "@/hooks/useRequest";
import { NO_ACCESS_BTN_CLASS, noAccessTitle } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { alertt } from "@/Redux/LanguageSlice";
import { formatSum, tt } from "@/utils";
import { Button, Modal } from "@/ui";

/**
 * Shartnoma holati: faol / bekor qilingan (backend: contract.status, 88.sql).
 *
 * Bekor qilingan shartnoma qarzdorlik, dashboard, monitoring va chiqimda
 * hisobga olinmaydi; "Shartnomalar" sahifasidagi "Bekor qilinganlar"
 * oynasida turadi va o'sha yerdan qayta faollashtiriladi.
 *
 * Kirim (prixod) hujjati ham xuddi shunday bekor qilinadi (95.sql):
 * shu fayldagi yordamchilar `kind = "prixod"` bilan ishlatiladi.
 */
export type ContractStatus = "active" | "cancelled";

/** Bekor qilinadigan hujjat turi — so'rov manzili va matnlar shunga qarab */
export type StatusKind = "contract" | "prixod";

/**
 * Nega bekor qilib bo'lmaydi (backend: helper/contract.cancel.js) —
 * NULL bo'lsa mumkin. Shartnoma: pul tushgan yoki chiqim qilingan bo'lsa;
 * kirim: shartnoma bo'yicha chiqim qilingan bo'lsa. Tadbir sanasi to'siq emas.
 */
export type CancelBlock = "prixod" | "rasxod" | null | undefined;

export const cancelBlockText = (block: CancelBlock, kind: StatusKind = "contract"): string | null =>
  block === "prixod"
    ? tt("Pul kelib tushgan — bekor qilib bo'lmaydi", "Поступила оплата — отменить нельзя")
    : block === "rasxod"
      ? kind === "prixod"
        ? tt(
            "Shartnoma bo'yicha chiqim qilingan — bekor qilib bo'lmaydi",
            "По договору есть расход — отменить нельзя"
          )
        : tt("Chiqim qilingan — bekor qilib bo'lmaydi", "Есть расход — отменить нельзя")
      : null;

/**
 * "Bekor qilish" tugmasi xossalari: ruxsat yo'q yoki to'siq bor bo'lsa —
 * o'chiq, sichqoncha ustida sababi (permBtn uslubida, tugma yashirilmaydi).
 */
export function cancelBtnProps(allowed: boolean, block: CancelBlock, className?: string, kind: StatusKind = "contract") {
  const reason = cancelBlockText(block, kind);
  const ok = allowed && !reason;
  return {
    disabled: !ok,
    "aria-disabled": !ok || undefined,
    title: !allowed
      ? noAccessTitle()
      : reason ?? (kind === "prixod" ? tt("Kirimni bekor qilish", "Отменить приход") : tt("Shartnomani bekor qilish", "Отменить договор")),
    className: cn(className, !ok && NO_ACCESS_BTN_CLASS),
  };
}

type Action = "cancel" | "restore";

/** Bekor qilish / faollashtirish so'rovi — natija xabari alert sifatida chiqadi */
export function useContractStatusAction(kind: StatusKind = "contract") {
  const request = useRequest();
  const dispatch = useDispatch();

  return async (action: Action, id: number, accountNumberId?: number | string | null) => {
    try {
      const res = await request.patch(`/${kind}/${id}/${action}`, null, {
        params: accountNumberId ? { account_number_id: accountNumberId } : undefined,
      });
      dispatch(alertt({ text: res.data?.message, success: true }));
      return true;
    } catch (error: any) {
      dispatch(alertt({ text: error?.message, success: false }));
      return false;
    }
  };
}

export type ContractStatusTarget = {
  id: number;
  doc_num?: string | number;
  organization_name?: string;
  result_summa?: number | string;
  /** Qo'shimcha qator (masalan, kirim uchun shartnoma raqami) */
  note?: string;
};

const TEXTS: Record<StatusKind, () => Record<"doc" | "cancelTitle" | "restoreTitle" | "cancelNote" | "restoreNote", string>> = {
  contract: () => ({
    doc: tt("Shartnoma", "Договор"),
    cancelTitle: tt("Shartnomani bekor qilasizmi?", "Отменить договор?"),
    restoreTitle: tt("Shartnomani qayta faollashtirasizmi?", "Восстановить договор?"),
    cancelNote: tt(
      "Bekor qilingan shartnoma qarzdorlik, dashboard, hisobot va chiqimda hisobga olinmaydi, summasi jamlanmalarga qo'shilmaydi. U faqat «Bekor qilinganlar» ro'yxatida turadi va kerak bo'lsa qayta faollashtiriladi.",
      "Отменённый договор не учитывается в задолженности, дашборде, отчётах и расходах, его сумма не входит в итоги. Он остаётся только в списке «Отменённые» и при необходимости восстанавливается."
    ),
    restoreNote: tt(
      "Shartnoma yana asosiy ro'yxatga, qarzdorlik, dashboard va hisobotlarga qaytadi.",
      "Договор снова появится в основном списке, задолженности, дашборде и отчётах."
    ),
  }),
  prixod: () => ({
    doc: tt("Kirim", "Приход"),
    cancelTitle: tt("Kirimni bekor qilasizmi?", "Отменить приход?"),
    restoreTitle: tt("Kirimni qayta faollashtirasizmi?", "Восстановить приход?"),
    cancelNote: tt(
      "Bekor qilingan kirim shartnomaga kelib tushgan pul, qarzdorlik, dashboard va hisobotlarda hisobga olinmaydi — shartnoma qarzi shu summaga ko'payadi. Kirim faqat «Bekor qilinganlar» ro'yxatida turadi va kerak bo'lsa qayta faollashtiriladi.",
      "Отменённый приход не учитывается в поступлениях по договору, задолженности, дашборде и отчётах — долг по договору увеличится на эту сумму. Приход остаётся только в списке «Отменённые» и при необходимости восстанавливается."
    ),
    restoreNote: tt(
      "Kirim yana «Kirimlar kitobi» ga qaytadi va shartnomaga kelib tushgan pul sifatida hisoblanadi.",
      "Приход снова появится в «Книге приходов» и будет учитываться как поступление по договору."
    ),
  }),
};

/**
 * Bekor qilish / faollashtirishni tasdiqlash oynasi — o'chirish oynasi
 * (DeleteModal) uslubida: nima bo'lishi aniq yozilgan, tasdiqlash tugmasi
 * so'rov tugaguncha bloklanadi.
 */
export function ContractStatusConfirm({
  action,
  contract,
  onClose,
  onConfirm,
  kind = "contract",
}: {
  action: Action;
  /** null — oyna yopiq */
  contract: ContractStatusTarget | null;
  onClose: () => void;
  /** true qaytarsa oyna yopiladi */
  onConfirm: (contract: ContractStatusTarget) => Promise<boolean>;
  kind?: StatusKind;
}) {
  const [busy, setBusy] = useState(false);
  const cancel = action === "cancel";
  const text = TEXTS[kind]();

  const confirm = async () => {
    if (!contract || busy) return;
    setBusy(true);
    try {
      if (await onConfirm(contract)) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(contract)}
      onClose={busy ? () => {} : onClose}
      size="sm"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {tt("Yo'q, qaytish", "Нет, назад")}
          </Button>
          <Button variant={cancel ? "destructive" : "success"} onClick={confirm} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : cancel ? <Ban /> : <RotateCcw />}
            {cancel ? tt("Ha, bekor qilish", "Да, отменить") : tt("Ha, faollashtirish", "Да, восстановить")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span
          className={
            cancel
              ? "flex size-11 items-center justify-center bg-destructive/10 text-destructive"
              : "flex size-11 items-center justify-center bg-success/10 text-success"
          }
        >
          {cancel ? <Ban className="size-5" /> : <RotateCcw className="size-5" />}
        </span>
        <h2 className="text-[0.9375rem] font-semibold text-foreground">{cancel ? text.cancelTitle : text.restoreTitle}</h2>

        {contract && (
          <div className="w-full border border-border bg-muted/40 px-3 py-2 text-left text-[0.8125rem]">
            <div className="font-medium text-foreground">
              {text.doc} № {contract.doc_num}
            </div>
            {contract.note && <div className="text-muted-foreground">{contract.note}</div>}
            {contract.organization_name && (
              <div className="truncate text-muted-foreground" title={contract.organization_name}>
                {contract.organization_name}
              </div>
            )}
            {contract.result_summa != null && (
              <div className="tabular-nums text-muted-foreground">
                {tt("Summasi", "Сумма")}: {formatSum(contract.result_summa) || "0"}
              </div>
            )}
          </div>
        )}

        <p className="text-[0.8125rem] text-muted-foreground">{cancel ? text.cancelNote : text.restoreNote}</p>
      </div>
    </Modal>
  );
}
