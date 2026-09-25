import { AlertTriangle } from "lucide-react";

import { tt } from "../utils";
import { Button, Modal } from "@/ui";

/**
 * O'chirishni tasdiqlash oynasi — yangi dizayn tizimidagi `Modal` ustida.
 * Props interfeysi o'zgarmadi (`open`, `closeModal`, `deletee`).
 */
function DeleteModal({ closeModal, open, deletee }: any) {
  return (
    <Modal
      open={open}
      onClose={closeModal}
      size="sm"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={closeModal}>
            {tt("Bekor qilish", "Отмена")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deletee();
              closeModal();
            }}
          >
            {tt("O'chirish", "Удалить")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="flex size-11 items-center justify-center rounded-none bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <h2 className="text-[0.9375rem] font-semibold text-foreground">
          {tt("Siz mutlaqo ishonchingiz komilmi?", "Вы абсолютно уверены?")}
        </h2>
        <p className="max-w-xs text-[0.8125rem] text-muted-foreground">
          {tt(
            "Bu amalni ortga qaytarib bo'lmaydi.",
            "Это действие нельзя отменить."
          )}
        </p>
      </div>
    </Modal>
  );
}

export default DeleteModal;
