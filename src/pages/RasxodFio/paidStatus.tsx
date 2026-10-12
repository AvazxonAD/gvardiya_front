import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleCheck, Loader2, Undo2 } from "lucide-react";

import { useRequest } from "@/hooks/useRequest";
import type { RasxodInterface } from "@/interface";
import { cn } from "@/lib/utils";
import { alertt } from "@/Redux/LanguageSlice";
import { formatDate, formatSum, tt } from "@/utils";
import { Badge, Button, Modal } from "@/ui";

/**
 * Chiqim hujjati holati: to'langan / to'lanmagan. Ikki sahifada:
 *  - "fio"    — "Hodimlarning pul hisob-kitobi" (rasxod_fio_doc.is_paid, 91.sql);
 *  - "rasxod" — "Chiqimlar kitobi", hamkor tashkilotlarga: IIO, FVV, MG harbiy
 *               qismlari va h.k. (rasxod_doc.is_paid, 92.sql).
 *
 * Yangi hujjat to'lanmagan bo'lib yaratiladi. Hujjatdagi summalar to'langach
 * ro'yxatdagi ⋮ menyudan "To'landi" deb belgilanadi, kerak bo'lsa
 * to'lanmaganga qaytariladi. Hujjatni tahrirlash holatni o'zgartirmaydi.
 */

export type PaidDocKind = "fio" | "rasxod";

const PAID_ENDPOINT: Record<PaidDocKind, string> = {
  fio: "/rasxod/fio",
  rasxod: "/rasxod",
};

export const paidStatusLabel = (paid: boolean) =>
  paid ? tt("To'landi", "Оплачено") : tt("To'lanmagan", "Не оплачено");

/** Holat belgisi: to'langan — yashil, to'lanmagan — sariq (to'lov kutilmoqda) */
export function PaidStatusBadge({
  paid,
  dot = true,
  className,
  title,
}: {
  paid: boolean;
  dot?: boolean;
  className?: string;
  /** Sichqoncha ustiga kelganda chiqadigan izoh */
  title?: string;
}) {
  return (
    <Badge tone={paid ? "success" : "warning"} dot={dot} className={className} title={title}>
      {paidStatusLabel(paid)}
    </Badge>
  );
}

/** Holatni almashtiruvchi amal nomi (menyu bandi va tasdiqlash oynasi uchun) */
export const paidActionLabel = (paid: boolean) =>
  paid
    ? tt("To'lanmaganga qaytarish", "Вернуть в неоплаченные")
    : tt("To'landi deb belgilash", "Отметить как оплачено");

/** Menyu bandi ostidagi izoh: amal nima qilishi */
export const paidActionHint = (paid: boolean, kind: PaidDocKind) =>
  paid
    ? tt("Hujjat yana «To'lanmagan» bo'ladi", "Документ снова станет «Не оплачено»")
    : kind === "fio"
      ? tt("Summalar xodimlarga to'langanini qayd etish", "Отметить, что суммы выплачены сотрудникам")
      : tt("Summa qabul qiluvchiga o'tkazilganini qayd etish", "Отметить, что сумма перечислена получателю");

/**
 * Holatni o'zgartirish so'rovi (PUT /rasxod/fio/:id/paid yoki
 * /rasxod/:id/paid) — natija alert sifatida chiqadi, muvaffaqiyatli bo'lsa
 * `true` qaytaradi.
 */
export function usePaidStatusAction(kind: PaidDocKind = "fio") {
  const request = useRequest();
  const dispatch = useDispatch();
  const { account_number_id } = useSelector((state: any) => state.account);

  return async (id: number, is_paid: boolean) => {
    try {
      await request.put(
        `${PAID_ENDPOINT[kind]}/${id}/paid`,
        { is_paid },
        { params: { account_number_id } }
      );
      dispatch(
        alertt({
          success: true,
          text: is_paid
            ? tt("Hujjat «To'landi» deb belgilandi", "Документ отмечен как оплаченный")
            : tt("Hujjat to'lanmaganlarga qaytarildi", "Документ возвращён в неоплаченные"),
        })
      );
      return true;
    } catch (error: any) {
      // `useRequest` xato matnini serverning o'z xabariga almashtiradi
      dispatch(alertt({ success: false, text: error?.message }));
      return false;
    }
  };
}

