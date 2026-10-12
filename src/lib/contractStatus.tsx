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
 */
export type ContractStatus = "active" | "cancelled";

/**
 * Nega bekor qilib bo'lmaydi (backend: helper/contract.cancel.js) —
 * NULL bo'lsa mumkin. Bekor qilish faqat pul tushmagan, chiqim qilinmagan
 * va tadbir hali boshlanmagan shartnomaga.
 */
export type CancelBlock = "prixod" | "rasxod" | "started" | null | undefined;

export const cancelBlockText = (block: CancelBlock): string | null =>
  block === "prixod"
    ? tt("Pul kelib tushgan — bekor qilib bo'lmaydi", "Поступила оплата — отменить нельзя")
    : block === "rasxod"
      ? tt("Chiqim qilingan — bekor qilib bo'lmaydi", "Есть расход — отменить нельзя")
      : block === "started"
        ? tt(
            "Tadbir boshlangan — bekor qilish faqat tadbirdan oldin",
            "Мероприятие началось — отмена только до мероприятия"
          )
        : null;

/**
 * "Bekor qilish" tugmasi xossalari: ruxsat yo'q yoki to'siq bor bo'lsa —
 * o'chiq, sichqoncha ustida sababi (permBtn uslubida, tugma yashirilmaydi).
 */
export function cancelBtnProps(allowed: boolean, block: CancelBlock, className?: string) {
  const reason = cancelBlockText(block);
  const ok = allowed && !reason;
  return {
    disabled: !ok,
    "aria-disabled": !ok || undefined,
    title: !allowed ? noAccessTitle() : reason ?? tt("Shartnomani bekor qilish", "Отменить договор"),
    className: cn(className, !ok && NO_ACCESS_BTN_CLASS),
  };
}

type Action = "cancel" | "restore";

/** Bekor qilish / faollashtirish so'rovi — natija xabari alert sifatida chiqadi */
export function useContractStatusAction() {
  const request = useRequest();
  const dispatch = useDispatch();

  return async (action: Action, id: number, accountNumberId?: number | string | null) => {
    try {
      const res = await request.patch(`/contract/${id}/${action}`, null, {
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
}: {
  action: Action;
  /** null — oyna yopiq */
  contract: ContractStatusTarget | null;
  onClose: () => void;
  /** true qaytarsa oyna yopiladi */
  onConfirm: (contract: ContractStatusTarget) => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const cancel = action === "cancel";

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
        <h2 className="text-[0.9375rem] font-semibold text-foreground">
          {cancel
            ? tt("Shartnomani bekor qilasizmi?", "Отменить договор?")
            : tt("Shartnomani qayta faollashtirasizmi?", "Восстановить договор?")}
        </h2>

        {contract && (
          <div className="w-full border border-border bg-muted/40 px-3 py-2 text-left text-[0.8125rem]">
            <div className="font-medium text-foreground">
              {tt("Shartnoma", "Договор")} № {contract.doc_num}
            </div>
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

        <p className="text-[0.8125rem] text-muted-foreground">
          {cancel
            ? tt(
                "Bekor qilingan shartnoma qarzdorlik, dashboard, hisobot va chiqimda hisobga olinmaydi, summasi jamlanmalarga qo'shilmaydi. U faqat «Bekor qilinganlar» ro'yxatida turadi va kerak bo'lsa qayta faollashtiriladi.",
                "Отменённый договор не учитывается в задолженности, дашборде, отчётах и расходах, его сумма не входит в итоги. Он остаётся только в списке «Отменённые» и при необходимости восстанавливается."
              )
            : tt(
                "Shartnoma yana asosiy ro'yxatga, qarzdorlik, dashboard va hisobotlarga qaytadi.",
                "Договор снова появится в основном списке, задолженности, дашборде и отчётах."
              )}
        </p>
      </div>
    </Modal>
  );
}
