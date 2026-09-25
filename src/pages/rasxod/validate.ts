import { tt } from "@/utils";

type Form = {
  docNum?: string;
  docDate?: string;
  batalonId?: number | string;
  from?: string;
  to?: string;
  taskCount: number;
};

/**
 * Chiqim hujjatini saqlashdan oldingi tekshiruv (yaratish va tahrirlash).
 * Ilgari hech narsa tekshirilmasdan yuborilardi va foydalanuvchi backendning
 * tushunarsiz Joi xabarini ko'rardi ("doc_num" is required ...).
 * Xato bo'lsa — foydalanuvchiga ko'rsatiladigan matn, bo'lmasa `null`.
 */
export function validateRasxodForm(f: Form): string | null {
  if (!f.docNum?.trim())
    return tt("Hujjat raqamini kiriting", "Введите номер документа");
  if (!/^\d+(\.\d+)?$/.test(f.docNum.trim()))
    return tt(
      "Hujjat raqami faqat raqamlardan iborat bo'lishi kerak",
      "Номер документа должен состоять только из цифр"
    );
  if (!f.docDate)
    return tt("Hujjat sanasini tanlang", "Выберите дату документа");
  if (!f.batalonId)
    return tt(
      "Qabul qiluvchini tanlang (ikki marta bosing)",
      "Выберите получателя (двойной щелчок)"
    );
  if (!f.from || !f.to)
    return tt(
      "\"dan\" va \"gacha\" sanalarini tanlang",
      "Выберите даты «с» и «по»"
    );
  if (!f.taskCount)
    return tt(
      "Jadvalda topshiriq yo'q — \"Ishga tushirish\" tugmasini bosing",
      "В таблице нет заданий — нажмите «Запустить»"
    );
  return null;
}