export type PaidStatusTarget = Pick<
  RasxodInterface,
  "id" | "doc_num" | "doc_date" | "batalon_name" | "summa" | "worker_summa" | "is_paid"
>;

/**
 * Holatni o'zgartirishni tasdiqlash oynasi (shartnomani bekor qilish oynasi —
 * `ContractStatusConfirm` uslubida). Nima qilinishini hujjatning JORIY holati
 * belgilaydi: to'lanmagan bo'lsa — "To'landi" deb belgilash, aks holda qaytarish.
 * Tasdiqlash tugmasi so'rov tugaguncha bloklanadi.
 */
export function PaidStatusConfirm({
  doc,
  kind = "fio",
  onClose,
  onConfirm,
}: {
  /** null — oyna yopiq */
  doc: PaidStatusTarget | null;
  kind?: PaidDocKind;
  onClose: () => void;
  /** true qaytarsa oyna yopiladi */
  onConfirm: (doc: PaidStatusTarget) => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const markPaid = !doc?.is_paid;
  const Icon = markPaid ? CircleCheck : Undo2;

  const confirm = async () => {
    if (!doc || busy) return;
    setBusy(true);
    try {
      if (await onConfirm(doc)) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(doc)}
      onClose={busy ? () => {} : onClose}
      size="sm"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {tt("Yo'q, qaytish", "Нет, назад")}
          </Button>
          <Button variant={markPaid ? "success" : "primary"} onClick={confirm} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Icon />}
            {markPaid ? tt("Ha, to'landi", "Да, оплачено") : tt("Ha, qaytarish", "Да, вернуть")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span
          className={cn(
            "flex size-11 items-center justify-center",
            markPaid ? "bg-success/10 text-success" : "bg-warning/15 text-warning"
          )}
        >
          <Icon className="size-5" />
        </span>
        <h2 className="text-[0.9375rem] font-semibold text-foreground">
          {markPaid
            ? tt("Hujjatni «To'landi» deb belgilaysizmi?", "Отметить документ как оплаченный?")
            : tt("Hujjatni to'lanmaganga qaytarasizmi?", "Вернуть документ в неоплаченные?")}
        </h2>

        {doc && (
          <div className="w-full border border-border bg-muted/40 px-3 py-2 text-left text-[0.8125rem]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">
                {tt("Hujjat", "Документ")} № {doc.doc_num}
              </span>
              <span className="tabular-nums text-muted-foreground">{formatDate(doc.doc_date)}</span>
            </div>
            {doc.batalon_name && (
              <div className="truncate text-muted-foreground" title={doc.batalon_name}>
                {doc.batalon_name}
              </div>
            )}
            <div className="tabular-nums text-muted-foreground">
              {kind === "fio" ? tt("Jami (100%)", "Всего (100%)") : tt("Summa", "Сумма")}:{" "}
              {formatSum(doc.summa) || "0"}
            </div>
            {kind === "fio" && doc.worker_summa != null && (
              <div className="tabular-nums text-muted-foreground">
                {tt("Kartaga o'tkazildi", "Перечислено на карту")}: {formatSum(doc.worker_summa) || "0"}
              </div>
            )}
          </div>
        )}

        <p className="text-[0.8125rem] text-muted-foreground">
          {markPaid
            ? kind === "fio"
              ? tt(
                  "Hujjatdagi summalar xodimlarga to'langan deb belgilanadi. Kerak bo'lsa keyin to'lanmaganga qaytarish mumkin.",
                  "Суммы документа будут отмечены как выплаченные сотрудникам. При необходимости документ можно вернуть в неоплаченные."
                )
              : tt(
                  "Hujjatdagi summa qabul qiluvchi tashkilotga o'tkazilgan deb belgilanadi. Kerak bo'lsa keyin to'lanmaganga qaytarish mumkin.",
                  "Сумма документа будет отмечена как перечисленная организации-получателю. При необходимости документ можно вернуть в неоплаченные."
                )
            : tt(
                "Hujjat yana to'lanmagan deb ko'rsatiladi. Summalari o'zgarmaydi.",
                "Документ снова будет отображаться как неоплаченный. Суммы не изменятся."
              )}
        </p>
      </div>
    </Modal>
  );
}
