import { CircleCheck, Pencil, Trash2, Undo2 } from "lucide-react";

import type { ExportMenuItem } from "@/Components/ExportMenu";
import { noAccessTitle } from "@/lib/permissions";
import { paidActionHint, paidActionLabel, type PaidDocKind } from "@/pages/RasxodFio/paidStatus";
import { tt } from "@/utils";

/**
 * Chiqim hujjati qatorining ⋮ menyusi ("Chiqimlar kitobi" va "Hodimlarning
 * pul hisob-kitobi"): avval amallar (tahrirlash, "To'landi"), keyin
 * "Hisobotlar" guruhi, oxirida o'chirish. Ilgari amallar qator ichida nomsiz
 * kichik belgilar bo'lib turardi — qaysi biri nima qilishi tushunarsiz edi.
 *
 * Ruxsat yo'q amal yashirilmaydi — o'chirilgan holda "Ruxsat yo'q" izohi bilan
 * ko'rinadi (`permBtn` kabi). Holatni o'zgartirish — tahrirlash ruxsati bilan.
 */
export function rasxodRowMenu(opts: {
  kind: PaidDocKind;
  paid: boolean;
  canEdit: boolean;
  canDelete: boolean;
  reports: ExportMenuItem[];
  onEdit: () => void;
  onTogglePaid: () => void;
  onDelete: () => void;
}): ExportMenuItem[] {
  const { kind, paid, canEdit, canDelete, reports, onEdit, onTogglePaid, onDelete } = opts;
  const noAccess = noAccessTitle();

  return [
    {
      key: "edit",
      icon: <Pencil />,
      label: tt("Hujjatni tahrirlash", "Редактировать документ"),
      run: onEdit,
      disabled: !canEdit,
      disabledTitle: noAccess,
    },
    {
      key: "paid",
      icon: paid ? <Undo2 className="text-warning" /> : <CircleCheck className="text-success" />,
      label: paidActionLabel(paid),
      hint: paidActionHint(paid, kind),
      run: onTogglePaid,
      disabled: !canEdit,
      disabledTitle: noAccess,
    },
    ...reports.map((item, i) => (i === 0 ? { ...item, section: tt("Hisobotlar", "Отчёты") } : item)),
    {
      key: "delete",
      icon: <Trash2 />,
      label: tt("Hujjatni o'chirish", "Удалить документ"),
      run: onDelete,
      disabled: !canDelete,
      disabledTitle: noAccess,
      tone: "danger",
      divider: true,
    },
  ];
}
