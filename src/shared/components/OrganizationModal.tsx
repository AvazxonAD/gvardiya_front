import React, { useState } from "react";
import Button from "@/Components/reusable/button";
import { PlusIcon, Trash2Icon, SearchIcon, Loader2Icon } from "lucide-react";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import { tt } from "@/utils";
import { formatAccountNumber } from "@/pages/Organisation";
import { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";

interface OrganizationModalProps {
  open: boolean;
  closeModal: () => void;
  value: {
    name: string;
    address: string;
    str: string;
    bank_name: string;
    mfo: string;
    boss: string;
    account_numbers: string[];
    gazna_numbers: string[];
  };
  handleChange: (e: any) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAccountNumberChange: (index: number, value: string) => void;
  handleGaznaChange: (index: number, value: string) => void;
  addAccountNumber: () => void;
  addGazna: () => void;
  removeAccountNumber: (index: number) => void;
  removeGazna: (index: number) => void;
  title: string;
  submitButtonText?: string;
  onFill?: (data: Partial<OrganizationModalProps["value"]> & { newAccountNumber?: string }) => void;
}

function OrganizationModal({
  open,
  closeModal,
  value,
  handleChange,
  handleSubmit,
  handleAccountNumberChange,
  handleGaznaChange,
  addAccountNumber,
  addGazna,
  removeAccountNumber,
  removeGazna,
  title,
  submitButtonText = "save",
  onFill,
}: OrganizationModalProps) {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleInnSearch = async () => {
    const inn = value.str.replace(/\s/g, "");
    if (inn.length !== 9) {
      setSearchError(tt("INN 9 ta raqamdan iborat bo'lishi kerak", "ИНН должен состоять из 9 цифр"));
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const res = await authFetch(`${baseUri}/didox/search/${inn}`);
      const result = await res.json();

      if (result.success && result.data) {
        const d = result.data;
        const accountNum = d.account || d.bankAccount || "";

        if (onFill) {
          const formatted = accountNum ? formatAccountNumber(accountNum) : "";
          const raw = accountNum ? accountNum.replace(/\s/g, "") : "";
          const alreadyExists = value.account_numbers.some(
            (num) => num.replace(/\s/g, "") === raw
          );

          onFill({
            name: d.fullName || d.name || "",
            address: d.address || "",
            boss: d.director || "",
            mfo: d.mfo || d.bankCode || "",
            bank_name: d.bank_name || "",
            newAccountNumber: formatted && !alreadyExists ? formatted : undefined,
          });
        }
      } else {
        setSearchError(result.message || tt("Tashkilot topilmadi", "Организация не найдена"));
      }
    } catch {
      setSearchError(tt("Qidirishda xatolik", "Ошибка при поиске"));
    } finally {
      setSearching(false);
    }
  };

  return (
    <Modal open={open} w="730px" title={title} closeModal={closeModal}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 w-full">
          <div className="flex gap-3 flex-col w-1/2">
            <div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    change={handleChange}
                    v={value.str}
                    n="str"
                    t="text"
                    label={tt("INN", "ИНН")}
                    p={tt("INN", "ИНН")}
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInnSearch}
                  disabled={searching}
                  className="mb-[2px] px-3 py-[9px] bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  {searching ? (
                    <Loader2Icon size={16} className="animate-spin" />
                  ) : (
                    <SearchIcon size={16} />
                  )}
                </button>
              </div>
              {searchError && (
                <p className="text-red-500 text-xs mt-1">{searchError}</p>
              )}
            </div>
            <Input
              t={"text"}
              change={handleChange}
              v={value.name}
              n="name"
              label={tt("Nomi", "Имя")}
              p={tt("Nom kiriting", "Введите имя")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.address}
              n="address"
              label={tt("Manzil", "Адрес")}
              p={tt("Manzil kiriting", "Введите адрес")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.bank_name}
              n="bank_name"
              label={tt("Bank nomi", "Название банка")}
              p={tt("Bank nomi kiritng", "Введите название банка")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.mfo}
              n="mfo"
              t="number"
              label={tt("MFO", "МФО")}
              p={tt("MFO kiriting", "Введите МФО")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.boss}
              n="boss"
              label={tt("Direktor", "Директор")}
              p={tt("Direktor kiriting", "Введите директора")}
              className="w-full"
            />
          </div>
          <div className="flex gap-3 flex-col w-1/2">
            {/* Account numbers section */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tt("Hisob raqami", "Счет номер")}
              </label>
              {value.account_numbers.map((accountNumber, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="w-full">
                    <Input
                      t="text"
                      change={(e: any) =>
                        handleAccountNumberChange(index, e.target.value)
                      }
                      v={accountNumber}
                      p={tt("Hisob raqam kiriting", "Введите номер счета")}
                      className="w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccountNumber(index)}
                    className="ml-2 text-red-500"
                  >
                    <Trash2Icon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAccountNumber}
                className="w-full py-2 border border-gray-300 rounded-md text-center text-sm flex items-center justify-center gap-2"
              >
                <PlusIcon size={16} /> {tt("Qo'shish", "Добавить")}
              </button>
            </div>

            {/* Gazna numbers section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tt("Hisob raqami g'azna", "Счет номер казначейства")}
              </label>
              {value.gazna_numbers.map((gazna, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="w-full">
                    <Input
                      t="text"
                      change={(e: any) =>
                        handleGaznaChange(index, e.target.value)
                      }
                      v={gazna}
                      p={tt(
                        "Xazna raqam kiriting",
                        "Введите номер казначейства"
                      )}
                      className="w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGazna(index)}
                    className="ml-2 text-red-500"
                  >
                    <Trash2Icon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGazna}
                className="w-full py-2 border border-gray-300 rounded-md text-center text-sm flex items-center justify-center gap-2"
              >
                <PlusIcon size={16} /> {tt("Qo'shish", "Добавить")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button mode={submitButtonText} type="submit" />
        </div>
      </form>
    </Modal>
  );
}

export default OrganizationModal;
